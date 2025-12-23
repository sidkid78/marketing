"use client"

import { useSession, signOut } from "next-auth/react"
import { LogOut, User } from "lucide-react"

export default function UserMenu() {
    const { data: session, status } = useSession()

    if (status === "loading") {
        return (
            <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-lg border border-[#00f0ff]/20 backdrop-blur-sm">
                <div className="w-6 h-6 rounded-full bg-gray-600 animate-pulse"></div>
                <span className="text-xs font-mono text-gray-400">Loading...</span>
            </div>
        )
    }

    if (!session?.user) {
        return null
    }

    return (
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-lg border border-[#00f0ff]/20 backdrop-blur-sm">
                {session.user.image ? (
                    <img
                        src={session.user.image}
                        alt={session.user.name || "User"}
                        className="w-6 h-6 rounded-full border border-[#00f0ff]/50"
                    />
                ) : (
                    <User size={16} className="text-[#00f0ff]" />
                )}
                <span className="text-xs font-mono text-gray-300 max-w-[120px] truncate">
                    {session.user.name || session.user.email}
                </span>
            </div>
            <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex items-center gap-2 bg-black/40 px-3 py-2 rounded-lg border border-[#ff00ff]/20 backdrop-blur-sm hover:border-[#ff00ff]/50 transition-all group"
                title="Sign out"
            >
                <LogOut size={14} className="text-[#ff00ff] group-hover:text-white transition-colors" />
                <span className="text-xs font-mono text-gray-400 group-hover:text-white transition-colors">
                    Sign Out
                </span>
            </button>
        </div>
    )
}
