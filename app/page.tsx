'use client';

import { motion } from 'framer-motion';
import { Activity, Music, Shield, PenTool, Sparkles, ArrowRight } from 'lucide-react';
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from 'next/link';

export default function Home() {
    const { data: session } = useSession();
    const router = useRouter();

    return (
        <main className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-8 relative overflow-hidden">
            {/* Ambient Background */}
            <div className="fixed inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="relative z-10 text-center max-w-5xl w-full"
            >
                <div className="flex items-center justify-center gap-4 mb-8">
                    <Activity size={48} className="text-[#1DB954]" />
                    <h1 className="text-6xl font-black tracking-tighter">COGNIA</h1>
                </div>

                <p className="text-xl text-zinc-400 mb-16 max-w-2xl mx-auto leading-relaxed">
                    A dual-hemisphere approach to mindfulness.
                    <br />
                    Select your portal to begin.
                </p>

                <div className="grid md:grid-cols-2 gap-8 w-full">
                    {/* Spotify Portal */}
                    <motion.div
                        whileHover={{ y: -8 }}
                        className="glass-card p-10 text-left border border-zinc-800/50 hover:border-green-500/30 transition-all duration-500 group relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Music size={120} />
                        </div>

                        <Music className="text-[#1DB954] mb-6" size={32} />
                        <h2 className="text-3xl font-bold mb-4">Mood-Core</h2>
                        <p className="text-zinc-400 mb-8 leading-relaxed">
                            Analyze your behavioral rhythm through Spotify metadata. Real-time valence maps and emotional resonance scores.
                        </p>

                        {session ? (
                            <Link href="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 bg-[#1DB954] text-black font-bold rounded-full hover:bg-[#1ed760] transition-colors">
                                Dashboard <ArrowRight size={18} />
                            </Link>
                        ) : (
                            <button
                                onClick={() => signIn('spotify')}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-[#1DB954] text-black font-bold rounded-full hover:bg-[#1ed760] transition-colors"
                            >
                                Connect Spotify <ArrowRight size={18} />
                            </button>
                        )}

                        <div className="mt-8 flex gap-4 opacity-40">
                            <div className="flex items-center gap-1 text-xs uppercase tracking-widest font-bold">
                                <Shield size={12} /> Privacy First
                            </div>
                            <div className="flex items-center gap-1 text-xs uppercase tracking-widest font-bold">
                                <Sparkles size={12} /> AI Analyzed
                            </div>
                        </div>
                    </motion.div>

                    {/* Journal Portal */}
                    <motion.div
                        whileHover={{ y: -8 }}
                        className="glass-card p-10 text-left border border-zinc-800/50 hover:border-blue-500/30 transition-all duration-500 group relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <PenTool size={120} />
                        </div>

                        <PenTool className="text-blue-400 mb-6" size={32} />
                        <h2 className="text-3xl font-bold mb-4">Digital Sanctuary</h2>
                        <p className="text-zinc-400 mb-8 leading-relaxed">
                            A private space for your consciousness. Rich text journaling, mood tracking, and cross-platform syncing.
                        </p>

                        <Link href="/journal" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white font-bold rounded-full hover:bg-blue-400 transition-colors">
                            Enter Sanctuary <ArrowRight size={18} />
                        </Link>

                        <div className="mt-8 flex gap-4 opacity-40">
                            <div className="flex items-center gap-1 text-xs uppercase tracking-widest font-bold">
                                <Shield size={12} /> Local-Only
                            </div>
                            <div className="flex items-center gap-1 text-xs uppercase tracking-widest font-bold">
                                <Sparkles size={12} /> Rich Media
                            </div>
                        </div>
                    </motion.div>
                </div>

                <div className="mt-20 opacity-20 text-[10px] tracking-[0.5em] uppercase font-bold text-zinc-500">
                    Integration v3.1 • Neural Sync • Cognia Systems
                </div>
            </motion.div>
        </main>
    );
}
