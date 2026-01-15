'use client'

import { useEffect, useState } from "react"
import { useBatchStore, useContestStore } from "../../../store"
import { useParams, useRouter } from "next/navigation"
import Navbar from "../../../components/layout/navbar"
import { motion, AnimatePresence } from "framer-motion"
import { Trophy, Calendar, Clock, Users, Plus, Edit2, Trash2, CheckCircle2, XCircle, Search, Target, HelpCircle, Save, ArrowLeft } from "lucide-react"
import { toast, ToastContainer } from "react-toastify"

const Modal = ({ children, onClose, title }: { children: React.ReactNode, onClose: () => void, title: string }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-[#050505] border border-brand-red/20 rounded-2xl p-6 w-full max-w-2xl shadow-[0_0_50px_-20px_rgba(220,38,38,0.2)] max-h-[90vh] overflow-y-auto custom-scrollbar"
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

export default function ContestDetails() {
    const params = useParams()
    const router = useRouter()
    const { contest, getContestById, createQuestion, updateQuestion, deleteQuestion } = useContestStore()

    const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false)
    const [editingQuestion, setEditingQuestion] = useState<any>(null)
    const [options, setOptions] = useState<{ title: string, isCorrect: boolean }[]>([
        { title: "", isCorrect: false },
        { title: "", isCorrect: false }
    ])

    useEffect(() => {
        if (params.id) {
            getContestById(params.id as string)
        }
    }, [params.id])

    const handleOpenCreate = () => {
        setEditingQuestion(null)
        setOptions([{ title: "", isCorrect: false }, { title: "", isCorrect: false }])
        setIsQuestionModalOpen(true)
    }

    const handleOpenEdit = (question: any) => {
        setEditingQuestion(question)
        setOptions(question.options || [])
        setIsQuestionModalOpen(true)
    }

    const handleSaveQuestion = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const title = formData.get("title") as string
        const description = formData.get("description") as string
        const score = Number(formData.get("score"))
        const timeLimit = Number(formData.get("timeLimit"))

        try {
            if (editingQuestion) {
                await updateQuestion(editingQuestion.id, title, description, score, options, timeLimit)
                toast.success("Question updated successfully")
            } else {
                await createQuestion(contest.id, title, description, score, options, timeLimit)
                toast.success("Question created successfully")
            }
            setIsQuestionModalOpen(false)
            getContestById(contest.id)
        } catch (error: any) {
            console.error(error)
            toast.error(error.message || "Failed to save question")
        }
    }

    const handleDeleteQuestion = async (id: string) => {
        if (!confirm("Delete this question?")) return
        try {
            await deleteQuestion(id)
            toast.success("Question deleted")
            getContestById(contest.id)
        } catch (error: any) {
            toast.error(error.message || "Failed to delete")
        }
    }

    const handleOptionChange = (index: number, field: 'title' | 'isCorrect', value: string | boolean) => {
        setOptions(prev => prev.map((opt, i) => {
            if (i === index) {
                if (field === 'title') return { ...opt, title: value as string }
                if (field === 'isCorrect') return { ...opt, isCorrect: value as boolean }
            }
            return opt
        }))
    }

    const addOption = () => setOptions([...options, { title: "", isCorrect: false }])
    const removeOption = (index: number) => setOptions(options.filter((_, i) => i !== index))

    if (!contest) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>

    return (
        <div className="min-h-screen bg-black text-slate-100 selection:bg-brand-red/30 relative overflow-hidden">
            <ToastContainer position="top-right" theme="dark" />
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[10%] right-[10%] w-[500px] h-[500px] rounded-full bg-brand-red/5 blur-[120px]" />
            </div>

            <Navbar />

            <main className="container mx-auto px-4 pt-28 pb-12 relative z-10">
                <div className="mb-10">
                    <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors">
                        <ArrowLeft size={16} /> Back to Battles
                    </button>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 mb-2 rounded-full border border-white/10 bg-white/5 text-slate-400 text-xs font-mono uppercase tracking-widest">
                                <Trophy size={12} className="text-brand-red" /> Battle Protocol
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold font-serif text-white mb-4">{contest.title}</h1>
                            <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                                <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                                    <Calendar size={14} className="text-brand-red" />
                                    <span>{new Date(contest.startTime).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                                    <Clock size={14} className="text-brand-red" />
                                    <span>{new Date(contest.startTime).toLocaleTimeString()}</span>
                                </div>
                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${contest.isOpenAll ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500'}`}>
                                    {contest.isOpenAll ? <Target size={14} /> : <Users size={14} />}
                                    <span>{contest.isOpenAll ? 'Public Protocol' : 'Restricted Access'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <div className="text-right hidden md:block">
                                <div className="text-3xl font-bold text-white font-mono">{contest.questions?.length || 0}</div>
                                <div className="text-xs text-slate-500 uppercase tracking-wider">Total Questions</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-10">
                    <div className="space-y-6">
                        <div className="bg-[#050505]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Users size={18} className="text-brand-red" /> Associated Batches
                            </h3>
                            {contest.batches && contest.batches.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {contest.batches.map((batch: any) => (
                                        <span key={batch.id} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300 font-medium hover:bg-white/10 transition-colors">
                                            {batch.name}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-slate-500 text-sm italic">No specific batches assigned (Public)</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                <HelpCircle className="text-brand-red" /> Questions
                            </h2>
                            <button
                                onClick={handleOpenCreate}
                                className="flex items-center gap-2 px-4 py-2 bg-brand-red hover:bg-red-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-brand-red/20 transition-all border border-red-500/20"
                            >
                                <Plus size={16} /> Add Question
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {contest.questions && contest.questions.length > 0 ? (
                                contest.questions.map((question: any, index: number) => (
                                    <motion.div
                                        key={question.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="group bg-[#050505]/80 backdrop-blur-md border border-white/10 hover:border-brand-red/30 rounded-xl p-5 transition-all hover:-translate-y-1 relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 w-20 h-20 bg-brand-red/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-brand-red/10 transition-all" />

                                        <div className="flex justify-between items-start relative z-10">
                                            <div className="w-full">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-mono text-slate-400">
                                                        {index + 1}
                                                    </span>
                                                    <h3 className="text-lg font-bold text-white group-hover:text-brand-red transition-colors">{question.title}</h3>
                                                </div>
                                                <p className="text-slate-400 text-sm line-clamp-2 max-w-lg mb-3">{question.description}</p>
                                                <div className="flex gap-4 text-xs font-mono text-slate-500 mb-4">
                                                    <span className="flex items-center gap-1"><Target size={12} /> {question.score} PTS</span>
                                                    <span className="flex items-center gap-1"><Clock size={12} /> {question.timeLimit}s</span>
                                                </div>

                                                {question.options && question.options.length > 0 && (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                                                        {question.options.map((opt: any, i: number) => (
                                                            <div key={i} className={`group/opt text-xs px-3 py-2 rounded-lg border ${opt.isCorrect ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-white/5 border-white/10 text-slate-400'} flex justify-between items-center transition-all hover:bg-opacity-20`}>
                                                                <span className="font-mono truncate mr-2">{opt.title}</span>
                                                                {opt.isCorrect && <CheckCircle2 size={12} className="text-green-500 shrink-0" />}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                                                <button onClick={() => handleOpenEdit(question)} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button onClick={() => handleDeleteQuestion(question.id)} className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-500 transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/5 border-dashed">
                                    <HelpCircle size={32} className="mx-auto mb-3 text-slate-600" />
                                    <h3 className="text-slate-400 font-medium">No Questions Added</h3>
                                    <p className="text-sm text-slate-600 mb-4">Initialize the protocol by adding the first challenge.</p>
                                    <button onClick={handleOpenCreate} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg text-sm transition-colors border border-white/5">
                                        Create Question
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <AnimatePresence>
                {isQuestionModalOpen && (
                    <Modal onClose={() => setIsQuestionModalOpen(false)} title={editingQuestion ? "Edit Question" : "New Question"}>
                        <form onSubmit={handleSaveQuestion} className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-xs font-mono text-slate-500 mb-1 uppercase">Question Title</label>
                                    <input type="text" name="title" defaultValue={editingQuestion?.title} required className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-brand-red focus:ring-1 focus:ring-brand-red outline-none transition-all placeholder:text-slate-700" placeholder="e.g. Binary Search Implementation" />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-mono text-slate-500 mb-1 uppercase">Description</label>
                                    <textarea name="description" defaultValue={editingQuestion?.description} rows={3} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-brand-red focus:ring-1 focus:ring-brand-red outline-none transition-all placeholder:text-slate-700" placeholder="Describe the challenge..." />
                                </div>
                                <div>
                                    <label className="block text-xs font-mono text-slate-500 mb-1 uppercase">Score Points</label>
                                    <input type="number" name="score" defaultValue={editingQuestion?.score || 10} required className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-brand-red focus:ring-1 focus:ring-brand-red outline-none transition-all" />
                                </div>
                                <div>
                                    <label className="block text-xs font-mono text-slate-500 mb-1 uppercase">Time Limit (sec)</label>
                                    <input type="number" name="timeLimit" defaultValue={editingQuestion?.timeLimit || 60} required className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-brand-red focus:ring-1 focus:ring-brand-red outline-none transition-all" />
                                </div>
                            </div>

                            <div className="border-t border-white/5 pt-4">
                                <div className="flex justify-between items-center mb-3">
                                    <label className="block text-xs font-mono text-slate-500 uppercase">Answer Options</label>
                                    <button type="button" onClick={addOption} className="text-xs text-brand-red hover:text-white transition-colors flex items-center gap-1">+ Add Option</button>
                                </div>
                                <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                    {options.map((opt, idx) => (
                                        <div key={idx} className="flex gap-3 items-center">
                                            <input
                                                type="text"
                                                value={opt.title}
                                                onChange={(e) => handleOptionChange(idx, 'title', e.target.value)}
                                                placeholder={`Option ${idx + 1}`}
                                                className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-brand-red outline-none"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleOptionChange(idx, 'isCorrect', !opt.isCorrect)}
                                                className={`p-2 rounded-lg border transition-all ${opt.isCorrect ? 'bg-green-500/20 border-green-500/50 text-green-500' : 'bg-white/5 border-white/10 text-slate-500 hover:text-white'}`}
                                            >
                                                <CheckCircle2 size={16} />
                                            </button>
                                            <button type="button" onClick={() => removeOption(idx)} className="text-slate-600 hover:text-red-500 transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button type="submit" className="w-full py-3 bg-brand-red hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-brand-red/20 transition-all flex items-center justify-center gap-2">
                                <Save size={18} /> Save Question
                            </button>
                        </form>
                    </Modal>
                )}
            </AnimatePresence>
        </div>
    )
}