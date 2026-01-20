'use client'
import { useParams } from "next/navigation";
import ImageSphere from "../../../../components/ImageSphere";
import Navbar from "../../../components/layout/navbar";

// Generate dummy avatars
const AVATARS = Array.from({ length: 50 }).map((_, i) =>
    `https://api.dicebear.com/9.x/avataaars/png?seed=${i}`
);

export default function ContestPage() {
    const { id } = useParams();

    return (
        <div className="min-h-screen bg-black text-white font-sans overflow-hidden relative">
            <Navbar />

            {/* Background Sphere */}
            <div className="absolute inset-0 z-0">
                <ImageSphere images={AVATARS} />
            </div>

            {/* Overlay Content */}
            <div className="relative z-10 container mx-auto px-4 h-full min-h-screen flex flex-col justify-center items-center pointer-events-none">
                <div className="glass-card p-8 md:p-12 rounded-[2rem] text-center max-w-2xl w-full border border-white/10 backdrop-blur-md bg-black/40 pointer-events-auto">
                    <div className="mb-4">
                        <span className="inline-block w-3 h-3 rounded-full bg-green-500 animate-pulse mr-2"></span>
                        <span className="text-sm font-mono uppercase tracking-widest text-slate-400">Waiting Room</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-clean font-bold mb-6">Contest <span className="text-brand-red font-cursive">#{id}</span></h1>

                    <p className="font-clean text-xl text-slate-300 mb-8 max-w-lg mx-auto leading-relaxed">
                        The arena is preparing. Gladiators are gathering. Prepare your algorithms for the ultimate showdown.
                    </p>

                    <div className="flex justify-center gap-4 mb-8">
                        <div className="flex flex-col items-center">
                            <span className="text-3xl font-bold text-white">124</span>
                            <span className="text-xs uppercase text-slate-500 tracking-wider">Players Ready</span>
                        </div>
                        <div className="w-px h-12 bg-white/10"></div>
                        <div className="flex flex-col items-center">
                            <span className="text-3xl font-bold text-white">05:23</span>
                            <span className="text-xs uppercase text-slate-500 tracking-wider">Time to Start</span>
                        </div>
                    </div>

                    <button className="bg-brand-red hover:bg-red-600 text-white px-8 py-3 rounded-full font-bold transition-all shadow-lg hover:shadow-brand-red/25 border border-white/10">
                        Join Discussion
                    </button>
                </div>
            </div>

            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" />
        </div>
    );
}