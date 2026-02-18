"use client";

import Sidebar from "../components/layout/sidebar";
import { motion } from "framer-motion";
import Link from "next/link";
import { Clock, ChevronRight, Video, Calendar } from "lucide-react";
import { useAuthStore } from "../store";
import { useEffect, useState } from "react";
import axios from "axios";

export default function MyInterviewsPage() {
    const { token } = useAuthStore();
    const [isLoading, setIsLoading] = useState(true);
    const [interviews, setInterviews] = useState<any[]>([]);

    useEffect(() => {
        const fetchInterviews = async () => {
            if (token) {
                try {
                    const res = await axios.get(`http://localhost:3001/interview/my-interviews`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setInterviews(res.data.interviews);
                } catch (e) {
                    console.error("Failed to fetch interviews", e);
                }
            }
            setIsLoading(false);
        };
        fetchInterviews();
    }, [token]);

    return (
        <div className="min-h-screen bg-black text-slate-100 selection:bg-brand-red/30 relative overflow-hidden">
            <Sidebar />

            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-[10%] left-[20%] w-[400px] h-[400px] rounded-full bg-brand-red/5 blur-[80px]" />
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 md:pt-12 md:pl-24 pb-12 relative z-10">
                <div className="mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full border border-white/10 bg-white/5 text-slate-400 text-xs font-mono uppercase tracking-widest"
                    >
                        <span className="w-2 h-2 rounded-full bg-brand-red" /> Interviews
                    </motion.div>
                    <h1 className="text-4xl md:text-5xl font-clean font-bold text-white tracking-tight mb-2">
                        My <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-red to-red-600 font-cursive text-6xl">Interviews</span>
                    </h1>
                    <p className="text-slate-400 text-lg max-w-2xl">Manage your scheduled interviews and history.</p>
                </div>

                {isLoading ? (
                    <div className="text-center py-20 text-slate-500">Loading your schedule...</div>
                ) : interviews.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {interviews.map((interview) => (
                            <motion.div
                                key={interview.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-[#111] border border-white/5 p-6 rounded-3xl hover:border-brand-red/30 transition-all group relative overflow-hidden flex flex-col"
                            >
                                <div className="flex justify-between items-start mb-4 relative z-10">
                                    <div className="p-3 bg-white/5 rounded-2xl text-brand-red">
                                        <Video size={24} />
                                    </div>
                                    <span className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wide bg-white/5 border border-white/5 ${interview.status === 'SCHEDULED' ? 'text-blue-400' : 'text-slate-400'}`}>
                                        {interview.status}
                                    </span>
                                </div>
                                <h3 className="font-bold text-xl text-white mb-2 relative z-10">{interview.topic}</h3>
                                <p className="text-slate-500 text-sm mb-6 line-clamp-2 relative z-10 h-10">{interview.description || "No description provided."}</p>

                                <div className="mt-auto space-y-4 relative z-10">
                                    <div className="flex items-center gap-2 text-slate-400 text-sm p-3 bg-black/40 rounded-xl border border-white/5">
                                        <Calendar size={16} className="text-brand-red" />
                                        {new Date(interview.startTime).toLocaleDateString()}
                                        <span className="w-1 h-1 bg-slate-600 rounded-full" />
                                        {new Date(interview.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>

                                    {(() => {
                                        const start = new Date(interview.startTime).getTime();
                                        const now = new Date().getTime();
                                        const diffMinutes = (start - now) / (1000 * 60);
                                        const isJoinable = diffMinutes <= 5;

                                        // Only show join button if scheduled and within time window (or ongoing)
                                        // Simple logic: if status is SCHEDULED
                                        if (interview.status !== 'SCHEDULED') return null;

                                        return (
                                            <Link href={isJoinable ? `/interview/${interview.id}` : '#'} onClick={(e) => !isJoinable && e.preventDefault()}>
                                                <button
                                                    disabled={!isJoinable}
                                                    className={`w-full py-3 rounded-xl transition-all text-sm font-bold flex items-center justify-center gap-2 
                                                        ${isJoinable
                                                            ? 'bg-brand-red text-white hover:bg-red-600 shadow-lg shadow-brand-red/25'
                                                            : 'bg-white/5 text-slate-500 cursor-not-allowed opacity-50 border border-white/5'}`}
                                                >
                                                    {isJoinable ? (
                                                        <>Join Interview Room <ChevronRight size={16} /></>
                                                    ) : (
                                                        <>Starts in {Math.max(0, Math.ceil(diffMinutes))} mins</>
                                                    )}
                                                </button>
                                            </Link>
                                        );
                                    })()}
                                </div>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-red/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-brand-red/10 transition-colors" />
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="p-12 rounded-[2rem] bg-white/5 border border-white/5 text-center max-w-lg mx-auto">
                        <Video size={48} className="mx-auto mb-6 text-slate-700" />
                        <h3 className="text-xl font-bold text-slate-300 mb-2">No Scheduled Interviews</h3>
                        <p className="text-slate-500">You don't have any upcoming interviews at the moment.</p>
                    </div>
                )}
            </main>
        </div>
    );
}
