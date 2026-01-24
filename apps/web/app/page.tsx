"use client";

import React from 'react';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { ArrowRight, Zap, Trophy, Globe, Shield, Terminal, ArrowUpRight, Target } from 'lucide-react';
import Navbar from './components/layout/navbar';
import { useAuthStore } from './store';
import { useEffect, useState } from 'react';


const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 80,
      damping: 20
    }
  }
};

export default function Home() {
  const { isAuthenticated } = useAuthStore((s) => s);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-black text-slate-100 font-sans selection:bg-brand-red/30 overflow-x-hidden">
      <Navbar />



      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] rounded-full bg-brand-red/10 blur-[150px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[800px] h-[800px] rounded-full bg-brand-red/5 blur-[150px]" />
      </div>

      <main className={`relative z-10 container mx-auto px-4 pt-32 pb-20`}>

        <div className="flex flex-col md:flex-row items-end justify-between mb-32 gap-12 min-h-[60vh]">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-4xl"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 border border-white/10 bg-white/5 backdrop-blur-md text-slate-300 text-sm font-light uppercase tracking-[0.2em] rounded-full"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-brand-red animate-pulse" />
              System v2.0 Live
            </motion.div>

            <h1 className="text-7xl md:text-9xl font-sans font-bold leading-[0.9] text-white tracking-tighter mb-8 uppercase">
              Code <br />
              <span className="font-cursive text-brand-red lowercase text-8xl md:text-[10rem] leading-[0.5] block py-4 pl-4" style={{ fontFamily: 'var(--font-great-vibes)' }}>Battle</span>
              Arena
            </h1>

            <p className="font-clean text-2xl md:text-3xl text-slate-300 max-w-xl border-l-2 border-brand-red pl-8 italic leading-relaxed">
              Step into the <span className="text-white font-normal not-italic">ultimate proving ground</span>. Compete in high-stakes algorithmic duels.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="flex flex-col gap-8 items-start md:items-end"
          >
            <div className="glass-card p-6 rounded-2xl">
              <div className="flex -space-x-4 mb-3 justify-end">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-black bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-xs font-bold text-white relative z-10 shadow-lg">
                    U{i}
                  </div>
                ))}
              </div>
              <div className="text-right">
                <span className="block text-3xl font-sans font-bold text-white">10K+</span>
                <span className="font-clean text-lg text-slate-400 italic">Active Gladiators</span>
              </div>
            </div>

            <Link href={isAuthenticated ? "/dashboard" : "/signin"}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-brand-red text-white px-10 py-5 rounded-full font-sans font-bold text-lg transition-all flex items-center gap-3 group shadow-[0_0_40px_-10px_rgba(220,38,38,0.5)] border border-red-400/20"
              >
                ENTER ARENA <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
          </motion.div>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-12 grid-rows-auto gap-6"
        >

          <motion.div
            variants={itemVariants}
            className="md:col-span-5 md:row-span-2 glass-card rounded-[2.5rem] p-10 flex flex-col justify-between relative overflow-hidden group min-h-[500px]"
          >
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-red/5 rounded-full blur-[100px] group-hover:bg-brand-red/10 transition-all duration-700" />

            <div className="flex justify-between items-start relative z-10">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <Trophy className="w-8 h-8 text-brand-red" />
              </div>
              <p className="text-6xl font-cursive text-white/10 group-hover:text-white/20 transition-colors">01</p>
            </div>

            <div className="relative z-10 mt-auto">
              <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-xs text-slate-400 font-mono tracking-wider uppercase">
                <Target size={14} className="text-brand-red" /> Global Rankings
              </div>
              <h3 className="text-5xl font-sans font-bold text-white mb-6 leading-[0.9]">Dominate <br />The <span className="font-cursive text-brand-red font-thin">Ladder</span></h3>
              <p className="font-clean text-xl text-slate-400 leading-relaxed max-w-sm">
                Rise through the ranks. Earn exclusive badges. Prove your superiority in real-time combat against the world's best.
              </p>
            </div>
          </motion.div>

          {/* Weekly Championship */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -5 }}
            className="md:col-span-7 bg-gradient-to-br from-brand-red to-red-900 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center justify-between relative overflow-hidden group shadow-[0_20px_40px_-15px_rgba(220,38,38,0.3)] min-h-[240px]"
          >
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
            <div className="relative z-10 max-w-md">
              <div className="flex items-center gap-2 mb-4">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                </span>
                <span className="text-xs font-bold text-white uppercase tracking-widest bg-black/20 px-2 py-1 rounded">Live Event</span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-2 font-sans">Weekly Championship</h3>
              <p className="text-white/90 font-clean text-xl italic">Prize pool: <span className="not-italic font-bold bg-white/20 px-1 rounded">50,000 XP</span></p>
            </div>
            <button className="relative z-10 mt-6 md:mt-0 w-16 h-16 bg-white text-brand-red rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-xl">
              <ArrowUpRight className="w-8 h-8" />
            </button>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="md:col-span-4 glass-card rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center group hover:border-brand-red/30 transition-colors relative"
          >
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10 group-hover:border-brand-red/30 transition-all duration-500 relative z-10">
              <Globe className="w-10 h-10 text-slate-400 group-hover:text-brand-red transition-colors" strokeWidth={1.5} />
            </div>
            <h4 className="font-bold text-white text-xl mb-1 font-sans">Global Network</h4>
            <p className="font-clean text-lg text-slate-400 italic">Servers in 5 Regions</p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="md:col-span-3 glass-card rounded-[2.5rem] p-8 flex flex-col justify-between group hover:border-brand-red/30 transition-colors relative"
          >
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-brand-red/5 rounded-full blur-[50px] group-hover:bg-brand-red/10 transition-all" />
            <div className="flex justify-between items-start relative z-10">
              <Shield className="w-8 h-8 text-slate-500 group-hover:text-brand-red transition-colors" />
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            </div>
            <div className="relative z-10">
              <div className="text-4xl font-bold text-white mb-1 group-hover:text-brand-red transition-colors font-sans">99.9%</div>
              <div className="text-xs text-slate-500 uppercase tracking-widest font-mono">Uptime</div>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="md:col-span-12 glass-card rounded-[2.5rem] p-8 md:p-12 flex flex-col md:flex-row items-center gap-12 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-full h-full bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

            <div className="flex-1 relative z-10">
              <div className="inline-flex items-center gap-2 text-brand-red mb-6 bg-brand-red/5 px-3 py-1 rounded-full border border-brand-red/10">
                <Terminal size={16} />
                <span className="font-mono text-xs uppercase tracking-widest">Developer API</span>
              </div>
              <h3 className="text-4xl md:text-5xl font-sans font-bold text-white mb-6">Built for <span className="font-clean italic text-brand-red font-light text-6xl">Builders</span></h3>
              <p className="font-clean text-2xl text-slate-400 leading-relaxed max-w-xl">
                Seamlessly integrate contest data into your ecosystem. Webhooks, raw socket streams, and comprehensive documentation.
              </p>
              <button className="mt-8 text-white font-medium hover:text-brand-red flex items-center gap-2 transition-colors font-sans">
                Read Documentation <ArrowRight size={16} />
              </button>
            </div>

            <div className="flex-1 w-full max-w-xl relative group z-10">
              <div className="absolute -inset-1 bg-gradient-to-r from-brand-red to-red-900 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative bg-[#050505] rounded-xl overflow-hidden border border-white/10 shadow-2xl">
                <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/5">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                    <div className="w-3 h-3 rounded-full bg-green-500/50" />
                  </div>
                  <span className="text-xs text-slate-600 font-mono">contest_init.ts</span>
                </div>
                <div className="p-6 font-mono text-sm leading-relaxed overflow-x-auto">
                  <div className="text-slate-300">
                    <span className="text-purple-400">import</span> {'{'} Battle {'}'} <span className="text-purple-400">from</span> <span className="text-green-400">'@contest/core'</span>;
                    <br /><br />
                    <span className="text-slate-500">// Initialize arena</span>
                    <br />
                    <span className="text-purple-400">const</span> arena = <span className="text-blue-400">new</span> Battle({'{'}
                    <br />
                    &nbsp;&nbsp;mode: <span className="text-green-400">'SUDDEN_DEATH'</span>,
                    <br />
                    &nbsp;&nbsp;players: <span className="text-brand-red font-bold">2048</span>,
                    <br />
                    &nbsp;&nbsp;region: <span className="text-green-400">'us-east-1'</span>
                    <br />
                    {'}'});
                    <br /><br />
                    <span className="text-brand-red">await</span> arena.start();
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

        </motion.div>
      </main>
    </div>
  );
}