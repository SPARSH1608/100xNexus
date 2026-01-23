'use client'

import React, { useEffect, useState } from "react"
import { useContestStore } from "../../store"
import Navbar from "../../components/layout/navbar"
import { Search, Filter, MoreHorizontal, FileQuestion, Edit2, Trash2, X, Check, ChevronDown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast, ToastContainer } from "react-toastify"

export default function QuestionsPage() {
    const { allQuestions, getAllQuestions, deleteQuestion, updateQuestion } = useContestStore()
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")


    // Modal States
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [questionToDelete, setQuestionToDelete] = useState<string | null>(null)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [questionToEdit, setQuestionToEdit] = useState<any>(null)
    const [editingOptions, setEditingOptions] = useState<any[]>([])
    const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null)

    useEffect(() => {
        if (questionToEdit) {
            setEditingOptions(questionToEdit.options || [])
        }
    }, [questionToEdit])

    useEffect(() => {
        const fetchData = async () => {
            try {
                await getAllQuestions()
            } catch (error) {
                console.error(error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [])

    const handleDelete = async () => {
        if (!questionToDelete) return;
        try {
            const res = await deleteQuestion(questionToDelete);
            if (res.success) {
                toast.success("Question deleted successfully");
                getAllQuestions(); // Refresh list
            } else {
                toast.error(res.error || "Failed to delete question");
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to delete question");
        } finally {
            setIsDeleteModalOpen(false);
            setQuestionToDelete(null);
        }
    }

    const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const formData = new FormData(e.currentTarget);
            const title = formData.get('title') as string;
            const score = Number(formData.get('score'));
            const timeLimit = Number(formData.get('timeLimit'));

            const res = await updateQuestion(questionToEdit.id, title, undefined, score, editingOptions, timeLimit);
            if (res.success) {
                toast.success("Question updated successfully");
                getAllQuestions();
            } else {
                toast.error(res.error || "Failed to update question");
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to update question");
        } finally {
            setIsEditModalOpen(false);
            setQuestionToEdit(null);
        }
    }

    const handleOptionChange = (index: number, field: string, value: any) => {
        const newOptions = [...editingOptions]
        newOptions[index] = { ...newOptions[index], [field]: value }
        setEditingOptions(newOptions)
    }

    const addOption = () => {
        setEditingOptions([...editingOptions, { title: "", isCorrect: false }])
    }

    const removeOption = (index: number) => {
        const newOptions = editingOptions.filter((_, i) => i !== index)
        setEditingOptions(newOptions)
    }

    const filteredQuestions = allQuestions?.filter((q: any) =>
        q.title.toLowerCase().includes(searchTerm.toLowerCase())
    ) || []

    return (
        <div className="min-h-screen bg-black text-slate-100 selection:bg-brand-red/30 relative overflow-hidden">
            <Navbar />
            <ToastContainer position="top-right" theme="dark" />

            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] rounded-full bg-brand-red/5 blur-[120px]" />
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 relative z-10">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold font-serif text-white mb-2">Question Bank</h1>
                    <p className="text-slate-400">Repository of all coding challenges across contests.</p>
                </div>

                <div className="bg-[#050505] border border-white/5 rounded-3xl p-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <div className="relative flex-1 sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search questions..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-[#111] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-300 focus:outline-none focus:border-brand-red/50 focus:ring-1 focus:ring-brand-red/50 placeholder:text-slate-600 transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 text-xs text-slate-500 uppercase tracking-widest font-mono">
                                    <th className="pb-4 pl-4">Title</th>
                                    <th className="pb-4">Score</th>
                                    <th className="pb-4">Time Limit</th>
                                    <th className="pb-4">Options</th>
                                    <th className="pb-4 pr-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={5} className="py-8 text-center text-slate-500">Loading protocol...</td>
                                    </tr>
                                ) : filteredQuestions.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-8 text-center text-slate-500">No questions found in repository.</td>
                                    </tr>
                                ) : (
                                    filteredQuestions.map((q: any, i: number) => (
                                        <React.Fragment key={q.id}>
                                            <motion.tr
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                                onClick={() => setExpandedQuestionId(expandedQuestionId === q.id ? null : q.id)}
                                                className={`group border-b border-white/5 cursor-pointer transition-colors ${expandedQuestionId === q.id ? 'bg-white/5' : 'hover:bg-white/5'}`}
                                            >
                                                <td className="py-5 pl-4 font-medium text-white group-hover:text-brand-red transition-colors flex items-center gap-3">
                                                    <div className="p-2 rounded-lg bg-white/5 border border-white/5 group-hover:border-brand-red/30 transition-colors">
                                                        <FileQuestion size={16} className="text-slate-400 group-hover:text-brand-red" />
                                                    </div>
                                                    {q.title}
                                                </td>
                                                <td className="py-5 text-slate-400 font-mono">{q.score} pts</td>
                                                <td className="py-5 text-slate-400 font-mono">{q.timeLimit}s</td>
                                                <td className="py-5 text-slate-400">
                                                    <div className="flex items-center gap-2">
                                                        <span>{q.options?.length || 0} options</span>
                                                        <ChevronDown
                                                            size={14}
                                                            className={`transition-transform duration-300 ${expandedQuestionId === q.id ? 'rotate-180 text-brand-red' : 'text-slate-600'}`}
                                                        />
                                                    </div>
                                                </td>
                                                <td className="py-5 pr-4 text-right">
                                                    <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                                        <button
                                                            onClick={() => {
                                                                setQuestionToEdit(q);
                                                                setIsEditModalOpen(true);
                                                            }}
                                                            className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                                                            title="Edit Metadata"
                                                        >
                                                            <Edit2 size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setQuestionToDelete(q.id);
                                                                setIsDeleteModalOpen(true);
                                                            }}
                                                            className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                            <AnimatePresence>
                                                {expandedQuestionId === q.id && (
                                                    <motion.tr
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{ opacity: 0 }}
                                                        className="bg-[#0a0a0a] border-b border-white/5"
                                                    >
                                                        <td colSpan={5} className="p-0">
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: "auto", opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                                                className="overflow-hidden"
                                                            >
                                                                <div className="p-6 pl-16 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                                    <div className="col-span-1 sm:col-span-2 mb-2">
                                                                        <h4 className="text-xs font-mono text-slate-500 uppercase tracking-widest">Available Options</h4>
                                                                    </div>
                                                                    {q.options?.map((opt: any, idx: number) => (
                                                                        <div
                                                                            key={idx}
                                                                            className={`flex items-center gap-3 p-3 rounded-xl border ${opt.isCorrect
                                                                                ? 'bg-brand-red/10 border-brand-red/20 text-white'
                                                                                : 'bg-white/[0.02] border-white/5 text-slate-400'
                                                                                }`}
                                                                        >
                                                                            <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${opt.isCorrect ? 'bg-brand-red border-brand-red' : 'border-slate-600'
                                                                                }`}>
                                                                                {opt.isCorrect && <Check size={12} className="text-white" />}
                                                                            </div>
                                                                            <span className="text-sm">{opt.title}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </motion.div>
                                                        </td>
                                                    </motion.tr>
                                                )}
                                            </AnimatePresence>
                                        </React.Fragment>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Edit Modal */}
            <AnimatePresence>
                {isEditModalOpen && questionToEdit && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="relative bg-[#050505] border border-brand-red/20 rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-white">Update Question</h3>
                                <button onClick={() => setIsEditModalOpen(false)} className="text-slate-500 hover:text-white"><X size={20} /></button>
                            </div>
                            <form onSubmit={handleUpdate} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-mono text-slate-500 mb-1 uppercase">Title</label>
                                    <input type="text" name="title" defaultValue={questionToEdit.title} className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-brand-red outline-none" required />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-mono text-slate-500 mb-1 uppercase">Score</label>
                                        <input type="number" name="score" defaultValue={questionToEdit.score} className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-brand-red outline-none" required />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-mono text-slate-500 mb-1 uppercase">Time Limit (s)</label>
                                        <input type="number" name="timeLimit" defaultValue={questionToEdit.timeLimit} className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-brand-red outline-none" required />
                                    </div>
                                </div>

                                {/* Options Editor */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-xs font-mono text-slate-500 uppercase">Options</label>
                                        <button type="button" onClick={addOption} className="text-xs text-brand-red hover:underline">+ Add Option</button>
                                    </div>
                                    <div className="space-y-2">
                                        {editingOptions.map((opt, idx) => (
                                            <div key={idx} className="flex gap-2 items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={opt.isCorrect}
                                                    onChange={(e) => handleOptionChange(idx, 'isCorrect', e.target.checked)}
                                                    className="accent-brand-red w-4 h-4"
                                                />
                                                <input
                                                    type="text"
                                                    value={opt.title}
                                                    onChange={(e) => handleOptionChange(idx, 'title', e.target.value)}
                                                    className="flex-1 bg-[#111] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-brand-red outline-none"
                                                    placeholder={`Option ${idx + 1}`}
                                                    required
                                                />
                                                <button type="button" onClick={() => removeOption(idx)} className="text-slate-500 hover:text-red-500">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button type="submit" className="w-full py-3 bg-brand-red hover:bg-red-700 text-white font-bold rounded-xl mt-4">Save Changes</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {isDeleteModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsDeleteModalOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="relative bg-[#050505] border border-red-500/20 rounded-2xl p-6 w-full max-w-md shadow-2xl"
                        >
                            <h3 className="text-xl font-bold text-white mb-2">Delete Question?</h3>
                            <p className="text-slate-400 mb-6">This will remove the question permanently. This action cannot be undone.</p>
                            <div className="flex justify-end gap-3">
                                <button onClick={() => setIsDeleteModalOpen(false)} className="px-5 py-2 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white">Cancel</button>
                                <button onClick={handleDelete} className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold">Delete</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
