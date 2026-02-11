'use client'
import { useParams, useRouter } from "next/navigation"
import Sidebar from "../../../components/layout/sidebar"
import { Code2, Trophy, Clock, CheckCircle2, X } from "lucide-react"
import { useEffect, useState, useRef } from "react"
import { submitAnswerAPI } from "../../../api"
import { useAuthStore } from "../../../store"

interface Question {
    id: string;
    title: string;
    description?: string;
    score: number;
    timeLimit: number;
    options: { id: string; title: string }[];
}

export default function ContestPlayPage() {
    const { id } = useParams()
    const router = useRouter()
    const [question, setQuestion] = useState<Question | null>(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const token = useAuthStore((state: any) => state.token);

    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [resultsData, setResultsData] = useState<any>(null);

    useEffect(() => {
        if (!id || !token) return;

        const eventSource = new EventSource(`http://localhost:3001/contest/${id}/stream?token=${token}`);

        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'QUESTION') {
                const newQuestion = data.payload.question;
                if (newQuestion.id !== question?.id) {
                    setQuestion(newQuestion);
                    setTimeLeft(Math.floor(data.payload.remainingTime / 1000));
                    setSelectedOptions([]);
                    setIsSubmitted(false);
                    setResultsData(null);
                } else {
                    setTimeLeft(Math.floor(data.payload.remainingTime / 1000));
                }
                setIsLoading(false);
            } else if (data.type === 'WAITING') {
                setQuestion(null);
                setResultsData(null);
                setIsLoading(false);
            } else if (data.type === 'RESULTS') {
                setResultsData(data.payload);
                setQuestion(data.payload.question);
                setTimeLeft(Math.floor(data.payload.remainingTime / 1000));
                setIsLoading(false);
            } else if (data.type === 'LEADERBOARD') {
                setLeaderboard(data.payload);
            } else if (data.type === 'END') {
                router.push(`/contest/${id}/leaderboard`);
                eventSource.close();
            }
        };

        eventSource.onerror = (err) => {
            console.error("EventSource failed:", err);
            // Optionally close or reconnect logic
            // eventSource.close(); 
        };

        return () => {
            eventSource.close();
        };
    }, [id, token, router, question?.id]);

    const handleOptionSelect = (optionId: string) => {
        if (isSubmitted) return;

        setSelectedOptions(prev => {
            if (prev.includes(optionId)) {
                return prev.filter(id => id !== optionId);
            } else {
                return [...prev, optionId];
            }
        });
    };

    const submitAnswer = async (autoSubmit = false) => {
        if (isSubmitted || !question) return;
        setIsSubmitted(true);
        try {
            await submitAnswerAPI(id as string, question.id, selectedOptions);
        } catch (error) {
            console.error("Failed to submit answer:", error);
        }
    };

    // Auto-submit when time runs out
    useEffect(() => {
        if (timeLeft === 0 && question && !isSubmitted) {
            submitAnswer(true);
        }
    }, [timeLeft, question, isSubmitted]);

    // Local timer countdown for smooth UI
    useEffect(() => {
        const timerCallback = () => {
            setTimeLeft(prev => {
                if (prev <= 0) return 0;
                return prev - 1;
            });
        };
        const timerId = setInterval(timerCallback, 1000);
        return () => clearInterval(timerId);
    }, []);



    if (isLoading) {
        return (
            <div className="min-h-screen bg-black text-white font-sans flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-red/5 via-black to-black opacity-30" />
                <Sidebar />
                <div className="flex flex-col items-center relative z-10">
                    <div className="relative mb-8">
                        <div className="absolute inset-0 bg-brand-red blur-xl opacity-20 animate-pulse-slow" />
                        <div className="w-16 h-16 border-4 border-white/5 border-t-brand-red rounded-full animate-spin shadow-2xl relative z-10" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-8 rounded-full bg-brand-red/10 animate-pulse" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-clean font-bold tracking-widest uppercase text-white animate-pulse">Connecting</h2>
                </div>
            </div>
        )
    }

    if (!question) {
        return (
            <div className="min-h-screen bg-black text-white font-sans flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-red/10 via-black to-black opacity-50" />
                <Sidebar />
                <div className="flex flex-col items-center relative z-10 p-12 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm animate-in fade-in zoom-in duration-500">
                    <div className="relative mb-8">
                        <div className="absolute inset-0 bg-brand-red blur-2xl opacity-20 animate-pulse-slow" />
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-red/20 to-black flex items-center justify-center text-brand-red border border-brand-red/20 shadow-xl relative z-10">
                            <Code2 size={40} className="animate-pulse" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-clean font-bold text-white mb-3 tracking-wide">Get Ready</h2>
                    <p className="text-slate-400 font-medium tracking-wide uppercase text-sm">Waiting for next question...</p>

                    <div className="mt-8 flex gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-red animate-bounce"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-red animate-bounce delay-75"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-red animate-bounce delay-150"></span>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-brand-red/30 flex flex-col">
            <Sidebar />
            <div className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex justify-between items-center transition-all duration-300">
                <div className="font-semibold text-lg tracking-tight text-white/90">Code<span className="text-blue-500">Quiz</span></div>
                <div className="flex items-center gap-6">
                    <div className={`
                        flex items-center gap-2 px-4 py-1.5 rounded-full border transition-all duration-500
                        ${timeLeft < 10
                            ? 'border-red-500/30 bg-red-500/10 text-red-400 animate-pulse'
                            : 'border-white/10 bg-white/5 text-slate-300'}
                    `}>
                        <Clock size={14} className="opacity-70" />
                        <span className="font-medium text-sm tabular-nums">{timeLeft}s</span>
                    </div>
                    <button onClick={() => setShowLeaderboard(!showLeaderboard)} className="lg:hidden p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white" title="Leaderboard">
                        <Trophy size={18} />
                    </button>
                </div>
            </div>

            <div className="w-full px-6 md:px-12 pt-32 md:pt-24 md:pl-24 pb-12 flex-1 flex flex-col relative">
                <div className="w-full max-w-4xl mx-auto">
                    <div className="mb-12 text-center md:text-left">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <span className="inline-flex self-start md:self-auto items-center px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-slate-400 uppercase tracking-wider backdrop-blur-sm">
                                Question
                            </span>
                            <span className="text-sm font-medium text-slate-500 bg-white/5 px-4 py-1.5 rounded-full border border-white/5">
                                {question.score} Points
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white leading-tight mb-6">
                            {question.title}
                        </h1>
                        {question.description && (
                            <div className="text-slate-300 text-lg leading-relaxed font-light">
                                {question.description}
                            </div>
                        )}
                    </div>

                    {resultsData ? (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
                            <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-white/10 relative overflow-hidden w-full shadow-2xl">
                                <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-brand-red/5 via-transparent to-transparent opacity-50 pointer-events-none" />

                                <div className="flex items-center justify-between mb-12 relative z-10">
                                    <h2 className="text-2xl font-mono font-bold uppercase tracking-widest text-white flex items-center gap-3">
                                        <div className="w-2 h-8 bg-brand-red" />
                                        Voting Analysis
                                    </h2>
                                    <div className="px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs font-mono text-slate-400">
                                        LIVE DATA
                                    </div>
                                </div>

                                <div className="space-y-6 relative z-10">
                                    {question.options.map((option, idx) => {
                                        const stats = resultsData.stats?.[option.id] || { count: 0, users: [] };
                                        const count = stats.count;
                                        const isCorrect = resultsData.question.options.find((o: any) => o.id === option.id)?.isCorrect;

                                        // Max calculations
                                        const totalVotes = Object.values(resultsData.stats || {}).reduce((acc: number, curr: any) => acc + curr.count, 0) as number;
                                        const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                                        const maxCount = Math.max(...Object.values(resultsData.stats || {}).map((s: any) => s.count), 1);
                                        const widthPercent = (count / maxCount) * 100;

                                        return (
                                            <div key={option.id} className="relative group">
                                                <div className="flex justify-between items-end mb-2">
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-mono text-slate-500 text-sm">0{idx + 1}</span>
                                                        <span className={`font-medium text-lg ${isCorrect ? 'text-white' : 'text-slate-400'}`}>
                                                            {option.title}
                                                        </span>
                                                        {isCorrect && (
                                                            <CheckCircle2 size={16} className="text-brand-red" />
                                                        )}
                                                    </div>
                                                    <div className="font-mono font-bold text-xl flex items-baseline gap-1">
                                                        <span className={isCorrect ? 'text-brand-red' : 'text-white'}>{count}</span>
                                                        <span className="text-xs text-slate-600 font-normal">VOTES</span>
                                                    </div>
                                                </div>
                                                <div className="h-10 w-full bg-white/5 rounded-r-xl relative overflow-hidden flex items-center">
                                                    <div
                                                        className={`h-full transition-all duration-1000 ease-out relative
                                                            ${isCorrect
                                                                ? 'bg-brand-red/20 border-r-4 border-brand-red'
                                                                : 'bg-white/10 border-r-4 border-white/20'}
                                                        `}
                                                        style={{ width: `${Math.max(widthPercent, 1)}%` }}
                                                    >
                                                        {/* Pattern overlay */}
                                                        <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />
                                                    </div>

                                                    <span className="absolute left-4 font-mono text-xs text-slate-500 tracking-wider z-10">
                                                        {percentage}%
                                                    </span>

                                                    {stats.users.length > 0 && (
                                                        <div className="absolute right-4 flex items-center -space-x-2 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                            {stats.users.slice(0, 5).map((u: any, i: number) => (
                                                                <div key={i} className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[8px] text-slate-300 font-bold" title={u.name}>
                                                                    {u.name.charAt(0)}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    ) : !isSubmitted ? (
                        <>
                            <div className="grid gap-4 md:grid-cols-1 w-full relative z-10">
                                {question.options.map((option, idx) => (
                                    <button
                                        key={option.id}
                                        onClick={() => handleOptionSelect(option.id)}
                                        disabled={isSubmitted}
                                        className={`
                                            group w-full p-6 rounded-xl text-left transition-all duration-200 border relative overflow-hidden
                                            ${selectedOptions.includes(option.id)
                                                ? 'bg-white/10 border-brand-red ring-1 ring-brand-red/50'
                                                : 'bg-black/40 border-white/10 hover:border-white/30 hover:bg-white/5'
                                            }
                                            ${isSubmitted ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                        `}
                                    >
                                        <div className="flex items-center gap-6 relative z-10">
                                            <div className={`
                                                font-mono text-2xl font-bold w-12 h-12 flex items-center justify-center rounded-lg border transition-colors
                                                ${selectedOptions.includes(option.id)
                                                    ? 'bg-brand-red text-white border-brand-red'
                                                    : 'bg-white/5 text-slate-500 border-white/10 group-hover:border-white/30'
                                                }
                                            `}>
                                                {String.fromCharCode(65 + idx)}
                                            </div>
                                            <div className="flex-1">
                                                <div className={`text-lg font-medium transition-colors ${selectedOptions.includes(option.id) ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                                                    {option.title}
                                                </div>
                                            </div>
                                            {selectedOptions.includes(option.id) && (
                                                <div className="animate-in zoom-in spin-in duration-300">
                                                    <CheckCircle2 size={24} className="text-brand-red" />
                                                </div>
                                            )}
                                        </div>

                                        {selectedOptions.includes(option.id) && (
                                            <div className="absolute inset-0 bg-gradient-to-r from-brand-red/10 to-transparent pointer-events-none" />
                                        )}
                                    </button>
                                ))}
                            </div>

                            <div className="mt-12 flex justify-end">
                                <button
                                    onClick={() => submitAnswer()}
                                    disabled={isSubmitted || selectedOptions.length === 0}
                                    className={`
                                        px-10 py-4 rounded-xl font-bold font-mono text-lg tracking-widest uppercase transition-all relative overflow-hidden group
                                        ${isSubmitted
                                            ? 'bg-white/5 text-slate-500 border border-white/10 cursor-default'
                                            : selectedOptions.length === 0
                                                ? 'bg-white/5 text-slate-600 border border-white/5 cursor-not-allowed'
                                                : 'bg-brand-red text-white hover:bg-red-600 shadow-[0_0_30px_-10px_var(--brand-red)] hover:shadow-[0_0_50px_-10px_var(--brand-red)]'
                                        }
                                    `}
                                >
                                    <span className="relative z-10">
                                        {isSubmitted ? 'Submitted' : 'Confirm Selection'}
                                    </span>
                                    {!isSubmitted && selectedOptions.length > 0 && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                    )}
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 bg-black/40 backdrop-blur-sm rounded-3xl border border-white/10 relative overflow-hidden group w-full">
                            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-20" />

                            <div className="w-32 h-32 relative mb-10">
                                <div className="absolute inset-0 border-4 border-white/5 rounded-full animate-[spin_10s_linear_infinite]" />
                                <div className="absolute inset-2 border-2 border-t-brand-red border-r-transparent border-b-brand-red border-l-transparent rounded-full animate-[spin_3s_linear_infinite]" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <CheckCircle2 size={48} className="text-brand-red animate-in zoom-in duration-500" />
                                </div>
                            </div>

                            <h2 className="text-3xl font-mono font-bold mb-4 text-white tracking-widest uppercase">
                                System Locked
                            </h2>
                            <p className="text-slate-500 font-mono text-sm uppercase tracking-wider mb-12">
                                Answer recorded. Awaiting results sequence.
                            </p>

                            <div className="w-64 h-1 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-brand-red/50 w-1/3 animate-[translateX_3s_ease-in-out_infinite]" />
                            </div>
                        </div>
                    )}
                </div>

                <div className="fixed right-0 top-0 bottom-0 w-4 z-50 group hover:w-96 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]">
                    <div className={`
                        absolute right-0 top-0 bottom-0 w-96 bg-white/5 backdrop-blur-3xl border-l border-white/10 shadow-2xl
                        transform transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] translate-x-full group-hover:translate-x-0
                        flex flex-col pt-24 pb-8 px-6
                    `}>
                        <div className="mb-8 flex items-center justify-between">
                            <h2 className="font-semibold text-xl tracking-tight text-white flex items-center gap-3">
                                <Trophy size={20} className="text-blue-500" />
                                Standings
                            </h2>
                            <span className="text-xs font-medium text-slate-500 bg-white/5 px-2 py-1 rounded-md">Live</span>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                            {leaderboard.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-slate-500 text-sm">
                                    <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-3">
                                        <Trophy size={20} className="opacity-20" />
                                    </div>
                                    Waiting for rankings...
                                </div>
                            ) : (
                                leaderboard.map((user: any, index) => (
                                    <div key={user.userId} className={`
                                        flex items-center p-3 rounded-xl border transition-all duration-200
                                        ${user.rank === 1 ? 'bg-white/10 border-white/10 shadow-lg' :
                                            'bg-white/5 border-transparent hover:bg-white/10'}
                                    `}>
                                        <div className={`
                                            w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mr-4 shadow-sm
                                            ${user.rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white ring-2 ring-yellow-500/20' :
                                                user.rank === 2 ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-slate-900' :
                                                    user.rank === 3 ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-amber-100' : 'bg-white/10 text-slate-400'}
                                        `}>
                                            {user.rank}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="truncate font-medium text-sm text-slate-200">{user.name}</div>
                                        </div>
                                        <div className="text-sm font-semibold text-white ml-2">{user.score}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className={`
                    fixed inset-0 z-50 bg-black/80 backdrop-blur-xl lg:hidden
                    flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
                    ${showLeaderboard ? 'translate-x-0' : 'translate-x-full'}
                `}>
                    <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/20">
                        <h2 className="text-lg font-semibold text-white">Leaderboard</h2>
                        <button onClick={() => setShowLeaderboard(false)} className="p-2 bg-white/10 rounded-full text-slate-300 hover:bg-white/20 transition-colors">
                            <X size={18} />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        {leaderboard.map((user: any) => (
                            <div key={user.userId} className={`
                                flex items-center p-4 rounded-2xl bg-white/5 border border-white/5
                            `}>
                                <div className={`
                                    w-10 h-10 rounded-full flex items-center justify-center font-bold text-base mr-4
                                    ${user.rank <= 3 ? 'bg-white text-black' : 'bg-white/10 text-slate-400'}
                                `}>
                                    {user.rank}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="truncate font-medium text-base text-white">{user.name}</div>
                                </div>
                                <div className="text-base font-semibold text-white/90">{user.score} pts</div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    )
}
