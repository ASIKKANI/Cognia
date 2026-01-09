'use client';

import { motion } from 'framer-motion';
import { Activity, Music, Shield, Info } from 'lucide-react';
import { signIn, useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
    const { data: session } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (session) {
            router.push("/dashboard");
        }
    }, [session, router]);

    return (
        <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '100vh', zIndex: -1, background: 'radial-gradient(circle at 50% 50%, #121212 0%, #050505 100%)' }} />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                style={{ textAlign: 'center', maxWidth: '800px' }}
            >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    <Activity size={48} color="#1DB954" />
                    <h1 style={{ fontSize: '3.5rem', fontWeight: 800 }}>Cognia</h1>
                </div>

                <p style={{ fontSize: '1.5rem', color: '#b3b3b3', marginBottom: '3rem', lineHeight: 1.6 }}>
                    Understanding your <span className="gradient-text">behavioural rhythm</span> through personal music patterns.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '4rem' }}>
                    <div className="glass-card" style={{ padding: '2rem', textAlign: 'left' }}>
                        <Music size={24} color="#1DB954" style={{ marginBottom: '1rem' }} />
                        <h3 style={{ marginBottom: '0.5rem' }}>Privacy First</h3>
                        <p style={{ color: '#888', fontSize: '0.9rem' }}>We only store aggregated features. No raw track data ever leaves your control.</p>
                    </div>
                    <div className="glass-card" style={{ padding: '2rem', textAlign: 'left' }}>
                        <Shield size={24} color="#1DB954" style={{ marginBottom: '1rem' }} />
                        <h3 style={{ marginBottom: '0.5rem' }}>Non-Clinical</h3>
                        <p style={{ color: '#888', fontSize: '0.9rem' }}>Insight into your rhythm stability, not a diagnosis or mood interpretation.</p>
                    </div>
                </div>

                <motion.button
                    onClick={() => signIn('spotify')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                        background: '#1DB954',
                        color: 'white',
                        border: 'none',
                        padding: '1rem 3rem',
                        borderRadius: '50px',
                        fontSize: '1.2rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 4px 20px rgba(29, 185, 84, 0.4)'
                    }}
                >
                    Connect Spotify
                </motion.button>

                <div style={{ marginTop: '4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#666' }}>
                    <Info size={16} />
                    <p style={{ fontSize: '0.8rem' }}>Explicit OAuth consent required. Revoke anytime.</p>
                </div>
            </motion.div>
        </main>
    );
}
