"use client"

import Link from "next/link"
import { useAuthStore } from "../../store"
import { NAV_ITEMS } from "../../config/navigation"
import { useRouter, usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { Menu, X, LogOut, Code2, User, Settings, ChevronRight, LogIn, ChevronLeft, LayoutDashboard, Trophy, Layers, Users, FileQuestion, History, Swords, Video } from "lucide-react"

const ICON_MAP: Record<string, any> = {
    "Dashboard": LayoutDashboard,
    "Contests": Trophy,
    "Batches": Layers,
    "Students": Users,
    "Questions": FileQuestion,
    "My Contests": Swords,
    "History": History,
    "Interviews": Video
}

export default function Sidebar() {
    const { isAuthenticated, role, logout } = useAuthStore((s) => s)
    const router = useRouter()
    const pathname = usePathname()
    const [isHovered, setIsHovered] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const items = (isAuthenticated && role) ? NAV_ITEMS[role as keyof typeof NAV_ITEMS] : []

    const handleLogout = () => {
        logout()
        router.push("/")
    }

    return (
        <>
            {/* Desktop Sidebar */}
            <motion.div
                className="hidden md:flex fixed top-0 left-0 h-full z-50 flex-col bg-[#050505] border-r border-white/10 transition-all duration-300 ease-in-out shadow-2xl"
                initial={false}
                animate={{ width: isHovered ? 240 : 80 }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Logo Area */}
                <div className="p-5 flex items-center gap-4 border-b border-white/5 h-20">
                    <Link href={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-3 group shrink-0">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-red to-red-900 shadow-lg shadow-brand-red/20 flex items-center justify-center text-white group-hover:scale-105 transition-transform duration-300 border border-white/10">
                            <Code2 size={20} strokeWidth={2.5} />
                        </div>
                        <AnimatePresence>
                            {isHovered && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="whitespace-nowrap overflow-hidden"
                                >
                                    <span className="text-lg font-bold text-white tracking-tight">100x<span className="text-brand-red font-cursive text-2xl ml-1">Contest</span></span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Link>
                </div>

                {/* Navigation Items */}
                <div className="flex-1 py-6 flex flex-col gap-2 overflow-x-hidden">
                    {isAuthenticated && items?.map((item) => {
                        const isActive = pathname === item.href
                        const Icon = ICON_MAP[item.label] || ChevronRight
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`relative flex items-center h-12 px-4 mx-3 rounded-xl transition-all duration-200 group ${isActive
                                    ? "bg-brand-red/10 text-brand-red"
                                    : "text-slate-400 hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                <div className="min-w-[24px] flex justify-center">
                                    <Icon size={20} className={isActive ? "text-brand-red" : "group-hover:text-white transition-colors"} />
                                </div>
                                <AnimatePresence>
                                    {isHovered && (
                                        <motion.span
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            className="ml-4 font-medium whitespace-nowrap"
                                        >
                                            {item.label}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                                {isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-brand-red rounded-r-full" />
                                )}
                            </Link>
                        )
                    })}
                </div>

                {/* Bottom Actions (User / Login) */}
                <div className="p-4 border-t border-white/5 bg-[#050505]">
                    {isAuthenticated ? (
                        <div className="flex flex-col gap-2">
                            <button
                                onClick={() => router.push('/profile')}
                                className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors w-full group text-left"
                            >
                                <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-xs font-bold text-slate-300 shadow-inner group-hover:border-brand-red/50 transition-colors shrink-0">
                                    SC
                                </div>
                                <AnimatePresence>
                                    {isHovered && (
                                        <motion.div
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            className="overflow-hidden"
                                        >
                                            <p className="text-sm font-medium text-white truncate">Sparsh Codes</p>
                                            <p className="text-xs text-slate-500 truncate">sparsh@example.com</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </button>

                            <button
                                onClick={handleLogout}
                                className={`flex items-center gap-3 p-2 rounded-xl hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors w-full ${!isHovered && 'justify-center'}`}
                            >
                                <LogOut size={20} />
                                <AnimatePresence>
                                    {isHovered && (
                                        <motion.span
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            className="text-sm font-medium whitespace-nowrap"
                                        >
                                            Sign Out
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            <Link href="/signin" className={`flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-colors ${!isHovered && 'justify-center'}`}>
                                <LogIn size={20} />
                                <AnimatePresence>
                                    {isHovered && (
                                        <motion.span
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            className="text-sm font-medium whitespace-nowrap"
                                        >
                                            Sign In
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </Link>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Mobile Header (replaces Sidebar on small screens) */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#050505]/95 backdrop-blur-xl border-b border-white/5 px-4 py-4 flex items-center justify-between">
                <Link href={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-red to-red-900 flex items-center justify-center text-white">
                        <Code2 size={18} />
                    </div>
                    <span className="text-lg font-bold text-white">100x<span className="text-brand-red font-cursive">Contest</span></span>
                </Link>
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="p-2 text-slate-400 hover:text-white"
                >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                        animate={{ opacity: 1, backdropFilter: "blur(10px)" }}
                        exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                        className="fixed inset-0 z-40 bg-black/60 md:hidden pt-20 px-4"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <motion.div
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            className="bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden shadow-2xl p-2 space-y-1"
                            onClick={e => e.stopPropagation()}
                        >
                            {isAuthenticated && items ? (
                                <>
                                    {items.map((item) => {
                                        const isActive = pathname === item.href
                                        const Icon = ICON_MAP[item.label] || ChevronRight
                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                onClick={() => setMobileMenuOpen(false)}
                                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                                    ? "bg-white/10 text-white"
                                                    : "text-slate-400 hover:text-white hover:bg-white/5"
                                                    }`}
                                            >
                                                <Icon size={18} className={isActive ? "text-brand-red" : ""} />
                                                <span className="font-medium">{item.label}</span>
                                            </Link>
                                        )
                                    })}
                                    <div className="h-px bg-white/5 my-2" />
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors font-medium"
                                    >
                                        <LogOut size={18} /> Sign Out
                                    </button>
                                </>
                            ) : (
                                <div className="p-4 space-y-3">
                                    <Link href="/signin" onClick={() => setMobileMenuOpen(false)} className="block">
                                        <button className="w-full py-3 text-slate-300 font-medium border border-white/10 rounded-xl hover:bg-white/5">
                                            Sign In
                                        </button>
                                    </Link>
                                    <Link href="/signup" onClick={() => setMobileMenuOpen(false)} className="block">
                                        <button className="w-full py-3 bg-brand-red text-white font-bold rounded-xl shadow-lg shadow-brand-red/20">
                                            Sign Up
                                        </button>
                                    </Link>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
