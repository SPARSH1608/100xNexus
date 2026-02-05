'use client'
import { useParams, useRouter } from "next/navigation"
import Sidebar from "../../../components/layout/sidebar"
import { Code2, Trophy, Clock, CheckCircle2 } from "lucide-react"
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
            {/* Minimal Header for Play Mode */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10 px-6 py-4 flex justify-between items-center">
                <div className="font-bold text-xl tracking-wider">ARENA <span className="text-brand-red">LIVE</span></div>
                <div className="flex items-center gap-6">
                    <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border ${timeLeft < 10 ? 'border-red-500/50 bg-red-500/10 text-red-400' : 'border-white/10 bg-white/5 text-slate-300'}`}>
                        <Clock size={16} />
                        <span className="font-mono font-bold text-lg">{timeLeft}s</span>
                    </div>
                    <button onClick={() => setShowLeaderboard(!showLeaderboard)} className="lg:hidden p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white" title="Leaderboard">
                        <Trophy size={20} />
                    </button>
                </div>
            </div>

            <div className="w-full px-6 md:px-12 pt-32 md:pt-24 md:pl-24 pb-12 flex-1 flex flex-col relative">
                {/* Main Question Area - Centered and distraction free */}
                <div className="w-full">
                    <div className="mb-8">
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-sm font-mono text-brand-red uppercase tracking-widest">Question</span>
                            <span className="text-sm font-mono text-slate-500">Points: {question.score}</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-clean font-bold leading-tight mb-6">{question.title}</h1>
                        {question.description && (
                            <div className="text-slate-400 text-lg leading-relaxed bg-white/5 p-6 rounded-2xl border border-white/10">
                                {question.description}
                            </div>
                        )}
                    </div>

                    {/* Content Area: Options or Waiting Screen */}
                    {resultsData ? (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
                            <div className="bg-white/5 rounded-3xl p-12 border border-white/10 relative overflow-hidden w-full">
                                {/* Ambient Background Glow */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-brand-red/5 blur-3xl pointer-events-none" />

                                <h2 className="text-3xl font-bold mb-16 text-center flex items-center justify-center gap-3 relative z-10">
                                    <span className="bg-white/10 border border-white/5 px-6 py-2 rounded-full text-base uppercase tracking-wider text-slate-300 backdrop-blur-md">Voting Results</span>
                                </h2>

                                <div className="flex items-end justify-center gap-8 sm:gap-12 h-96 mb-12 px-8 relative z-10 w-full">
                                    {question.options.map((option) => {
                                        const stats = resultsData.stats?.[option.id] || { count: 0, users: [] };
                                        const count = stats.count;
                                        // The question object from RESULTS payload should have isCorrect.
                                        const isCorrect = resultsData.question.options.find((o: any) => o.id === option.id)?.isCorrect;

                                        // Max height calculation
                                        const maxCount = Math.max(...Object.values(resultsData.stats || {}).map((s: any) => s.count), 1);
                                        const heightPercent = Math.max((count / maxCount) * 100, 10); // Minimum 10% height

                                        return (
                                            <div key={option.id} className="flex flex-col items-center flex-1 h-full max-w-[180px] group relative">
                                                {/* Count Badge - Floating */}
                                                <div className={`mb-6 font-clean font-bold text-5xl transition-all transform group-hover:scale-110 drop-shadow-lg
                                                    ${isCorrect ? 'text-white' : 'text-slate-400'}
                                                `}>
                                                    {count}
                                                </div>

                                                {/* The Bar */}
                                                <div
                                                    className={`w-full rounded-t-3xl transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] relative
                                                        ${isCorrect
                                                            ? 'bg-gradient-to-t from-brand-red to-red-500 shadow-[0_0_40px_-5px_var(--brand-red)] border-t-2 border-white/30'
                                                            : 'bg-white/10 border-t-2 border-white/20 hover:bg-white/15'}
                                                    `}
                                                    style={{ height: `${heightPercent}%` }}
                                                >
                                                    {/* Tooltip for Voters */}
                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 opacity-0 group-hover:opacity-100 transition-all duration-300 z-50 pointer-events-none translate-y-2 group-hover:translate-y-0">
                                                        {stats.users.length > 0 && (
                                                            <div className="bg-black/90 backdrop-blur-xl border border-white/20 px-4 py-3 rounded-2xl whitespace-nowrap text-sm text-slate-300 shadow-2xl flex flex-col items-center">
                                                                <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Voters</div>
                                                                <div className="font-medium text-white">
                                                                    {stats.users.slice(0, 3).map((u: any) => u.name).join(', ')}
                                                                    {stats.users.length > 3 && <span className="opacity-50 ml-1">+{stats.users.length - 3}</span>}
                                                                </div>
                                                                {/* Triangle Arrow */}
                                                                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-black/90" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Label */}
                                                <div className="mt-6 text-base font-medium text-center leading-tight text-slate-400 group-hover:text-white transition-colors line-clamp-2">
                                                    {option.title}
                                                </div>

                                                {/* Correct Indicator */}
                                                {isCorrect && (
                                                    <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-brand-red text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 animate-pulse bg-brand-red/10 px-4 py-1.5 rounded-full border border-brand-red/20">
                                                        <CheckCircle2 size={14} /> Correct Answer
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    ) : !isSubmitted ? (
                        <>
                            <div className="grid gap-6 md:grid-cols-1 w-full">
                                {question.options.map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => handleOptionSelect(option.id)}
                                        disabled={isSubmitted}
                                        className={`
                                            w-full px-8 py-6 rounded-2xl font-bold text-lg text-left transition-all border-2
                                            ${selectedOptions.includes(option.id)
                                                ? 'bg-brand-red border-brand-red text-white shadow-lg shadow-brand-red/25 scale-[1.02]'
                                                : 'bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20 hover:scale-[1.01]'
                                            }
                                            ${isSubmitted ? 'cursor-not-allowed opacity-50' : 'cursor-pointer active:scale-[0.99]'}
                                        `}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                                                ${selectedOptions.includes(option.id)
                                                    ? 'border-white bg-white'
                                                    : 'border-white/30'
                                                }
                                            `}>
                                                {selectedOptions.includes(option.id) && (
                                                    <CheckCircle2 size={16} className="text-brand-red" />
                                                )}
                                            </div>
                                            <span className="flex-1">{option.title}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <div className="mt-12 flex justify-end">
                                <button
                                    onClick={() => submitAnswer()}
                                    disabled={isSubmitted || selectedOptions.length === 0}
                                    className={`
                                        px-8 py-4 rounded-xl font-bold text-lg tracking-wide transition-all
                                        ${isSubmitted
                                            ? 'bg-green-500/20 text-green-500 border border-green-500/20 cursor-default'
                                            : selectedOptions.length === 0
                                                ? 'bg-white/5 text-slate-500 border border-white/10 cursor-not-allowed'
                                                : 'bg-brand-red text-white shadow-lg hover:shadow-brand-red/25 hover:scale-[1.02] active:scale-[0.98]'
                                        }
                                    `}
                                >
                                    Submit Answer
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-24 bg-white/5 rounded-3xl border border-white/10 relative overflow-hidden group">
                            {/* Ambient Background Glow */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-green-500/5 blur-3xl pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />

                            <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 mb-8 relative z-10 border border-green-500/20 shadow-[0_0_40px_-10px_var(--green-500)] animate-pulse-slow">
                                <CheckCircle2 size={48} />
                            </div>
                            <h2 className="text-4xl font-clean font-bold mb-3 text-white tracking-wide relative z-10">Answer Submitted</h2>
                            <p className="text-slate-400 text-lg font-medium relative z-10">Relax, the next round is coming.</p>

                            <div className="mt-12 flex items-center gap-3 bg-black/40 px-6 py-3 rounded-full border border-white/5 backdrop-blur-md relative z-10">
                                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Waiting for timer</span>
                                <div className="flex gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-brand-red animate-bounce"></span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-brand-red animate-bounce delay-100"></span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-brand-red animate-bounce delay-200"></span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Leaderboard Panel - Hover Trigger Zone */}
                <div className="fixed right-0 top-0 bottom-0 w-4 z-50 group hover:w-96 transition-all duration-500 ease-out">
                    {/* The Panel Itself */}
                    <div className={`
                        absolute right-0 top-0 bottom-0 w-96 bg-black/95 backdrop-blur-xl border-l border-white/10 shadow-2xl
                        transform transition-transform duration-500 ease-out translate-x-full group-hover:translate-x-0
                        flex flex-col pt-24 pb-8 px-6
                    `}>
                        <div className="mb-8 flex items-center gap-3 text-brand-red animate-fade-in">
                            <div className="p-2 bg-brand-red/10 rounded-lg">
                                <Trophy size={24} />
                            </div>
                            <h2 className="font-clean font-bold text-xl tracking-wider uppercase text-white">Live Standings</h2>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
                            {leaderboard.length === 0 ? (
                                <div className="text-center text-slate-500 py-10 italic">Waiting for rankings...</div>
                            ) : (
                                leaderboard.map((user: any, index) => (
                                    <div key={user.userId} className={`
                                        relative flex items-center p-4 rounded-xl border transition-all duration-300 hover:scale-[1.02]
                                        ${user.rank === 1 ? 'bg-gradient-to-r from-yellow-500/10 to-transparent border-yellow-500/20' :
                                            user.rank === 2 ? 'bg-gradient-to-r from-slate-300/10 to-transparent border-white/10' :
                                                user.rank === 3 ? 'bg-gradient-to-r from-orange-500/10 to-transparent border-orange-500/20' :
                                                    'bg-white/5 border-white/5 hover:bg-white/10'}
                                    `}>
                                        <div className={`
                                            w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg mr-4 shadow-lg
                                            ${user.rank === 1 ? 'bg-yellow-500 text-black' :
                                                user.rank === 2 ? 'bg-slate-300 text-black' :
                                                    user.rank === 3 ? 'bg-orange-500 text-black' : 'bg-white/10 text-slate-400'}
                                        `}>
                                            {user.rank}
                                        </div>
                                        <div className="flex-1 min-w-0 z-10">
                                            <div className={`truncate font-bold ${user.rank <= 3 ? 'text-white' : 'text-slate-300'}`}>{user.name}</div>
                                            <div className="text-xs text-slate-500 font-mono mt-0.5">{user.score} pts</div>
                                        </div>
                                        {user.rank === 1 && <Trophy className="text-yellow-500/20 absolute right-4 w-12 h-12" />}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Mobile Leaderboard Panel (Toggle-based) */}
                <div className={`
                    fixed inset-0 z-50 bg-black/95 lg:hidden
                    flex flex-col transition-transform duration-300 ease-in-out
                    ${showLeaderboard ? 'translate-x-0' : 'translate-x-full'}
                `}>
                    <div className="p-6 border-b border-white/10 flex justify-between items-center">
                        <h2 className="text-xl font-bold">Leaderboard</h2>
                        <button onClick={() => setShowLeaderboard(false)} className="text-slate-400 hover:text-white">
                            Close
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        {/* Same list code as above - could be componentized but duplicating for speed */}
                        {leaderboard.map((user: any) => (
                            <div key={user.userId} className={`
                                flex items-center p-4 rounded-xl border transition-all
                                ${user.rank === 1 ? 'bg-gradient-to-r from-yellow-500/10 to-transparent border-yellow-500/20' :
                                    user.rank === 2 ? 'bg-gradient-to-r from-slate-300/10 to-transparent border-white/10' :
                                        user.rank === 3 ? 'bg-gradient-to-r from-orange-500/10 to-transparent border-orange-500/20' :
                                            'bg-white/5 border-white/5'}
                            `}>
                                <div className={`
                                    w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg mr-4 shadow-lg
                                    ${user.rank === 1 ? 'bg-yellow-500 text-black' :
                                        user.rank === 2 ? 'bg-slate-300 text-black' :
                                            user.rank === 3 ? 'bg-orange-500 text-black' : 'bg-white/10 text-slate-400'}
                                `}>
                                    {user.rank}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className={`truncate font-bold ${user.rank <= 3 ? 'text-white' : 'text-slate-300'}`}>{user.name}</div>
                                    <div className="text-xs text-slate-500 font-mono mt-0.5">{user.score} pts</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    )
}
