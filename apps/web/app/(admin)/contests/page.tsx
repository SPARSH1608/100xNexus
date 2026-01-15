'use client'

import { useEffect, useState } from "react"
import { useBatchStore, useContestStore } from "../../store"
import { createContestAPI, deleteContestAPI, updateContestAPI } from "../../api"
import { toast, ToastContainer } from "react-toastify"
import Navbar from "../../components/layout/navbar"
import { Plus, Trash2, Edit2, Calendar, Clock, CheckCircle2, XCircle, Search, Trophy, Shield, Zap, Target, Check } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"

// Modal Component
const Modal = ({ children, onClose, title }: { children: React.ReactNode, onClose: () => void, title: string }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-[#050505] border border-brand-red/20 rounded-2xl p-6 w-full max-w-lg shadow-[0_0_50px_-20px_rgba(220,38,38,0.2)]"
        >
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white font-serif">{title}</h3>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors">
                    <XCircle size={20} />
                </button>
            </div>
            {children}
        </motion.div>
    </div>
)

export default function Contests() {
    const { contests, getContests, getContestById, updateContest, deleteContest } = useContestStore()
    const { batches, getBatches } = useBatchStore()
    const [isCreateContestModalOpen, setIsCreateContestModalOpen] = useState(false)
    const [selectedBatchIds, setSelectedBatchIds] = useState<string[]>([])
    const [isOpenAll, setIsOpenAll] = useState(false)
    const [isUpdateContestModalOpen, setIsUpdateContestModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [contestIdToDelete, setContestIdToDelete] = useState<string | null>(null)
    const [contest, setContest] = useState<any>({})
    const [searchTerm, setSearchTerm] = useState("")
    const router = useRouter()
    const toggleBatch = (batchId: string) => {
        setSelectedBatchIds(prev =>
            prev.includes(batchId)
                ? prev.filter(id => id !== batchId)
                : [...prev, batchId]
        )
    }

    const handleCreateContest = async (e: React.FormEvent<HTMLFormElement>) => {
        try {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const dataObject = Object.fromEntries(formData.entries());
            const title = dataObject.title;
            const startTime = new Date(dataObject.startTime as string).toISOString();

            const batchIds = selectedBatchIds
            const res = await createContestAPI(title as string, !!isOpenAll, startTime as string, batchIds);
            toast.success(res.message);
            setIsCreateContestModalOpen(false);
            getContests();
        } catch (error: any) {
            console.log(error);
            toast.error(error.message || 'Failed to create contest');
        }
    };

    const handleDeleteContest = (contestId: string) => {
        setContestIdToDelete(contestId)
        setIsDeleteModalOpen(true)
    }

    const executeDelete = async () => {
        if (!contestIdToDelete) return;
        try {
            const res = await deleteContest(contestIdToDelete);
            toast.success(res.message);
            getContests()
            setIsDeleteModalOpen(false)
        } catch (error: any) {
            console.log(error);
            toast.error(error.message || 'Failed to delete contest');
        }
    }
    const handleOpenUpdateContest = async (contestId: string) => {
        try {
            const contestData = await getContestById(contestId);
            if (contestData) {
                setContest(contestData);
                setIsOpenAll(contestData.isOpenAll);
                if (contestData.batches) {
                    setSelectedBatchIds(contestData.batches.map((b: any) => b.id))
                }
                setIsUpdateContestModalOpen(true)
            }
        } catch (error: any) {
            console.log(error);
            toast.error(error.message || 'Failed to Fetch contest');
        }
    }
    const handleUpdateContest = async (e: React.FormEvent<HTMLFormElement>) => {
        try {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const dataObject = Object.fromEntries(formData.entries());
            const title = dataObject.title;
            const startTime = new Date(dataObject.startTime as string).toISOString();

            const batchIds = selectedBatchIds
            const res = await updateContest(contest.id, title as string, !!isOpenAll, startTime as string, batchIds);
            toast.success(res.message);
            setIsUpdateContestModalOpen(false);
            getContests()
        } catch (error: any) {
            console.log(error);
            toast.error(error.message || 'Failed to update contest');
        }
    }

    useEffect(() => {
        getContests()
        getBatches()
    }, [])

    const filteredContests = contests.filter(c =>
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

                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 mb-2 rounded-full border border-white/10 bg-white/5 text-slate-400 text-xs font-mono uppercase tracking-widest">
                            <Shield size={12} className="text-brand-red" /> Admin Console
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold font-serif text-white mb-2">
                            Battle <span className="text-brand-red">Management</span>
                        </h1>
                        <p className="text-slate-400 max-w-xl">
                            Orchestrate code battles, manage schedules, and control access protocols.
                        </p>
                    </div>

                    <button
                        onClick={() => {
                            setContest({});
                            setSelectedBatchIds([]);
                            setIsOpenAll(false);
                            setIsCreateContestModalOpen(true)
                        }}
                        className="group flex items-center gap-2 px-6 py-3 bg-brand-red hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-brand-red/20 transition-all border border-red-500/20"
                    >
                        <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                        Init New Battle
                    </button>
                </div>

                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                        <input
                            type="text"
                            placeholder="Search battles..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#050505] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-brand-red/50 focus:ring-1 focus:ring-brand-red/50 transition-all placeholder:text-slate-600"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {filteredContests.map((contest, index) => (
                            <motion.div
                                key={contest.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => router.push(`/contests/${contest.id}`)}
                                className="group bg-[#050505]/80 backdrop-blur-md border border-white/10 hover:border-brand-red/30 rounded-2xl p-6 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-red/5 relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-red/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-brand-red/10 transition-all" />

                                <div className="flex justify-between items-start mb-6 relative z-10">
                                    <div className="w-12 h-12 rounded-xl bg-brand-red/10 border border-brand-red/20 flex items-center justify-center text-brand-red group-hover:scale-110 transition-transform duration-500">
                                        <Trophy size={24} />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleOpenUpdateContest(contest.id);
                                            }}
                                            className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteContest(contest.id);
                                            }}
                                            className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                <div className="mb-6 relative z-10">
                                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-1 font-serif group-hover:text-brand-red transition-colors">{contest.title}</h3>
                                    <div className="flex flex-col gap-2 text-sm text-slate-400">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} className="text-slate-500" />
                                            <span>{new Date(contest.startTime).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock size={14} className="text-slate-500" />
                                            <span>{new Date(contest.startTime).toLocaleTimeString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-white/5 relative z-10">
                                    <div className="flex items-center gap-2">
                                        <div className="flex -space-x-2">
                                            <div className="w-6 h-6 rounded-full bg-slate-800 border border-black flex items-center justify-center text-[10px]">
                                                <Target size={12} />
                                            </div>
                                        </div>
                                        <span className="text-xs text-slate-500 font-mono">
                                            {contest._count?.questions || 0} QUESTIONS
                                        </span>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded border ${contest.isOpenAll ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500'}`}>
                                        {contest.isOpenAll ? 'PUBLIC' : 'RESTRICTED'}
                                    </span>

                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {filteredContests.length === 0 && (
                    <div className="text-center py-20 opacity-50">
                        <Trophy size={48} className="mx-auto mb-4 text-slate-600" />
                        <h3 className="text-xl font-bold text-slate-400">No Battles Found</h3>
                        <p className="text-slate-600">Start a new protocol to begin.</p>
                    </div>
                )}

            </main>

            <AnimatePresence>
                {isCreateContestModalOpen && (
                    <Modal onClose={() => setIsCreateContestModalOpen(false)} title="Initialize New Battle">
                        <form onSubmit={handleCreateContest} className="space-y-4">
                            <div>
                                <label className="block text-xs font-mono text-slate-500 mb-1 uppercase">Battle Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    placeholder="e.g. Weekly Algorithm Showdown"
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-brand-red focus:ring-1 focus:ring-brand-red outline-none transition-all placeholder:text-slate-700"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-mono text-slate-500 mb-1 uppercase">Start Time</label>
                                <input
                                    type="datetime-local"
                                    name="startTime"
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-brand-red focus:ring-1 focus:ring-brand-red outline-none transition-all [color-scheme:dark]"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <label className={`cursor-pointer border ${isOpenAll ? 'border-brand-red bg-brand-red/10' : 'border-white/10 bg-black/50'} rounded-lg p-4 transition-all hover:bg-white/5`}>
                                    <div className="flex items-center gap-3 mb-2">
                                        <input type="radio" name="isOpenAll" className="hidden" checked={isOpenAll} onChange={() => setIsOpenAll(true)} />
                                        <Zap size={18} className={isOpenAll ? "text-brand-red" : "text-slate-500"} />
                                        <span className="font-bold text-white text-sm">Open to All</span>
                                    </div>
                                    <p className="text-xs text-slate-500">Anyone on the platform can join this battle.</p>
                                </label>

                                <label className={`cursor-pointer border ${!isOpenAll ? 'border-brand-red bg-brand-red/10' : 'border-white/10 bg-black/50'} rounded-lg p-4 transition-all hover:bg-white/5`}>
                                    <div className="flex items-center gap-3 mb-2">
                                        <input type="radio" name="isOpenAll" className="hidden" checked={!isOpenAll} onChange={() => setIsOpenAll(false)} />
                                        <Shield size={18} className={!isOpenAll ? "text-brand-red" : "text-slate-500"} />
                                        <span className="font-bold text-white text-sm">Restricted</span>
                                    </div>
                                    <p className="text-xs text-slate-500">Only specific batches can access.</p>
                                </label>
                            </div>

                            {!isOpenAll && (
                                <div>
                                    <label className="block text-xs font-mono text-slate-500 mb-3 uppercase">Select Batches (Allowed)</label>
                                    <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                        {batches.map(batch => {
                                            const isSelected = selectedBatchIds.includes(batch.id);
                                            return (
                                                <div
                                                    key={batch.id}
                                                    onClick={() => toggleBatch(batch.id)}
                                                    className={`cursor-pointer group flex items-center justify-between p-3 rounded-xl border transition-all duration-200 ${isSelected
                                                        ? 'bg-brand-red/10 border-brand-red shadow-[0_0_15px_-5px_rgba(220,38,38,0.3)]'
                                                        : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10'
                                                        }`}
                                                >
                                                    <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                                                        {batch.name}
                                                    </span>
                                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${isSelected
                                                        ? 'bg-brand-red border-brand-red scale-100'
                                                        : 'border-slate-600 bg-transparent scale-90 opacity-50 group-hover:opacity-100 group-hover:border-slate-400'
                                                        }`}>
                                                        {isSelected && <Check size={12} className="text-white" strokeWidth={3} />}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2">Click to toggle access permissions.</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                className="w-full py-4 bg-brand-red hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-brand-red/20 transition-all flex items-center justify-center gap-2 mt-4"
                            >
                                <RocketIcon /> Launch Battle
                            </button>
                        </form>
                    </Modal>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isUpdateContestModalOpen && (
                    <Modal onClose={() => setIsUpdateContestModalOpen(false)} title="Update Battle Protocol">
                        <form onSubmit={handleUpdateContest} className="space-y-4">
                            <div>
                                <label className="block text-xs font-mono text-slate-500 mb-1 uppercase">Battle Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    defaultValue={contest.title}
                                    placeholder="e.g. Weekly Algorithm Showdown"
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-brand-red focus:ring-1 focus:ring-brand-red outline-none transition-all placeholder:text-slate-700"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-mono text-slate-500 mb-1 uppercase">Start Time</label>
                                <input
                                    type="datetime-local"
                                    name="startTime"
                                    defaultValue={contest.startTime ? new Date(contest.startTime).toISOString().slice(0, 16) : ''}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-brand-red focus:ring-1 focus:ring-brand-red outline-none transition-all [color-scheme:dark]"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <label className={`cursor-pointer border ${isOpenAll ? 'border-brand-red bg-brand-red/10' : 'border-white/10 bg-black/50'} rounded-lg p-4 transition-all hover:bg-white/5`}>
                                    <div className="flex items-center gap-3 mb-2">
                                        <input type="radio" name="isOpenAll" className="hidden" checked={isOpenAll} onChange={() => setIsOpenAll(true)} />
                                        <Zap size={18} className={isOpenAll ? "text-brand-red" : "text-slate-500"} />
                                        <span className="font-bold text-white text-sm">Open to All</span>
                                    </div>
                                    <p className="text-xs text-slate-500">Anyone on the platform can join this battle.</p>
                                </label>

                                <label className={`cursor-pointer border ${!isOpenAll ? 'border-brand-red bg-brand-red/10' : 'border-white/10 bg-black/50'} rounded-lg p-4 transition-all hover:bg-white/5`}>
                                    <div className="flex items-center gap-3 mb-2">
                                        <input type="radio" name="isOpenAll" className="hidden" checked={!isOpenAll} onChange={() => setIsOpenAll(false)} />
                                        <Shield size={18} className={!isOpenAll ? "text-brand-red" : "text-slate-500"} />
                                        <span className="font-bold text-white text-sm">Restricted</span>
                                    </div>
                                    <p className="text-xs text-slate-500">Only specific batches can access.</p>
                                </label>
                            </div>

                            {!isOpenAll && (
                                <div>
                                    <label className="block text-xs font-mono text-slate-500 mb-3 uppercase">Select Batches (Allowed)</label>
                                    <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                        {batches.map(batch => {
                                            const isSelected = selectedBatchIds.includes(batch.id);
                                            return (
                                                <div
                                                    key={batch.id}
                                                    onClick={() => toggleBatch(batch.id)}
                                                    className={`cursor-pointer group flex items-center justify-between p-3 rounded-xl border transition-all duration-200 ${isSelected
                                                        ? 'bg-brand-red/10 border-brand-red shadow-[0_0_15px_-5px_rgba(220,38,38,0.3)]'
                                                        : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10'
                                                        }`}
                                                >
                                                    <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                                                        {batch.name}
                                                    </span>
                                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${isSelected
                                                        ? 'bg-brand-red border-brand-red scale-100'
                                                        : 'border-slate-600 bg-transparent scale-90 opacity-50 group-hover:opacity-100 group-hover:border-slate-400'
                                                        }`}>
                                                        {isSelected && <Check size={12} className="text-white" strokeWidth={3} />}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2">Click to toggle access permissions.</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                className="w-full py-4 bg-brand-red hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-brand-red/20 transition-all flex items-center justify-center gap-2 mt-4"
                            >
                                <RocketIcon /> Update Protocol
                            </button>
                        </form>
                    </Modal>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isDeleteModalOpen && (
                    <Modal onClose={() => setIsDeleteModalOpen(false)} title="Confirm Deletion">
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                                <div className="p-3 bg-red-500/20 rounded-full">
                                    <Trash2 size={24} className="text-red-500" />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold mb-1">Delete Battle Protocol?</h4>
                                    <p className="text-sm text-slate-400">This action causes permanent data loss and cannot be undone.</p>
                                </div>
                            </div>

                            <div className="flex gap-3 justify-end pt-2">
                                <button
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    className="px-5 py-2.5 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={executeDelete}
                                    className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-600/20 transition-all flex items-center gap-2"
                                >
                                    <Trash2 size={18} />
                                    Delete Forever
                                </button>
                            </div>
                        </div>
                    </Modal>
                )}
            </AnimatePresence>
        </div>
    )
}

function RocketIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" /><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" /><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" /><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" /></svg>
    )
}   