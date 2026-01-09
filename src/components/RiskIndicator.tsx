import React from 'react';
import { motion } from 'framer-motion';
import type { WellbeingIndicator } from '../types';
import { getStatusColor } from '../utils/wellbeingAggregator';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Props {
    indicator: WellbeingIndicator | null;
}

const RiskIndicator: React.FC<Props> = ({ indicator }) => {
    if (!indicator) return null;

    const getTrendIcon = () => {
        switch (indicator.trend) {
            case 'improving': return <TrendingUp className="w-5 h-5 text-accent" />;
            case 'declining': return <TrendingDown className="w-5 h-5 text-risk-high" />;
            default: return <Minus className="w-5 h-5 text-slate-400" />;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel p-8 bg-gradient-to-br from-white/5 to-transparent relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 p-8 flex flex-col items-end">
                <div className="text-[12px] uppercase tracking-[0.2em] font-bold text-slate-500 mb-2">Stability Score</div>
                <div className={`text-6xl font-black ${getStatusColor(indicator.status)}`}>
                    {indicator.score}
                </div>
            </div>

            <div className="max-w-md">
                <div className="flex items-center gap-3 mb-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-white/5 border border-white/10 ${getStatusColor(indicator.status)}`}>
                        {indicator.status}
                    </span>
                    <div className="flex items-center gap-1">
                        {getTrendIcon()}
                        <span className="text-[10px] uppercase font-bold text-slate-500">{indicator.trend}</span>
                    </div>
                </div>

                <h2 className="text-3xl font-bold mb-4 tracking-tight leading-tight">
                    Current Baseline Analysis
                </h2>

                <p className="text-slate-400 text-lg leading-relaxed">
                    {indicator.description}
                </p>
            </div>

            {/* Score bar at the bottom */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-white/5">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${indicator.score}%` }}
                    className={`h-full bg-gradient-to-r from-primary to-accent`}
                />
            </div>
        </motion.div>
    );
};

export default RiskIndicator;
