import React from 'react';
import { motion } from 'framer-motion';
import { X, Sun, Moon, Clock, Infinity } from 'lucide-react';
import type { MonitoringSchedule } from '../types';

interface Props {
    schedule: MonitoringSchedule;
    setSchedule: (s: MonitoringSchedule) => void;
    onClose: () => void;
}

const Settings: React.FC<Props> = ({ schedule, setSchedule, onClose }) => {
    const options: { id: MonitoringSchedule, label: string, icon: any }[] = [
        { id: 'morning', label: 'Morning Only (6 AM - 12 PM)', icon: Sun },
        { id: 'afternoon', label: 'Afternoon Only (12 PM - 6 PM)', icon: Clock },
        { id: 'evening', label: 'Evening Only (6 PM - 12 AM)', icon: Moon },
        { id: 'always', label: 'Continuous Monitoring', icon: Infinity },
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-4"
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="glass-panel w-full max-w-lg p-8 relative shadow-2xl border-white/20"
            >
                <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full">
                    <X className="w-5 h-5 text-slate-400" />
                </button>

                <h3 className="text-2xl font-bold mb-2">Monitoring Preferences</h3>
                <p className="text-slate-400 mb-8 text-sm">Configure when you want the AI to analyze your behavioral patterns.</p>

                <div className="space-y-3">
                    {options.map((opt) => (
                        <button
                            key={opt.id}
                            onClick={() => setSchedule(opt.id)}
                            className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${schedule === opt.id
                                ? 'bg-primary/20 border-primary shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                                : 'bg-white/5 border-white/10 hover:bg-white/10'
                                }`}
                        >
                            <div className={`p-2 rounded-lg ${schedule === opt.id ? 'bg-primary text-white' : 'bg-slate-800 text-slate-400'}`}>
                                <opt.icon className="w-4 h-4" />
                            </div>
                            <span className={`font-medium ${schedule === opt.id ? 'text-white' : 'text-slate-400'}`}>
                                {opt.label}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="mt-8 p-4 bg-accent/10 border border-accent/20 rounded-xl">
                    <p className="text-xs text-accent leading-relaxed">
                        Note: The system will automatically resume monitoring during these scheduled windows if the app remains active in your browser.
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default Settings;
