"use client";

import React, { Suspense, useEffect, useState } from "react";
import { Cpu, Zap, Terminal } from "lucide-react";
import UserMenu from "@/components/UserMenu";

const MarketingAgent = React.lazy(() => import("../ai-marketing-agent/App"));
const ContentStudio = React.lazy(() => import("../content-generation-studio/App"));
const ImageStudio = React.lazy(() => import("../image-studio/App"));
const MultiAgentOrch = React.lazy(() => import("../multi-agent-orch/App"));
const ContentArchitect = React.lazy(() => import("../content_architect/App"));
const SentinelCode = React.lazy(() => import("../sentinel-code/App"));
const AgenticStoryboard = React.lazy(() => import("../agentic-storyboard/App"));
const PromptArch = React.lazy(() => import("../prompt-arch/App"));
const Hormozi = React.lazy(() => import("../hormozi/App"));
const Poetry = React.lazy(() => import("../poetry/App"));
const ThreePs = React.lazy(() => import("../3ps/App"));
const ArtifactToLife = React.lazy(() => import("../artifact-to-life/App"));

// Get environment variable API key if available (for Vercel deployments).
// Use Next.js compile-time injection so server and client always see the same value.
const ENV_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY ?? '';

const tabs = [
  { id: "agent", label: "AI Marketing", icon: "🎯" },
  { id: "studio", label: "Content Studio", icon: "✍️" },
  { id: "image", label: "Image Studio", icon: "🎨" },
  { id: "orchestrator", label: "Orchestrator", icon: "🧠" },
  { id: "architect", label: "Architect", icon: "🏗️" },
  { id: "sentinel", label: "Sentinel", icon: "🛡️" },
  { id: "storyboard", label: "Storyboard", icon: "🎬" },
  { id: "promptarch", label: "Prompt Arch", icon: "✨" },
  { id: "hormozi", label: "Hormozi", icon: "💰" },
  { id: "poetry", label: "Kinetic Poet", icon: "✍️" },
  { id: "3ps", label: "3Ps Strategist", icon: "💡" },
  { id: "artifact", label: "Artifact to Life", icon: "⚡" },
] as const;

type TabId = typeof tabs[number]["id"];

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>("agent");
  const [apiKey, setApiKey] = useState("");
  const [draftKey, setDraftKey] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      // Priority: localStorage > environment variable
      const saved = window.localStorage.getItem("GEMINI_API_KEY") || ENV_API_KEY || "";
      setApiKey(saved);
      setDraftKey(saved);

      // Always use dark theme for cyberpunk
      document.documentElement.classList.add("dark");
      window.localStorage.setItem("theme", "dark");
    } catch { }
  }, []);

  function handleSave() {
    try {
      window.localStorage.setItem("GEMINI_API_KEY", draftKey.trim());
    } catch { }
    setApiKey(draftKey.trim());
  }

  function handleClear() {
    try {
      window.localStorage.removeItem("GEMINI_API_KEY");
    } catch { }
    setApiKey("");
    setDraftKey("");
  }

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Cyberpunk Grid Background */}
      <div className="fixed inset-0 cyber-grid z-0"></div>

      {/* Gradient Overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#0a0a1a] via-[#0f0f2a] to-[#1a0a2a] z-0"></div>

      {/* Animated Corner Accents */}
      <div className="fixed top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-[#00f0ff]/30 z-10"></div>
      <div className="fixed top-0 right-0 w-32 h-32 border-r-2 border-t-2 border-[#ff00ff]/30 z-10"></div>
      <div className="fixed bottom-0 left-0 w-32 h-32 border-l-2 border-b-2 border-[#ff00ff]/30 z-10"></div>
      <div className="fixed bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-[#00f0ff]/30 z-10"></div>

      {/* Main Content */}
      <div className="relative z-20 px-6 py-8 sm:px-10">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-[#00f0ff] blur-xl opacity-30 animate-pulse"></div>
              <div className="relative bg-black/50 p-3 rounded-xl border border-[#00f0ff]/50 backdrop-blur-sm">
                <Cpu size={28} className="text-[#00f0ff]" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight font-mono">
                <span className="text-[#00f0ff] neon-text">NEURAL</span>
                <span className="text-white">_</span>
                <span className="text-[#ff00ff] neon-text-magenta">CORE</span>
                <span className="text-[#00f0ff] animate-pulse">_</span>
              </h1>
              <p className="text-sm text-gray-400 font-mono tracking-widest">
                AI SYSTEMS INTERFACE v3.0
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-lg border border-[#00f0ff]/20 backdrop-blur-sm">
              <div className="w-2 h-2 rounded-full bg-[#39ff14] animate-pulse shadow-[0_0_10px_#39ff14]"></div>
              <span className="text-xs font-mono text-gray-400">SYSTEMS ONLINE</span>
            </div>
            <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-lg border border-[#ff00ff]/20 backdrop-blur-sm">
              <Terminal size={14} className="text-[#ff00ff]" />
              <span className="text-xs font-mono text-gray-400">v3.0.0</span>
            </div>
            <UserMenu />
          </div>
        </header>

        {/* API Key Section */}
        <section className="mb-8 bg-black/40 backdrop-blur-sm rounded-xl border border-[#00f0ff]/20 p-6 relative overflow-hidden">
          {/* Decorative corner */}
          <div className="absolute top-0 right-0 w-20 h-20 border-r border-t border-[#00f0ff]/30"></div>
          <div className="absolute bottom-0 left-0 w-20 h-20 border-l border-b border-[#ff00ff]/30"></div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label htmlFor="apiKey" className="flex items-center gap-2 text-sm font-mono font-medium mb-2 text-[#00f0ff]">
                <Zap size={14} />
                GEMINI API KEY
              </label>
              <input
                id="apiKey"
                type="password"
                className="w-full px-4 py-3 border border-[#00f0ff]/30 rounded-lg bg-black/50 text-white font-mono placeholder:text-gray-600 focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff] focus:outline-none transition-all"
                placeholder="Enter your Gemini API key..."
                value={draftKey}
                onChange={(e) => setDraftKey(e.target.value)}
                autoComplete="off"
              />
              <p className="mt-2 text-xs font-mono text-gray-500">
                ◈ Stored locally in browser memory. Not transmitted to external servers.
                {ENV_API_KEY && <span className="block mt-1 text-[#39ff14]">◈ Environment variable detected</span>}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                className="px-6 py-3 rounded-lg font-mono text-sm font-medium bg-gradient-to-r from-[#00f0ff] to-[#00a0ff] text-black hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all duration-300 glitch-hover"
              >
                SAVE KEY
              </button>
              <button
                onClick={handleClear}
                className="px-6 py-3 rounded-lg font-mono text-sm font-medium border border-[#ff00ff]/50 text-[#ff00ff] hover:bg-[#ff00ff]/10 hover:shadow-[0_0_20px_rgba(255,0,255,0.3)] transition-all duration-300"
              >
                CLEAR
              </button>
            </div>
          </div>

          {mounted && apiKey && (
            <div className="mt-4 flex items-center gap-2 text-xs font-mono text-[#39ff14]">
              <div className="w-2 h-2 rounded-full bg-[#39ff14] shadow-[0_0_10px_#39ff14]"></div>
              API KEY CONFIGURED (ending with ...{apiKey.slice(-4)})
            </div>
          )}
          {mounted && !apiKey && (
            <div className="mt-4 flex items-center gap-2 text-xs font-mono text-[#ff6b6b]">
              <div className="w-2 h-2 rounded-full bg-[#ff6b6b] animate-pulse"></div>
              WARNING: No API key detected. Enter your Gemini API key above.
            </div>
          )}
        </section>

        {/* Tab Navigation */}
        <div className="mb-6">
          <nav className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`group relative px-5 py-3 rounded-lg font-mono text-sm transition-all duration-300 ${activeTab === tab.id
                  ? "bg-gradient-to-r from-[#00f0ff]/20 to-[#ff00ff]/20 text-white border border-[#00f0ff]/50 shadow-[0_0_15px_rgba(0,240,255,0.2)]"
                  : "bg-black/30 text-gray-400 border border-gray-800 hover:border-[#00f0ff]/30 hover:text-white hover:bg-black/50"
                  }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {/* Active indicator line */}
                {activeTab === tab.id && (
                  <div className="absolute -top-px left-4 right-4 h-[2px] bg-gradient-to-r from-[#00f0ff] via-[#ff00ff] to-[#00f0ff]"></div>
                )}
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content Panel */}
        <div className="relative bg-black/40 backdrop-blur-sm rounded-xl border border-[#00f0ff]/20 overflow-hidden" role="tabpanel">
          {/* Top decoration line */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#00f0ff]/50 to-transparent"></div>

          {/* Corner decorations */}
          <div className="absolute top-0 left-0 w-6 h-6 border-l-2 border-t-2 border-[#00f0ff]/50"></div>
          <div className="absolute top-0 right-0 w-6 h-6 border-r-2 border-t-2 border-[#ff00ff]/50"></div>
          <div className="absolute bottom-0 left-0 w-6 h-6 border-l-2 border-b-2 border-[#ff00ff]/50"></div>
          <div className="absolute bottom-0 right-0 w-6 h-6 border-r-2 border-b-2 border-[#00f0ff]/50"></div>

          {mounted ? (
            <Suspense
              fallback={
                <div className="p-12 text-center">
                  <div className="inline-block relative">
                    <div className="w-12 h-12 border-2 border-[#00f0ff]/30 rounded-full"></div>
                    <div className="absolute inset-0 w-12 h-12 border-2 border-[#00f0ff] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <p className="mt-4 text-sm font-mono text-gray-400 animate-pulse">LOADING MODULE...</p>
                </div>
              }
            >
              {activeTab === "agent" && <MarketingAgent apiKey={apiKey} />}
              {activeTab === "studio" && <ContentStudio apiKey={apiKey} />}
              {activeTab === "image" && <ImageStudio apiKey={apiKey} />}
              {activeTab === "orchestrator" && <MultiAgentOrch />}
              {activeTab === "architect" && <ContentArchitect />}
              {activeTab === "sentinel" && <SentinelCode />}
              {activeTab === "storyboard" && <AgenticStoryboard apiKey={apiKey} />}
              {activeTab === "promptarch" && <PromptArch apiKey={apiKey} />}
              {activeTab === "hormozi" && <Hormozi apiKey={apiKey} />}
              {activeTab === "poetry" && <Poetry apiKey={apiKey} />}
              {activeTab === "3ps" && <ThreePs />}
              {activeTab === "artifact" && <ArtifactToLife apiKey={apiKey} />}
            </Suspense>
          ) : (
            <div className="p-12 text-center">
              <div className="inline-block relative">
                <div className="w-12 h-12 border-2 border-[#00f0ff]/30 rounded-full"></div>
                <div className="absolute inset-0 w-12 h-12 border-2 border-[#00f0ff] border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="mt-4 text-sm font-mono text-gray-400">INITIALIZING NEURAL CORE...</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center">
          <div className="inline-flex items-center gap-4 text-xs font-mono text-gray-600">
            <span>◈ NEURAL_CORE SYSTEMS</span>
            <span className="w-1 h-1 rounded-full bg-[#00f0ff]/50"></span>
            <span>QUANTUM PROCESSING ENABLED</span>
            <span className="w-1 h-1 rounded-full bg-[#ff00ff]/50"></span>
            <span>© 2077 MEGACORP</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
