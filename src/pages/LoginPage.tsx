import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Chrome } from 'lucide-react';
import { authService } from '../services/authService';
import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [tokenClient, setTokenClient] = useState<any>(null);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);

    useEffect(() => {
        const client = authService.initTokenClient(async (response: any) => {
            if (response.error) {
                setError('Login failed. Please try again.');
                setLoading(false);
                return;
            }

            if (response.access_token) {
                try {
                    const profile = await authService.fetchUserProfile(response.access_token);
                    if (profile) {
                        authService.setUser(profile);
                        navigate('/', { replace: true });
                    }
                } catch (err) {
                    setError('Failed to fetch user profile.');
                }
            }
            setLoading(false);
        });
        setTokenClient(client);
    }, [navigate]);

    const handleGoogleLogin = () => {
        setLoading(true);
        setError(null);
        if (tokenClient) {
            tokenClient.requestAccessToken();
        } else {
            setError('Google Login is not initialized yet. Please refresh.');
            setLoading(false);
        }
    };

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { signInWithEmailAndPassword, createUserWithEmailAndPassword } = await import('firebase/auth');
            const { auth } = await import('../services/firebaseService');

            let userCredential;
            if (isRegistering) {
                userCredential = await createUserWithEmailAndPassword(auth, email, password);
            } else {
                userCredential = await signInWithEmailAndPassword(auth, email, password);
            }

            const user = userCredential.user;
            authService.setUser({
                name: user.displayName || user.email?.split('@')[0] || 'User',
                email: user.email || '',
                picture: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`
            });
            authService.setToken('firebase_token_' + user.uid);
            navigate('/', { replace: true });
        } catch (err: any) {
            setError(err.message || 'Authentication failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-30">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/20 rounded-full blur-[180px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-accent/20 rounded-full blur-[180px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="glass-panel p-10 rounded-[40px] border-white/10 bg-white/[0.02] backdrop-blur-3xl shadow-[0_0_80px_rgba(0,0,0,0.5)]">
                    <div className="flex flex-col items-center text-center mb-8">
                        <div className="w-16 h-16 bg-primary/10 rounded-[24px] flex items-center justify-center mb-6 border border-primary/20 shadow-[0_0_40px_rgba(99,102,241,0.15)]">
                            <Activity className="text-primary w-8 h-8" />
                        </div>
                        <h1 className="text-3xl font-black mb-2 tracking-tight">Cognia Access</h1>
                        <p className="text-slate-400 text-xs leading-relaxed max-w-[280px]">
                            Enter your credentials to access your behavioral dashboard.
                        </p>
                    </div>

                    <form onSubmit={handleEmailAuth} className="space-y-4 mb-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                                placeholder="name@company.com"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary/80 text-white p-4 rounded-2xl font-bold transition-all disabled:opacity-50 active:scale-[0.98]"
                        >
                            {loading ? 'Processing...' : (isRegistering ? 'Create Account' : 'Sign In')}
                        </button>
                    </form>

                    <div className="text-center mb-6">
                        <button
                            onClick={() => setIsRegistering(!isRegistering)}
                            className="text-xs text-slate-400 hover:text-white transition-colors"
                        >
                            {isRegistering ? 'Already have an account? Sign In' : 'Need an account? Create one'}
                        </button>
                    </div>

                    <div className="flex items-center gap-4 py-2 mb-6">
                        <div className="h-px flex-1 bg-white/10" />
                        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-600">OR</span>
                        <div className="h-px flex-1 bg-white/10" />
                    </div>

                    <div className="space-y-4">
                        <button
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            type="button"
                            className="w-full flex items-center justify-center gap-4 bg-white/5 border border-white/10 text-white hover:bg-white/10 p-4 rounded-2xl font-bold transition-all disabled:opacity-50"
                        >
                            <Chrome className="w-5 h-5" />
                            Continue with Google
                        </button>

                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-medium text-center">
                                {error}
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em]">
                        Advanced behavioral monitoring unit — v2.0
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;
