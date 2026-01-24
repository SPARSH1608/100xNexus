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
                } else {
                    setTimeLeft(Math.floor(data.payload.remainingTime / 1000));
                }
                setIsLoading(false);
            } else if (data.type === 'WAITING') {
                setQuestion(null);
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
            <div className="min-h-screen bg-black text-white font-sans flex flex-col items-center justify-center">
                <Sidebar />
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-brand-red border-t-transparent rounded-full animate-spin mb-6"></div>
                    <h2 className="text-xl font-clean font-medium text-slate-400">Connecting to Arena...</h2>
                </div>
            </div>
        )
    }

    if (!question) {
        return (
            <div className="min-h-screen bg-black text-white font-sans flex flex-col items-center justify-center">
                <Sidebar />
                <div className="animate-pulse flex flex-col items-center">
                    <div className="w-16 h-16 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 mb-6 border border-orange-500/20">
                        <Code2 size={32} />
                    </div>
                    <h2 className="text-2xl font-clean font-bold">Waiting for next question...</h2>
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

            <div className="container mx-auto px-4 pt-32 md:pt-24 md:pl-24 pb-12 flex-1 flex flex-col max-w-4xl relative">
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
                    {!isSubmitted ? (
                        <>
                            <div className="grid gap-4 md:grid-cols-1">
                                {question.options.map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => handleOptionSelect(option.id)}
                                        disabled={isSubmitted}
                                        className={`group relative p-6 rounded-2xl border text-left transition-all duration-200 
                                            ${selectedOptions.includes(option.id)
                                                ? 'bg-brand-red/10 border-brand-red text-white shadow-[0_0_30px_-5px_var(--brand-red)]'
                                                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'
                                            }
                                            ${isSubmitted ? 'opacity-50 cursor-not-allowed' : ''}
                                        `}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-lg font-medium">{option.title}</span>
                                            {selectedOptions.includes(option.id) && (
                                                <CheckCircle2 className="text-brand-red" size={24} />
                                            )}
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
                        <div className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-3xl border border-white/10">
                            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 mb-6 animate-bounce">
                                <CheckCircle2 size={40} />
                            </div>
                            <h2 className="text-3xl font-clean font-bold mb-2">Answer Submitted!</h2>
                            <p className="text-slate-400 text-lg">Waiting for the timer to end...</p>
                            <div className="mt-8 flex gap-2">
                                <span className="w-2 h-2 rounded-full bg-slate-600 animate-pulse"></span>
                                <span className="w-2 h-2 rounded-full bg-slate-600 animate-pulse delay-75"></span>
                                <span className="w-2 h-2 rounded-full bg-slate-600 animate-pulse delay-150"></span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Leaderboard Panel - Hover Trigger Zone */}
                <div className="fixed right-0 top-0 bottom-0 w-4 z-50 group">
                    {/* The Panel Itself */}
                    <div className={`
                        absolute right-0 top-0 bottom-0 w-80 bg-black/90 backdrop-blur-xl border-l border-white/10 shadow-2xl
                        transform transition-transform duration-300 ease-in-out translate-x-full group-hover:translate-x-0
                        flex flex-col pt-20
                    `}>
                        <div className="p-6 border-b border-white/10">
                            <div className="flex items-center gap-3 text-brand-red">
                                <Trophy size={20} />
                                <h2 className="font-bold tracking-wider uppercase">Live Standings</h2>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                            {leaderboard.length === 0 ? (
                                <div className="text-center text-slate-500 py-10">Waiting for rankings...</div>
                            ) : (
                                leaderboard.map((user: any) => (
                                    <div key={user.userId} className="flex items-center p-3 rounded-xl bg-white/5 border border-white/10">
                                        <div className={`
                                            w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mr-3
                                            ${user.rank === 1 ? 'bg-yellow-500/20 text-yellow-500' :
                                                user.rank === 2 ? 'bg-slate-300/20 text-slate-300' :
                                                    user.rank === 3 ? 'bg-orange-600/20 text-orange-400' : 'bg-white/10 text-slate-400'}
                                        `}>
                                            {user.rank}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="truncate font-medium text-slate-200">{user.name}</div>
                                            <div className="text-xs text-slate-500">{user.score} pts</div>
                                        </div>
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
                            <div key={user.userId} className="flex items-center p-3 rounded-xl bg-white/5 border border-white/10">
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-sm mr-3 text-slate-300">
                                    {user.rank}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="truncate font-medium text-slate-200">{user.name}</div>
                                    <div className="text-xs text-slate-500">{user.score} pts</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    )
}
