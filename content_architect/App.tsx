import React, { useState, useCallback } from 'react';
import { 
    PipelineStage, 
    AgentLog, 
    ContentConfig, 
    ResearchBrief,
    ContentDraft,
    EditSuggestions,
    FinalContent,
    GeneratedImage
} from './types';
import { agentResearch, agentDraft, agentEdit, agentPublish, agentGenerateImages } from './services/gemini';
import StageStepper from './components/StageStepper';
import AgentTerminal from './components/AgentTerminal';
import PipelineForm from './components/PipelineForm';
import ResultViewer from './components/ResultViewer';
import { Layers, Terminal } from 'lucide-react';

const App: React.FC = () => {
    const [currentStage, setCurrentStage] = useState<PipelineStage>(PipelineStage.IDLE);
    const [logs, setLogs] = useState<AgentLog[]>([]);
    
    // Data Artifacts
    const [researchData, setResearchData] = useState<ResearchBrief | null>(null);
    const [draftData, setDraftData] = useState<ContentDraft | null>(null);
    const [editData, setEditData] = useState<EditSuggestions | null>(null);
    const [finalData, setFinalData] = useState<FinalContent | null>(null);
    const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);

    const addLog = useCallback((stage: PipelineStage, message: string) => {
        setLogs(prev => [...prev, {
            id: Math.random().toString(36).substr(2, 9),
            stage,
            message,
            timestamp: Date.now()
        }]);
    }, []);

    const runPipeline = async (config: ContentConfig) => {
        if (!process.env.API_KEY) {
            alert("Missing API_KEY in environment variables.");
            return;
        }

        // Reset
        setResearchData(null);
        setDraftData(null);
        setEditData(null);
        setFinalData(null);
        setGeneratedImages([]);
        setLogs([]);
        
        try {
            // --- Stage 1: Research ---
            setCurrentStage(PipelineStage.RESEARCH);
            addLog(PipelineStage.RESEARCH, `Agent 'Researcher' initialized for topic: "${config.topic}"`);
            addLog(PipelineStage.RESEARCH, `Analyzing audience: ${config.targetAudience}...`);
            
            const brief = await agentResearch(config);
            setResearchData(brief);
            addLog(PipelineStage.RESEARCH, `Research complete. Identified ${brief.key_points.length} key points.`);

            // --- Stage 2: Draft ---
            setCurrentStage(PipelineStage.DRAFT);
            addLog(PipelineStage.DRAFT, `Agent 'Writer' started. Target tone: ${config.tone}`);
            addLog(PipelineStage.DRAFT, `Structuring content based on research brief...`);
            
            const draft = await agentDraft(config, brief);
            setDraftData(draft);
            addLog(PipelineStage.DRAFT, `Draft generated. Length: ${draft.estimated_reading_time} min read.`);

            // --- Stage 3: Edit ---
            setCurrentStage(PipelineStage.EDIT);
            addLog(PipelineStage.EDIT, `Agent 'Editor' reviewing draft for clarity and structure...`);
            
            const edits = await agentEdit(config, draft);
            setEditData(edits);
            addLog(PipelineStage.EDIT, `Editorial review complete. Score: ${edits.overall_score}/100.`);

            // --- Stage 4: Publish ---
            setCurrentStage(PipelineStage.PUBLISH);
            addLog(PipelineStage.PUBLISH, `Agent 'Publisher' optimizing for SEO and formatting...`);
            
            const final = await agentPublish(config, draft, edits);
            setFinalData(final);
            addLog(PipelineStage.PUBLISH, `Content published. Generating visual concepts...`);

            // --- Stage 5: Visualize (New) ---
            if (final.image_prompts && final.image_prompts.length > 0) {
                setCurrentStage(PipelineStage.VISUALIZE);
                addLog(PipelineStage.VISUALIZE, `Agent 'Artist' received ${final.image_prompts.length} prompts. Rendering...`);
                
                const images = await agentGenerateImages(final.image_prompts);
                setGeneratedImages(images);
                addLog(PipelineStage.VISUALIZE, `Rendering complete. ${images.length} visuals generated.`);
            } else {
                addLog(PipelineStage.VISUALIZE, `No image prompts found. Skipping visualization.`);
            }
            
            addLog(PipelineStage.COMPLETE, `Pipeline finished successfully. All artifacts ready.`);
            setCurrentStage(PipelineStage.COMPLETE);

        } catch (error: any) {
            console.error(error);
            setCurrentStage(PipelineStage.ERROR);
            addLog(PipelineStage.ERROR, `Pipeline failed: ${error.message || 'Unknown error'}`);
        }
    };

    return (
        <div className="min-h-screen flex flex-col relative overflow-hidden bg-cyber-black selection:bg-cyber-primary selection:text-black">
            {/* Background Grid */}
            <div className="absolute inset-0 cyber-grid z-0"></div>

            {/* Header */}
            <header className="bg-cyber-black/80 backdrop-blur-md border-b border-cyber-primary/20 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-cyber-primary/10 p-2 rounded border border-cyber-primary/30 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                            <Layers size={20} className="text-cyber-primary" />
                        </div>
                        <h1 className="text-xl font-bold text-white tracking-tight font-mono">
                            AutoContent <span className="text-cyber-primary">Architect</span>
                            <span className="text-cyber-primary animate-pulse">_</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-mono text-cyber-text bg-cyber-panel/50 px-3 py-1.5 rounded border border-white/5">
                        <Terminal size={14} className="text-cyber-accent" />
                        <span>SYS.VERSION: v2.5.0</span>
                    </div>
                </div>
            </header>

            <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left Column: Configuration & Status */}
                <div className="lg:col-span-4 space-y-6 flex flex-col h-full">
                    <div className="bg-cyber-panel/40 backdrop-blur-sm rounded-xl border border-white/5 p-5 shadow-2xl">
                        <StageStepper currentStage={currentStage} />
                    </div>

                    <PipelineForm 
                        onStart={runPipeline} 
                        isLoading={currentStage !== PipelineStage.IDLE && currentStage !== PipelineStage.COMPLETE && currentStage !== PipelineStage.ERROR} 
                    />
                    
                    <div className="flex-1 min-h-0">
                        <AgentTerminal logs={logs} />
                    </div>
                </div>

                {/* Right Column: Output Viewer */}
                <div className="lg:col-span-8 h-full min-h-[600px]">
                    <ResultViewer 
                        research={researchData} 
                        draft={draftData} 
                        edits={editData} 
                        final={finalData}
                        images={generatedImages}
                    />
                </div>
            </main>
        </div>
    );
};

export default App;