'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, User, BookOpen, Clock } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../../app/store';

interface EditInterviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    interview: any;
}

export default function EditInterviewModal({ isOpen, onClose, onSuccess, interview }: EditInterviewModalProps) {
    const [studentId, setStudentId] = useState('');
    const [topic, setTopic] = useState('');
    const [description, setDescription] = useState('');
    const [startTime, setStartTime] = useState('');
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState<any[]>([]);
    const token = useAuthStore((state: any) => state.token);

    // Fetch users on mount
    useEffect(() => {
        const fetchUsers = async () => {
            if (!token) return;
            try {
                const res = await axios.get('http://localhost:3001/user', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.data.success) {
                    setUsers(res.data.data);
                }
            } catch (error) {
                console.error('Failed to fetch users:', error);
            }
        };
        fetchUsers();
    }, [token]);

    useEffect(() => {
        if (interview) {
            setStudentId(interview.studentId);
            setTopic(interview.topic);
            setDescription(interview.description || '');

            // Fix timezone issue: adjust UTC date to local time for input
            if (interview.startTime) {
                const date = new Date(interview.startTime);
                const offset = date.getTimezoneOffset();
                const localDate = new Date(date.getTime() - (offset * 60 * 1000));
                setStartTime(localDate.toISOString().slice(0, 16));
            }

            setStatus(interview.status);
        }
    }, [interview]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await axios.patch(`http://localhost:3001/interview/${interview.id}`, {
                studentId,
                topic,
                description,
                startTime,
                status
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to update interview:', error);
            alert('Failed to update interview');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-lg bg-[#0f0f11] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="flex justify-between items-center p-6 border-b border-white/10 bg-white/5">
                    <h2 className="text-xl font-bold text-white tracking-tight">Edit Interview</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
                                <User size={16} /> Student
                            </label>
                            <div className="relative">
                                <select
                                    value={studentId}
                                    onChange={(e) => setStudentId(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-red/50 transition-all font-mono text-sm appearance-none cursor-pointer hover:bg-white/5"
                                    required
                                >
                                    <option value="" disabled className="bg-[#0f0f11] text-slate-500">Select a student</option>
                                    {users.map((user) => (
                                        <option key={user.id} value={user.id} className="bg-[#0f0f11] text-white">
                                            {user.name} ({user.email})
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
                                <BookOpen size={16} /> Topic
                            </label>
                            <input
                                type="text"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-red/50 transition-all font-mono text-sm placeholder:text-slate-600"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">
                                Description
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-red/50 transition-all font-sans text-sm placeholder:text-slate-600 min-h-[100px]"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
                                <Clock size={16} /> Start Time
                            </label>
                            <input
                                type="datetime-local"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-red/50 transition-all font-mono text-sm"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Status</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-red/50 transition-all font-mono text-sm"
                            >
                                <option value="SCHEDULED">SCHEDULED</option>
                                <option value="COMPLETED">COMPLETED</option>
                                <option value="CANCELLED">CANCELLED</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-xl font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2.5 rounded-xl font-bold bg-brand-red text-white hover:bg-red-600 transition-all shadow-lg shadow-brand-red/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Updating...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
