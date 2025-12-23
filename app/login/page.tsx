import { signIn } from "@/auth"
import { Cpu, Zap } from "lucide-react"

export default function LoginPage() {
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

            {/* Content */}
            <div className="relative z-20 min-h-screen flex items-center justify-center px-6">
                <div className="w-full max-w-md">
                    {/* Logo/Header */}
                    <div className="text-center mb-10">
                        <div className="inline-block relative mb-6">
                            <div className="absolute inset-0 bg-[#00f0ff] blur-xl opacity-30 animate-pulse"></div>
                            <div className="relative bg-black/50 p-4 rounded-xl border border-[#00f0ff]/50 backdrop-blur-sm">
                                <Cpu size={40} className="text-[#00f0ff]" />
                            </div>
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight font-mono mb-2">
                            <span className="text-[#00f0ff]">NEURAL</span>
                            <span className="text-white">_</span>
                            <span className="text-[#ff00ff]">CORE</span>
                        </h1>
                        <p className="text-sm text-gray-400 font-mono tracking-widest">
                            AI SYSTEMS INTERFACE v3.0
                        </p>
                    </div>

                    {/* Login Card */}
                    <div className="relative bg-black/40 backdrop-blur-sm rounded-xl border border-[#00f0ff]/20 p-8 overflow-hidden">
                        {/* Corner decorations */}
                        <div className="absolute top-0 left-0 w-6 h-6 border-l-2 border-t-2 border-[#00f0ff]/50"></div>
                        <div className="absolute top-0 right-0 w-6 h-6 border-r-2 border-t-2 border-[#ff00ff]/50"></div>
                        <div className="absolute bottom-0 left-0 w-6 h-6 border-l-2 border-b-2 border-[#ff00ff]/50"></div>
                        <div className="absolute bottom-0 right-0 w-6 h-6 border-r-2 border-b-2 border-[#00f0ff]/50"></div>

                        {/* Top decoration line */}
                        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#00f0ff]/50 to-transparent"></div>

                        <div className="text-center mb-8">
                            <h2 className="text-xl font-mono font-bold text-white mb-2">
                                AUTHENTICATION REQUIRED
                            </h2>
                            <p className="text-sm text-gray-500 font-mono">
                                Sign in to access the Neural Core dashboard
                            </p>
                        </div>

                        <form
                            action={async () => {
                                "use server"
                                await signIn("google", { redirectTo: "/" })
                            }}
                        >
                            <button
                                type="submit"
                                className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-mono text-sm font-medium bg-white text-black hover:bg-gray-100 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path
                                        fill="currentColor"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                Sign in with Google
                            </button>
                        </form>

                        <div className="mt-6 flex items-center justify-center gap-2 text-xs font-mono text-gray-600">
                            <Zap size={12} className="text-[#00f0ff]" />
                            <span>Secure authentication via OAuth 2.0</span>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 text-center">
                        <p className="text-xs font-mono text-gray-600">
                            ◈ NEURAL_CORE SYSTEMS ◈ QUANTUM PROCESSING ENABLED
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
