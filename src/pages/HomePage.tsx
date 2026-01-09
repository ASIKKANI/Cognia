import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Clock, ArrowRight, Shield, Heart, Globe, TrendingUp, Bed, Music, PenTool, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { sessionService } from '../services/sessionService';
import DigitalActivity from '../components/DigitalActivity';
import { AnalyticsDashboard } from '../components/AnalyticsDashboard';

const HomePage: React.FC = () => {
    const [cogniaTime, setCogniaTime] = useState(sessionService.getFormattedTime());
    const [deviceTime, setDeviceTime] = useState(sessionService.getFormattedDeviceTime());
    const [showDigitalActivity, setShowDigitalActivity] = useState(false);
    const [showAnalytics, setShowAnalytics] = useState(false);

    React.useEffect(() => {
        sessionService.resetDaily();
        const interval = setInterval(() => {
            setCogniaTime(sessionService.getFormattedTime());
            setDeviceTime(sessionService.getFormattedDeviceTime());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[160px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/20 rounded-full blur-[160px]" />
            </div>

            <nav className="relative z-10 flex justify-between items-center px-6 py-8 max-w-7xl mx-auto">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/20 border border-primary/30 rounded-lg flex items-center justify-center">
                        <Activity className="text-primary w-6 h-6" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">Cognia</span>
                </div>
                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
                    <a href="#" className="hover:text-white transition-colors">Methodology</a>
                    <a href="#" className="hover:text-white transition-colors">Privacy</a>
                    <a href="#" className="hover:text-white transition-colors">Docs</a>
                    <div className="h-6 w-px bg-white/10 mx-2" />
                    <div className="flex items-center gap-3 bg-white/5 pl-2 pr-4 py-1.5 rounded-full border border-white/5 hover:border-white/10 transition-all group">
                        <img
                            src={authService.getUser()?.picture || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Cognia'}
                            className="w-8 h-8 rounded-full border border-primary/30 group-hover:scale-110 transition-transform"
                            alt="avatar"
                        />
                        <button
                            onClick={() => { authService.logout(); window.location.reload(); }}
                            className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </nav>

            <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
                <div className="max-w-3xl mb-20 text-center mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-6"
                    >
                        <Shield className="w-3 h-3" /> Privacy-First Mental Health Monitoring
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-black mb-8 leading-tight tracking-tight bg-gradient-to-br from-white via-white to-white/40 bg-clip-text text-transparent"
                    >
                        Holistic Well-being <br /> through AI analysis.
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-slate-400 leading-relaxed mb-10"
                    >
                        Cognia combines real-time facial emotion monitoring with passive consumption pattern analysis to provide a comprehensive look at your mental state.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {/* Live Monitoring Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        whileHover={{ y: -5 }}
                        className="group relative"
                    >
                        <Link to="/monitor">
                            <div className="glass-panel p-10 h-full border-white/5 group-hover:border-primary/50 transition-all duration-500 overflow-hidden">
                                <div className="relative z-10">
                                    <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                                        <Activity className="text-primary w-8 h-8" />
                                    </div>
                                    <h3 className="text-3xl font-bold mb-4">Live Analysis</h3>
                                    <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                                        Direct real-time monitoring of facial micro-expressions to track emotional fluctuations.
                                    </p>
                                    <div className="flex items-center gap-2 text-primary font-bold">
                                        Open Monitor <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/20 transition-colors" />
                            </div>
                        </Link>
                    </motion.div>

                    {/* Screen Time Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        whileHover={{ y: -5 }}
                        className="group relative"
                    >
                        <div className="glass-panel p-10 h-full border-white/5 group-hover:border-accent/50 transition-all duration-500 overflow-hidden">
                            <div className="relative z-10">
                                <div className="w-14 h-14 bg-accent/20 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                                    <Clock className="text-accent w-8 h-8" />
                                </div>
                                <h3 className="text-3xl font-bold mb-4">Focus Velocity</h3>
                                <p className="text-slate-400 text-lg mb-4 leading-relaxed">
                                    Total active engagement with the Cognia platform today.
                                </p>
                                <div className="space-y-4 mt-8">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Total Device Usage</p>
                                            <div className="text-3xl font-black text-white">
                                                {deviceTime}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">In Cognia</p>
                                            <div className="text-xl font-bold text-primary">
                                                {cogniaTime}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min(100, (sessionService.getDailyTotalSeconds() / Math.max(1, sessionService.getDeviceTotalSeconds())) * 100)}% ` }}
                                            className="h-full bg-primary"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-accent/20 transition-colors" />
                        </div>
                    </motion.div>

                    {/* Digital Activity Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        whileHover={{ y: -5 }}
                        className="group relative cursor-pointer"
                        onClick={() => setShowDigitalActivity(true)}
                    >
                        <div className="glass-panel p-10 h-full border-white/5 group-hover:border-accent/50 transition-all duration-500 overflow-hidden">
                            <div className="relative z-10">
                                <div className="w-14 h-14 bg-accent/20 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                                    <Globe className="text-accent w-8 h-8" />
                                </div>
                                <h3 className="text-3xl font-bold mb-4">Digital Activity</h3>
                                <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                                    Track your application usage and web browsing patterns in real-time.
                                </p>
                                <div className="flex items-center gap-2 text-accent font-bold">
                                    View Activity <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-accent/20 transition-colors" />
                        </div>
                    </motion.div>
                </div>

                {/* Second Row - Fit Tracker */}
                <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 max-w-7xl mx-auto mt-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        whileHover={{ y: -5 }}
                        className="group relative cursor-pointer"
                        onClick={() => window.open('http://localhost:5174', '_blank')}
                    >
                        <div className="glass-panel p-10 h-full border-white/5 group-hover:border-purple-500/50 transition-all duration-500 overflow-hidden">
                            <div className="relative z-10">
                                <div className="w-14 h-14 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                                    <Bed className="text-purple-500 w-8 h-8" />
                                </div>
                                <h3 className="text-3xl font-bold mb-4">Sleep & Steps Tracker</h3>
                                <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                                    Connect Google Fit to monitor your sleep patterns, step count, and overall wellness insights.
                                </p>
                                <div className="flex items-center gap-2 text-purple-500 font-bold">
                                    Open Tracker <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-purple-500/20 transition-colors" />
                        </div>
                    </motion.div>
                </div>

                {/* Third Row - Spotify and Journal */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto mt-8">
                    {/* Spotify Mood-Core Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        whileHover={{ y: -5 }}
                        className="group relative cursor-pointer"
                        onClick={() => window.open('http://localhost:3000', '_blank')}
                    >
                        <div className="glass-panel p-10 h-full border-white/5 group-hover:border-green-500/50 transition-all duration-500 overflow-hidden">
                            <div className="relative z-10">
                                <div className="w-14 h-14 bg-green-500/20 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                                    <Music className="text-green-500 w-8 h-8" />
                                </div>
                                <h3 className="text-3xl font-bold mb-4">Mood-Core</h3>
                                <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                                    Analyze your behavioral rhythm through Spotify metadata with real-time valence maps and emotional resonance scores.
                                </p>
                                <div className="flex items-center gap-2 text-green-500 font-bold">
                                    Connect Spotify <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-green-500/20 transition-colors" />
                        </div>
                    </motion.div>

                    {/* Journal Digital Sanctuary Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        whileHover={{ y: -5 }}
                        className="group relative cursor-pointer"
                        onClick={() => window.open('http://localhost:3000/journal', '_blank')}
                    >
                        <div className="glass-panel p-10 h-full border-white/5 group-hover:border-blue-500/50 transition-all duration-500 overflow-hidden">
                            <div className="relative z-10">
                                <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                                    <PenTool className="text-blue-500 w-8 h-8" />
                                </div>
                                <h3 className="text-3xl font-bold mb-4">Digital Sanctuary</h3>
                                <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                                    A private space for your consciousness. Rich text journaling, mood tracking, and AI-powered sentiment analysis.
                                </p>
                                <div className="flex items-center gap-2 text-blue-500 font-bold">
                                    Enter Sanctuary <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/20 transition-colors" />
                        </div>
                    </motion.div>

                    {/* Analytics Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 }}
                        whileHover={{ y: -5 }}
                        className="group relative cursor-pointer"
                        onClick={() => setShowAnalytics(true)}
                    >
                        <div className="glass-panel p-10 h-full border-white/5 group-hover:border-purple-400/50 transition-all duration-500 overflow-hidden">
                            <div className="relative z-10">
                                <div className="w-14 h-14 bg-purple-400/20 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                                    <BarChart3 className="text-purple-400 w-8 h-8" />
                                </div>
                                <h3 className="text-3xl font-bold mb-4">Unified Analytics</h3>
                                <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                                    Comprehensive wellness insights aggregating data from all your tracking systems with AI-powered scoring.
                                </p>
                                <div className="flex items-center gap-2 text-purple-400 font-bold">
                                    View Analytics <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-400/10 blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-purple-400/20 transition-colors" />
                        </div>
                    </motion.div>
                </div>


                <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="flex items-center gap-4 text-slate-500">
                        <TrendingUp className="w-5 h-5" />
                        <span className="text-sm font-medium">Predictive Risk Modeling</span>
                    </div>
                    <div className="flex items-center gap-4 text-slate-500">
                        <Heart className="w-5 h-5" />
                        <span className="text-sm font-medium">Emotional Baseline Tracking</span>
                    </div>
                    <div className="flex items-center gap-4 text-slate-500">
                        <Shield className="w-5 h-5" />
                        <span className="text-sm font-medium">Local-Only Processing</span>
                    </div>
                </div>
            </main>

            <AnimatePresence>
                {showDigitalActivity && <DigitalActivity onClose={() => setShowDigitalActivity(false)} />}
                {showAnalytics && <AnalyticsDashboard onClose={() => setShowAnalytics(false)} />}
            </AnimatePresence>
        </div>
    );
};

export default HomePage;
