"use client";

import Link from "next/link";
import { ArrowLeft, Home, Search } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden selection:bg-brand-red/30">

            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[20%] left-[20%] w-[500px] h-[500px] bg-brand-red/10 blur-[150px] rounded-full animate-pulse" />
                <div className="absolute bottom-[20%] right-[20%] w-[500px] h-[500px] bg-red-900/10 blur-[150px] rounded-full" />
            </div>

            <div className="relative z-10 text-center max-w-2xl">
                <h1 className="text-[12rem] md:text-[16rem] font-bold text-transparent bg-clip-text bg-gradient-to-b from-brand-red to-black leading-[0.8] opacity-50 select-none font-cursive">
                    404
                </h1>

                <div className="relative -mt-12 md:-mt-20">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 font-clean">Lost in the Void?</h2>
                    <p className="text-slate-400 text-lg md:text-xl mb-10 max-w-lg mx-auto">
                        The page you are looking for has been consumed by the darkness or never existed in this timeline.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/" className="w-full sm:w-auto">
                            <button className="w-full px-8 py-3 bg-brand-red hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-brand-red/20 hover:shadow-brand-red/30 transition-all flex items-center justify-center gap-2">
                                <Home size={20} /> Return Home
                            </button>
                        </Link>
                        <button
                            onClick={() => window.history.back()}
                            className="w-full sm:w-auto px-8 py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                        >
                            <ArrowLeft size={20} /> Go Back
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
