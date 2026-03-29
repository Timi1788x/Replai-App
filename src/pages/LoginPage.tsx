import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, AlertCircle, UserPlus, LogIn } from 'lucide-react';
import { useAuth } from '../api/useAuth';
import { supabase } from '../api/supabaseClient';

// ── Google icon (inline SVG — no extra dependency) ────────────
function GoogleIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
            <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
        </svg>
    );
}

export default function LoginPage() {
    const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
    const navigate = useNavigate();

    const [mode, setMode] = useState<'signin' | 'signup'>('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [signUpSuccess, setSignUpSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (mode === 'signup' && password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (password.length < 8) {
            setError('Password must be at least 8 characters.');
            return;
        }

        setLoading(true);
        try {
            if (mode === 'signup') {
                await signUpWithEmail(email, password);
                setSignUpSuccess(true);
                return;
            }

            await signInWithEmail(email, password);

            // DB-based admin check — redirect to /admin or /inbox.
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            const { data: isAdmin } = await supabase.rpc('is_admin', { uid: session.user.id });
            navigate(isAdmin ? '/admin' : '/inbox', { replace: true });

        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Authentication failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogle = async () => {
        setGoogleLoading(true);
        try {
            await signInWithGoogle();
            // Navigation happens in AuthCallbackPage after the OAuth redirect.
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Google sign-in failed.');
            setGoogleLoading(false);
        }
    };

    // ── Sign-up confirmation screen ───────────────────────────
    if (signUpSuccess) {
        return (
            <div className="h-screen flex items-center justify-center bg-dark-950 p-6">
                <div className="w-full max-w-sm text-center space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 flex items-center justify-center mx-auto">
                        <UserPlus size={24} className="text-emerald-400" />
                    </div>
                    <h2 className="text-lg font-bold text-white">Check your email</h2>
                    <p className="text-sm text-dark-400">
                        We sent a confirmation link to <span className="text-dark-200">{email}</span>.
                        Click it to activate your account.
                    </p>
                    <button
                        onClick={() => { setSignUpSuccess(false); setMode('signin'); }}
                        className="text-sm text-accent hover:underline cursor-pointer"
                    >
                        Back to sign in
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex items-center justify-center bg-dark-950 p-6">
            <div className="w-full max-w-sm space-y-6">

                {/* Logo */}
                <div className="text-center space-y-2">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center mx-auto shadow-lg shadow-accent/20">
                        <span className="text-white text-xl font-bold">H</span>
                    </div>
                    <h1 className="text-xl font-bold text-white">Hostbuddy</h1>
                    <p className="text-sm text-dark-400">
                        {mode === 'signin' ? 'Sign in to your account' : 'Create your account'}
                    </p>
                </div>

                {/* Google */}
                <button
                    onClick={handleGoogle}
                    disabled={googleLoading}
                    className="w-full flex items-center justify-center gap-3 py-2.5 rounded-xl bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors cursor-pointer shadow-sm"
                >
                    {googleLoading ? (
                        <Loader2 size={16} className="animate-spin text-gray-500" />
                    ) : (
                        <GoogleIcon />
                    )}
                    Continue with Google
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-dark-800" />
                    <span className="text-xs text-dark-500">or</span>
                    <div className="flex-1 h-px bg-dark-800" />
                </div>

                {/* Email / Password form */}
                <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                        <label className="block text-xs font-medium text-dark-400 mb-1.5">Email</label>
                        <div className="relative">
                            <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                                className="w-full bg-dark-800 text-dark-200 text-sm rounded-lg pl-9 pr-3 py-2.5 border border-dark-700 outline-none focus:border-accent/50 transition-colors placeholder:text-dark-600"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-dark-400 mb-1.5">Password</label>
                        <div className="relative">
                            <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="w-full bg-dark-800 text-dark-200 text-sm rounded-lg pl-9 pr-3 py-2.5 border border-dark-700 outline-none focus:border-accent/50 transition-colors placeholder:text-dark-600"
                            />
                        </div>
                    </div>

                    {mode === 'signup' && (
                        <div>
                            <label className="block text-xs font-medium text-dark-400 mb-1.5">Confirm Password</label>
                            <div className="relative">
                                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" />
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full bg-dark-800 text-dark-200 text-sm rounded-lg pl-9 pr-3 py-2.5 border border-dark-700 outline-none focus:border-accent/50 transition-colors placeholder:text-dark-600"
                                />
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 rounded-lg px-3 py-2">
                            <AlertCircle size={14} className="shrink-0" />
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent-dark transition-colors disabled:opacity-50 cursor-pointer"
                    >
                        {loading ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <>
                                {mode === 'signin' ? <LogIn size={14} /> : <UserPlus size={14} />}
                                {mode === 'signin' ? 'Sign In' : 'Create Account'}
                            </>
                        )}
                    </button>
                </form>

                {/* Mode toggle */}
                <p className="text-center text-xs text-dark-500">
                    {mode === 'signin' ? (
                        <>
                            No account?{' '}
                            <button
                                onClick={() => { setMode('signup'); setError(''); }}
                                className="text-accent hover:underline cursor-pointer"
                            >
                                Sign up
                            </button>
                        </>
                    ) : (
                        <>
                            Already have an account?{' '}
                            <button
                                onClick={() => { setMode('signin'); setError(''); }}
                                className="text-accent hover:underline cursor-pointer"
                            >
                                Sign in
                            </button>
                        </>
                    )}
                </p>
            </div>
        </div>
    );
}
