"use client";

import React, { Suspense, useEffect, useState } from "react";

const MarketingAgent = React.lazy(() => import("../ai-marketing-agent/App"));
const ContentStudio = React.lazy(() => import("../content-generation-studio/App"));

export default function Home() {
  const [activeTab, setActiveTab] = useState<"agent" | "studio">("agent");
  const [apiKey, setApiKey] = useState("");
  const [draftKey, setDraftKey] = useState("");
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("GEMINI_API_KEY") || "";
      setApiKey(saved);
      setDraftKey(saved);
      
      // Check for saved theme or system preference
      const savedTheme = window.localStorage.getItem("theme");
      if (savedTheme === "dark") {
        setIsDark(true);
        document.documentElement.classList.add("dark");
      } else if (savedTheme === "light") {
        setIsDark(false);
        document.documentElement.classList.remove("dark");
      } else {
        // Use system preference
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        setIsDark(prefersDark);
        if (prefersDark) {
          document.documentElement.classList.add("dark");
        }
      }
    } catch {}
  }, []);

  function handleSave() {
    try {
      window.localStorage.setItem("GEMINI_API_KEY", draftKey.trim());
    } catch {}
    setApiKey(draftKey.trim());
  }

  function handleClear() {
    try {
      window.localStorage.removeItem("GEMINI_API_KEY");
    } catch {}
    setApiKey("");
    setDraftKey("");
  }

  function toggleDarkMode() {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    
    if (newIsDark) {
      document.documentElement.classList.add("dark");
      window.localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      window.localStorage.setItem("theme", "light");
    }
  }

  return (
    <div className="min-h-screen w-full px-6 py-8 sm:px-10">
      <header className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">AI Tools</h1>
          <p className="text-sm text-muted-foreground">Switch between apps using the tabs below.</p>
        </div>
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-md border border-border bg-card hover:bg-accent transition-colors"
          aria-label="Toggle dark mode"
        >
          {isDark ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          )}
        </button>
      </header>

      <section className="mb-6 border border-border rounded-md p-4 bg-card">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-3">
          <div className="flex-1">
            <label htmlFor="apiKey" className="block text-sm font-medium mb-1">Gemini API Key</label>
            <input
              id="apiKey"
              type="password"
              className="w-full px-3 py-2 border border-input rounded-md bg-background"
              placeholder="Enter your Gemini API key"
              value={draftKey}
              onChange={(e) => setDraftKey(e.target.value)}
              autoComplete="off"
            />
            <p className="mt-1 text-xs text-muted-foreground">Stored locally in your browser (localStorage). Not shared with the server.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-md border border-border bg-primary text-primary-foreground"
            >
              Save Key
            </button>
            <button
              onClick={handleClear}
              className="px-4 py-2 rounded-md border border-border bg-muted text-foreground"
            >
              Clear
            </button>
          </div>
        </div>
        {apiKey && (
          <p className="mt-2 text-xs text-green-600">Key saved{draftKey ? " (updated)" : ""}. Using key ending with {apiKey.slice(-4)}.</p>
        )}
      </section>

      <div className="w-full border-b border-border mb-4">
        <nav className="flex gap-2">
          <button
            className={`px-4 py-2 rounded-t-md border border-b-0 ${
              activeTab === "agent"
                ? "bg-background text-foreground border-border"
                : "bg-muted text-muted-foreground border-transparent hover:text-foreground"
            }`}
            onClick={() => setActiveTab("agent")}
          >
            AI Marketing Agent
          </button>
          <button
            className={`px-4 py-2 rounded-t-md border border-b-0 ${
              activeTab === "studio"
                ? "bg-background text-foreground border-border"
                : "bg-muted text-muted-foreground border-transparent hover:text-foreground"
            }`}
            onClick={() => setActiveTab("studio")}
          >
            Content Generation Studio
          </button>
        </nav>
      </div>

      <div className="rounded-b-md rounded-tr-md border border-border bg-background" role="tabpanel">
        <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading…</div>}>
          {activeTab === "agent" ? (
            <MarketingAgent apiKey={apiKey} />
          ) : (
            <ContentStudio apiKey={apiKey} />
          )}
        </Suspense>
      </div>
    </div>
  );
}
