import Navbar from "../layout/navbar"
import { motion } from "framer-motion"
import Link from "next/link"
import { Plus, Users, Trophy, Activity, ArrowUpRight, Search, Filter, MoreHorizontal, ShieldAlert, Zap } from "lucide-react"

export default function AdminDashboard() {
    return (
        <div className="min-h-screen bg-black text-slate-100 selection:bg-brand-red/30 relative overflow-hidden">
            <Navbar />

            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] rounded-full bg-brand-red/10 blur-[100px]" />
                <div className="absolute bottom-[-20%] right-[-20%] w-[600px] h-[600px] rounded-full bg-red-900/10 blur-[100px]" />
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 relative z-10">
                <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full border border-brand-red/30 bg-brand-red/10 text-brand-red text-xs font-mono uppercase tracking-widest">
                            <ShieldAlert size={14} /> Admin access granted
                        </div>
                        <h1 className="text-4xl md:text-5xl font-clean font-bold text-white tracking-tight">
                            Command Center
                        </h1>
                        <p className="text-slate-400 mt-2 text-lg">Manage contests, batches, and monitor system diagnostics.</p>
                    </div>
                    <Link href="/admin/create-contest">
                        <button className="group flex items-center gap-3 px-6 py-3 bg-brand-red hover:bg-red-700 text-white rounded-xl transition-all shadow-lg shadow-brand-red/20 hover:shadow-brand-red/40">
                            <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                            <span className="font-bold tracking-wide">Create Contest</span>
                        </button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {[
                        { label: "Total Students", value: "1,234", change: "+12%", icon: Users, color: "text-brand-red", bg: "bg-brand-red/10" },
                        { label: "Active Contests", value: "8", change: "+2", icon: Trophy, color: "text-yellow-400", bg: "bg-yellow-400/10" },
                        { label: "Avg. Score", value: "76%", change: "+5.4%", icon: Activity, color: "text-green-400", bg: "bg-green-400/10" },
                        { label: "Participation", value: "92%", change: "+1.2%", icon: Zap, color: "text-orange-400", bg: "bg-orange-400/10" },
                    ].map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-[#0A0A0A] border border-white/5 p-6 rounded-2xl hover:border-brand-red/30 transition-all hover:-translate-y-1 group"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} border border-white/5 group-hover:border-white/10 transition-colors`}>
                                    <stat.icon size={20} />
                                </div>
                                <span className="text-xs font-bold text-slate-300 bg-white/5 px-2 py-1 rounded-full border border-white/5">
                                    {stat.change}
                                </span>
                            </div>
                            <h3 className="text-3xl font-bold text-white mb-1 group-hover:text-brand-red transition-colors">{stat.value}</h3>
                            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-[#050505] border border-white/5 rounded-3xl p-6 overflow-hidden">
                            <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Activity size={20} className="text-brand-red" /> Live Operations
                                </h2>
                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <div className="relative flex-1 sm:w-64">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                        <input
                                            type="text"
                                            placeholder="Search contests..."
                                            className="w-full bg-[#111] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-300 focus:outline-none focus:border-brand-red/50 focus:ring-1 focus:ring-brand-red/50 placeholder:text-slate-600 transition-all"
                                        />
                                    </div>
                                    <button className="p-2.5 bg-[#111] hover:bg-white/5 rounded-xl border border-white/10 transition-colors text-slate-400 hover:text-white">
                                        <Filter size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-white/5 text-xs text-slate-500 uppercase tracking-widest font-mono">
                                            <th className="pb-4 pl-4">Contest Name</th>
                                            <th className="pb-4">Date</th>
                                            <th className="pb-4">Participants</th>
                                            <th className="pb-4">Status</th>
                                            <th className="pb-4 pr-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        {[
                                            { name: "Weekly Challenge #45", date: "Oct 24, 2025", participants: 342, status: "Active" },
                                            { name: "Dynamic Programming Basics", date: "Oct 28, 2025", participants: 128, status: "Upcoming" },
                                            { name: "Graph Theory Advanced", date: "Oct 20, 2025", participants: 89, status: "Ended" },
                                        ].map((contest, i) => (
                                            <tr key={i} className="group border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                                <td className="py-5 pl-4 text-white font-medium group-hover:text-brand-red transition-colors">{contest.name}</td>
                                                <td className="py-5 text-slate-400">{contest.date}</td>
                                                <td className="py-5 text-slate-400 font-mono">{contest.participants}</td>
                                                <td className="py-5">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border uppercase tracking-wide ${contest.status === "Active" ? "bg-brand-red/10 text-brand-red border-brand-red/20" :
                                                        contest.status === "Upcoming" ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                                                            "bg-slate-800 text-slate-400 border-slate-700"
                                                        }`}>
                                                        {contest.status}
                                                    </span>
                                                </td>
                                                <td className="py-5 pr-4 text-right">
                                                    <button className="text-slate-600 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg">
                                                        <MoreHorizontal size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-[#050505] border border-white/5 rounded-3xl p-6">
                            <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
                            <div className="space-y-3">
                                {[
                                    "Manage Batches",
                                    "View Reports",
                                    "System Settings",
                                    "User Management"
                                ].map((action) => (
                                    <button key={action} className="w-full text-left px-5 py-4 rounded-xl text-sm font-medium text-slate-400 bg-[#111] hover:bg-[#151515] hover:text-white border border-transparent hover:border-white/5 transition-all flex items-center justify-between group">
                                        {action}
                                        <ArrowUpRight size={16} className="text-slate-600 group-hover:text-brand-red transition-colors" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
