import Sidebar from "../layout/sidebar";
import { motion } from "framer-motion"
import Link from "next/link";
import { Play, Clock, BarChart3, ChevronRight, Trophy, Calendar, Zap, Target } from "lucide-react";
import { useContestStore } from "../../store";
import { useEffect, useState } from "react";

export default function CandidateDashboard() {
    const { myContests, getMyContests } = useContestStore()
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetch = async () => {
            await getMyContests()
            setIsLoading(false)
        }
        fetch()
    }, [])

    const liveContests = myContests.filter((c: any) => c.status === 'LIVE')
    const upcomingContests = myContests.filter((c: any) => c.status === 'PUBLISHED' || (c.status === 'LIVE' && !liveContests.includes(c)))
    const displayedUpcoming = myContests.filter((c: any) => c.status === 'PUBLISHED')

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
                        <span className="w-2 h-2 rounded-full bg-green-500" /> System Online
                    </motion.div>
                    <h1 className="text-4xl md:text-5xl font-clean font-bold text-white tracking-tight mb-2">
                        Welcome Back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-red to-red-600 font-cursive text-6xl">Warrior</span>
                    </h1>
                    <p className="text-slate-400 text-lg max-w-2xl">The arena awaits. Ready to challenge yourself today?</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Live Contests Carousel */}
                        {liveContests.length > 0 ? (
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Zap className="text-brand-red fill-brand-red" size={20} /> Live Now
                                </h2>
                                <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar snap-x">
                                    {liveContests.map((contest: any) => (
                                        <motion.div
                                            key={contest.id}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="min-w-[300px] md:min-w-[400px] bg-gradient-to-br from-[#111] to-black border border-brand-red/30 rounded-[2rem] p-8 relative overflow-hidden group snap-center"
                                        >
                                            <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-brand-red/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
                                            <div className="relative z-10">
                                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold bg-brand-red text-white shadow-lg shadow-brand-red/20 mb-4 tracking-wide uppercase">
                                                    LIVE
                                                </span>
                                                <h3 className="text-2xl font-bold text-white mb-2 leading-tight">{contest.title}</h3>
                                                <div className="flex items-center gap-4 text-sm font-medium text-slate-400 mb-6">
                                                    <span className="flex items-center gap-1"><Clock size={14} /> Ends in 2h</span>
                                                    <span className="flex items-center gap-1"><Target size={14} /> {contest._count?.questions || 0} Qs</span>
                                                </div>
                                                <Link href={`/contest/${contest.id}`}>
                                                    <button className="flex items-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-brand-red hover:text-white transition-all shadow-lg group/btn w-full justify-center">
                                                        <Play size={16} className="fill-current" />
                                                        Enter Arena
                                                    </button>
                                                </Link>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="p-8 rounded-[2rem] bg-white/5 border border-white/5 text-center">
                                <Trophy size={40} className="mx-auto mb-4 text-slate-600" />
                                <h3 className="text-xl font-bold text-slate-300">No Live Battles</h3>
                                <p className="text-slate-500">Prepare yourself. The next challenge is coming soon.</p>
                            </div>
                        )}

                        {/* Upcoming Contests List */}
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-white font-serif">Upcoming Battles</h2>
                                <Link href="/contests">
                                    <button className="text-sm font-bold text-slate-500 hover:text-white flex items-center gap-1 transition-colors uppercase tracking-wider">
                                        View All <ChevronRight size={16} />
                                    </button>
                                </Link>
                            </div>
                            <div className="space-y-4">
                                {displayedUpcoming.length > 0 ? displayedUpcoming.map((contest: any, i: number) => (
                                    <div key={contest.id} className="group flex items-center justify-between p-5 rounded-2xl bg-[#0A0A0A] border border-white/5 hover:border-brand-red/30 hover:bg-[#111] transition-all">
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 rounded-xl bg-[#151515] flex items-center justify-center text-slate-500 group-hover:text-brand-red group-hover:scale-110 transition-all duration-300 border border-white/5">
                                                <Calendar size={24} />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-white group-hover:text-brand-red transition-colors mb-1">{contest.title}</h3>
                                                <div className="flex items-center gap-3 text-xs text-slate-500 uppercase tracking-wide font-medium">
                                                    <span>Starts: {new Date(contest.startTime).toLocaleDateString()}</span>
                                                    <span className="w-1 h-1 rounded-full bg-slate-700" />
                                                    <span>{new Date(contest.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button className="px-5 py-2.5 rounded-xl bg-white/5 text-sm font-bold text-slate-300 hover:bg-white hover:text-black transition-all border border-white/5">
                                            Register
                                        </button>
                                    </div>
                                )) : (
                                    <div className="text-center py-10 text-slate-500">
                                        <p>No upcoming battles scheduled.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Stats Panel (Unchanged) */}
                    <div className="space-y-6">
                        <div className="bg-[#050505] border border-white/5 rounded-[2rem] p-6">
                            <h2 className="text-xl font-bold text-white mb-6 font-serif">Performance</h2>
                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between text-sm mb-2 font-medium">
                                        <span className="text-slate-400">Problems Solved</span>
                                        <span className="text-white">145  <span className="text-slate-600">/ 200</span></span>
                                    </div>
                                    <div className="h-2 bg-[#111] rounded-full overflow-hidden border border-white/5">
                                        <div className="h-full w-[72%] bg-brand-red rounded-full shadow-[0_0_10px_rgba(220,38,38,0.5)]" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-5 rounded-2xl bg-[#111] border border-white/5 text-center group hover:border-white/10 transition-colors">
                                        <div className="text-yellow-500 mb-2 flex justify-center group-hover:scale-110 transition-transform"><Trophy size={24} className="fill-current" /></div>
                                        <div className="text-2xl font-bold text-white">12</div>
                                        <div className="text-xs text-slate-500 uppercase tracking-wider font-bold">Wins</div>
                                    </div>
                                    <div className="p-5 rounded-2xl bg-[#111] border border-white/5 text-center group hover:border-white/10 transition-colors">
                                        <div className="text-brand-red mb-2 flex justify-center group-hover:scale-110 transition-transform"><Target size={24} /></div>
                                        <div className="text-2xl font-bold text-white">Top 5%</div>
                                        <div className="text-xs text-slate-500 uppercase tracking-wider font-bold">Rank</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-b from-brand-red to-red-900 rounded-[2rem] p-8 text-white relative overflow-hidden group shadow-lg shadow-red-500/20 border border-white/5 hover:border-white/10 transition-all duration-300 ">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
                            <div className="relative z-10 text-center">
                                <h3 className="text-2xl font-bold mb-2 font-serif">Pro Access</h3>
                                <p className="text-red-100 text-sm mb-6 leading-relaxed">Unlock advanced analytics and premium problem sets.</p>
                                <button className="w-full py-3 bg-white text-brand-red rounded-xl font-bold text-sm hover:bg-red-50 transition-colors shadow-lg">
                                    Upgrade Now
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
