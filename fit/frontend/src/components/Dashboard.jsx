import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { AlertCircle, CheckCircle, TrendingDown, TrendingUp, Minus } from 'lucide-react';

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // First sync (in case it wasn't done) - ideally separate but for demo we chain
                await axios.post('http://localhost:8000/sync');
                const response = await axios.get('http://localhost:8000/insights');
                setData(response.data);
            } catch (err) {
                console.error(err);
                setError("Could not load behavioral insights. Ensure backend is running and you have data.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div className="animate-pulse">Analyzing patterns...</div>;
    if (error) return <div className="text-red-400">{error}</div>;
    if (!data) return null;

    const { status, trend, confidence, metrics, history } = data;

    // Determine status color
    const getStatusColor = (s) => {
        if (s === 'Needs Attention') return '#ef4444'; // Red
        if (s === 'Moderate') return '#f59e0b'; // Amber
        if (s === 'Stable') return '#10b981'; // Emerald
        if (s === 'Energetic') return '#3b82f6'; // Blue
        return '#64748b';
    };

    const statusColor = getStatusColor(status);

    return (
        <div className="dashboard-container" style={{ textAlign: 'left', width: '100%' }}>
            {/* Header Card */}
            <div className="card" style={{ borderLeft: `4px solid ${statusColor}`, marginBottom: '2rem' }}>
                <h3 style={{ margin: 0, textTransform: 'uppercase', fontSize: '0.875rem', color: '#94a3b8' }}>Well-Being Signal</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                    {status === 'Stable' ? <CheckCircle color={statusColor} /> : <AlertCircle color={statusColor} />}
                    <span style={{ fontSize: '2rem', fontWeight: 700, color: statusColor }}>{status}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1.5rem' }}>
                    <div>
                        <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Trend</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem' }}>
                            {trend.includes('Decline') ? <TrendingDown size={20} /> :
                                trend.includes('Improving') ? <TrendingUp size={20} /> : <Minus size={20} />}
                            {trend}
                        </div>
                    </div>
                    <div>
                        <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Confidence</div>
                        <div style={{ fontSize: '1.25rem' }}>{confidence}</div>
                    </div>
                </div>
            </div>

            {/* Metrics Overview Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div className="card" style={{ padding: '1.5rem' }}>
                    <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Daily Active Minutes</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 600, marginTop: '0.5rem' }}>{metrics.recent_active} min</div>
                    <div style={{ fontSize: '0.75rem', color: metrics.recent_active < metrics.baseline_active ? '#ef4444' : '#10b981' }}>
                        Baseline: {metrics.baseline_active} min
                    </div>
                </div>
                <div className="card" style={{ padding: '1.5rem' }}>
                    <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Avg Sleep Duration</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 600, marginTop: '0.5rem' }}>{Math.round(metrics.recent_sleep / 60)}h {metrics.recent_sleep % 60}m</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Baseline: {Math.round(metrics.baseline_sleep / 60)}h {metrics.baseline_sleep % 60}m
                    </div>
                </div>
            </div>

            {/* Chart Section */}
            <div className="card" style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>Activity & Sleep Trends</h3>
                <div style={{ height: '300px', width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={history}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="date" stroke="#94a3b8" tickFormatter={d => new Date(d).getDate()} />
                            <YAxis yAxisId="left" stroke="#60a5fa" />
                            <YAxis yAxisId="right" orientation="right" stroke="#a855f7" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                            />
                            <Line yAxisId="left" type="monotone" dataKey="steps" stroke="#60a5fa" name="Steps" dot={false} strokeWidth={2} />
                            <Line yAxisId="right" type="monotone" dataKey="sleep_minutes" stroke="#a855f7" name="Sleep (min)" dot={false} strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#94a3b8' }}>
                    Green/Blue: Activity | Purple: Sleep
                </div>
            </div>

            {/* Calendar & Context Tab */}
            <div className="card" style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>Context: Key Dates</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {data.calendar_context && data.calendar_context.length > 0 ? (
                        data.calendar_context.map((evt, idx) => (
                            <div key={idx} style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '0.75rem',
                                backgroundColor: '#1e293b',
                                borderRadius: '8px'
                            }}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontWeight: 600 }}>{new Date(evt.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', weekday: 'short' })}</span>
                                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                                        {evt.density === 'High' ? 'High Workload' : evt.density === 'Medium' ? 'Moderate Load' : 'Light Load'}
                                    </span>
                                </div>
                                <div>
                                    {evt.tags.map(tag => (
                                        <span key={tag} style={{
                                            fontSize: '0.7rem',
                                            padding: '2px 8px',
                                            borderRadius: '12px',
                                            marginLeft: '6px',
                                            backgroundColor: tag === 'Travel' ? '#3b82f6' : tag === 'High Stakes' ? '#ef4444' : '#10b981',
                                            color: 'white'
                                        }}>
                                            {tag}
                                        </span>
                                    ))}
                                    {/* Visualize event details on hover could be next, for now just tags */}
                                    {evt.events.length > 0 && evt.tags.length === 0 && (
                                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{evt.events.length} Events</span>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ color: '#64748b', fontStyle: 'italic' }}>No significant calendar events detected.</div>
                    )}
                </div>
            </div>

            {/* Why Selection */}
            <div className="card">
                <h3>Why am I seeing this?</h3>
                <p style={{ lineHeight: 1.6, color: '#cbd5e1' }}>
                    {data.explanation}
                </p>
                <div style={{ marginTop: '1rem', borderTop: '1px solid #334155', paddingTop: '1rem' }}>
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                        Analysis factors: Activity (Steps/Active Min), Sleep Patterns, and Calendar Schedule.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
