"use client";

import { useBatchStore } from "../../store";
import Sidebar from "../../components/layout/sidebar";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, X, Search, Layers, Box } from "lucide-react";

export default function BatchesPage() {
    const { batches, getBatches, updateBatch, deleteBatch, createBatch, getBatchById } = useBatchStore((state) => state);
    const [isCreateBatchModalOpen, setIsCreateBatchModalOpen] = useState(false);
    const [isUpdateBatchModalOpen, setIsUpdateBatchModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [batchId, setBatchId] = useState('');
    const [batchName, setBatchName] = useState('');

    const handleCreateBatch = async (e: React.FormEvent<HTMLFormElement>) => {
        try {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const name = formData.get('name');
            const res = await createBatch(name as string);
            toast.success(res.message);
            setIsCreateBatchModalOpen(false);
        } catch (error: any) {
            console.log(error);
            toast.error(error.message || 'Failed to create batch');
        }
    };

    const handleUpdateBatch = async (e: React.FormEvent<HTMLFormElement>) => {
        try {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const name = formData.get('name');
            const res = await updateBatch(batchId, name as string);
            toast.success(res.message);
            setIsUpdateBatchModalOpen(false);
        } catch (error: any) {
            console.log(error);
            toast.error(error.message || 'Failed to update batch');
        }
    };

    const handleDeleteBatch = async (id: string) => {
        try {
            const res = await deleteBatch(id);
            toast.success(res.message);
        } catch (error: any) {
            console.log(error);
            toast.error(error.message || 'Failed to delete batch');
        }
    };

    const openUpdateBatchModal = (batchId: string) => {
        const batch = getBatchById(batchId);
        if (batch) {
            setBatchName(batch.name);
            setBatchId(batchId);
            setIsUpdateBatchModalOpen(true);
        }
    };

    useEffect(() => {
        getBatches();
    }, []);

    const filteredBatches = batches.filter((batch: any) =>
        batch.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-black text-slate-100 selection:bg-brand-red/30 relative overflow-hidden">
            <ToastContainer position="top-right" theme="dark" />

            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[20%] right-[20%] w-[600px] h-[600px] rounded-full bg-brand-red/10 blur-[150px] animate-pulse" />
                <div className="absolute bottom-[20%] left-[20%] w-[500px] h-[500px] rounded-full bg-red-900/10 blur-[150px]" />
            </div>

            <div className="relative z-10">
                <Sidebar />

                <main className="container mx-auto px-4 pt-24 md:pt-12 md:pl-24 pb-12">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 mb-2 rounded-full border border-white/10 bg-white/5 text-slate-400 text-xs font-mono uppercase tracking-widest">
                                <Box size={14} /> Operations
                            </div>
                            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white tracking-tight">Manage Batches</h1>
                            <p className="text-slate-400 mt-2 text-lg">Organize and deploy your student cohorts.</p>
                        </div>

                        <div className="flex w-full md:w-auto gap-4">
                            <div className="relative flex-1 md:w-80">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    type="text"
                                    placeholder="Search batches..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-[#111] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-brand-red/50 focus:ring-1 focus:ring-brand-red/50 transition-all placeholder:text-slate-600 font-medium"
                                />
                            </div>
                            <button
                                onClick={() => setIsCreateBatchModalOpen(true)}
                                className="bg-brand-red hover:bg-black hover:text-brand-red hover:border-brand-red border border-transparent text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-brand-red/20 hover:shadow-brand-red/10 transition-all flex items-center gap-2 whitespace-nowrap"
                            >
                                <Plus className="w-5 h-5" /> New Batch
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {filteredBatches.map((batch: any, index: number) => (
                                <motion.div
                                    key={batch.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="group relative bg-[#050505] border border-white/10 hover:border-brand-red/50 rounded-2xl p-8 backdrop-blur-xl transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-brand-red/10 flex flex-col justify-between min-h-[180px]"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-red/5 rounded-bl-[100px] pointer-events-none group-hover:bg-brand-red/10 transition-colors" />

                                    <div className="flex justify-between items-start mb-6 relative z-10">
                                        <div className="w-12 h-12 rounded-xl bg-[#111] flex items-center justify-center border border-white/5 group-hover:border-brand-red/30 transition-colors shadow-lg">
                                            <Layers className="w-6 h-6 text-slate-500 group-hover:text-brand-red transition-colors" />
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => openUpdateBatchModal(batch.id)}
                                                className="p-2 hover:bg-white/10 rounded-lg text-slate-500 hover:text-white transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteBatch(batch.id)}
                                                className="p-2 hover:bg-red-500/10 rounded-lg text-slate-500 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-brand-red transition-colors tracking-tight">{batch.name}</h3>
                                        <div className="flex items-center gap-2 text-xs font-mono text-slate-500 uppercase tracking-widest">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]"></span>
                                            Active Cohort
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {filteredBatches.length === 0 && (
                        <div className="text-center py-32 text-slate-500">
                            <div className="inline-flex p-6 rounded-3xl bg-[#050505] border border-white/5 mb-6 shadow-2xl">
                                <Search className="w-8 h-8 text-slate-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-300 mb-1">No batches found</h3>
                            <p>We couldn't find any batches matching "{searchTerm}"</p>
                        </div>
                    )}
                </main>
            </div>

            <AnimatePresence>
                {isCreateBatchModalOpen && (
                    <Modal onClose={() => setIsCreateBatchModalOpen(false)} title="Create New Batch">
                        <form onSubmit={handleCreateBatch} className="space-y-8">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Batch Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="e.g. Class 12 - A"
                                    autoFocus
                                    className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-4 text-slate-100 focus:outline-none focus:border-brand-red/50 focus:ring-1 focus:ring-brand-red/50 placeholder:text-slate-600 transition-all font-medium"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateBatchModalOpen(false)}
                                    className="px-6 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-8 py-2.5 bg-brand-red hover:bg-red-700 text-white rounded-xl font-bold shadow-lg hover:shadow-brand-red/25 transition-all"
                                >
                                    Create Batch
                                </button>
                            </div>
                        </form>
                    </Modal>
                )}

                {isUpdateBatchModalOpen && (
                    <Modal onClose={() => setIsUpdateBatchModalOpen(false)} title="Update Batch">
                        <form onSubmit={handleUpdateBatch} className="space-y-8">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Batch Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder={batchName}
                                    defaultValue={batchName}
                                    className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-4 text-slate-100 focus:outline-none focus:border-brand-red/50 focus:ring-1 focus:ring-brand-red/50 placeholder:text-slate-600 transition-all font-medium"
                                />
                                <input type="hidden" name="batchId" value={batchId} />
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                                <button
                                    type="button"
                                    onClick={() => setIsUpdateBatchModalOpen(false)}
                                    className="px-6 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-8 py-2.5 bg-brand-red hover:bg-red-700 text-white rounded-xl font-bold shadow-lg hover:shadow-brand-red/25 transition-all"
                                >
                                    Update Batch
                                </button>
                            </div>
                        </form>
                    </Modal>
                )}
            </AnimatePresence>
        </div>
    );
}

function Modal({ children, onClose, title }: { children: React.ReactNode, onClose: () => void, title: string }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-md bg-[#111] border border-white/10 rounded-[2rem] p-8 shadow-2xl overflow-hidden"
            >
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold text-white font-serif">{title}</h2>
                    <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors border border-transparent hover:border-white/10">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                {children}
            </motion.div>
        </div>
    );
}