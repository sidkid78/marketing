"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import {
  Target, PenLine, Image as ImageIcon, Network, Blocks, ShieldCheck,
  Clapperboard, Wand2, BadgeDollarSign, Feather, Lightbulb, Zap,
  BarChart3, Megaphone, House, Youtube, KeyRound, Check, X, Moon, Sun, Menu,
} from "lucide-react";

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
const CampaignManager = React.lazy(() => import("../campaign-manager/App"));
const AdCampaigns = React.lazy(() => import("../ad-campaigns/app"));
const Dwellingly = React.lazy(() => import("../dwellingly/App"));
const YoutubeExtractor = React.lazy(() => import("../youtube-extractor/App"));

// Inlined at build time by Next.js. Only NEXT_PUBLIC_ vars reach the browser.
const ENV_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY ?? "";

// Sixteen tools is too many to scan as one flat list, so they are grouped by
// what you are trying to get out of them rather than by how they are built.
type TabId =
  | "agent" | "3ps" | "hormozi" | "campaign" | "ads"
  | "studio" | "architect" | "promptarch" | "poetry"
  | "image" | "storyboard" | "artifact"
  | "orchestrator" | "sentinel" | "dwellingly" | "youtube";

interface Tool {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  blurb: string;
}

const groups: { name: string; tools: Tool[] }[] = [
  {
    name: "Strategy",
    tools: [
      { id: "agent", label: "Marketing plan", icon: Target, blurb: "Positioning, channels and content ideas from a brief" },
      { id: "3ps", label: "3Ps strategist", icon: Lightbulb, blurb: "Find the angle in pain, profession and passion" },
      { id: "hormozi", label: "Offer builder", icon: BadgeDollarSign, blurb: "Grand-slam offers and direct-response copy" },
      { id: "campaign", label: "Campaign manager", icon: BarChart3, blurb: "Plan and track campaigns end to end" },
      { id: "ads", label: "Ad campaigns", icon: Megaphone, blurb: "Build and publish paid social campaigns" },
    ],
  },
  {
    name: "Content",
    tools: [
      { id: "studio", label: "Content studio", icon: PenLine, blurb: "Research, draft, edit and publish in one pass" },
      { id: "architect", label: "Content architect", icon: Blocks, blurb: "Staged pipeline with review at every step" },
      { id: "promptarch", label: "Prompt architect", icon: Wand2, blurb: "Build and refine prompts you reuse" },
      { id: "poetry", label: "Kinetic poet", icon: Feather, blurb: "Animated typographic pieces" },
    ],
  },
  {
    name: "Visual",
    tools: [
      { id: "image", label: "Image studio", icon: ImageIcon, blurb: "Generate and edit campaign imagery" },
      { id: "storyboard", label: "Storyboard", icon: Clapperboard, blurb: "Turn a story into scenes, stills and clips" },
      { id: "artifact", label: "Artifact to life", icon: Zap, blurb: "Turn a static artifact into a working page" },
    ],
  },
  {
    name: "Utility",
    tools: [
      { id: "orchestrator", label: "Orchestrator", icon: Network, blurb: "Plan a goal and run it across agents" },
      { id: "sentinel", label: "Code review", icon: ShieldCheck, blurb: "Security, performance and quality passes" },
      { id: "dwellingly", label: "Dwellingly", icon: House, blurb: "FSBO transaction coordination" },
      { id: "youtube", label: "YouTube extractor", icon: Youtube, blurb: "Pull transcripts out of videos" },
    ],
  },
];

const allTools = groups.flatMap((g) => g.tools);

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>("agent");
  const [apiKey, setApiKey] = useState("");
  const [draftKey, setDraftKey] = useState("");
  const [mounted, setMounted] = useState(false);
  const [keyOpen, setKeyOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const keyInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = window.localStorage.getItem("GEMINI_API_KEY") || ENV_API_KEY || "";
      setApiKey(saved);
      setDraftKey(saved);

      const savedTheme = window.localStorage.getItem("theme");
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const useDark = savedTheme ? savedTheme === "dark" : prefersDark;
      setDark(useDark);
      document.documentElement.classList.toggle("dark", useDark);
    } catch { }
  }, []);

  // A tool with no key configured is a dead end, so surface the key panel
  // rather than letting someone find out after filling in a whole form.
  useEffect(() => {
    if (mounted && !apiKey) setKeyOpen(true);
  }, [mounted, apiKey]);

  useEffect(() => {
    if (keyOpen) keyInputRef.current?.focus();
  }, [keyOpen]);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    try {
      document.documentElement.classList.toggle("dark", next);
      window.localStorage.setItem("theme", next ? "dark" : "light");
    } catch { }
  }

  function handleSave() {
    const trimmed = draftKey.trim();
    try { window.localStorage.setItem("GEMINI_API_KEY", trimmed); } catch { }
    setApiKey(trimmed);
    if (trimmed) setKeyOpen(false);
  }

  function handleClear() {
    try { window.localStorage.removeItem("GEMINI_API_KEY"); } catch { }
    setApiKey("");
    setDraftKey("");
  }

  const active = allTools.find((t) => t.id === activeTab)!;

  return (
    <div className="min-h-screen bg-bench text-ink lg:grid lg:grid-cols-[248px_1fr]">
      {/* rail */}
      <aside className="flex flex-col border-b border-rule bg-sidebar lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto lg:border-r lg:border-b-0">
        <div className="flex items-center justify-between gap-3 px-5 pt-5 pb-4">
          <div className="min-w-0">
            <h1 className="text-[15px] font-semibold tracking-tight">Neural Core</h1>
            <p className="mt-0.5 truncate text-[12.5px] text-ink-soft">
              <span className="lg:hidden">{active.label}</span>
              <span className="hidden lg:inline">{allTools.length} tools</span>
            </p>
          </div>
          <button
            onClick={() => setNavOpen((v) => !v)}
            aria-expanded={navOpen}
            aria-label={navOpen ? "Hide tools" : "Show tools"}
            className="rounded-sm p-1.5 text-ink-soft transition-colors hover:bg-sidebar-accent hover:text-ink lg:hidden"
          >
            {navOpen ? <X size={18} strokeWidth={1.75} /> : <Menu size={18} strokeWidth={1.75} />}
          </button>
        </div>

        <nav
          className={`flex-1 px-2.5 pb-2 ${navOpen ? "block" : "hidden"} lg:block`}
          aria-label="Tools"
        >
          {groups.map((group) => (
            <div key={group.name} className="mb-4">
              <h2 className="px-2.5 pb-1.5 text-[12px] font-medium text-ink-soft">
                {group.name}
              </h2>
              <ul className="space-y-px">
                {group.tools.map((tool) => {
                  const Icon = tool.icon;
                  const isActive = tool.id === activeTab;
                  return (
                    <li key={tool.id}>
                      <button
                        onClick={() => { setActiveTab(tool.id); setNavOpen(false); }}
                        aria-current={isActive ? "page" : undefined}
                        title={tool.blurb}
                        className={`group flex w-full items-center gap-2.5 rounded-sm px-2.5 py-[7px] text-left text-[13.5px] transition-colors ${isActive
                          ? "bg-signal text-white"
                          : "text-ink hover:bg-sidebar-accent"
                          }`}
                      >
                        <Icon
                          size={15}
                          strokeWidth={1.75}
                          className={isActive ? "text-white" : "text-ink-soft group-hover:text-ink"}
                        />
                        <span className="truncate">{tool.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Key config lives here, not across the top of every tool. */}
        <div className={`border-t border-rule px-2.5 py-2.5 ${navOpen ? "block" : "hidden"} lg:block`}>
          <button
            onClick={() => setKeyOpen((v) => !v)}
            aria-expanded={keyOpen}
            className="flex w-full items-center gap-2.5 rounded-sm px-2.5 py-[7px] text-left text-[13px] transition-colors hover:bg-sidebar-accent"
          >
            <KeyRound size={15} strokeWidth={1.75} className="shrink-0 text-ink-soft" />
            {mounted && apiKey ? (
              <>
                <span className="flex-1 truncate text-ink-soft">API key</span>
                <span className="value text-ink-soft">{"…" + apiKey.slice(-4)}</span>
              </>
            ) : (
              <span className="flex-1 text-destructive">
                {mounted ? "No API key set" : "API key"}
              </span>
            )}
          </button>

          <button
            onClick={toggleTheme}
            className="mt-px flex w-full items-center gap-2.5 rounded-sm px-2.5 py-[7px] text-left text-[13px] text-ink-soft transition-colors hover:bg-sidebar-accent"
          >
            {dark ? <Sun size={15} strokeWidth={1.75} /> : <Moon size={15} strokeWidth={1.75} />}
            <span>{dark ? "Light" : "Dark"}</span>
          </button>
        </div>
      </aside>

      {/* work surface */}
      <main className="min-w-0">
        {keyOpen && (
          <div className="border-b border-rule bg-sheet px-6 py-5 sm:px-8">
            <div className="max-w-2xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-[15px] font-semibold">Gemini API key</h2>
                  <p className="mt-1 text-[13px] text-ink-soft">
                    Stored in this browser only. Requests go straight to Google.
                  </p>
                </div>
                <button
                  onClick={() => setKeyOpen(false)}
                  aria-label="Close key settings"
                  className="rounded-sm p-1 text-ink-soft transition-colors hover:bg-muted hover:text-ink"
                >
                  <X size={16} strokeWidth={1.75} />
                </button>
              </div>

              <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
                <input
                  ref={keyInputRef}
                  id="apiKey"
                  type="password"
                  className="value flex-1 rounded-sm border border-rule bg-background px-3 py-2 text-ink placeholder:text-ink-soft/70 focus:border-signal focus:outline-none"
                  placeholder="AIza"
                  value={draftKey}
                  onChange={(e) => setDraftKey(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
                  autoComplete="off"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="rounded-sm bg-signal px-4 py-2 text-[13.5px] font-medium text-white transition-opacity hover:opacity-90"
                  >
                    Save key
                  </button>
                  {mounted && apiKey && (
                    <button
                      onClick={handleClear}
                      className="rounded-sm border border-rule px-4 py-2 text-[13.5px] transition-colors hover:bg-muted"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {mounted && apiKey && (
                <p className="mt-2.5 flex items-center gap-1.5 text-[12.5px] text-ink-soft">
                  <Check size={13} strokeWidth={2} />
                  Key saved
                  {ENV_API_KEY && apiKey === ENV_API_KEY && " from the deployment environment"}
                </p>
              )}
              {mounted && !apiKey && (
                <p className="mt-2.5 text-[12.5px] text-ink-soft">
                  Get one at{" "}
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-signal underline underline-offset-2"
                  >
                    aistudio.google.com
                  </a>
                </p>
              )}
            </div>
          </div>
        )}

        <div className="border-b border-rule px-6 py-5 sm:px-8">
          <h2 className="text-[19px] font-semibold tracking-tight">{active.label}</h2>
          <p className="mt-0.5 text-[13.5px] text-ink-soft">{active.blurb}</p>
        </div>

        <div className="px-6 py-6 sm:px-8" role="tabpanel" aria-label={active.label}>
          {mounted ? (
            <Suspense fallback={<Loading />}>
              <div key={activeTab} className="settle">
                {activeTab === "agent" && <MarketingAgent apiKey={apiKey} />}
                {activeTab === "studio" && <ContentStudio apiKey={apiKey} />}
                {activeTab === "image" && <ImageStudio apiKey={apiKey} />}
                {activeTab === "orchestrator" && <MultiAgentOrch apiKey={apiKey} />}
                {activeTab === "architect" && <ContentArchitect apiKey={apiKey} />}
                {activeTab === "sentinel" && <SentinelCode apiKey={apiKey} />}
                {activeTab === "storyboard" && <AgenticStoryboard apiKey={apiKey} />}
                {activeTab === "promptarch" && <PromptArch apiKey={apiKey} />}
                {activeTab === "hormozi" && <Hormozi apiKey={apiKey} />}
                {activeTab === "poetry" && <Poetry apiKey={apiKey} />}
                {activeTab === "3ps" && <ThreePs apiKey={apiKey} />}
                {activeTab === "artifact" && <ArtifactToLife apiKey={apiKey} />}
                {activeTab === "campaign" && <CampaignManager apiKey={apiKey} />}
                {activeTab === "ads" && <AdCampaigns apiKey={apiKey} />}
                {activeTab === "dwellingly" && <Dwellingly apiKey={apiKey} />}
                {activeTab === "youtube" && <YoutubeExtractor />}
              </div>
            </Suspense>
          ) : (
            <Loading />
          )}
        </div>
      </main>
    </div>
  );
}

function Loading() {
  return (
    <div className="max-w-sm py-8">
      <div className="working-bar h-[3px] w-full rounded-full" />
      <p className="mt-3 text-[13px] text-ink-soft">Loading</p>
    </div>
  );
}
