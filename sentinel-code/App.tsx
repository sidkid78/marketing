import React, { useState, useCallback, useRef } from 'react';
import { Play, RotateCcw, ShieldCheck, Terminal, Code2, Activity, Upload } from 'lucide-react';
import AgentCard from './components/AgentCard';
import ScoreGauge from './components/ScoreGauge';
import FindingsList from './components/FindingsList';
import { AgentState, AgentStatus, CodeReviewReport } from './types';
import * as geminiService from './services/geminiService';

const DEFAULT_CODE = `def get_user_data(user_id):
    # Vulnerable SQL query
    query = f"SELECT * FROM users WHERE id = {user_id}"
    conn = db.connect()
    result = conn.execute(query)
    return result.fetchall()

def process_items(items):
    # Performance issue - O(n²)
    result = []
    for i in items:
        for j in items:
            if i != j:
                result.append((i, j))
    return result

class UserManager:
    # Missing documentation
    def update(self, id, data):
        # No input validation
        db.update(id, data)
        return True
`;

const INITIAL_AGENTS: AgentState[] = [
  { id: 'security', name: 'Security Agent', status: AgentStatus.IDLE, description: 'Analyzes vulnerabilities & risks', findingsCount: 0 },
  { id: 'performance', name: 'Performance Agent', status: AgentStatus.IDLE, description: 'Optimizes speed & resources', findingsCount: 0 },
  { id: 'quality', name: 'Quality Agent', status: AgentStatus.IDLE, description: 'Reviews style & maintainability', findingsCount: 0 },
];

const detectLanguage = (filename: string): string | null => {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'py': return 'python';
    case 'js':
    case 'jsx': return 'javascript';
    case 'ts':
    case 'tsx': return 'typescript';
    case 'go': return 'go';
    case 'rs': return 'rust';
    default: return null;
  }
};

export default function App() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [language, setLanguage] = useState('python');
  const [agents, setAgents] = useState<AgentState[]>(INITIAL_AGENTS);
  const [report, setReport] = useState<CodeReviewReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateAgentStatus = (id: string, status: AgentStatus, count: number = 0) => {
    setAgents(prev => prev.map(agent =>
      agent.id === id ? { ...agent, status, findingsCount: count } : agent
    ));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content === 'string') {
        setCode(content);
        const detected = detectLanguage(file.name);
        if (detected) {
          setLanguage(detected);
        }
      }
    };
    reader.readAsText(file);
    // Reset value to allow re-uploading the same file
    event.target.value = '';
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleReview = useCallback(async () => {
    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      alert("Please set the NEXT_PUBLIC_GEMINI_API_KEY environment variable to run this application.");
      return;
    }

    setIsAnalyzing(true);
    setReport(null);
    setAgents(INITIAL_AGENTS.map(a => ({ ...a, status: AgentStatus.ANALYZING })));

    try {
      // 1. Parallel Agent Execution
      const [securityRes, performanceRes, qualityRes] = await Promise.all([
        geminiService.analyzeSecurity(code, language).then(res => {
          updateAgentStatus('security', AgentStatus.COMPLETED, res.length);
          return res;
        }),
        geminiService.analyzePerformance(code, language).then(res => {
          updateAgentStatus('performance', AgentStatus.COMPLETED, res.length);
          return res;
        }),
        geminiService.analyzeQuality(code, language).then(res => {
          updateAgentStatus('quality', AgentStatus.COMPLETED, res.length);
          return res;
        })
      ]);

      // 2. Synthesis
      const finalReport = await geminiService.synthesizeReport(code, securityRes, performanceRes, qualityRes);
      setReport(finalReport);

    } catch (error) {
      console.error("Pipeline Error", error);
      setAgents(prev => prev.map(a => a.status === AgentStatus.ANALYZING ? { ...a, status: AgentStatus.ERROR } : a));
    } finally {
      setIsAnalyzing(false);
    }
  }, [code, language]);

  return (
    <div className="min-h-screen bg-transparent text-white flex flex-col">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
        accept=".py,.js,.jsx,.ts,.tsx,.go,.rs,.txt"
        aria-label="File Upload"
        title="File Upload"
      />

      {/* Header */}
      <header className="border-b border-[#00f0ff]/20 bg-black/40 backdrop-blur-sm">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-[#39ff14] blur-xl opacity-30"></div>
              <div className="relative bg-black/50 p-2 rounded-lg border border-[#39ff14]/50">
                <ShieldCheck className="w-5 h-5 text-[#39ff14]" />
              </div>
            </div>
            <div>
              <h1 className="font-bold text-lg font-mono">
                <span className="text-[#39ff14]">SENTINEL</span>
                <span className="text-white">_</span>
                <span className="text-[#00f0ff]">CODE</span>
                <span className="text-[#39ff14] animate-pulse">_</span>
              </h1>
              <p className="text-xs text-gray-500 font-mono">AI-POWERED CODE REVIEW PIPELINE</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full border border-[#00f0ff]/20">
              <Terminal className="w-4 h-4 text-[#00f0ff]" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent text-sm focus:outline-none text-gray-300 font-mono"
                aria-label="Select Language"
              >
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="go">Go</option>
                <option value="rust">Rust</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Code Input */}
        <div className="lg:col-span-7 flex flex-col gap-4 h-[calc(100vh-10rem)]">
          <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-[#00f0ff]/20 flex flex-col flex-1 overflow-hidden shadow-2xl relative">
            <div className="absolute top-0 left-0 w-8 h-8 border-l border-t border-[#00f0ff]/30"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-r border-t border-[#ff00ff]/30"></div>

            <div className="flex items-center justify-between px-4 py-3 border-b border-[#00f0ff]/10 bg-black/30">
              <div className="flex items-center gap-2 text-sm font-mono text-[#00f0ff]">
                <Code2 className="w-4 h-4" />
                <span>◈ SOURCE CODE</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={triggerFileUpload}
                  className="p-2 hover:bg-[#00f0ff]/10 rounded-lg transition-colors text-gray-400 hover:text-[#00f0ff]"
                  title="Upload File"
                >
                  <Upload className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCode(DEFAULT_CODE)}
                  className="p-2 hover:bg-[#ff00ff]/10 rounded-lg transition-colors text-gray-400 hover:text-[#ff00ff]"
                  title="Reset Code"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={handleReview}
                  disabled={isAnalyzing}
                  className="flex items-center gap-2 bg-gradient-to-r from-[#39ff14] to-[#00ff88] disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-black px-4 py-2 rounded-lg text-sm font-mono font-medium transition-all shadow-lg shadow-[#39ff14]/20 hover:shadow-[0_0_20px_rgba(57,255,20,0.4)]"
                >
                  {isAnalyzing ? (
                    <>PROCESSING...</>
                  ) : (
                    <><Play className="w-4 h-4 fill-current" /> RUN REVIEW</>
                  )}
                </button>
              </div>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="flex-1 bg-black/50 p-4 font-mono text-sm resize-none focus:outline-none text-gray-300 leading-relaxed"
              spellCheck={false}
              placeholder="Paste your code here..."
            />
          </div>

          {/* Agent Status Deck */}
          <div className="grid grid-cols-3 gap-4">
            {agents.map(agent => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        </div>

        {/* Right Column: Analysis Results */}
        <div className="lg:col-span-5 flex flex-col h-[calc(100vh-10rem)]">
          <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-[#ff00ff]/20 flex flex-col flex-1 shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 left-0 w-8 h-8 border-l border-t border-[#ff00ff]/30"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-r border-b border-[#00f0ff]/30"></div>

            <div className="flex items-center gap-2 px-4 py-3 border-b border-[#ff00ff]/10 bg-black/30">
              <Activity className="w-4 h-4 text-[#ff00ff]" />
              <span className="text-sm font-mono text-[#ff00ff]">◈ ANALYSIS REPORT</span>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {!report && !isAnalyzing && (
                <div className="h-full flex flex-col items-center justify-center text-gray-600 opacity-50">
                  <ShieldCheck className="w-16 h-16 mb-4" />
                  <p className="font-mono text-sm">READY TO ANALYZE CODE</p>
                </div>
              )}

              {isAnalyzing && !report && (
                <div className="h-full flex flex-col items-center justify-center">
                  <div className="relative w-24 h-24 mb-6">
                    <div className="absolute inset-0 border-4 border-[#00f0ff]/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-[#00f0ff] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <p className="font-mono text-[#00f0ff] animate-pulse">ORCHESTRATING AGENTS...</p>
                </div>
              )}

              {report && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {/* Score Section */}
                  <div className="flex flex-col items-center justify-center bg-black/30 p-6 rounded-xl border border-white/5">
                    <ScoreGauge score={report.overall_score} />
                    <div className={`mt-4 px-4 py-1.5 rounded-full text-sm font-mono font-bold border ${report.approved ? 'bg-[#39ff14]/10 text-[#39ff14] border-[#39ff14]/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}`}>
                      {report.approved ? '✅ APPROVED FOR PRODUCTION' : '❌ REVISION REQUIRED'}
                    </div>
                  </div>

                  {/* Summary Section */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">◈ EXECUTIVE SUMMARY</h3>
                    <p className="text-sm text-gray-300 leading-relaxed bg-black/30 p-4 rounded-lg border border-white/5 font-mono">
                      {report.summary}
                    </p>
                  </div>

                  {/* Detailed Findings */}
                  <div>
                    <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider mb-4">◈ DETAILED FINDINGS</h3>
                    <FindingsList
                      security={report.security_findings}
                      performance={report.performance_issues}
                      quality={report.quality_issues}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}