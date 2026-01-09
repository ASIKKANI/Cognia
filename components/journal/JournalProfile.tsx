import React, { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "./ui/Button"
import { ArrowLeft, Activity, ShieldCheck, Zap, Brain, RefreshCw, AlertTriangle, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface JournalProfileProps {
    entries: any[];
    onBack: () => void;
}

export function JournalProfile({ entries, onBack }: JournalProfileProps) {
    const [loading, setLoading] = useState(true)
    const [analysis, setAnalysis] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)

    const fetchAnalysis = async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await fetch('/api/analyze/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ entries })
            })
            if (!res.ok) throw new Error("Failed to fetch profile analysis")
            const data = await res.json()
            setAnalysis(data)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (entries.length > 0) {
            fetchAnalysis()
        } else {
            setLoading(false)
        }
    }, [])

    const moodHistory = useMemo(() => {
        return [...entries].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    }, [entries])

    const getMoodColor = (mood: string) => {
        switch (mood?.toLowerCase()) {
            case "joy": return "#FFD700";
            case "calm": return "#00FA9A";
            case "focus": return "#AFEEEE";
            case "intense": return "#FF4500";
            case "melancholic": return "#4169E1";
            case "nature": return "#32CD32";
            default: return "#808080";
        }
    }

    if (entries.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
                <Brain className="w-16 h-16 opacity-20 mb-4" />
                <h2 className="text-2xl font-serif">Insufficient Data</h2>
                <p className="text-muted-foreground max-w-sm mt-2">Write a few more entries to generate your Emotional Profile.</p>
                <Button variant="ghost" className="mt-6" onClick={onBack}>Go Back</Button>
            </div>
        )
    }

    return (
        <main className="min-h-screen p-6 md:p-12 max-w-6xl mx-auto space-y-8 bg-[#050505] text-white">
            <header className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-6">
                    <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full w-12 h-12 bg-white/5 hover:bg-white/10">
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-serif font-medium tracking-tight">Emotional Profile</h1>
                        <p className="text-white/40 text-sm font-sans uppercase tracking-widest mt-1">Behavioral Audit Log</p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={fetchAnalysis}
                    disabled={loading}
                    className="rounded-full gap-2 bg-white/5 hover:bg-white/10 border border-white/10"
                >
                    <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                    Refresh Audit
                </Button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Resilience Score */}
                <section className="glass-card p-8 flex flex-col items-center text-center relative overflow-hidden bg-white/5 border border-white/10 rounded-[2.5rem]">
                    <div className="absolute top-0 right-0 p-6 opacity-20">
                        <ShieldCheck size={40} />
                    </div>
                    <h3 className="text-white/40 text-[10px] uppercase font-bold tracking-[0.3em] mb-6">Resilience Score</h3>

                    <div className="relative w-40 h-40 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                            <motion.circle
                                cx="80" cy="80" r="70" fill="none"
                                stroke={loading ? "rgba(255,255,255,0.1)" : "#1DB954"}
                                strokeWidth="8"
                                strokeDasharray="440"
                                initial={{ strokeDashoffset: 440 }}
                                animate={{ strokeDashoffset: 440 - (440 * (analysis?.resilienceScore || 50)) / 100 }}
                                transition={{ duration: 2, ease: "circOut" }}
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-5xl font-serif font-bold">{loading ? "..." : analysis?.resilienceScore}</span>
                            <span className="text-[10px] opacity-40 font-bold uppercase tracking-widest">Base Pts</span>
                        </div>
                    </div>

                    <div className="mt-8 py-2 px-6 rounded-full bg-white/5 border border-white/10 text-xs font-bold tracking-widest uppercase text-[#1DB954]">
                        {loading ? "Analyzing..." : (analysis?.resilienceScore > 80 ? "High Harmonic" : "Standard Variance")}
                    </div>
                </section>

                {/* Cognitive Signature */}
                <section className="col-span-1 md:col-span-2 glass-card p-10 bg-white/5 border border-white/10 rounded-[2.5rem] flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-6">
                        <Brain className="w-5 h-5 text-[#1DB954]" />
                        <h3 className="text-white/40 text-[10px] uppercase font-bold tracking-[0.3em]">Cognitive Signature</h3>
                    </div>

                    {loading ? (
                        <div className="space-y-4">
                            <div className="h-12 w-3/4 bg-white/5 animate-pulse rounded-xl" />
                            <div className="h-6 w-1/2 bg-white/5 animate-pulse rounded-xl" />
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <h2 className="text-4xl md:text-5xl font-serif italic text-white/90 leading-tight">
                                "{analysis?.signature || "Awaiting Data"}"
                            </h2>
                            <p className="text-xl text-white/60 font-serif leading-relaxed line-clamp-2">
                                {analysis?.summary || "Your journal patterns are being synthesized for behavioral insights."}
                            </p>
                        </div>
                    )}
                </section>

                {/* Mood Pulse Audit */}
                <section className="col-span-1 md:col-span-3 glass-card p-8 bg-white/5 border border-white/10 rounded-[2.5rem]">
                    <div className="flex justify-between items-center mb-10">
                        <div className="flex items-center gap-3">
                            <TrendingUp className="w-5 h-5 text-blue-400" />
                            <h3 className="text-white/40 text-[10px] uppercase font-bold tracking-[0.3em]">Emotional Resonance Archive</h3>
                        </div>
                        <div className="text-[10px] opacity-40 uppercase font-bold tracking-widest">Temporal Variance</div>
                    </div>

                    <div className="h-48 flex items-end gap-3 px-4">
                        {moodHistory.map((entry, i) => (
                            <motion.div
                                key={`mood-${entry.id}-${i}`}
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: '100%', opacity: 1 }}
                                transition={{ delay: i * 0.05 }}
                                className="flex-1 group relative flex flex-col justify-end"
                            >
                                <div
                                    className="w-full rounded-t-lg transition-all duration-300 hover:scale-x-110 cursor-help"
                                    style={{
                                        height: `${30 + (i % 7) * 10}%`,
                                        backgroundColor: getMoodColor(entry.mood),
                                        boxShadow: `0 0 20px ${getMoodColor(entry.mood)}44`,
                                        opacity: 0.8
                                    }}
                                />
                                <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 backdrop-blur-md p-2 rounded-lg text-[10px] whitespace-nowrap z-50 pointer-events-none">
                                    {new Date(entry.createdAt).toLocaleDateString()} — {entry.mood || "Stoic"}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Anomalies Audit */}
                <section className="col-span-1 md:col-span-2 glass-card p-10 bg-white/5 border border-white/10 rounded-[2.5rem]">
                    <div className="flex items-center gap-3 mb-8">
                        <AlertTriangle className="w-5 h-5 text-orange-400" />
                        <h3 className="text-white/40 text-[10px] uppercase font-bold tracking-[0.3em]">Anomaly Audit Log</h3>
                    </div>

                    <div className="space-y-4">
                        {loading ? (
                            [1, 2].map(i => <div key={i} className="h-16 bg-white/3 animate-pulse rounded-2xl" />)
                        ) : (
                            analysis?.anomalies?.length > 0 ? (
                                analysis.anomalies.map((anomaly: string, i: number) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="p-5 rounded-2xl bg-white/3 border border-white/5 flex items-start gap-4"
                                    >
                                        <div className="mt-1 w-2 h-2 rounded-full bg-orange-400 shrink-0" />
                                        <p className="text-white/80 font-serif leading-relaxed">{anomaly}</p>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="p-8 text-center bg-white/3 rounded-2xl opacity-40 italic font-serif">
                                    No anomalies detected in the current resonance window.
                                </div>
                            )
                        )}
                    </div>
                </section>

                {/* Behavioral Recommendation */}
                <section className="glass-card p-10 bg-white/5 border border-white/10 rounded-[2.5rem] flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-8">
                            <Zap className="w-5 h-5 text-yellow-400" />
                            <h3 className="text-white/40 text-[10px] uppercase font-bold tracking-[0.3em]">Directive</h3>
                        </div>

                        <p className="text-white/70 italic font-serif leading-relaxed text-lg">
                            {loading ? "Decrypting behavioral sequence..." : analysis?.recommendation}
                        </p>
                    </div>

                    <div className="mt-10 pt-6 border-t border-white/5">
                        <p className="text-[10px] font-sans font-bold text-white/30 tracking-widest uppercase">Audit Integrity: HIGH</p>
                    </div>
                </section>
            </div>
        </main>
    )
}
