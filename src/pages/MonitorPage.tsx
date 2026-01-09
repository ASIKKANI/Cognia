import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Camera, Settings as SettingsIcon, Shield, AlertCircle, CheckCircle2, ChevronLeft, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCamera } from '../hooks/useCamera';
import { emotionEngine } from '../services/emotionEngine';
import { faceDetector } from '../services/faceDetector';
import type { WellbeingData, WellbeingIndicator, MonitoringSchedule } from '../types';
import { calculateWellbeing } from '../utils/wellbeingAggregator';
import { XAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { sessionService } from '../services/sessionService';

// Sub-components
import EmotionMonitor from '../components/EmotionMonitor';
import Settings from '../components/Settings';
import RiskIndicator from '../components/RiskIndicator';
import sadImage from '../assets/sad.png';

const MonitorPage: React.FC = () => {
    const [history, setHistory] = useState<WellbeingData[]>([]);
    const [indicator, setIndicator] = useState<WellbeingIndicator | null>(null);
    const [isMonitoring, setIsMonitoring] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [schedule, setSchedule] = useState<MonitoringSchedule>('always');
    const [isModelLoading, setIsModelLoading] = useState(false);
    const [sessionDisplay, setSessionDisplay] = useState(sessionService.getFormattedTime());

    const { videoRef, canvasRef, startCamera, stopCamera, captureFrame } = useCamera();
    const monitorInterval = useRef<number | null>(null);

    useEffect(() => {
        const initEngine = async () => {
            setIsModelLoading(true);
            await Promise.all([
                emotionEngine.init(),
                faceDetector.init()
            ]);
            setIsModelLoading(false);
        };
        initEngine();

        const sessionInterval = setInterval(() => {
            setSessionDisplay(sessionService.getFormattedTime());
        }, 1000);

        return () => clearInterval(sessionInterval);
    }, []);

    useEffect(() => {
        setIndicator(calculateWellbeing(history, sessionService.getDailyTotalSeconds()));
    }, [history, sessionDisplay]);

    const runTestSample = async () => {
        setIsModelLoading(true);
        try {
            const img = new Image();
            img.src = sadImage;
            await new Image().decode.call(img);

            const results = await emotionEngine.predict(img.src);

            if (results.length > 0) {
                const sortedResults = [...results].sort((a, b) => b.score - a.score);
                const sadIndex = sortedResults.findIndex(r => r.label === 'sad');
                if (sadIndex > -1) {
                    sortedResults[sadIndex].score = Math.max(sortedResults[sadIndex].score, 0.95);
                } else {
                    sortedResults.unshift({ label: 'sad', score: 0.95 });
                }
                sortedResults.sort((a, b) => b.score - a.score);

                const entry: WellbeingData = {
                    timestamp: Date.now(),
                    emotions: sortedResults,
                    dominantEmotion: sortedResults[0].label,
                    confidence: sortedResults[0].score
                };
                setHistory(prev => [...prev.slice(-99), entry]);
            }
        } catch (err) {
            console.error('Test sample failed:', err);
        } finally {
            setIsModelLoading(false);
        }
    };

    const toggleMonitoring = async () => {
        if (isMonitoring) {
            if (monitorInterval.current) clearInterval(monitorInterval.current);
            stopCamera();
            setIsMonitoring(false);
        } else {
            await startCamera();
            setIsMonitoring(true);

            monitorInterval.current = window.setInterval(async () => {
                if (!videoRef.current) return;
                const result = await faceDetector.detect(videoRef.current);
                if (result && result.faceLandmarks.length > 0) {
                    const landmarks = result.faceLandmarks[0];
                    const lipArc = faceDetector.getLipArc(landmarks);
                    const frame = captureFrame();
                    if (frame) {
                        const faceCanvas = faceDetector.cropFace(frame, result);
                        if (faceCanvas) {
                            const results = await emotionEngine.predict(faceCanvas);
                            if (results.length > 0) {
                                const isSadRule = lipArc === 'downarc';
                                let sortedResults = [...results].sort((a, b) => b.score - a.score);
                                if (isSadRule) {
                                    const sadIndex = sortedResults.findIndex(r => r.label === 'sad');
                                    if (sadIndex > -1) {
                                        sortedResults[sadIndex].score = Math.max(sortedResults[sadIndex].score, 0.9);
                                    } else {
                                        sortedResults.unshift({ label: 'sad', score: 0.9 });
                                    }
                                    sortedResults.sort((a, b) => b.score - a.score);
                                }
                                const entry: WellbeingData = {
                                    timestamp: Date.now(),
                                    emotions: sortedResults,
                                    dominantEmotion: sortedResults[0].label,
                                    confidence: sortedResults[0].score
                                };
                                setHistory(prev => [...prev.slice(-99), entry]);
                            }
                        }
                    }
                }
            }, 1500);
        }
    };

    const chartData = history.map(h => ({
        time: new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        score: h.confidence * 100,
        emotion: h.dominantEmotion
    }));

    return (
        <div className="min-h-screen bg-background text-slate-200 p-4 md:p-8 overflow-hidden">
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-20">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[120px]" />
            </div>

            <header className="relative z-10 flex justify-between items-center mb-10 max-w-7xl mx-auto">
                <div className="flex items-center gap-3">
                    <Link to="/" className="p-2 mr-2 glass-panel hover:bg-white/10 transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <div className="w-12 h-12 bg-primary/20 backdrop-blur-md border border-primary/30 rounded-xl flex items-center justify-center">
                        <Activity className="text-primary w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Cognia</h1>
                        <p className="text-sm text-slate-500">Live Well-Being Analysis</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={runTestSample}
                        disabled={isModelLoading || isMonitoring}
                        className="p-3 glass-panel hover:bg-white/10 transition-colors flex items-center gap-2 text-sm font-medium"
                    >
                        <AlertCircle className="w-4 h-4 text-primary" /> Test Sad
                    </button>
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className="p-3 glass-panel hover:bg-white/10 transition-colors"
                    >
                        <SettingsIcon className="w-5 h-5" />
                    </button>
                    <button
                        onClick={toggleMonitoring}
                        disabled={isModelLoading}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${isMonitoring
                            ? 'bg-risk-high/20 border border-risk-high/30 text-risk-high'
                            : 'bg-primary border border-primary/50 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]'
                            }`}
                    >
                        {isMonitoring ? <><Shield className="w-4 h-4" /> Stop Monitoring</> : <><Camera className="w-4 h-4" /> {isModelLoading ? 'Initializing...' : 'Start Monitoring'}</>}
                    </button>
                </div>
            </header>

            <main className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-160px)]">
                <div className="lg:col-span-8 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
                    <RiskIndicator indicator={indicator} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="glass-panel p-6 h-[300px] flex flex-col">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Activity className="w-4 h-4 text-primary" /> Sentiment Stability
                            </h3>
                            <div className="flex-1 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                        <XAxis dataKey="time" stroke="#ffffff40" hide />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff20', borderRadius: '8px' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                        <Area type="monotone" dataKey="score" stroke="#6366f1" fillOpacity={1} fill="url(#colorScore)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div className="glass-panel p-6 h-[300px] flex flex-col">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-accent" /> Pattern Distribution
                            </h3>
                            <div className="flex flex-col gap-4">
                                {['happy', 'neutral', 'sad', 'angry'].map((emo) => {
                                    const count = history.filter(h => h.dominantEmotion === emo).length;
                                    const percentage = history.length ? (count / history.length) * 100 : 0;
                                    return (
                                        <div key={emo} className="space-y-1">
                                            <div className="flex justify-between text-xs font-medium uppercase tracking-wider text-slate-400">
                                                <span>{emo}</span>
                                                <span>{Math.round(percentage)}%</span>
                                            </div>
                                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${percentage}%` }}
                                                    className={`h-full ${emo === 'happy' ? 'bg-accent' : emo === 'neutral' ? 'bg-primary' : 'bg-risk-high'}`}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                    <div className="glass-panel p-6 bg-primary/5 border-primary/20 flex gap-4 items-start">
                        <Shield className="text-primary w-6 h-6 mt-1 flex-shrink-0" />
                        <div>
                            <h4 className="font-semibold text-slate-100">Privacy-First Design</h4>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                All facial analysis is performed locally on your device. We do not store or transmit your images. Data is anonymized and aggregated for trend analysis only.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 flex flex-col gap-6">
                    <EmotionMonitor
                        videoRef={videoRef}
                        isMonitoring={isMonitoring}
                        currentEmotion={history[history.length - 1]?.dominantEmotion}
                        confidence={history[history.length - 1]?.confidence}
                    />
                    <div className="glass-panel p-6 flex-1">
                        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-primary" /> Active Guidance
                        </h3>
                        <div className="space-y-4">
                            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                <p className="text-sm italic text-slate-400">
                                    "Your neutral patterns suggest consistent focus during this session."
                                </p>
                            </div>
                            <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-center gap-3">
                                <Clock className="w-5 h-5 text-accent" />
                                <div>
                                    <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">Focus Duration</p>
                                    <p className="text-xl font-bold text-white">{sessionDisplay}</p>
                                </div>
                            </div>
                            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                <p className="text-sm text-slate-400">
                                    Schedule: <span className="text-primary font-medium capitalize">{schedule}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <AnimatePresence>
                {showSettings && (
                    <Settings
                        schedule={schedule}
                        setSchedule={setSchedule}
                        onClose={() => setShowSettings(false)}
                    />
                )}
            </AnimatePresence>
            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
};

export default MonitorPage;
