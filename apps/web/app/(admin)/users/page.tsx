'use client'

import { useEffect, useState } from "react"
import { useBatchStore, useUserStore } from "../../store"
import Sidebar from "../../components/layout/sidebar"
import { toast, ToastContainer } from "react-toastify"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Users, Edit2, Check, X, Shield, BookOpen } from "lucide-react"

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
                    <X size={20} />
                </button>
            </div>
            {children}
        </motion.div>
    </div>
)

export default function UsersPage() {
    const { users, getUsers, updateUserBatches } = useUserStore()
    const { batches, getBatches } = useBatchStore()
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedUser, setSelectedUser] = useState<any>(null)
    const [selectedBatchIds, setSelectedBatchIds] = useState<string[]>([])
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)

    useEffect(() => {
        getUsers()
        getBatches()
    }, [])

    const handleOpenEdit = (user: any) => {
        setSelectedUser(user)
        setSelectedBatchIds(user.batches?.map((b: any) => b.id) || [])
        setIsEditModalOpen(true)
    }

    const toggleBatch = (batchId: string) => {
        setSelectedBatchIds(prev =>
            prev.includes(batchId)
                ? prev.filter(id => id !== batchId)
                : [...prev, batchId]
        )
    }

    const handleSaveBatches = async () => {
        try {
            await updateUserBatches(selectedUser.id, selectedBatchIds)
            toast.success("User batches updated successfully")
            setIsEditModalOpen(false)
        } catch (error: any) {
            console.error(error)
            toast.error(error.message || "Failed to update batches")
        }
    }

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-black text-slate-100 selection:bg-brand-red/30 relative overflow-hidden">
            <ToastContainer position="top-right" theme="dark" />
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] rounded-full bg-brand-red/5 blur-[120px]" />
            </div>

            <Sidebar />

            <main className="container mx-auto px-4 pt-28 md:pt-12 md:pl-24 pb-12 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 mb-2 rounded-full border border-white/10 bg-white/5 text-slate-400 text-xs font-mono uppercase tracking-widest">
                            <Users size={12} className="text-brand-red" /> User Management
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold font-serif text-white">Student Allocation</h1>
                        <p className="text-slate-400 mt-2">Manage student access and batch distribution.</p>
                    </div>

                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                        <input
                            type="text"
                            placeholder="Search students..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#050505] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-brand-red/50 focus:ring-1 focus:ring-brand-red/50 transition-all placeholder:text-slate-600"
                        />
                    </div>
                </div>

                <div className="bg-[#050505]/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 border-b border-white/10 text-xs font-mono text-slate-400 uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Student</th>
                                    <th className="px-6 py-4">Email</th>
                                    <th className="px-6 py-4">Assigned Batches</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-brand-red/10 border border-brand-red/20 flex items-center justify-center text-brand-red font-bold text-xs">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-medium text-white">{user.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-400 text-sm">{user.email}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-2">
                                                {user.batches && user.batches.length > 0 ? (
                                                    user.batches.map((batch: any) => (
                                                        <span key={batch.id} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/5 border border-white/10 text-xs text-slate-300">
                                                            <BookOpen size={10} className="text-slate-500" />
                                                            {batch.name}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-slate-600 text-xs italic">Unassigned</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleOpenEdit(user)}
                                                className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filteredUsers.length === 0 && (
                        <div className="text-center py-16 text-slate-500">
                            <Users size={32} className="mx-auto mb-2 opacity-50" />
                            <p>No students found matching your search.</p>
                        </div>
                    )}
                </div>
            </main>

            <AnimatePresence>
                {isEditModalOpen && selectedUser && (
                    <Modal onClose={() => setIsEditModalOpen(false)} title={`Assign Batches: ${selectedUser.name}`}>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-mono text-slate-500 mb-3 uppercase">Select Batches</label>
                                <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                    {batches.map(batch => {
                                        const isSelected = selectedBatchIds.includes(batch.id)
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
                            </div>

                            <button
                                onClick={handleSaveBatches}
                                className="w-full py-3 bg-brand-red hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-brand-red/20 transition-all flex items-center justify-center gap-2"
                            >
                                <Shield size={18} /> Save Assignments
                            </button>
                        </div>
                    </Modal>
                )}
            </AnimatePresence>
        </div>
    )
}
