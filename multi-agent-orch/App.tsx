import React, { useState, useRef, useEffect } from 'react';
import {
  BrainCircuit,
  Play,
  Loader2,
  AlertCircle,
  Layout,
  Terminal,
  RotateCcw
} from 'lucide-react';
import { OrchestratorService } from './services/orchestratorService';
import { TaskPlan, TaskResult, OrchestratorResult, LogEntry } from './types';
import { TaskCard } from './components/TaskCard';
import { LogViewer } from './components/LogViewer';
import { ResultView } from './components/ResultView';

// Helper to scroll logs to bottom
const useScrollToBottom = (dep: any) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, [dep]);
  return ref;
};

export default function App() {
  const [goal, setGoal] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<'idle' | 'planning' | 'executing' | 'synthesizing' | 'completed'>('idle');

  const [plan, setPlan] = useState<TaskPlan | null>(null);
  const [results, setResults] = useState<TaskResult[]>([]);
  const [finalResult, setFinalResult] = useState<OrchestratorResult | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Track hovered task for dependency visualization
  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null);

  const logsEndRef = useScrollToBottom(logs);

  const addLog = (message: string, level: 'info' | 'warning' | 'error' | 'success' = 'info') => {
    setLogs(prev => [...prev, { timestamp: new Date(), message, level }]);
  };

  const handleStart = async () => {
    if (!goal.trim()) return;

    // Reset state
    setIsProcessing(true);
    setCurrentPhase('planning');
    setPlan(null);
    setResults([]);
    setFinalResult(null);
    setLogs([]);
    setError(null);
    setHoveredTaskId(null);
    addLog(`Starting orchestration for goal: "${goal}"`, 'info');

    const orchestrator = new OrchestratorService();

    try {
      // 1. Planning
      addLog('Phase 1: Planning...', 'info');
      const generatedPlan = await orchestrator.plan(goal, (msg) => addLog(msg, 'info'));
      setPlan(generatedPlan);
      addLog(`Plan created with ${generatedPlan.tasks.length} tasks.`, 'success');

      // 2. Execution
      setCurrentPhase('executing');
      addLog('Phase 2: Execution...', 'info');

      const executionResults: TaskResult[] = [];
      const tasksById = new Map(generatedPlan.tasks.map(t => [t.id, t]));

      // Initialize placeholder results for UI
      setResults(generatedPlan.tasks.map(t => ({
        taskId: t.id,
        status: 'pending',
        output: '',
        tokenUsage: {},
        durationMs: 0
      })));

      // Execute groups sequentially
      for (const group of generatedPlan.parallelGroups) {
        addLog(`Executing parallel group: ${group.join(', ')}`, 'info');

        // Update UI status to running for this group
        setResults(prev => prev.map(r =>
          group.includes(r.taskId) ? { ...r, status: 'running' } : r
        ));

        // Create promises for the group
        const groupPromises = group.map(async (taskId) => {
          const task = tasksById.get(taskId);
          if (!task) return null;

          try {
            // Find dependencies
            const dependencyResults: Record<string, TaskResult> = {};
            task.dependencies.forEach(depId => {
              const found = executionResults.find(r => r.taskId === depId);
              if (found) dependencyResults[depId] = found;
            });

            const result = await orchestrator.executeTask(task, dependencyResults);
            return result;
          } catch (e: any) {
            addLog(`Task ${taskId} failed: ${e.message}`, 'error');
            return {
              taskId,
              status: 'failed',
              output: '',
              error: e.message,
              tokenUsage: {},
              durationMs: 0
            } as TaskResult;
          }
        });

        const groupResults = await Promise.all(groupPromises);

        // Update valid results and state
        groupResults.forEach(res => {
          if (res) {
            executionResults.push(res);
            setResults(prev => prev.map(r => r.taskId === res.taskId ? res : r));
            if (res.status === 'completed') {
              addLog(`Task "${tasksById.get(res.taskId)?.name}" completed.`, 'success');
            }
          }
        });
      }

      // 3. Synthesis
      setCurrentPhase('synthesizing');
      addLog('Phase 3: Synthesizing results...', 'info');
      const final = await orchestrator.synthesize(generatedPlan, executionResults);
      setFinalResult(final);
      addLog('Orchestration completed successfully.', 'success');
      setCurrentPhase('completed');

    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred");
      addLog(`Orchestration failed: ${err.message}`, 'error');
      setCurrentPhase('completed'); // Stop spinner
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setGoal('');
    setPlan(null);
    setResults([]);
    setFinalResult(null);
    setLogs([]);
    setCurrentPhase('idle');
    setError(null);
    setHoveredTaskId(null);
  };

  return (
    <div className="min-h-screen bg-transparent text-white p-4 md:p-8 font-sans selection:bg-[#00f0ff]/30">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <header className="flex items-center justify-between pb-6 border-b border-[#00f0ff]/20">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-[#00f0ff] blur-xl opacity-30 animate-pulse"></div>
              <div className="relative p-3 bg-black/50 rounded-xl border border-[#00f0ff]/30">
                <BrainCircuit className="w-8 h-8 text-[#00f0ff]" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold font-mono">
                <span className="text-[#00f0ff]">GEMINI</span>
                <span className="text-white">_</span>
                <span className="text-[#ff00ff]">ORCHESTRATOR</span>
                <span className="text-[#00f0ff] animate-pulse">_</span>
              </h1>
              <p className="text-sm text-gray-500 font-mono">MULTI-AGENT TASK DECOMPOSITION</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-4 py-1.5 rounded-full text-xs font-mono font-medium border ${currentPhase === 'idle' ? 'bg-gray-900 border-gray-700 text-gray-400' :
                currentPhase === 'completed' ? 'bg-[#39ff14]/10 border-[#39ff14]/30 text-[#39ff14]' :
                  'bg-[#00f0ff]/10 border-[#00f0ff]/30 text-[#00f0ff] animate-pulse'
              }`}>
              ◈ {currentPhase.toUpperCase()}
            </span>
          </div>
        </header>

        {/* Input Section */}
        <section className="bg-black/40 backdrop-blur-sm rounded-2xl border border-[#00f0ff]/20 p-1 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-16 h-16 border-l border-t border-[#00f0ff]/30"></div>
          <div className="absolute bottom-0 right-0 w-16 h-16 border-r border-b border-[#ff00ff]/30"></div>

          <div className="relative">
            <textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              disabled={isProcessing}
              placeholder="Describe a complex task... (e.g., 'Research the current state of Quantum Computing, write a technical summary, and generate 3 LinkedIn post drafts about it.')"
              className="w-full bg-black/50 text-white p-4 min-h-[120px] rounded-xl border-none focus:ring-2 focus:ring-[#00f0ff]/50 resize-none placeholder:text-gray-600 outline-none transition-all font-mono"
            />
            <div className="absolute bottom-4 right-4 flex gap-2">
              {currentPhase === 'completed' && (
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-4 py-2 bg-black/50 border border-[#ff00ff]/50 hover:bg-[#ff00ff]/10 text-[#ff00ff] rounded-lg transition-colors font-mono text-sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  RESET
                </button>
              )}
              <button
                onClick={handleStart}
                disabled={isProcessing || !goal.trim()}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg font-mono font-medium text-sm transition-all ${isProcessing || !goal.trim()
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#00f0ff] to-[#00a0ff] text-black hover:shadow-[0_0_20px_rgba(0,240,255,0.4)]'
                  }`}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    PROCESSING...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    START ORCHESTRATION
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column: Task Board */}
          <div className="lg:col-span-2 space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3 text-red-400">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm font-mono">◈ ERROR: {error}</p>
              </div>
            )}

            {plan ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-mono font-bold text-white flex items-center gap-3">
                    <div className="w-1 h-6 bg-[#00f0ff]"></div>
                    EXECUTION PLAN
                  </h2>
                  <span className="text-xs font-mono text-gray-500">
                    {results.filter(r => r.status === 'completed').length} / {plan.tasks.length} TASKS COMPLETED
                  </span>
                </div>

                <div className="grid gap-4">
                  {plan.tasks.map((task) => {
                    const result = results.find(r => r.taskId === task.id);
                    const isHovered = hoveredTaskId === task.id;

                    // Relationship Logic:
                    // 1. Get the currently hovered task object
                    const hoveredTaskObj = plan.tasks.find(t => t.id === hoveredTaskId);

                    // 2. Is THIS task a Prerequisite for the hovered task? (Parent)
                    // i.e., Does the hovered task depend on this task?
                    const isPrerequisite = hoveredTaskObj?.dependencies.includes(task.id) || false;

                    // 3. Is THIS task Dependent on the hovered task? (Child)
                    // i.e., Does this task have the hovered task in its dependencies?
                    const isDependent = task.dependencies.includes(hoveredTaskId || '') || false;

                    return (
                      <TaskCard
                        key={task.id}
                        task={task}
                        result={result}
                        isPending={!result || result.status === 'pending'}
                        onEnter={() => setHoveredTaskId(task.id)}
                        onLeave={() => setHoveredTaskId(null)}
                        isHovered={isHovered}
                        isPrerequisite={isPrerequisite}
                        isDependent={isDependent}
                      />
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-gray-600 border-2 border-dashed border-gray-800 rounded-2xl bg-black/20">
                <Layout className="w-12 h-12 mb-3 opacity-30" />
                <p className="font-mono text-sm">TASKS WILL APPEAR HERE AFTER PLANNING</p>
              </div>
            )}

            {finalResult && (
              <ResultView result={finalResult} />
            )}
          </div>

          {/* Right Column: Logs */}
          <div className="lg:col-span-1">
            <div className="bg-black/40 backdrop-blur-sm rounded-2xl border border-[#ff00ff]/20 shadow-xl overflow-hidden flex flex-col h-[600px] sticky top-6">
              <div className="p-4 border-b border-[#ff00ff]/20 bg-black/30 backdrop-blur flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#ff00ff]" />
                <h3 className="text-sm font-mono font-bold text-[#ff00ff]">◈ SYSTEM LOGS</h3>
              </div>
              <div ref={logsEndRef} className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs">
                <LogViewer logs={logs} />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}