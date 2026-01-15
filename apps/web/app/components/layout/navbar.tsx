"use client"

import Link from "next/link"
import { useAuthStore } from "../../store"
import { NAV_ITEMS } from "../../config/navigation"
import { useRouter, usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { Menu, X, LogOut, Code2, User, Settings, ChevronDown, UserPlus, LogIn, Monitor } from "lucide-react"

export default function Navbar() {
    const { isAuthenticated, role, logout } = useAuthStore((s) => s)
    const router = useRouter()
    const pathname = usePathname()
    const [isScrolled, setIsScrolled] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [profileMenuOpen, setProfileMenuOpen] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const items = (isAuthenticated && role) ? NAV_ITEMS[role as keyof typeof NAV_ITEMS] : []

    const handleLogout = () => {
        logout()
        router.push("/signin")
    }

    return (
        <>
            <motion.nav
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className={`fixed top-4 left-0 right-0 z-50 flex justify-center px-4 transition-all duration-300`}
            >
                <div
                    className={`
                        w-full max-w-5xl 
                        ${isScrolled ? 'bg-[#050505]/80 backdrop-blur-2xl border-white/5 shadow-2xl shadow-black/50' : 'bg-[#050505]/60 backdrop-blur-xl border-white/5'} 
                        border rounded-2xl px-6 py-3 transition-all duration-500
                    `}
                >
                    <div className="flex items-center justify-between">
                        {/* Logo Area */}
                        <Link href={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-3 group">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-red to-red-900 shadow-lg shadow-brand-red/20 flex items-center justify-center text-white group-hover:scale-105 transition-transform duration-300 border border-white/10">
                                <Code2 size={18} strokeWidth={2.5} />
                            </div>
                            <div className="hidden sm:block">
                                <span className="text-lg font-bold text-white tracking-tight">100x<span className="text-brand-red">Contest</span></span>
                            </div>
                        </Link>

                        {/* Desktop Navigation */}
                        {isAuthenticated && items ? (
                            <div className="hidden md:flex items-center gap-8">
                                {items.map((item) => {
                                    const isActive = pathname === item.href
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className="relative group py-2"
                                        >
                                            <span className={`text-sm font-medium transition-colors ${isActive ? "text-white" : "text-slate-400 group-hover:text-white"}`}>
                                                {item.label}
                                            </span>
                                            {isActive && (
                                                <motion.div
                                                    layoutId="nav-dot"
                                                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand-red shadow-[0_0_8px_2px_rgba(220,38,38,0.5)]"
                                                />
                                            )}
                                        </Link>
                                    )
                                })}
                            </div>
                        ) : null}

                        {/* Right Side Actions */}
                        <div className="flex items-center gap-4">
                            {isAuthenticated ? (
                                <div className="relative">
                                    <button
                                        onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                                        className="flex items-center gap-3 pl-1 pr-1 py-1 rounded-full hover:bg-white/5 transition-colors group"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-xs font-bold text-slate-300 shadow-inner group-hover:border-brand-red/50 transition-colors">
                                            SC
                                        </div>
                                        <ChevronDown size={14} className={`text-slate-500 transition-transform duration-300 ${profileMenuOpen ? "rotate-180" : ""}`} />
                                    </button>

                                    <AnimatePresence>
                                        {profileMenuOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95, y: 10, filter: "blur(10px)" }}
                                                animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                                                exit={{ opacity: 0, scale: 0.95, y: 10, filter: "blur(10px)" }}
                                                className="absolute right-0 top-full mt-4 w-60 bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden ring-1 ring-white/5"
                                            >
                                                <div className="p-4 border-b border-white/5 bg-white/[0.02]">
                                                    <p className="text-sm font-medium text-white">Sparsh Codes</p>
                                                    <p className="text-xs text-slate-500 truncate">sparsh@example.com</p>
                                                </div>
                                                <div className="p-2 space-y-1">
                                                    <Link href="/profile" className="flex items-center gap-3 px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
                                                        <User size={16} /> Profile
                                                    </Link>
                                                    <Link href="/settings" className="flex items-center gap-3 px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
                                                        <Settings size={16} /> Settings
                                                    </Link>
                                                </div>
                                                <div className="p-2 border-t border-white/5">
                                                    <button
                                                        onClick={handleLogout}
                                                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors"
                                                    >
                                                        <LogOut size={16} /> Logout
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <div className="hidden md:flex items-center gap-4">
                                    <Link href="/signin">
                                        <button className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
                                            Sign In
                                        </button>
                                    </Link>
                                    <Link href="/signup">
                                        <button className="px-5 py-2.5 bg-white text-black hover:bg-slate-200 text-sm font-bold rounded-xl shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] transition-all transform hover:-translate-y-0.5">
                                            Get Started
                                        </button>
                                    </Link>
                                </div>
                            )}

                            {/* Mobile Toggle */}
                            <div className="md:hidden">
                                <button
                                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                    className="p-2 text-slate-400 hover:text-white transition-colors"
                                >
                                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                        animate={{ opacity: 1, backdropFilter: "blur(10px)" }}
                        exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                        className="fixed inset-0 z-40 bg-black/60 md:hidden pt-28 px-4"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <motion.div
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            className="bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-2 space-y-1">
                                {isAuthenticated && items ? (
                                    <>
                                        {items.map((item) => {
                                            const isActive = pathname === item.href
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
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
