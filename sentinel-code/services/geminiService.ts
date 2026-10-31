import { GoogleGenAI } from "@google/genai";
import { SecurityFinding, PerformanceIssue, QualityIssue, CodeReviewReport } from "../types";

// Initialize the client lazily. Only NEXT_PUBLIC_-prefixed vars are inlined
// into the browser bundle, so a bare API_KEY is always undefined here.
let overrideKey = '';
export const setApiKey = (key: string) => { overrideKey = key; };

const getClient = () =>
  new GoogleGenAI({
    apiKey: overrideKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '',
  });

const MODEL_NAME = 'gemini-3.8-flash';
const SYNTHESIS_MODEL_NAME = 'gemini-3.8-flash'; // Using flash for speed in demo, Pro is better for synthesis

// Schemas
// The Interactions API takes plain JSON Schema (lowercase type names) rather
// than the SDK's `Type` enum.
const securitySchema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      severity: { type: 'string', enum: ["HIGH", "MEDIUM", "LOW"] },
      issue_type: { type: 'string' },
      location: { type: 'string' },
      description: { type: 'string' },
      recommendation: { type: 'string' },
    },
    required: ["severity", "issue_type", "location", "description", "recommendation"],
  },
};

const performanceSchema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      severity: { type: 'string', enum: ["HIGH", "MEDIUM", "LOW"] },
      issue_type: { type: 'string' },
      location: { type: 'string' },
      description: { type: 'string' },
      improvement: { type: 'string' },
    },
    required: ["severity", "issue_type", "location", "description", "improvement"],
  },
};

const qualitySchema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      category: { type: 'string', enum: ["readability", "maintainability", "documentation"] },
      location: { type: 'string' },
      description: { type: 'string' },
      suggestion: { type: 'string' },
    },
    required: ["category", "location", "description", "suggestion"],
  },
};

const reportSchema = {
  type: 'object',
  properties: {
    overall_score: { type: 'integer' },
    security_findings: securitySchema,
    performance_issues: performanceSchema,
    quality_issues: qualitySchema,
    summary: { type: 'string' },
    approved: { type: 'boolean' },
  },
  required: ["overall_score", "security_findings", "performance_issues", "quality_issues", "summary", "approved"],
};

/** Shared JSON-mode response format. */
const jsonFormat = (schema: Record<string, unknown>) => ({
  type: 'text' as const,
  mime_type: 'application/json' as const,
  schema,
});


export const analyzeSecurity = async (code: string, language: string): Promise<SecurityFinding[]> => {
  const prompt = `
  # Security Code Review
  ## Code Language: ${language}
  ## Code to Review:
  \`\`\`${language}
  ${code}
  \`\`\`
  ## Instructions
  Perform a thorough security analysis. Identify:
  1. Authentication/Authorization issues
  2. Input validation problems
  3. SQL injection vulnerabilities
  4. XSS vulnerabilities
  5. CSRF vulnerabilities
  6. Sensitive data exposure
  7. Insecure dependencies
  8. Cryptography issues

  For EACH finding, provide:
  - Severity (HIGH/MEDIUM/LOW)
  - Issue type
  - Exact location in code
  - Description of the vulnerability
  - Specific recommendation to fix
  `;

  try {
    const interaction = await getClient().interactions.create({
      model: MODEL_NAME,
      input: prompt,
      system_instruction: "You are a security expert specializing in code security analysis.",
      response_format: jsonFormat(securitySchema),
      generation_config: { thinking_level: 'high' },
      store: false,
    });

    if (interaction.output_text) {
        return JSON.parse(interaction.output_text) as SecurityFinding[];
    }
    return [];
  } catch (error) {
    console.error("Security Analysis Error:", error);
    return [];
  }
};

export const analyzePerformance = async (code: string, language: string): Promise<PerformanceIssue[]> => {
  const prompt = `
  # Performance Code Review
  ## Code Language: ${language}
  ## Code to Review:
  \`\`\`${language}
  ${code}
  \`\`\`
  ## Instructions
  Analyze code for performance issues:
  1. Time complexity problems (O(n²) when O(n) possible)
  2. Memory leaks
  3. Inefficient database queries (N+1 queries)
  4. Missing caching opportunities
  5. Blocking operations that should be async
  6. Resource leaks
  7. Unnecessary computations

  For EACH issue, provide:
  - Severity (HIGH/MEDIUM/LOW)
  - Issue type
  - Exact location
  - Description of the problem
  - Specific performance improvement
  `;

  try {
    const interaction = await getClient().interactions.create({
      model: MODEL_NAME,
      input: prompt,
      system_instruction: "You are a performance optimization expert.",
      response_format: jsonFormat(performanceSchema),
      generation_config: { thinking_level: 'high' },
      store: false,
    });
    if (interaction.output_text) {
        return JSON.parse(interaction.output_text) as PerformanceIssue[];
    }
    return [];
  } catch (error) {
    console.error("Performance Analysis Error:", error);
    return [];
  }
};

export const analyzeQuality = async (code: string, language: string): Promise<QualityIssue[]> => {
  const prompt = `
  # Code Quality Review
  ## Code Language: ${language}
  ## Code to Review:
  \`\`\`${language}
  ${code}
  \`\`\`
  ## Instructions
  Analyze code quality:
  1. Readability issues
  2. Maintainability concerns
  3. Documentation gaps
  4. Naming convention violations
  5. Code organization problems
  6. Design pattern opportunities
  7. DRY violations

  For EACH issue, provide:
  - Category (readability/maintainability/documentation)
  - Location
  - Description
  - Improvement suggestion
  `;

  try {
    const interaction = await getClient().interactions.create({
      model: MODEL_NAME,
      input: prompt,
      system_instruction: "You are a code quality expert.",
      response_format: jsonFormat(qualitySchema),
      store: false,
    });
    if (interaction.output_text) {
        return JSON.parse(interaction.output_text) as QualityIssue[];
    }
    return [];
  } catch (error) {
    console.error("Quality Analysis Error:", error);
    return [];
  }
};

export const synthesizeReport = async (
  code: string,
  securityFindings: SecurityFinding[],
  performanceIssues: PerformanceIssue[],
  qualityIssues: QualityIssue[]
): Promise<CodeReviewReport | null> => {
  
  const prompt = `
  # Code Review Synthesis

  ## Agent Findings
  ### Security Findings (${securityFindings.length} issues)
  ${JSON.stringify(securityFindings)}

  ### Performance Issues (${performanceIssues.length} issues)
  ${JSON.stringify(performanceIssues)}

  ### Quality Issues (${qualityIssues.length} issues)
  ${JSON.stringify(qualityIssues)}

  ## Instructions
  Create a comprehensive review report:
  1. Calculate overall_score (0-100) based on:
     - HIGH severity: -20 points each
     - MEDIUM severity: -10 points each
     - LOW severity: -5 points each
     - Start at 100, subtract penalties
  2. Provide 2-3 paragraph summary highlighting most critical issues.
  3. Set approved=true only if:
     - No HIGH severity issues
     - Overall score >= 70
  
  Note: Return the full findings lists in the response as well.
  `;

  try {
    const interaction = await getClient().interactions.create({
      model: SYNTHESIS_MODEL_NAME,
      input: prompt,
      system_instruction: "You are a senior code reviewer synthesizing findings.",
      response_format: jsonFormat(reportSchema),
      store: false,
    });

    if (interaction.output_text) {
        return JSON.parse(interaction.output_text) as CodeReviewReport;
    }
    return null;
  } catch (error) {
    console.error("Synthesis Error:", error);
    return null;
  }
};