import React, { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  BookOpenIcon,
  SparklesIcon,
  ImageIcon,
  VideoIcon,
  QuestionIcon,
  LoaderIcon,
} from "./icons";

interface ContentDisplayProps {
  content: string;
  isLoading: boolean;
  error: string | null;
  generateImagePreview?: (prompt: string) => Promise<string>;
  generateQuizPreview?: (
    topic: string,
  ) => Promise<{ question: string; options: string[]; answer: string }>;
  generateVideoPreview?: (prompt: string) => Promise<string>;
}

type PlaceholderType = "image" | "video" | "quiz";

interface QuizContent {
  question: string;
  options: string[];
  answer: string;
}

type PreviewContent =
  | { kind: "image"; url: string }
  | { kind: "video"; url: string }
  | { kind: "quiz"; data: QuizContent };

const InteractiveMediaPlaceholder: React.FC<{
  type: PlaceholderType;
  description: string;
  generateImagePreview?: (prompt: string) => Promise<string>;
  generateQuizPreview?: (
    topic: string,
  ) => Promise<{ question: string; options: string[]; answer: string }>;
  generateVideoPreview?: (prompt: string) => Promise<string>;
}> = ({
  type,
  description,
  generateImagePreview,
  generateQuizPreview,
  generateVideoPreview,
}) => {
    const [isPreviewing, setIsPreviewing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [previewContent, setPreviewContent] = useState<PreviewContent | null>(
      null,
    );

    const handlePreview = async () => {
      setIsPreviewing(true);
      setError(null);
      try {
        if (type === "image") {
          if (!generateImagePreview) {
            throw new Error("Missing API key for image preview");
          }
          const imageUrl = await generateImagePreview(description);
          setPreviewContent({ kind: "image", url: imageUrl });
        } else if (type === "video") {
          if (generateVideoPreview) {
            const videoUrl = await generateVideoPreview(description);
            setPreviewContent({ kind: "video", url: videoUrl });
          } else {
            // Fallback: generate a cinematic thumbnail using the image generator.
            const prompt = `A cinematic still frame representing a video about: ${description}`;
            if (!generateImagePreview) {
              throw new Error("Missing API key for video preview");
            }
            const imageUrl = await generateImagePreview(prompt);
            setPreviewContent({ kind: "image", url: imageUrl });
          }
        } else if (type === "quiz") {
          if (!generateQuizPreview) {
            throw new Error("Missing API key for quiz preview");
          }
          const quizData = await generateQuizPreview(description);
          setPreviewContent({ kind: "quiz", data: quizData });
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to generate preview.",
        );
      } finally {
        setIsPreviewing(false);
      }
    };

    const ICONS: Record<
      PlaceholderType,
      { icon: React.ReactNode; color: string; title: string; borderColor: string }
    > = {
      image: {
        icon: <ImageIcon className="w-6 h-6 flex-shrink-0" />,
        color: "text-ink",
        title: "Image Suggestion",
        borderColor: "border-rule",
      },
      video: {
        icon: <VideoIcon className="w-6 h-6 flex-shrink-0" />,
        color: "text-ink-soft",
        title: "Video Suggestion",
        borderColor: "border-rule",
      },
      quiz: {
        icon: <QuestionIcon className="w-6 h-6 flex-shrink-0" />,
        color: "text-[#fcee0a]",
        title: "Quiz Suggestion",
        borderColor: "border-[#fcee0a]",
      },
    };

    const { icon, color, title, borderColor } = ICONS[type];
    const actionLabel =
      type === "image" ? "Generate Image" :
        type === "video" ? "Generate Video" :
          "Generate Quiz";

    return (
      <div className={`my-4 p-4 border rounded-lg bg-sheet backdrop- ${borderColor}/30 hover:${borderColor}/60 transition-colors`}>
        <div className="flex items-start space-x-4">
          <div className={`${color}`}>{icon}</div>
          <div className="flex-1">
            <h4 className="font-semibold text-ink tracking-wide">{title}</h4>
            <p className="text-sm text-ink-soft italic mt-1 border-l-2 border-rule pl-2">
              "{description}"
            </p>
            {!previewContent && !isPreviewing && (
              <button
                onClick={handlePreview}
                className={`mt-4 inline-flex items-center px-4 py-2 border border-transparent text-xs font-bold rounded text-black bg-signal hover:from-[#00a0ff] hover: focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-signal transition-all`}
              >
                <SparklesIcon className="w-4 h-4 mr-2" />
                {actionLabel}
              </button>
            )}
          </div>
        </div>

        {isPreviewing && (
          <div className="mt-4 pt-4 border-t border-rule">
            <div className="flex items-center text-sm text-ink">
              <LoaderIcon className="w-4 h-4 animate-spin mr-2" />
              INITIALIZING PREVIEW GENERATION...
            </div>
            <div className="animate-pulse mt-3">
              {(type === "image" || type === "video") && (
                <div className="w-full bg-signal/10 rounded-lg aspect-[16/9] border border-rule" />
              )}
              {type === "quiz" && (
                <div className="space-y-3">
                  <div className="h-4 bg-signal/10 rounded w-3/4" />
                  <div className="space-y-2 pt-2">
                    <div className="h-3 bg-signal/5 rounded w-1/2" />
                    <div className="h-3 bg-signal/5 rounded w-1/2" />
                    <div className="h-3 bg-signal/5 rounded w-1/2" />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {error && (
          <p className="mt-3 text-sm text-ink-soft border border-rule p-2 rounded bg-signal/5">
            ERROR: {error}
          </p>
        )}

        {!isPreviewing && previewContent && (
          <div className="mt-4 pt-4 border-t border-rule animate-in fade-in zoom-in-95 duration-300">
            {previewContent.kind === "image" && (
              <div className="relative group">
                <img
                  src={previewContent.url}
                  alt={description}
                  className="rounded-lg max-w-full h-auto border border-rule"
                />
                <div className="absolute inset-0 rounded-lg ring-1 ring-signal pointer-events-none"></div>
              </div>
            )}
            {previewContent.kind === "video" && (
              <video
                src={previewContent.url}
                controls
                className="rounded-lg w-full h-auto border border-rule"
              />
            )}
            {previewContent.kind === "quiz" && (
              <div className="bg-sheet p-4 rounded border border-[#fcee0a]/30">
                <p className="font-bold text-ink text-lg">{previewContent.data.question}</p>
                <ul className="list-none mt-3 space-y-2 text-sm">
                  {previewContent.data.options.map((opt, i) => (
                    <li key={i} className="flex items-center gap-2 text-ink hover:text-[#fcee0a] cursor-pointer transition-colors p-2 hover:bg-[#fcee0a]/10 rounded">
                      <span className="text-[#fcee0a]">{'>'}</span> {opt}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 pt-3 border-t border-rule">
                  <p className="text-xs text-positive">
                    CORRECT_ANSWER: <span className="font-bold">{previewContent.data.answer}</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

const Loader: React.FC = () => (
  <div className="flex flex-col items-center justify-center text-center p-8 space-y-4">
    <div className="relative">
      <div className="absolute inset-0 bg-signal opacity-20 rounded-full animate-pulse"></div>
      <SparklesIcon className="w-12 h-12 text-ink-soft animate-spin-slow relative z-10" />
    </div>
    <div>
      <p className="mt-4 text-lg font-bold text-ink">GENERATING_CONTENT...</p>
      <p className="text-xs text-ink uppercase mt-1">AI core processing request</p>
    </div>
    <div className="h-1 w-48 bg-muted rounded-full overflow-hidden">
      <div className="h-full bg-signal animate-progress origin-left w-full"></div>
    </div>
  </div>
);

const ContentDisplay = React.forwardRef<HTMLDivElement, ContentDisplayProps>(
  (
    {
      content,
      isLoading,
      error,
      generateImagePreview,
      generateQuizPreview,
      generateVideoPreview,
    },
    ref,
  ) => {
    const components = useMemo(
      () => ({
        h1: ({ children }: any) => (
          <h1 className="text-3xl font-black mt-6 mb-6 text-transparent bg-clip-text bg-signal animate-gradient-x uppercase">
            {children}
          </h1>
        ),
        h2: ({ children }: any) => (
          <h2 className="text-2xl font-black mt-8 mb-4 text-ink tracking-tight flex items-center gap-2">
            <span className="text-positive text-lg">##</span>
            {children}
          </h2>
        ),
        h3: ({ children }: any) => (
          <h3 className="text-xl font-bold mt-6 mb-3 text-ink border-b border-rule pb-1 w-fit">
            {children}
          </h3>
        ),
        p: ({ children }: any) => {
          // Handle interactive tokens like [Image: description]
          const text = React.Children.toArray(children).join("");
          const imageMatch = text.match(/\[Image:\s*(.*?)\]/);
          const videoMatch = text.match(/\[Video:\s*(.*?)\]/);
          const quizMatch = text.match(/\[Quiz:\s*(.*?)\]/);

          if (imageMatch) {
            return (
              <InteractiveMediaPlaceholder
                type="image"
                description={imageMatch[1]}
                generateImagePreview={generateImagePreview}
                generateVideoPreview={generateVideoPreview}
              />
            );
          }
          if (videoMatch) {
            return (
              <InteractiveMediaPlaceholder
                type="video"
                description={videoMatch[1]}
                generateImagePreview={generateImagePreview}
                generateQuizPreview={generateQuizPreview}
                generateVideoPreview={generateVideoPreview}
              />
            );
          }
          if (quizMatch) {
            return (
              <InteractiveMediaPlaceholder
                type="quiz"
                description={quizMatch[1]}
                generateQuizPreview={generateQuizPreview}
                generateVideoPreview={generateVideoPreview}
              />
            );
          }

          return (
            <p className="my-4 leading-7 text-ink font-sans tracking-wide">
              {children}
            </p>
          );
        },
        blockquote: ({ children }: any) => (
          <blockquote className="my-6 pl-4 border-l-2 border-rule text-ink-soft italic font-serif text-lg bg-signal/5 py-2 pr-2 rounded-r">
            {children}
          </blockquote>
        ),
        code: ({ node, inline, className, children, ...props }: any) => {
          if (inline) {
            return (
              <code
                className="bg-signal/10 text-ink rounded px-1.5 py-1 text-sm mx-1 border border-rule"
                {...props}
              >
                {children}
              </code>
            );
          }
          const match = /language-(\w+)/.exec(className || "");
          return (
            <div className="my-4 bg-sheet rounded border border-rule overflow-hidden">
              <div className="flex justify-between items-center px-4 py-1.5 bg-signal/10 border-b border-rule">
                <span className="text-[10px] text-ink uppercase">
                  {match ? match[1] : "code"}
                </span>
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-signal/50"></div>
                  <div className="w-2 h-2 rounded-full bg-[#fcee0a]/50"></div>
                  <div className="w-2 h-2 rounded-full bg-positive/50"></div>
                </div>
              </div>
              <pre className="p-4 text-sm overflow-x-auto text-ink">
                <code>{children}</code>
              </pre>
            </div>
          );
        },
        ul: ({ children }: any) => (
          <ul className="list-disc list-outside space-y-2 my-2 pl-6 text-ink text-sm marker:text-ink">
            {children}
          </ul>
        ),
        ol: ({ children }: any) => (
          <ol className="list-decimal list-outside space-y-2 my-2 pl-6 text-ink text-sm marker:text-positive">
            {children}
          </ol>
        ),
        li: ({ children }: any) => <li className="pl-1">{children}</li>,
        hr: () => <hr className="my-8 border-rule" />,
        strong: ({ children }: any) => (
          <strong className="text-positive font-bold">{children}</strong>
        ),
        em: ({ children }: any) => (
          <em className="text-ink italic">{children}</em>
        ),
      }),
      [generateImagePreview, generateQuizPreview, generateVideoPreview],
    );

    if (isLoading) {
      return <Loader />;
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-8 bg-signal/5 border border-rule rounded-lg">
          <p className="text-lg font-bold text-ink-soft uppercase">
            SYSTEM_ERROR
          </p>
          <p className="mt-2 text-ink text-sm">{error}</p>
        </div>
      );
    }

    if (!content) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-12 border border-dashed border-rule rounded-xl bg-sheet backdrop- group hover:bg-sheet transition-colors">
          <div className="p-4 rounded-full bg-signal/5 group-hover:bg-signal/10 transition-colors duration-300">
            <BookOpenIcon className="w-12 h-12 text-ink/50 group-hover:text-ink transition-colors duration-300" />
          </div>
          <h3 className="mt-6 text-xl font-bold text-ink tracking-wide">
            AWAITING_INPUT
          </h3>
          <p className="mt-2 text-xs text-ink-soft uppercase">
            Fill out the form to initialize content generation sequence.
          </p>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        id="export-container"
        className="max-w-none animate-in fade-in slide-in-from-bottom-4 duration-700"
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
          {content}
        </ReactMarkdown>
      </div>
    );
  },
);

export default ContentDisplay;