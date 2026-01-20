"use client";

import { SignupAPI } from "../../api";
import { useAuthStore } from "../../store";
import { ToastContainer, toast } from 'react-toastify';
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, User, Mail, Lock, ShieldCheck } from "lucide-react";

export default function SignUpPage() {
    const signin = useAuthStore((state) => state.signin);
    const router = useRouter();

    const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const name = formData.get('name');
        const email = formData.get('email');
        const password = formData.get('password');
        try {
            const response = await SignupAPI(name as string, email as string, password as string);
            if (response.success) {
                signin(response.data.token, response.data.role);
                toast.success(response.message);
                router.push('/dashboard');
            }
        } catch (error) {
            toast.error(error as string);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4 selection:bg-brand-red/30 overflow-hidden relative">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] right-[-20%] w-[600px] h-[600px] rounded-full bg-brand-red/10 blur-[100px]" />
                <div className="absolute bottom-[-20%] left-[-20%] w-[600px] h-[600px] rounded-full bg-red-900/20 blur-[100px]" />
                <div className="absolute top-[40%] right-[30%] w-[300px] h-[300px] border-[30px] border-brand-red/5 rounded-full blur-[50px]" />
            </div>

            <ToastContainer position="top-right" theme="dark" />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-md relative z-10"
            >
                <div className="bg-[#050505]/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-[0_0_50px_-20px_rgba(220,38,38,0.3)]">

                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-red/10 text-brand-red mb-6 border border-brand-red/20 shadow-[0_0_20px_-5px_rgba(220,38,38,0.3)]">
                            <ShieldCheck size={24} className="fill-current" />
                        </div>
                        <h1 className="text-3xl font-clean font-bold text-white mb-2">Join the Elite</h1>
                        <p className="text-slate-500 font-clean text-lg">Create your profile and start competing</p>
                    </div>

                    <form onSubmit={handleSignup} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 ml-1 uppercase tracking-wider">Codename</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-brand-red transition-colors" />
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Execute_Order_66"
                                    className="w-full bg-black/50 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-slate-100 placeholder:text-slate-700 focus:outline-none focus:border-brand-red/50 focus:ring-1 focus:ring-brand-red/50 transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 ml-1 uppercase tracking-wider">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-brand-red transition-colors" />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="warrior@codebattle.com"
                                    className="w-full bg-black/50 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-slate-100 placeholder:text-slate-700 focus:outline-none focus:border-brand-red/50 focus:ring-1 focus:ring-brand-red/50 transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 ml-1 uppercase tracking-wider">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-brand-red transition-colors" />
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="••••••••"
                                    className="w-full bg-black/50 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-slate-100 placeholder:text-slate-700 focus:outline-none focus:border-brand-red/50 focus:ring-1 focus:ring-brand-red/50 transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full mt-2 bg-brand-red hover:bg-black hover:text-brand-red hover:border-brand-red border border-transparent text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-red/20 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 group tracking-wide uppercase text-sm"
                        >
                            Register Identity <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-white/5 text-center">
                        <p className="text-slate-500 text-sm">
                            Already enlisted?{' '}
                            <Link href="/signin" className="text-white hover:text-brand-red font-bold transition-colors">
                                Access Terminal
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}