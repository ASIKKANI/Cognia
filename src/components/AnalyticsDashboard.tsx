import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, Activity, Heart, Calendar, Music, PenTool, Brain, Lightbulb, CheckCircle, AlertTriangle } from 'lucide-react';
import { analyticsService, type AnalyticsData } from '../services/analyticsService';
import { suggestionsEngine, type Suggestion } from '../services/suggestionsEngine';
import {
    LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

interface Props {
    onClose: () => void;
}

export const AnalyticsDashboard: React.FC<Props> = ({ onClose }) => {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

    useEffect(() => {
        loadAnalytics();
    }, []);

    const loadAnalytics = async () => {
        try {
            const analyticsData = await analyticsService.fetchAllData();
            setData(analyticsData);

            // Generate AI suggestions
            const aiSuggestions = suggestionsEngine.generateSuggestions(analyticsData);
            setSuggestions(aiSuggestions);
        } catch (error) {
            console.error('Failed to load analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
                <div className="text-white text-xl animate-pulse">Loading Analytics...</div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
                <div className="text-white">Failed to load analytics data</div>
            </div>
        );
    }

    const categoryIcons = {
        emotionalStability: Brain,
        productivity: Activity,
        physicalWellness: Heart,
        timeManagement: Calendar,
        emotionalResonance: Music,
        mentalWellness: PenTool,
    };

    const radarData = Object.entries(data.categories).map(([key, cat]) => ({
        category: cat.name,
        score: cat.score,
        fullMark: 100,
    }));

    const barData = Object.entries(data.categories).map(([key, cat]) => ({
        name: cat.name.split(' ')[0],
        score: cat.score,
        fill: analyticsService.getStatusColor(cat.status),
    }));

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-y-auto"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, y: 50 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 50 }}
                    onClick={(e) => e.stopPropagation()}
                    className="min-h-screen p-8"
                >
                    <div className="max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="glass-panel p-8 mb-8">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h1 className="text-4xl font-bold mb-2">Wellness Analytics</h1>
                                    <p className="text-slate-400">{data.date}</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Overall Score */}
                            <div className="flex items-center gap-6">
                                <div className="text-6xl font-black" style={{
                                    color: data.overallScore >= 80 ? '#10b981' :
                                        data.overallScore >= 60 ? '#3b82f6' :
                                            data.overallScore >= 40 ? '#f59e0b' : '#ef4444'
                                }}>
                                    {data.overallScore}
                                </div>
                                <div>
                                    <div className="text-2xl font-bold">Overall Wellness Score</div>
                                    <div className="text-slate-400">
                                        {data.overallScore >= 80 ? 'Excellent' :
                                            data.overallScore >= 60 ? 'Good' :
                                                data.overallScore >= 40 ? 'Fair' : 'Needs Attention'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Category Scores Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {Object.entries(data.categories).map(([key, category]) => {
                                const Icon = categoryIcons[key as keyof typeof categoryIcons];
                                return (
                                    <motion.div
                                        key={key}
                                        whileHover={{ scale: 1.02 }}
                                        className="glass-panel p-6"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <Icon
                                                className="w-8 h-8"
                                                style={{ color: analyticsService.getStatusColor(category.status) }}
                                            />
                                            <div className="text-3xl font-bold" style={{
                                                color: analyticsService.getStatusColor(category.status)
                                            }}>
                                                {category.score}
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-semibold mb-2">{category.name}</h3>
                                        <p className="text-sm text-slate-400">{category.details}</p>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Charts */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                            {/* Radar Chart */}
                            <div className="glass-panel p-6">
                                <h2 className="text-2xl font-bold mb-6">Wellness Radar</h2>
                                <ResponsiveContainer width="100%" height={300}>
                                    <RadarChart data={radarData}>
                                        <PolarGrid stroke="#ffffff20" />
                                        <PolarAngleAxis dataKey="category" stroke="#94a3b8" />
                                        <Radar
                                            name="Score"
                                            dataKey="score"
                                            stroke="#6366f1"
                                            fill="#6366f1"
                                            fillOpacity={0.5}
                                        />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Bar Chart */}
                            <div className="glass-panel p-6">
                                <h2 className="text-2xl font-bold mb-6">Category Breakdown</h2>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={barData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                        <XAxis dataKey="name" stroke="#94a3b8" />
                                        <YAxis stroke="#94a3b8" />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#0f172a',
                                                border: '1px solid #ffffff20',
                                                borderRadius: '8px'
                                            }}
                                        />
                                        <Bar dataKey="score" radius={[8, 8, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Raw Data Tables */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Digital Activity */}
                            {data.rawData.digitalActivity && (
                                <div className="glass-panel p-6">
                                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                        <Activity className="w-5 h-5 text-accent" />
                                        Digital Activity
                                    </h3>
                                    <div className="space-y-2">
                                        {Object.entries(data.rawData.digitalActivity.apps || {})
                                            .sort(([, a], [, b]) => (b as number) - (a as number))
                                            .slice(0, 5)
                                            .map(([app, seconds]) => (
                                                <div key={app} className="flex justify-between items-center">
                                                    <span className="text-sm">{app}</span>
                                                    <span className="text-xs text-slate-500">
                                                        {Math.floor((seconds as number) / 60)}m
                                                    </span>
                                                </div>
                                            ))
                                        }
                                    </div>
                                </div>
                            )}

                            {/* Physical Wellness */}
                            {data.rawData.fitness && (
                                <div className="glass-panel p-6">
                                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                        <Heart className="w-5 h-5 text-red-400" />
                                        Physical Wellness
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-sm">Sleep Duration</span>
                                            <span className="text-sm font-bold">
                                                {Math.round(data.rawData.fitness.metrics?.recent_sleep / 60)}h
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm">Active Minutes</span>
                                            <span className="text-sm font-bold">
                                                {data.rawData.fitness.metrics?.recent_active}min
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm">Status</span>
                                            <span className="text-sm font-bold" style={{
                                                color: analyticsService.getStatusColor(data.rawData.fitness.status)
                                            }}>
                                                {data.rawData.fitness.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* AI Suggestions Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="glass-panel p-8 mt-8"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <Lightbulb className="w-8 h-8 text-yellow-400 animate-pulse" />
                                <h2 className="text-3xl font-bold">AI Wellness Suggestions</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {suggestions.map((suggestion, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 * index }}
                                        className={`p-5 rounded-xl border-2 ${suggestion.type === 'strength'
                                                ? 'bg-green-500/10 border-green-500/30'
                                                : suggestion.type === 'action'
                                                    ? 'bg-blue-500/10 border-blue-500/30'
                                                    : 'bg-yellow-500/10 border-yellow-500/30'
                                            }`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="text-3xl flex-shrink-0">
                                                {suggestion.type === 'strength' && <CheckCircle className="w-7 h-7 text-green-500" />}
                                                {suggestion.type === 'action' && <Lightbulb className="w-7 h-7 text-blue-400" />}
                                                {suggestion.type === 'concern' && <AlertTriangle className="w-7 h-7 text-yellow-500" />}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-2xl">{suggestion.icon}</span>
                                                    <h3 className="font-bold text-lg">{suggestion.title}</h3>
                                                </div>
                                                <p className="text-slate-300 text-sm leading-relaxed">
                                                    {suggestion.message}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
