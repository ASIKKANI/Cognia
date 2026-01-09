import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Monitor, Globe } from 'lucide-react';
import { sessionService } from '../services/sessionService';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface DigitalActivityProps {
    onClose: () => void;
}

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#06b6d4'];

const DigitalActivity: React.FC<DigitalActivityProps> = ({ onClose }) => {
    const [apps, setApps] = useState<Record<string, number>>({});
    const [webActivity, setWebActivity] = useState<Record<string, number>>({});

    useEffect(() => {
        const interval = setInterval(() => {
            setApps(sessionService.getApps());
            setWebActivity(sessionService.getWebActivity());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const appData = Object.entries(apps)
        .sort(([, a], [, b]) => b - a)
        .map(([name, value]) => ({ name, value }));

    const webData = Object.entries(webActivity)
        .sort(([, a], [, b]) => b - a)
        .map(([name, value]) => ({ name, value }));

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="glass-panel p-8 w-full max-w-6xl max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                            Digital Activity
                        </h2>
                        <p className="text-sm text-slate-400 mt-1">Your application and web usage patterns</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* App Usage Chart */}
                    <div className="glass-panel p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Monitor className="w-5 h-5 text-primary" />
                            Application Usage
                        </h3>
                        {appData.length > 0 ? (
                            <>
                                <div className="h-64 mb-4">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={appData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {appData.map((_, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#0f172a',
                                                    border: '1px solid #ffffff20',
                                                    borderRadius: '8px'
                                                }}
                                                formatter={(value: number | undefined) => value ? sessionService.formatSeconds(value) : '0s'}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="space-y-2">
                                    {appData.slice(0, 8).map((app, index) => (
                                        <div key={app.name} className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                                />
                                                <span className="text-sm text-slate-300">{app.name}</span>
                                            </div>
                                            <span className="text-xs text-slate-500 font-mono">
                                                {sessionService.formatSeconds(app.value)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <p className="text-slate-500 italic text-center py-8">No application data yet...</p>
                        )}
                    </div>

                    {/* Web Activity Chart */}
                    <div className="glass-panel p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Globe className="w-5 h-5 text-accent" />
                            Web Activity
                        </h3>
                        {webData.length > 0 ? (
                            <>
                                <div className="h-64 mb-4">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={webData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                            <XAxis
                                                dataKey="name"
                                                stroke="#ffffff40"
                                                tick={{ fill: '#94a3b8', fontSize: 12 }}
                                                angle={-45}
                                                textAnchor="end"
                                                height={80}
                                            />
                                            <YAxis
                                                stroke="#ffffff40"
                                                tick={{ fill: '#94a3b8', fontSize: 12 }}
                                                tickFormatter={(value) => `${Math.floor(value / 60)}m`}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#0f172a',
                                                    border: '1px solid #ffffff20',
                                                    borderRadius: '8px'
                                                }}
                                                formatter={(value: number | undefined) => value ? sessionService.formatSeconds(value) : '0s'}
                                            />
                                            <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="space-y-2">
                                    {webData.slice(0, 8).map((site) => (
                                        <div key={site.name} className="flex justify-between items-center">
                                            <span className="text-sm text-slate-300">{site.name}</span>
                                            <span className="text-xs text-slate-500 font-mono">
                                                {sessionService.formatSeconds(site.value)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <p className="text-slate-500 italic text-center py-8">No web activity data yet...</p>
                        )}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default DigitalActivity;
