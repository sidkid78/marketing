export enum ContentType {
    BLOG_POST = "blog_post",
    ARTICLE = "article",
    TUTORIAL = "tutorial",
    DOCUMENTATION = "documentation",
    SOCIAL_MEDIA = "social_media"
}
  
export enum ToneStyle {
    PROFESSIONAL = "professional",
    CASUAL = "casual",
    TECHNICAL = "technical",
    CONVERSATIONAL = "conversational",
    ACADEMIC = "academic"
}
  
export interface ContentConfig {
    topic: string;
    contentType: ContentType;
    tone: ToneStyle;
    targetAudience: string;
    wordCountTarget: number;
}

export interface Section {
    heading: string;
    content: string;
}

export interface ResearchBrief {
    key_points: string[];
    target_audience_analysis: string;
    recommended_angle: string;
    seo_keywords: string[];
    sources_type: string[];
}

export interface ContentDraft {
    title: string;
    subtitle?: string;
    introduction: string;
    main_sections: Section[];
    conclusion: string;
    estimated_reading_time: number;
}

export interface ClarityIssue {
    issue: string;
    suggestion: string;
    relevant_text_snippet: string;
    suggestion_reasoning?: string;
}

export interface EditSuggestions {
    overall_score: number;
    structure_feedback: string;
    clarity_issues: ClarityIssue[];
    tone_consistency_check: string;
}

export interface FinalContent {
    title: string;
    meta_description: string;
    tags: string[];
    full_markdown: string;
    image_prompts: string[];
}

export interface GeneratedImage {
    prompt: string;
    url: string;
}

export enum PipelineStage {
    IDLE = 'idle',
    RESEARCH = 'research',
    DRAFT = 'draft',
    EDIT = 'edit',
    PUBLISH = 'publish',
    VISUALIZE = 'visualize',
    COMPLETE = 'complete',
    ERROR = 'error'
}

export interface AgentLog {
    id: string;
    stage: PipelineStage;
    message: string;
    timestamp: number;
}