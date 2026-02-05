'use client'

import React, { useState, useEffect } from "react";
import Sidebar from "../../components/layout/sidebar";
import { useBatchStore, useContestStore, useAuthStore } from "../../store";
import { toast, ToastContainer } from "react-toastify";
import { useRouter } from "next/navigation";
import { createContestAPI, createQuestionAPI } from "../../api"; // Direct import for specialized usage or use store actions if preferred
import {
    Zap, Shield, Check, Trophy, Rocket, Plus, Search,
    FileText, Clock, HelpCircle, X, ChevronRight, FileQuestion, Loader
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CreateContestPage() {
    const router = useRouter();
    const { batches, getBatches } = useBatchStore();
    const { allQuestions, getAllQuestions } = useContestStore(); // Needs to be populated

    // Steps: 0 = Details, 1 = Select/Create Questions, 2 = Review
    const [step, setStep] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    // Form Data
    const [contestData, setContestData] = useState({
        title: "",
        startTime: "",
        isOpenAll: false,
        showResults: false,
        batchIds: [] as string[]
    });

    // Question Selection
    const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        getBatches();
        getAllQuestions();
    }, []);

    const toggleBatch = (batchId: string) => {
        setContestData(prev => ({
            ...prev,
            batchIds: prev.batchIds.includes(batchId)
                ? prev.batchIds.filter(id => id !== batchId)
                : [...prev.batchIds, batchId]
        }));
    };

    const toggleQuestion = (questionId: string) => {
        setSelectedQuestionIds(prev =>
            prev.includes(questionId)
                ? prev.filter(id => id !== questionId)
                : [...prev, questionId]
        );
    };

    const filteredQuestions = allQuestions?.filter((q: any) =>
        q.title.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const handleCreate = async () => {
        try {
            setIsLoading(true);

            // 1. Create Contest
            const res = await createContestAPI(
                contestData.title,
                contestData.isOpenAll,
                new Date(contestData.startTime).toISOString(),
                contestData.batchIds,
                contestData.showResults
            );

            if (res.success) {
                const newContestId = res.data.id;

                // 2. Add Selected Questions (Copy them)
                // We need to fetch full details of selected questions and re-create them for this contest
                const questionsToCopy = allQuestions.filter((q: any) => selectedQuestionIds.includes(q.id));

                // execute sequentially or parallel
                for (const q of questionsToCopy) {
                    await createQuestionAPI(
                        newContestId,
                        q.title,
                        q.description || "",
                        q.score,
                        q.options.map((opt: any) => ({ title: opt.title, isCorrect: opt.isCorrect })), // Transform options as needed
                        q.timeLimit
                    );
                }

                toast.success("Contest created and questions linked successfully!");
                router.push("/dashboard");
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to create contest");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-slate-100 selection:bg-brand-red/30">
            <Sidebar />
            <ToastContainer position="top-right" theme="dark" />

            <main className="max-w-4xl mx-auto px-4 pt-24 md:pt-12 md:pl-24 pb-12">

                {/* Header */}
                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-bold font-serif text-white mb-2">Initialize Battle</h1>
                    <p className="text-slate-400">Step {step + 1} of 2</p>

                    {/* Progress Bar */}
                    <div className="w-full max-w-md mx-auto h-1 bg-white/10 rounded-full mt-4 overflow-hidden">
                        <motion.div
                            className="h-full bg-brand-red"
                            initial={{ width: "0%" }}
                            animate={{ width: step === 0 ? "50%" : "100%" }}
                        />
                    </div>
                </div>

                <div className="bg-[#050505] border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative">

                    {/* Step 0: Basic Details */}
                    {step === 0 && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="p-8 space-y-6"
                        >
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Trophy className="text-brand-red" /> Battle Parameters
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-mono text-slate-500 mb-1 uppercase">Battle Title</label>
                                    <input
                                        type="text"
                                        value={contestData.title}
                                        onChange={(e) => setContestData({ ...contestData, title: e.target.value })}
                                        placeholder="e.g. Weekly Algorithm Showdown"
                                        className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-red focus:ring-1 focus:ring-brand-red outline-none transition-all placeholder:text-slate-700"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-mono text-slate-500 mb-1 uppercase">Start Time</label>
                                    <input
                                        type="datetime-local"
                                        value={contestData.startTime}
                                        onChange={(e) => setContestData({ ...contestData, startTime: e.target.value })}
                                        className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-red focus:ring-1 focus:ring-brand-red outline-none transition-all [color-scheme:dark]"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    <div
                                        onClick={() => setContestData({ ...contestData, isOpenAll: true })}
                                        className={`cursor-pointer border rounded-xl p-4 transition-all hover:bg-white/5 ${contestData.isOpenAll ? 'border-brand-red bg-brand-red/5' : 'border-white/10 bg-[#111]'}`}
                                    >
                                        <div className="flex items-center gap-3 mb-2">
                                            <Zap size={20} className={contestData.isOpenAll ? "text-brand-red" : "text-slate-500"} />
                                            <span className="font-bold text-white">Open to All</span>
                                        </div>
                                        <p className="text-xs text-slate-500">Public access for everyone.</p>
                                    </div>

                                    <div
                                        onClick={() => setContestData({ ...contestData, isOpenAll: false })}
                                        className={`cursor-pointer border rounded-xl p-4 transition-all hover:bg-white/5 ${!contestData.isOpenAll ? 'border-brand-red bg-brand-red/5' : 'border-white/10 bg-[#111]'}`}
                                    >
                                        <div className="flex items-center gap-3 mb-2">
                                            <Shield size={20} className={!contestData.isOpenAll ? "text-brand-red" : "text-slate-500"} />
                                            <span className="font-bold text-white">Restricted</span>
                                        </div>
                                        <p className="text-xs text-slate-500">Only selected batches.</p>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <div
                                        onClick={() => setContestData({ ...contestData, showResults: !contestData.showResults })}
                                        className={`cursor-pointer border rounded-xl p-4 transition-all hover:bg-white/5 flex items-center justify-between ${contestData.showResults ? 'border-brand-red bg-brand-red/5' : 'border-white/10 bg-[#111]'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Check size={20} className={contestData.showResults ? "text-brand-red" : "text-slate-500"} />
                                            <div>
                                                <span className="font-bold text-white block">Show Results After Question</span>
                                                <p className="text-xs text-slate-500">Display voting results for 5s after each question.</p>
                                            </div>
                                        </div>
                                        <div className={`w-10 h-6 rounded-full p-1 transition-colors ${contestData.showResults ? 'bg-brand-red' : 'bg-white/10'}`}>
                                            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${contestData.showResults ? 'translate-x-4' : 'translate-x-0'}`} />
                                        </div>
                                    </div>
                                </div>

                                {!contestData.isOpenAll && (
                                    <div className="pt-2">
                                        <label className="block text-xs font-mono text-slate-500 mb-3 uppercase">Select Batches</label>
                                        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto custom-scrollbar p-1">
                                            {batches.map(batch => {
                                                const isSelected = contestData.batchIds.includes(batch.id);
                                                return (
                                                    <div
                                                        key={batch.id}
                                                        onClick={() => toggleBatch(batch.id)}
                                                        className={`cursor-pointer flex items-center justify-between p-3 rounded-xl border transition-all ${isSelected
                                                            ? 'bg-brand-red/10 border-brand-red'
                                                            : 'bg-white/5 border-white/5 hover:border-white/20'
                                                            }`}
                                                    >
                                                        <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-slate-400'}`}>{batch.name}</span>
                                                        {isSelected && <Check size={14} className="text-brand-red" />}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 flex justify-end">
                                <button
                                    onClick={() => setStep(1)}
                                    disabled={!contestData.title || !contestData.startTime}
                                    className="px-8 py-3 bg-brand-red disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-brand-red/20 transition-all flex items-center gap-2"
                                >
                                    Next Phase <ChevronRight size={18} />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 1: Add Questions */}
                    {step === 1 && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="p-8 h-[600px] flex flex-col"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <FileQuestion className="text-brand-red" />
                                    Question Bank
                                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-xs text-slate-300 ml-2">
                                        {selectedQuestionIds.length} Selected
                                    </span>
                                </h2>
                                <div className="relative w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full bg-[#111] border border-white/10 rounded-lg py-2 pl-9 pr-4 text-sm text-slate-300 focus:outline-none focus:border-brand-red/50"
                                    />
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2 mb-6">
                                {filteredQuestions.length === 0 ? (
                                    <div className="text-center py-20 text-slate-500">No questions found.</div>
                                ) : (
                                    filteredQuestions.map((q: any) => {
                                        const isSelected = selectedQuestionIds.includes(q.id);
                                        return (
                                            <div
                                                key={q.id}
                                                onClick={() => toggleQuestion(q.id)}
                                                className={`cursor-pointer group relative p-4 rounded-xl border transition-all ${isSelected
                                                    ? 'bg-brand-red/5 border-brand-red/50'
                                                    : 'bg-[#111] border-white/5 hover:border-white/10'
                                                    }`}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className={`font-bold ${isSelected ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>{q.title}</h4>
                                                        <div className="flex gap-3 mt-1 text-xs font-mono text-slate-500">
                                                            <span className="flex items-center gap-1"><HelpCircle size={10} /> {q.score} pts</span>
                                                            <span className="flex items-center gap-1"><Clock size={10} /> {q.timeLimit}s</span>
                                                        </div>
                                                    </div>
                                                    {isSelected && (
                                                        <div className="w-6 h-6 rounded-full bg-brand-red flex items-center justify-center">
                                                            <Check size={14} className="text-white" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                            </div>

                            <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                                <button
                                    onClick={() => setStep(0)}
                                    className="text-slate-400 hover:text-white text-sm font-medium transition-colors"
                                >
                                    Back to Details
                                </button>
                                <button
                                    onClick={handleCreate}
                                    disabled={isLoading}
                                    className="px-8 py-3 bg-brand-red hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-brand-red/20 transition-all flex items-center gap-2"
                                >
                                    {isLoading ? <Loader className="animate-spin" size={18} /> : <Rocket size={18} />}
                                    {isLoading ? 'Initializing...' : 'Launch Battle'}
                                </button>
                            </div>
                        </motion.div>
                    )}

                </div>
            </main>
        </div>
    );
}
