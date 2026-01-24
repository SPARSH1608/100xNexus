import Sidebar from "../layout/sidebar"
import { motion } from "framer-motion"
import Link from "next/link"
import { Plus, Users, Trophy, Activity, ArrowUpRight, Search, Filter, MoreHorizontal, ShieldAlert, Zap, Clock, ChevronDown, Bell, MessageSquare, Heart } from "lucide-react"
import { useContestStore, useUserStore } from "../../store"
import { useEffect } from "react"
import { format } from "date-fns";

export default function AdminDashboard() {
    const { contests, getContests, submissions, getQuizSubmissions } = useContestStore((state) => state)
    const { users, getUsers } = useUserStore((state) => state)

    useEffect(() => {
        getContests()
        getUsers()
        getQuizSubmissions()
    }, [])

    const activeContestsCount = contests.filter(c => c.status === "Active" || new Date(c.startTime) <= new Date() && new Date(c.endTime) > new Date()).length
    const totalStudents = users.length

    // Sort users by ID assuming newer users have higher IDs
    const newStudents = [...users].slice(-5).reverse();

    // Filter active/live contests for the list
    const liveBattles = contests.filter(c => c.status === "Active" || c.isOpenAll).slice(0, 4);

    return (
        <div className="min-h-screen bg-[#050505] text-slate-100 selection:bg-brand-red/30 relative overflow-hidden font-sans">
            <Sidebar />

            <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 md:pt-12 md:pl-24 pb-12 relative z-10 text-white">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative flex-1 md:w-96 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-white transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Search anything..."
                                className="w-full bg-[#111] hover:bg-[#161616] focus:bg-[#161616] border-none rounded-full py-3.5 pl-12 pr-6 text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-white/10 transition-all placeholder:text-slate-600 font-medium"
                            />
                        </div>

                        <Link href="/admin/create-contest">
                            <button className="bg-[#111] hover:bg-[#222] text-white px-6 py-3.5 rounded-full font-bold text-sm transition-all flex items-center gap-2 whitespace-nowrap">
                                <Plus size={16} /> Create
                            </button>
                        </Link>

                        <button className="w-12 h-12 bg-[#111] hover:bg-[#222] rounded-full flex items-center justify-center transition-colors text-slate-400 hover:text-white relative">
                            <Bell size={20} />
                            <span className="absolute top-3 right-3.5 w-2 h-2 bg-brand-red rounded-full border-2 border-[#111]" />
                        </button>

                        <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10">
                            <img
                                src={`https://api.dicebear.com/9.x/avataaars/svg?seed=Admin`}
                                alt="Admin"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

                    {/* Left Column (Main Content) */}
                    <div className="xl:col-span-8 flex flex-col gap-8">

                        {/* Overview Card */}
                        <div className="bg-[#111] rounded-[2.5rem] p-8 relative overflow-hidden group">
                            {/* Decorative Blur */}
                            <div className="absolute -right-20 -top-20 w-80 h-80 bg-brand-red/5 rounded-full blur-[100px] group-hover:bg-brand-red/10 transition-all duration-700" />

                            <div className="flex items-center justify-between mb-8 relative z-10">
                                <h2 className="text-xl font-bold">Overview</h2>
                                <button className="flex items-center gap-2 text-sm font-medium text-slate-400 bg-white/5 px-4 py-2 rounded-full hover:bg-white/10 transition-colors">
                                    Last month <ChevronDown size={14} />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                                {/* Metric 1: Students */}
                                <div className="bg-[#1A1A1A] rounded-[2rem] p-6 flex flex-col justify-between min-h-[160px] border border-white/5 hover:border-brand-red/20 transition-all">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3 text-slate-400">
                                            <div className="p-2 rounded-full bg-white/5">
                                                <Users size={18} />
                                            </div>
                                            <span className="font-medium">Total Students</span>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-5xl font-bold mb-2 tracking-tight">{totalStudents}</div>
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-red/10 text-brand-red text-xs font-bold border border-brand-red/20">
                                            <ArrowUpRight size={12} /> +{users.length > 0 ? '12' : '0'}%
                                            <span className="text-slate-500 font-medium ml-1">vs last month</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Metric 2: Submissions */}
                                <div className="bg-[#1A1A1A] rounded-[2rem] p-6 flex flex-col justify-between min-h-[160px] border border-white/5 hover:border-white/10 transition-all">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3 text-slate-400">
                                            <div className="p-2 rounded-full bg-white/5">
                                                <Activity size={18} />
                                            </div>
                                            <span className="font-medium">Total Submissions</span>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-5xl font-bold mb-2 tracking-tight">{submissions.length}</div>
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                                            <ArrowUpRight size={12} /> Active
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* New Gladiators Section */}
                        <div className="bg-[#111] rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div>
                                <h3 className="text-2xl font-bold mb-2">{totalStudents > 0 ? `${newStudents.length} recent gladiators joined!` : 'No gladiators yet'}</h3>
                                <p className="text-slate-400">The arena is growing. Prepare the servers.</p>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="flex -space-x-4">
                                    {newStudents.map((user, i) => (
                                        <div key={user.id || i} className="w-14 h-14 rounded-full border-4 border-[#111] bg-slate-800 hover:-translate-y-2 transition-transform duration-300 relative z-10 overflow-hidden" title={user.name}>
                                            <img
                                                src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${user.name || user.id}`}
                                                alt={user.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ))}
                                    {totalStudents === 0 && (
                                        <div className="text-slate-500 text-sm">No users found</div>
                                    )}
                                </div>
                            </div>
                            <Link href="/admin/users">
                                <button className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
                                    <ArrowUpRight size={20} />
                                </button>
                            </Link>
                        </div>
                        {/* Battle Activity Chart (Using Submissions) */}
                        <div className="bg-[#111] rounded-[2.5rem] p-8 min-h-[300px] relative">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-bold">Submission Activity</h2>
                                <Link href="/admin/contests">
                                    <button className="flex items-center gap-2 text-sm font-medium text-slate-400 bg-white/5 px-4 py-2 rounded-full hover:bg-white/10 transition-colors">
                                        View Contests <ArrowUpRight size={14} />
                                    </button>
                                </Link>
                            </div>

                            <div className="flex items-end justify-between h-48 px-4 gap-4">
                                <div className="w-full flex items-end justify-between gap-4 h-full">
                                    {Array.from({ length: 7 }).map((_, i) => {
                                        const date = new Date();
                                        date.setDate(date.getDate() - (6 - i));
                                        const dateStr = date.toISOString().split('T')[0];

                                        const count = submissions.filter((s: any) => s.submittedAt && s.submittedAt.startsWith(dateStr)).length;

                                        // Find max count for normalization
                                        const maxCount = Math.max(...Array.from({ length: 7 }).map((_, j) => {
                                            const d = new Date();
                                            d.setDate(d.getDate() - (6 - j));
                                            const dStr = d.toISOString().split('T')[0];
                                            return submissions.filter((s: any) => s.submittedAt && s.submittedAt.startsWith(dStr)).length;
                                        })) || 1; // Avoid division by zero

                                        const height = Math.max((count / maxCount) * 100, 5); // Minimum 5% height

                                        return (
                                            <div key={i} className="relative w-full group flex flex-col justify-end h-full">
                                                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[#222] text-white text-xs font-bold py-1.5 px-3 rounded-xl mb-2 flex flex-col items-center opacity-0 group-hover:opacity-100 transition-opacity shadow-xl z-20 whitespace-nowrap pointer-events-none">
                                                    {count} Submissions
                                                    <span className="text-[10px] font-normal text-slate-400">{format(date, 'MMM d')}</span>
                                                    <div className="w-2 h-2 bg-[#222] rotate-45 -mb-4 absolute -bottom-1" />
                                                </div>

                                                <div
                                                    className={`w-full rounded-2xl transition-all duration-500 ${count > 0 ? 'bg-gradient-to-b from-brand-red to-red-900/50' : 'bg-white/5'}`}
                                                    style={{ height: `${height}%` }}
                                                />
                                                <div className="mt-2 text-center text-[10px] text-slate-500 font-medium">
                                                    {format(date, 'd')}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="absolute bottom-6 left-8 text-4xl font-bold text-white/20">
                                {submissions.length > 0 ? submissions.length : '0'} <span className="text-lg text-slate-600 font-normal">total submissions</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column (Sidebar Content) */}
                    <div className="xl:col-span-4 flex flex-col gap-8">

                        {/* Live Battles List */}
                        <div className="bg-[#111] rounded-[2.5rem] p-8">
                            <h2 className="text-xl font-bold mb-6">Live & Upcoming</h2>

                            <div className="flex flex-col gap-4">
                                {liveBattles.length > 0 ? liveBattles.map((item: any, i) => (
                                    <div key={i} className="flex items-center gap-4 p-2 rounded-2xl hover:bg-white/5 transition-colors group cursor-pointer">
                                        <div className={`w-16 h-16 rounded-2xl ${item.status === 'Active' ? 'bg-blue-500' : 'bg-slate-700'} flex items-center justify-center shadow-lg group-hover:scale-95 transition-transform`}>
                                            <Trophy size={24} className="text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-slate-200 truncate max-w-[120px]">{item.title}</h4>
                                            <p className="text-xs text-slate-500 font-medium">
                                                {format(new Date(item.startTime), 'MMM d, h:mm a')}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.status === 'Active' ? 'bg-green-500/10 text-green-500' :
                                                'bg-white/10 text-slate-300'
                                                }`}>
                                                {item.status || 'Scheduled'}
                                            </span>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-slate-500 text-sm">No active or upcoming contests found.</p>
                                )}
                            </div>

                            <Link href="/admin/contests">
                                <button className="w-full mt-6 py-4 rounded-full border border-white/10 text-sm font-bold text-slate-300 hover:bg-white/5 transition-colors">
                                    View all battles
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
