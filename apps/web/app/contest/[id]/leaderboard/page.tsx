'use client';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from '../../../components/layout/sidebar';
import { Trophy, Medal, Star } from 'lucide-react';
import { getLeaderboardAPI } from '../../../api'; // Assuming this API function needs to be created or I'll just fetch directly for now if not exists

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

    const getRankIcon = (index: number) => {
        switch (index) {
            case 0: return <Trophy className="text-yellow-400 w-8 h-8" />;
            case 1: return <Medal className="text-slate-300 w-8 h-8" />;
            case 2: return <Medal className="text-amber-600 w-8 h-8" />;
            default: return <span className="text-slate-500 font-mono font-bold w-8 text-center">{index + 1}</span>;
        }
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-brand-red/30">
            <Sidebar />

            <div className="container mx-auto px-4 pt-32 md:pt-12 md:pl-24 pb-12 max-w-4xl">
                <div className="text-center mb-12 animate-fade-in-up">
                    <div className="inline-flex items-center justify-center p-4 rounded-full bg-brand-red/10 text-brand-red mb-6 border border-brand-red/20 shadow-[0_0_30px_-5px_var(--brand-red)]">
                        <Trophy size={48} />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-clean font-bold mb-4 bg-gradient-to-br from-white to-slate-500 bg-clip-text text-transparent">
                        Contest Results
                    </h1>
                    <p className="text-slate-400 text-lg">The dust has settled. Here are the champions.</p>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-20 bg-white/5 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/10 bg-white/5">
                                        <th className="px-6 py-4 text-left text-sm font-mono text-slate-400 uppercase tracking-wider">Rank</th>
                                        <th className="px-6 py-4 text-left text-sm font-mono text-slate-400 uppercase tracking-wider">Gladiator</th>
                                        <th className="px-6 py-4 text-right text-sm font-mono text-slate-400 uppercase tracking-wider">Score</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {leaderboard.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-12 text-center text-slate-500">
                                                No participants found.
                                            </td>
                                        </tr>
                                    ) : (
                                        leaderboard.map((user, index) => (
                                            <tr
                                                key={user.userId}
                                                className={`
                                                    group transition-colors hover:bg-white/5
                                                    ${index < 3 ? 'bg-gradient-to-r from-white/5 to-transparent' : ''}
                                                `}
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-4">
                                                        {getRankIcon(index)}
                                                        {index < 3 && <Star className="w-4 h-4 text-yellow-500/50 animate-pulse" />}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className={`
                                                            w-10 h-10 rounded-full mr-4 flex items-center justify-center font-bold text-sm
                                                            ${index === 0 ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' :
                                                                'bg-white/10 text-slate-300 border border-white/10'}
                                                        `}>
                                                            {user.name?.slice(0, 2).toUpperCase() || 'AN'}
                                                        </div>
                                                        <div className="font-medium text-slate-200 group-hover:text-white transition-colors">
                                                            {user.name}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <span className={`
                                                        text-xl font-mono font-bold
                                                        ${index === 0 ? 'text-brand-red' : 'text-slate-300'}
                                                    `}>
                                                        {user.score}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}