'use client'
import { useParams } from "next/navigation"
import Navbar from "../../components/layout/navbar"
import { Trophy } from "lucide-react"

export default function ContestPage() {
    const { id } = useParams()
    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-brand-red/30">
            <Navbar />
            <div className="container mx-auto px-4 pt-24 pb-12 flex flex-col items-center justify-center min-h-[80vh]">
                <div className="w-20 h-20 rounded-2xl bg-brand-red/10 flex items-center justify-center text-brand-red mb-6 border border-brand-red/20">
                    <Trophy size={40} />
                </div>
                <h1 className="text-4xl md:text-5xl font-clean font-bold mb-4 text-center">Contest Details</h1>
                <p className="text-slate-400 text-lg mb-8 font-clean">Viewing information for Contest <span className="text-brand-red">{id}</span></p>
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 max-w-lg w-full text-center">
                    <p className="text-slate-500 italic">This module is currently under development.</p>
                </div>
            </div>
        </div>
    )
}