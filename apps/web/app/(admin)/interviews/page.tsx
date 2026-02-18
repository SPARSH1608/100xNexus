'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Calendar, User, Clock, CheckCircle, XCircle } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../../store';
import CreateInterviewModal from '../../../components/admin/CreateInterviewModal';
import EditInterviewModal from '../../../components/admin/EditInterviewModal';

interface Interview {
    id: string;
    studentId: string;
    topic: string;
    startTime: string;
    status: string;
    user: {
        name: string;
        email: string;
    };
}

export default function InterviewsPage() {
    const [interviews, setInterviews] = useState<Interview[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingInterview, setEditingInterview] = useState<Interview | null>(null);
    const token = useAuthStore((state: any) => state.token);

    const fetchInterviews = async () => {
        try {
            // Fetch all interviews (need an endpoint for this, assuming GET /interview/all or similar exists or we fetch per student)
            // For now, let's assume we can fetch all. If not, we might need to add an endpoint.
            // But wait, the router I made only has `get /:id` and `get /student/:id`.
            // I should add `get /` (admin only) to list all.
            const res = await axios.get('http://localhost:3001/interview/all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setInterviews(res.data.interviews);
        } catch (error) {
            console.error('Failed to fetch interviews:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchInterviews();
    }, [token]);

    return (
        <div className="min-h-screen bg-[#0f0f11] text-white font-sans p-8 pl-24">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2">Interviews</h1>
                        <p className="text-slate-400">Manage and schedule technical interviews</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-brand-red text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                    >
                        <Plus size={18} />
                        Schedule Interview
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-red"></div>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {interviews.length === 0 ? (
                            <div className="text-center py-20 bg-white/5 rounded-xl border border-white/5">
                                <Calendar size={48} className="mx-auto text-slate-600 mb-4" />
                                <h3 className="text-lg font-medium text-slate-300">No interviews scheduled</h3>
                                <p className="text-slate-500">Get started by scheduling a new interview.</p>
                            </div>
                        ) : (
                            interviews.map((interview) => (
                                <div key={interview.id} className="bg-[#1a1a1c] border border-white/5 p-6 rounded-xl hover:border-white/10 transition-colors flex items-center justify-between group">
                                    <div className="flex gap-6 items-center">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold
                                            ${interview.status === 'SCHEDULED' ? 'bg-blue-500/10 text-blue-500' :
                                                interview.status === 'COMPLETED' ? 'bg-green-500/10 text-green-500' :
                                                    'bg-slate-500/10 text-slate-500'}
                                         `}>
                                            {interview.status === 'SCHEDULED' && <Calendar size={20} />}
                                            {interview.status === 'COMPLETED' && <CheckCircle size={20} />}
                                            {interview.status === 'CANCELLED' && <XCircle size={20} />}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg text-white mb-1 group-hover:text-brand-red transition-colors">
                                                {interview.topic}
                                            </h3>
                                            <div className="flex items-center gap-4 text-sm text-slate-400 font-mono">
                                                <span className="flex items-center gap-1.5">
                                                    <User size={14} />
                                                    {interview.user?.name || interview.studentId}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <Clock size={14} />
                                                    {new Date(interview.startTime).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => setEditingInterview(interview)}
                                            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="px-3 py-1.5 bg-brand-red/10 hover:bg-brand-red/20 text-brand-red rounded-lg text-sm font-medium"
                                            onClick={() => window.open(`/interview/${interview.id}`, '_blank')}
                                        >
                                            Join Room
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            <CreateInterviewModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchInterviews}
            />

            <EditInterviewModal
                isOpen={!!editingInterview}
                onClose={() => setEditingInterview(null)}
                onSuccess={fetchInterviews}
                interview={editingInterview}
            />
        </div>
    );
}
