'use client'
import { useParams } from "next/navigation"
import Navbar from "../../../components/layout/navbar"
import { Code2 } from "lucide-react"

export default function ContestPlayPage() {
    const { id } = useParams()
    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-brand-red/30">
            <Navbar />
            <div className="container mx-auto px-4 pt-24 pb-12 flex flex-col items-center justify-center min-h-[80vh]">
                <div className="w-16 h-16 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 mb-6 border border-orange-500/20">
                    <Code2 size={32} />
                </div>
                <h1 className="text-4xl md:text-5xl font-clean font-bold mb-4 text-center">The Arena</h1>
                <p className="text-slate-400 text-lg mb-8 font-clean">Preparing environment for Contest <span className="text-brand-red">{id}</span></p>
                <div className="w-full max-w-2xl h-64 bg-[#0A0A0A] border border-white/10 rounded-2xl flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:20px_20px]" />
                    <code className="relative z-10 text-brand-red font-mono">System.init(arena_{id})...</code>
                </div>
            </div>
        </div>
    )
}
