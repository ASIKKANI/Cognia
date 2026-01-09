'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Music, Heart } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect, useMemo } from 'react';

export default function Dashboard() {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [selectedHour, setSelectedHour] = useState<number | null>(null);
    const [selectedMood, setSelectedMood] = useState<string | null>(null);
    const [showAllTracks, setShowAllTracks] = useState(false);

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch('/api/spotify');
                const json = await res.json();
                if (!res.ok) throw new Error(json.error || 'Failed to fetch dashboard data');
                setData(json);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        if (session) {
            fetchData();
            const interval = setInterval(fetchData, 15000);
            return () => clearInterval(interval);
        }
        else setLoading(false);
    }, [session]);

    const handleLogout = () => signOut({ callbackUrl: 'http://127.0.0.1:3000' });

    const { aggregated, tracks, nowPlaying } = data || {};

    const filteredTracks = useMemo(() => {
        if (!tracks) return [];
        let result = tracks;

        if (selectedHour !== null) {
            result = result.filter((t: any) => {
                if (!t.playedAt) return false;
                return new Date(t.playedAt).getHours() === selectedHour;
            });
        }

        if (selectedMood !== null) {
            result = result.filter((t: any) => t.mood === selectedMood);
        }

        return result;
    }, [tracks, selectedHour, selectedMood]);

    const displayedTracks = showAllTracks ? filteredTracks : filteredTracks.slice(0, 5);

    if (loading) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#020202' }}>
                <motion.div animate={{ rotate: 360, scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
                    <Activity size={48} color="#1DB954" />
                </motion.div>
            </div>
        );
    }

    if (error || !data || !data.aggregated) {
        return (
            <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#020202', color: '#888', textAlign: 'center', padding: '2rem' }}>
                <p style={{ maxWidth: '400px', fontSize: '1rem', color: '#eee' }}>{error || "Connect to Spotify to see your rhythm."}</p>
                <button onClick={handleLogout} className="glass-card" style={{ padding: '0.75rem 2rem', marginTop: '1.5rem', cursor: 'pointer', color: 'white', fontWeight: 600 }}>Try Reconnecting</button>
            </div>
        );
    }

    const history = aggregated.rhythmHistory || new Array(24).fill(0);
    const score = Math.round(data?.aggregated?.dataConfidence * 100) || 0;
    const moodDistribution = aggregated.moodDistribution || {};

    const getMoodColor = (mood: string) => {
        const colors: Record<string, string> = {
            Euphoric: '#FFD700',
            Peaceful: '#00FA9A',
            Aggressive: '#FF4500',
            Melancholic: '#4169E1',
            Intense: '#FF1493',
            Chill: '#AFEEEE',
            Positive: '#1DB954',
            Stoic: '#808080'
        };
        return colors[mood] || '#1DB954';
    };

    return (
        <main style={{ minHeight: '100vh', padding: '2rem', maxWidth: '1200px', margin: '0 auto', color: '#eee', position: 'relative', background: '#050505' }}>

            {/* GLOW BACKGROUND EFFECT */}
            <div style={{ position: 'fixed', top: '-10%', left: '50%', transform: 'translateX(-50%)', width: '80%', height: '40%', background: 'radial-gradient(circle, rgba(29, 185, 84, 0.08) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

            {/* Live Now Playing - Floating & Glowy */}
            <AnimatePresence>
                {nowPlaying && (
                    <motion.div
                        initial={{ opacity: 0, y: -40, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -40, scale: 0.95 }}
                        style={{ position: 'fixed', top: '2rem', left: '50%', transform: 'translateX(-50%)', zIndex: 2000, pointerEvents: 'none' }}
                    >
                        <div className="glass-card now-playing-bar" style={{ padding: '0.7rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', border: `1px solid ${getMoodColor(nowPlaying.mood)}88`, background: 'rgba(5, 5, 5, 0.95)', backdropFilter: 'blur(40px)', pointerEvents: 'auto', borderRadius: '18px', boxShadow: `0 15px 40px rgba(0,0,0,0.8), 0 0 20px ${getMoodColor(nowPlaying.mood)}22` }}>
                            <div style={{ position: 'relative', width: '44px', height: '44px', flexShrink: 0 }}>
                                {nowPlaying.albumArt ? (
                                    <img src={nowPlaying.albumArt} style={{ width: '100%', height: '100%', borderRadius: '10px', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', background: '#111', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Music size={18} /></div>
                                )}
                                <div style={{ position: 'absolute', bottom: -4, right: -4, background: '#000', borderRadius: '50%', padding: '2px' }}>
                                    <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }} transition={{ duration: 1.5, repeat: Infinity }} style={{ width: '10px', height: '10px', background: getMoodColor(nowPlaying.mood), borderRadius: '50%', boxShadow: `0 0 10px ${getMoodColor(nowPlaying.mood)}` }} />
                                </div>
                            </div>
                            <div style={{ position: 'relative' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <p style={{ fontSize: '0.55rem', color: getMoodColor(nowPlaying.mood), fontWeight: 950, letterSpacing: '1.5px', textTransform: 'uppercase' }}>Current Emotional Incursion</p>
                                    <div className="scan-bar" style={{ background: getMoodColor(nowPlaying.mood) }} />
                                </div>
                                <div style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>
                                    <span style={{ fontSize: '1rem', fontWeight: 900, color: '#fff' }}>{nowPlaying.name}</span>
                                    <span style={{ fontSize: '0.8rem', color: '#666', marginLeft: '8px' }}>— {nowPlaying.artist}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                    <div style={{ padding: '2px 8px', background: `${getMoodColor(nowPlaying.mood)}22`, borderRadius: '6px', border: `1px solid ${getMoodColor(nowPlaying.mood)}44`, fontSize: '0.65rem', fontWeight: 900, color: getMoodColor(nowPlaying.mood), textTransform: 'uppercase' }}>
                                        {nowPlaying.mood}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem', position: 'relative', zIndex: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                    <Activity size={32} color="#1DB954" />
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 950, letterSpacing: '-1px' }}>Cognia <span style={{ color: '#333' }}>Mood-Core</span></h1>
                </div>
                <button onClick={handleLogout} style={{ border: '1px solid #1a1a1a', padding: '0.7rem 1.4rem', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', color: '#888', fontWeight: 700, cursor: 'pointer', transition: '0.3s' }} className="btn-secondary">
                    SIGN OUT
                </button>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '2.5rem', zIndex: 10, position: 'relative' }}>

                {/* Emotional Stability Score */}
                <section className="glass-card" style={{ padding: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <h3 className="section-title">Emotional Resonance</h3>
                    <div style={{ position: 'relative', width: '200px', height: '200px', margin: '2rem 0' }}>
                        <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                            <circle cx="50" cy="50" r="46" fill="none" stroke="#0a0a0a" strokeWidth="8" />
                            <motion.circle
                                cx="50" cy="50" r="46" fill="none" stroke="#1DB954" strokeWidth="8"
                                strokeDasharray="289"
                                initial={{ strokeDashoffset: 289 }}
                                animate={{ strokeDashoffset: 289 - (289 * score) / 100 }}
                                transition={{ duration: 2.5, ease: "circOut" }}
                                strokeLinecap="round"
                            />
                            <motion.circle
                                cx="50" cy="50" r="46" fill="none" stroke="#1DB954" strokeWidth="1"
                                animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.4, 0.1] }}
                                transition={{ duration: 5, repeat: Infinity }}
                            />
                        </svg>
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: '4rem', fontWeight: 950, color: '#fff' }}>{score}</span>
                            <span style={{ fontSize: '0.7rem', color: '#444', fontWeight: 900, letterSpacing: '3px' }}>STABILITY</span>
                        </div>
                    </div>
                    <div style={{ background: '#080808', padding: '12px 24px', borderRadius: '16px', border: '1px solid #111', width: '100%' }}>
                        <p style={{ fontSize: '0.85rem', fontWeight: 900, color: score > 80 ? '#1DB954' : '#FF4500', letterSpacing: '1px', textTransform: 'uppercase' }}>
                            {score > 80 ? 'Harmonic Equilibrium' : score > 50 ? 'Emotional Fluency' : 'High Volatility Detected'}
                        </p>
                    </div>
                </section>

                {/* Mood Spectrum Widget */}
                <section className="glass-card" style={{ padding: '3rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                        <h3 className="section-title">Mood Spectrum</h3>
                        <Heart size={18} color="#FF1493" />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                        {Object.entries(moodDistribution).sort((a: any, b: any) => b[1] - a[1]).map(([mood, count]: any) => {
                            const totalMoods = Object.values(moodDistribution).reduce((a: any, b: any) => a + b, 0) as number;
                            const percentage = Math.round((count / (totalMoods || 1)) * 100);
                            const isSelected = selectedMood === mood;
                            return (
                                <motion.div
                                    key={mood}
                                    whileHover={{ x: 5 }}
                                    onClick={() => setSelectedMood(isSelected ? null : mood)}
                                    style={{ cursor: 'pointer', opacity: selectedMood && !isSelected ? 0.3 : 1, transition: '0.3s' }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: getMoodColor(mood) }} />
                                            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#eee' }}>{mood}</span>
                                        </div>
                                        <span style={{ fontSize: '0.75rem', color: '#444', fontWeight: 900 }}>{percentage}%</span>
                                    </div>
                                    <div style={{ height: '8px', background: '#0a0a0a', borderRadius: '10px', overflow: 'hidden', border: '1px solid #111' }}>
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${percentage}%` }}
                                            style={{ height: '100%', background: getMoodColor(mood), boxShadow: `0 0 10px ${getMoodColor(mood)}44` }}
                                        />
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                    <p style={{ fontSize: '0.65rem', color: '#333', marginTop: '2rem', textAlign: 'center' }}>Tap a mood to filter your behavioral audit.</p>
                </section>

                {/* Chrono-Dynamic Valence Map */}
                <section className="glass-card" style={{ padding: '3rem', gridColumn: '1 / -1' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4rem' }}>
                        <div>
                            <h3 className="section-title">Valence Pulse Audit (24h)</h3>
                            <p style={{ fontSize: '0.85rem', color: '#1DB954', marginTop: '8px', fontWeight: 800 }}>
                                {selectedHour !== null ? `DECRYPTING HOUR ${selectedHour}:00` : 'TRACKING EMOTIONAL BIOMETRICS'}
                            </p>
                        </div>
                        {selectedHour !== null && (
                            <button onClick={() => setSelectedHour(null)} style={{ background: '#1DB954', border: 'none', color: '#000', fontSize: '0.7rem', fontWeight: 950, padding: '10px 24px', borderRadius: '14px', cursor: 'pointer', boxShadow: '0 8px 20px rgba(29, 185, 84, 0.4)' }}>CLEAR AUDIT</button>
                        )}
                    </div>

                    <div style={{ height: '220px', display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
                        {history.map((h: number, i: number) => {
                            const max = Math.max(...history, 1);
                            const height = (h / max) * 100;
                            const isSelected = selectedHour === i;
                            const isCurrentHour = new Date().getHours() === i;

                            return (
                                <div key={i} style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', position: 'relative' }}>
                                    <motion.div
                                        whileHover={{ scaleY: 1.15, filter: 'brightness(1.5)' }}
                                        initial={{ height: 0 }}
                                        animate={{
                                            height: `${Math.max(6, height)}%`,
                                            background: isSelected ? '#1DB954' : (isCurrentHour ? 'rgba(29, 185, 84, 0.2)' : (h > 0 ? '#111' : '#050505')),
                                            boxShadow: isCurrentHour ? '0 0 40px rgba(29, 185, 84, 0.3)' : 'none'
                                        }}
                                        style={{
                                            width: '100%',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            border: isCurrentHour ? '1px solid rgba(29, 185, 84, 0.6)' : 'none',
                                            zIndex: 2
                                        }}
                                        onClick={() => setSelectedHour(i)}
                                    />
                                    {isCurrentHour && (
                                        <div className="current-marker">LIVE</div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Audit Log */}
                <section style={{ gridColumn: '1 / -1' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                        <h3 className="section-title">Audit Feed</h3>
                        <button onClick={() => setShowAllTracks(!showAllTracks)} style={{ color: '#1DB954', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 900 }}>{showAllTracks ? 'SHOW LESS' : 'EXPAND ARCHIVE'}</button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                        <AnimatePresence mode="popLayout">
                            {displayedTracks.map((track: any) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    key={track.playedAt + track.name}
                                    className="glass-card"
                                    style={{ padding: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'center' }}
                                >
                                    <img src={track.albumArt} style={{ width: '56px', height: '56px', borderRadius: '12px' }} />
                                    <div>
                                        <p style={{ fontWeight: 950, fontSize: '0.9rem' }}>{track.name}</p>
                                        <p style={{ color: '#666', fontSize: '0.75rem' }}>{track.artist}</p>
                                        <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                                            <div style={{ fontSize: '0.6rem', padding: '2px 8px', background: `${getMoodColor(track.mood)}22`, color: getMoodColor(track.mood), borderRadius: '6px', fontWeight: 900 }}>{track.mood}</div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </section>
            </div>

            <style jsx>{`
        .glass-card {
          background: rgba(5, 5, 5, 0.7);
          backdrop-filter: blur(60px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 32px;
          transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
        }
        .section-title {
          font-size: 0.8rem;
          color: #444;
          letter-spacing: 4px;
          text-transform: uppercase;
          font-weight: 950;
        }
        .scan-bar {
            width: 20px;
            height: 2px;
            animation: scan-wide 1.5s ease-in-out infinite;
        }
        .current-marker {
            position: absolute;
            top: -40px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 0.6rem;
            color: #1DB954;
            font-weight: 950;
            letter-spacing: 2px;
            animation: pulse-y 2s infinite;
        }
        @keyframes scan-wide {
            0% { width: 0; opacity: 0; }
            50% { width: 40px; opacity: 1; }
            100% { width: 0; opacity: 0; }
        }
        @keyframes pulse-y {
            0% { transform: translate(-50%, 0); }
            50% { transform: translate(-50%, -5px); }
            100% { transform: translate(-50%, 0); }
        }
      `}</style>
        </main>
    );
}
