'use client'

import { useEffect, useState } from "react"
import { useContestStore } from "../../store"
import { toast, ToastContainer } from "react-toastify"
import Navbar from "../layout/navbar"
import { Calendar, Clock, Search, Trophy, Target, Loader, Play } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"

export default function CandidateContests() {
    const { myContests, getMyContests } = useContestStore()
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const router = useRouter()

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true)
                await getMyContests()
            } catch (error) {
                console.error("Failed to fetch data", error)
                toast.error("Failed to load contests")
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [])

    const filteredContests = myContests.filter((c: any) =>
        c.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-black text-slate-100 selection:bg-brand-red/30 relative overflow-hidden">
            <ToastContainer position="top-right" theme="dark" />
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[20%] right-[20%] w-[600px] h-[600px] rounded-full bg-brand-red/10 blur-[150px] animate-pulse" />
                <div className="absolute bottom-[20%] left-[20%] w-[500px] h-[500px] rounded-full bg-red-900/10 blur-[150px]" />
            </div>
            <Navbar />
            <main className="container mx-auto px-4 pt-24 pb-12 relative z-10">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-40">
                        <Loader className="animate-spin text-brand-red mb-4" size={48} />
                        <p className="text-slate-500 font-mono animate-pulse">Loading Arena...</p>
                    </div>
                ) : (
                    <>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                            <div>
                                <h1 className="text-4xl md:text-5xl font-bold font-serif text-white mb-2">
                                    My <span className="text-brand-red">Battles</span>
                                </h1>
                                <p className="text-slate-400 max-w-xl">
                                    View and join all contests you are eligible for.
                                </p>
                            </div>
                        </div>

                        <div className="relative w-full md:w-96 mb-8">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                            <input
                                type="text"
                                placeholder="Search battles..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-[#050505] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-brand-red/50 focus:ring-1 focus:ring-brand-red/50 transition-all placeholder:text-slate-600"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <AnimatePresence>
                                {filteredContests.map((contest: any, index: number) => (
                                    <motion.div
                                        key={contest.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="group bg-[#050505]/80 backdrop-blur-md border border-white/10 hover:border-brand-red/30 rounded-2xl p-6 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-red/5 relative overflow-hidden flex flex-col h-full"
                                    >
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-red/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-brand-red/10 transition-all" />

                                        <div className="flex justify-between items-start mb-4 relative z-10">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold border ${contest.status === 'LIVE' ? 'bg-green-500/20 border-green-500/50 text-green-500' :
                                                contest.status === 'PUBLISHED' ? 'bg-blue-500/20 border-blue-500/50 text-blue-500' :
                                                    'bg-slate-500/20 border-slate-500/50 text-slate-500'
                                                }`}>
                                                {contest.status}
                                            </span>
                                            {contest.status === 'LIVE' && (
                                                <div className="flex items-center gap-1 text-xs text-red-500 font-bold animate-pulse">
                                                    <span className="w-2 h-2 rounded-full bg-red-500" /> LIVE
                                                </div>
                                            )}
                                        </div>

                                        <h3 className="text-xl font-bold text-white mb-2 line-clamp-1 font-serif group-hover:text-brand-red transition-colors">{contest.title}</h3>

                                        <div className="flex flex-col gap-2 text-sm text-slate-400 mb-6 flex-grow">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} className="text-slate-500" />
                                                <span>{new Date(contest.startTime).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock size={14} className="text-slate-500" />
                                                <span>{new Date(contest.startTime).toLocaleTimeString()}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Target size={14} className="text-slate-500" />
                                                <span>{contest._count?.questions || 0} Questions</span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() =>{(
                                                contest.status === 'LIVE' ? router.push(`/contest/${contest.id}`) : contest.status === 'FINISHED' ? router.push(`/contest/${contest.id}/leaderboard`) : contest.status === 'WAITING' ? router.push(`/contest/${contest.id}/waiting-room`) : router.push(`/contest/${contest.id}`)
                                            )}}
                                            className="w-full py-3 bg-white/5 hover:bg-white text-slate-300 hover:text-black font-bold rounded-xl border border-white/5 transition-all flex items-center justify-center gap-2 group/btn"
                                        >
                                            <Play size={16} className="fill-current" />
                                            {contest.status === 'LIVE' ? 'Enter Contest' : contest.status === 'FINISHED' ? 'View leaderboard' : contest.status === 'WAITING' ? 'Join Waiting Room' : 'View Contest Details'}
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                        {filteredContests.length === 0 && (
                            <div className="text-center py-20 opacity-50">
                                <Trophy size={48} className="mx-auto mb-4 text-slate-600" />
                                <h3 className="text-xl font-bold text-slate-400">No Battles Found</h3>
                                <p className="text-slate-600">You have no upcoming battles.</p>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    )
}
