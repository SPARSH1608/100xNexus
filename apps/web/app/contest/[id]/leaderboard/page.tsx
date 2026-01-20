'use client'
import { useParams } from "next/navigation"
import Navbar from "../../../components/layout/navbar"
import { BarChart3 } from "lucide-react"

export default function LeaderboardPage() {
    const { id } = useParams()
    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-brand-red/30">
            <Navbar />
            <div className="container mx-auto px-4 pt-24 pb-12 flex flex-col items-center justify-center min-h-[80vh]">
                <div className="w-16 h-16 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 mb-6 border border-purple-500/20">
                    <BarChart3 size={32} />
                </div>
                <h1 className="text-4xl md:text-5xl font-clean font-bold mb-4 text-center">Leaderboard</h1>
                <p className="text-slate-400 text-lg mb-8 font-clean">Rankings for Contest <span className="text-brand-red">{id}</span></p>

                <div className="w-full max-w-md space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse"></div>
                    ))}
                </div>
            </div>
        </div>
    )
}