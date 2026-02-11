'use client';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from '../../../components/layout/sidebar';
import { Trophy } from 'lucide-react';
import { getLeaderboardAPI } from '../../../api';

export default function LeaderboardPage() {
    const { id } = useParams();
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await getLeaderboardAPI(id as string);
                if (response.success) {
                    setLeaderboard(response.data);
                }
            } catch (error) {
                console.error('Failed to fetch leaderboard:', error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchLeaderboard();
        }
    }, [id]);

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-brand-red/30">
            <Sidebar />

            <div className="w-full px-6 md:px-12 pt-32 md:pt-12 md:pl-24 pb-12 min-h-screen relative overflow-hidden">
                <div className="text-center mb-16 animate-in slide-in-from-top-10 duration-700 relative z-10">
                    <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-400 mb-6 backdrop-blur-md">
                        <Trophy size={14} />
                        <span className="font-medium text-xs tracking-wide uppercase">Official Results</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-4">
                        Leaderboard
                    </h1>
                    <p className="text-slate-400 text-lg font-normal max-w-2xl mx-auto leading-relaxed">
                        Top performers from the latest session.
                    </p>
                </div>

                {loading ? (
                    <div className="max-w-3xl mx-auto space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-20 bg-white/5 rounded-2xl animate-pulse border border-white/5" />
                        ))}
                    </div>
                ) : (
                    <div className="max-w-4xl mx-auto relative z-10 text-white">
                        {leaderboard.length > 0 && (
                            <div className="flex flex-col md:flex-row items-end justify-center gap-6 mb-16 px-4">
                                {leaderboard[1] && (
                                    <div className="order-2 md:order-1 flex-1 flex flex-col items-center animate-in slide-in-from-bottom-8 duration-700 delay-100">
                                        <div className="mb-4 text-center">
                                            <div className="font-semibold text-slate-200 text-base">{leaderboard[1].name}</div>
                                            <div className="text-slate-500 text-sm font-medium">{leaderboard[1].score} pts</div>
                                        </div>
                                        <div className="w-full h-32 bg-gradient-to-t from-slate-800/50 to-slate-800/20 rounded-t-2xl border-x border-t border-white/5 relative flex items-end justify-center pb-4 backdrop-blur-sm">
                                            <div className="text-4xl font-bold text-slate-700/50">2</div>
                                        </div>
                                    </div>
                                )}

                                {leaderboard[0] && (
                                    <div className="order-1 md:order-2 flex-[1.2] flex flex-col items-center animate-in slide-in-from-bottom-12 duration-700 z-10 shadow-2xl shadow-yellow-500/5">
                                        <div className="mb-6 text-center">
                                            <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-3" strokeWidth={1.5} />
                                            <div className="font-bold text-white text-xl tracking-tight">{leaderboard[0].name}</div>
                                            <div className="text-yellow-500/80 text-sm font-medium">{leaderboard[0].score} pts</div>
                                        </div>
                                        <div className="w-full h-48 bg-gradient-to-t from-yellow-500/10 to-transparent rounded-t-2xl border-x border-t border-white/10 relative flex items-end justify-center pb-6 backdrop-blur-md">
                                            <div className="text-6xl font-bold text-yellow-500/10">1</div>
                                        </div>
                                    </div>
                                )}

                                {leaderboard[2] && (
                                    <div className="order-3 flex-1 flex flex-col items-center animate-in slide-in-from-bottom-8 duration-700 delay-200">
                                        <div className="mb-4 text-center">
                                            <div className="font-semibold text-slate-200 text-base">{leaderboard[2].name}</div>
                                            <div className="text-slate-500 text-sm font-medium">{leaderboard[2].score} pts</div>
                                        </div>
                                        <div className="w-full h-24 bg-gradient-to-t from-orange-900/20 to-transparent rounded-t-2xl border-x border-t border-white/5 relative flex items-end justify-center pb-4 backdrop-blur-sm">
                                            <div className="text-4xl font-bold text-orange-900/30">3</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="space-y-3">
                            {leaderboard.slice(3).map((user, index) => (
                                <div
                                    key={user.userId}
                                    className="group flex items-center p-5 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 backdrop-blur-sm"
                                    style={{ animationDelay: `${(index + 3) * 50}ms` }}
                                >
                                    <div className="font-medium text-slate-500 text-lg w-12 text-center">{user.rank}</div>
                                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-slate-300 font-medium text-sm mr-6 border border-white/5 group-hover:border-white/20 transition-colors">
                                        {user.name?.charAt(0)}
                                    </div>
                                    <div className="flex-1 font-medium text-lg text-slate-200 group-hover:text-white transition-colors">
                                        {user.name}
                                    </div>
                                    <div className="font-semibold text-slate-400 group-hover:text-white transition-colors text-lg">
                                        {user.score}
                                    </div>
                                </div>
                            ))}

                            {leaderboard.length === 0 && (
                                <div className="text-center py-32 bg-white/5 rounded-3xl border border-white/5">
                                    <p className="text-slate-500 font-medium">No results data available.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}