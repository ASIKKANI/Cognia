import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Activity, Shield, ArrowRight, TrendingUp, Heart, Clock } from 'lucide-react';
import { authService } from '../services/authService';
import { sessionService } from '../services/sessionService';

const HomePage: React.FC = () => {
    const [cogniaTime, setCogniaTime] = React.useState(sessionService.getFormattedTime());
    const [deviceTime, setDeviceTime] = React.useState(sessionService.getFormattedDeviceTime());

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
                                            animate={{ width: `${Math.min(100, (sessionService.getDailyTotalSeconds() / Math.max(1, sessionService.getDeviceTotalSeconds())) * 100)}%` }}
                                            className="h-full bg-primary"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-accent/20 transition-colors" />
                        </div>
                    </motion.div>

                    {/* Future Capacity / System Info moved back to 3rd col or placeholder */}
                    <div className="glass-panel p-10 h-full border-white/5 border-dashed bg-transparent flex flex-col items-center justify-center text-center opacity-40 group hover:opacity-100 transition-opacity">
                        <Shield className="w-12 h-12 text-slate-500 mb-6 group-hover:text-primary transition-colors" />
                        <h4 className="text-xl font-bold text-slate-400">Expansion Slot</h4>
                        <p className="text-sm text-slate-500 mt-2">Ready for behavioral modeling <br /> integration v3.0</p>
                    </div>
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
        </div>
    );
};

export default HomePage;
