import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Emotion } from '../types';

interface Props {
    videoRef: React.RefObject<HTMLVideoElement | null>;
    isMonitoring: boolean;
    currentEmotion?: Emotion;
    confidence?: number;
}

const EmotionMonitor: React.FC<Props> = ({ videoRef, isMonitoring, currentEmotion, confidence }) => {
    return (
        <div className="glass-panel overflow-hidden relative group aspect-video lg:aspect-square flex flex-col">
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isMonitoring ? 'bg-red-500 animate-pulse' : 'bg-slate-500'}`} />
                <span className="text-[10px] uppercase tracking-widest font-bold text-white/70">
                    {isMonitoring ? 'Live Analysis' : 'Camera Standby'}
                </span>
            </div>

            <div className="flex-1 bg-slate-900 relative">
                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className={`w-full h-full object-cover transition-opacity duration-700 ${isMonitoring ? 'opacity-100' : 'opacity-20'}`}
                />

                {/* Scanning Animation */}
                {isMonitoring && (
                    <motion.div
                        initial={{ top: 0 }}
                        animate={{ top: '100%' }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="absolute left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent z-10 shadow-[0_0_15px_rgba(99,102,241,0.8)]"
                    />
                )}

                <AnimatePresence>
                    {isMonitoring && currentEmotion && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="absolute bottom-4 left-4 right-4 p-4 glass-panel bg-black/40 backdrop-blur-md border border-white/20 z-20"
                        >
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-[10px] uppercase text-slate-400 font-bold mb-1">Detected Pattern</p>
                                    <h4 className="text-xl font-bold capitalize text-white">{currentEmotion}</h4>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] uppercase text-slate-400 font-bold mb-1">Confidence</p>
                                    <p className="text-sm font-mono text-primary">{Math.round((confidence || 0) * 100)}%</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {!isMonitoring && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <p className="text-slate-500 text-sm font-medium">Monitoring Inactive</p>
                </div>
            )}
        </div>
    );
};

export default EmotionMonitor;
