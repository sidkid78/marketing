import { GoogleGenAI } from "@google/genai";
import { 
  ORCHESTRATOR_SYSTEM_INSTRUCTION, 
  WORKER_SYSTEM_INSTRUCTION, 
  SYNTHESIZER_SYSTEM_INSTRUCTION,
  PLANNING_MODEL,
  EXECUTION_MODEL,
  SYNTHESIS_MODEL
} from "../constants";
import { TaskPlan, TaskResult, OrchestratorResult, SubTask } from "../types";

export class OrchestratorService {
  private client: GoogleGenAI;

  constructor(apiKey?: string) {
    // Note: In a production app, never expose API keys on the client side.
    // This is for demonstration using the user's provided environment key.
    // Only NEXT_PUBLIC_-prefixed vars are inlined into the browser bundle.
    const key = apiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!key) {
      throw new Error("NEXT_PUBLIC_GEMINI_API_KEY is not defined in the environment.");
    }
    this.client = new GoogleGenAI({ apiKey: key });
  }

  async plan(goal: string, logCb: (msg: string) => void): Promise<TaskPlan> {
    logCb("Analyzing goal and generating execution plan...");
    
    // Schema definition for Structured Output (plain JSON Schema for the
    // Interactions API, rather than the SDK's `Type` enum).
    const planSchema = {
      type: 'object',
      properties: {
        goal: { type: 'string' },
        strategy: { type: 'string' },
        successCriteria: { type: 'string' },
        tasks: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              prompt: { type: 'string' },
              dependencies: {
                type: 'array',
                items: { type: 'string' }
              },
              priority: { type: 'string', enum: ["high", "medium", "low"] },
              model: { type: 'string' },
              tools: { type: 'array', items: { type: 'string' } },
              estimatedTokens: { type: 'integer' }
            },
            required: ["id", "name", "prompt", "dependencies", "priority", "model"]
          }
        },
        parallelGroups: {
          type: 'array',
          items: {
            type: 'array',
            items: { type: 'string' }
          },
          description: "List of groups, where each group contains task IDs that can be executed in parallel."
        }
      },
      required: ["goal", "strategy", "tasks", "parallelGroups", "successCriteria"]
    };

    const planningPrompt = `Analyze this request and create a detailed execution plan.

<user_request>
${goal}
</user_request>

Create a TaskPlan that:
1. Breaks this into the smallest parallelizable units
2. Identifies dependencies (only when strictly necessary)
3. Groups independent tasks for parallel execution
4. Assigns appropriate models to each task`;

    try {
      const interaction = await this.client.interactions.create({
        model: PLANNING_MODEL,
        input: planningPrompt,
        system_instruction: ORCHESTRATOR_SYSTEM_INSTRUCTION,
        response_format: {
          type: 'text',
          mime_type: 'application/json',
          schema: planSchema,
        },
        store: false,
      });

      if (!interaction.output_text) {
        throw new Error("Empty response from planning model");
      }

      const plan: TaskPlan = JSON.parse(interaction.output_text);
      return plan;
    } catch (error) {
      console.error("Planning failed:", error);
      throw error;
    }
  }

  async executeTask(
    task: SubTask, 
    dependencyResults: Record<string, TaskResult>
  ): Promise<TaskResult> {
    const startTime = Date.now();
    
    // Inject dependency outputs into the prompt
    let finalPrompt = task.prompt;
    for (const [depId, result] of Object.entries(dependencyResults)) {
      finalPrompt = finalPrompt.replace(`{dep:${depId}}`, result.output);
    }
    // Also try to replace any {dep:ID} that wasn't exactly matched if the plan was slightly loose, 
    // by appending dependency context if it looks like it's missing.
    // (Simplification for robustness)
    
    const contextStr = Object.entries(dependencyResults)
        .map(([id, res]) => `Context from Task ${id}: \n${res.output}`)
        .join("\n\n");
    
    if (Object.keys(dependencyResults).length > 0 && !finalPrompt.includes("{dep:")) {
        finalPrompt += `\n\n<dependency_context>\n${contextStr}\n</dependency_context>`;
    }

    try {
      // Use the model specified in the plan, or default
      const modelName = task.model || EXECUTION_MODEL;
      
      // Ensure we don't use a deprecated model name if the planner hallucinates one
      const safeModel = modelName.includes("pro") ? "gemini-3.5-flash" : EXECUTION_MODEL;

      const interaction = await this.client.interactions.create({
        model: EXECUTION_MODEL, // Forcing flash for speed/quota in this demo app
        input: finalPrompt,
        system_instruction: WORKER_SYSTEM_INSTRUCTION,
        store: false,
      });

      const durationMs = Date.now() - startTime;

      const tokenUsage = {
        promptTokens: interaction.usage?.total_input_tokens,
        completionTokens: interaction.usage?.total_output_tokens,
        totalTokens: interaction.usage?.total_tokens,
      };

      return {
        taskId: task.id,
        status: 'completed',
        output: interaction.output_text || "No output generated.",
        durationMs,
        tokenUsage
      };

    } catch (error: any) {
      return {
        taskId: task.id,
        status: 'failed',
        output: '',
        durationMs: Date.now() - startTime,
        error: error.message || "Unknown execution error",
        tokenUsage: {}
      };
    }
  }

  async synthesize(plan: TaskPlan, results: TaskResult[]): Promise<OrchestratorResult> {
    const startTime = Date.now();
    
    const resultsSummary = results.map(r => ({
      task_id: r.taskId,
      status: r.status,
      output: r.output, // In a real app, might want to truncate if huge
      error: r.error
    }));

    const synthesisPrompt = `Synthesize these task results into a final response.

<original_goal>
${plan.goal}
</original_goal>

<strategy>
${plan.strategy}
</strategy>

<success_criteria>
${plan.successCriteria}
</success_criteria>

<task_results>
${JSON.stringify(resultsSummary, null, 2)}
</task_results>

Provide:
1. Overall success assessment
2. Comprehensive summary addressing the original goal
3. Key findings
4. Any incomplete items or failures`;

    try {
      const interaction = await this.client.interactions.create({
        model: SYNTHESIS_MODEL,
        input: synthesisPrompt,
        system_instruction: SYNTHESIZER_SYSTEM_INSTRUCTION,
        store: false,
      });

      const totalTokens = results.reduce((acc, r) => acc + (r.tokenUsage.totalTokens || 0), 0);
      const totalDuration = results.reduce((acc, r) => acc + r.durationMs, 0) + (Date.now() - startTime);

      return {
        success: !results.some(r => r.status === 'failed'),
        summary: interaction.output_text || "Failed to generate summary.",
        taskResults: results,
        totalTokens,
        totalDurationMs: totalDuration
      };

    } catch (error: any) {
       return {
        success: false,
        summary: "Error during synthesis phase: " + error.message,
        taskResults: results,
        totalTokens: 0,
        totalDurationMs: 0
      };
    }
  }
}