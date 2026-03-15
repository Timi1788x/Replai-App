import { useState } from 'react';
import { User, Mail, Lock, Bell, LogOut, Shield, Save, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../api/useAuth';

export default function ProfilePage() {
    const { user, loading, isAuthenticated, signInWithEmail, signOut } = useAuth();

    // ── Login form state ──
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [loginLoading, setLoginLoading] = useState(false);

    // ── Profile state (must be before early returns — Rules of Hooks) ──
    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        sms: false,
    });

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError('');
        setLoginLoading(true);
        try {
            await signInWithEmail(email, password);
        } catch (err: unknown) {
            setLoginError(err instanceof Error ? err.message : 'Login failed');
        } finally {
            setLoginLoading(false);
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut();
        } catch {
            // silently fail
        }
    };

    // ── Loading state ──
    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader2 size={24} className="text-accent animate-spin" />
            </div>
        );
    }

    // ── Not authenticated → Login form ──
    if (!isAuthenticated) {
        return (
            <div className="h-full flex items-center justify-center p-6">
                <div className="w-full max-w-sm space-y-6">
                    {/* Logo / header */}
                    <div className="text-center space-y-2">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center mx-auto shadow-lg shadow-accent/20">
                            <User size={28} className="text-white" />
                        </div>
                        <h1 className="text-xl font-bold text-white">Hostbuddy</h1>
                        <p className="text-sm text-dark-400">Sign in to your host account</p>
                    </div>

                    {/* Login form */}
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-dark-400 mb-1.5">Email</label>
                            <div className="relative">
                                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="host@example.com"
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

                        {loginError && (
                            <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 rounded-lg px-3 py-2">
                                <AlertCircle size={14} />
                                {loginError}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loginLoading}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent-dark transition-colors disabled:opacity-50 cursor-pointer"
                        >
                            {loginLoading ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <>
                                    <LogOut size={14} className="rotate-180" />
                                    Sign In
                                </>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-[10px] text-dark-500">
                        Host accounts are created by the development team.
                        <br />Contact your admin if you don't have credentials.
                    </p>
                </div>
            </div>
        );
    }

    // ── Authenticated → Profile & Settings ──
    const initials = (user?.email ?? 'U')[0].toUpperCase();

    return (
        <div className="h-full overflow-y-auto p-6">
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center">
                        <User size={20} className="text-accent" />
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold text-white">Profile & Settings</h1>
                        <p className="text-xs text-dark-400">Manage your account and preferences</p>
                    </div>
                </div>

                {/* Avatar section */}
                <div className="bg-dark-900 rounded-2xl border border-dark-800 p-6 flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-accent/20">
                        {initials}
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-white">{user?.email}</h2>
                        <p className="text-[10px] text-dark-500 mt-1">
                            Host ID: <span className="font-mono text-dark-400">{user?.id.slice(0, 8)}…</span>
                        </p>
                    </div>
                    <div className="ml-auto flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 rounded-full px-3 py-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Connected
                    </div>
                </div>

                {/* Account info */}
                <div className="bg-dark-900 rounded-2xl border border-dark-800 p-6 space-y-4">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                        <Mail size={14} className="text-accent" />
                        Account Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-dark-400 mb-1.5">Email</label>
                            <p className="text-sm text-dark-200 bg-dark-800 rounded-lg px-3 py-2 border border-dark-700">
                                {user?.email}
                            </p>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-dark-400 mb-1.5">Host UUID</label>
                            <p className="text-sm text-dark-200 bg-dark-800 rounded-lg px-3 py-2 border border-dark-700 font-mono text-xs">
                                {user?.id}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Notifications */}
                <div className="bg-dark-900 rounded-2xl border border-dark-800 p-6 space-y-4">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                        <Bell size={14} className="text-accent" />
                        Notifications
                    </h3>
                    {([
                        { key: 'email' as const, label: 'Email Notifications' },
                        { key: 'push' as const, label: 'Push Notifications' },
                        { key: 'sms' as const, label: 'SMS Notifications' },
                    ]).map(({ key, label }) => (
                        <div key={key} className="flex items-center justify-between">
                            <span className="text-sm text-dark-300">{label}</span>
                            <button
                                onClick={() => setNotifications({ ...notifications, [key]: !notifications[key] })}
                                className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer
                  ${notifications[key] ? 'bg-accent' : 'bg-dark-600'}`}
                            >
                                <span
                                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform
                    ${notifications[key] ? 'left-5.5' : 'left-0.5'}`}
                                />
                            </button>
                        </div>
                    ))}
                </div>

                {/* Security */}
                <div className="bg-dark-900 rounded-2xl border border-dark-800 p-6 space-y-4">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                        <Shield size={14} className="text-accent" />
                        Security
                    </h3>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-dark-300">Two-Factor Authentication</p>
                            <p className="text-[10px] text-dark-500">Add an extra layer of security</p>
                        </div>
                        <button className="px-3 py-1.5 text-xs font-medium rounded-lg bg-dark-800 text-dark-300 border border-dark-700 hover:bg-dark-700 transition-colors cursor-pointer">
                            Enable
                        </button>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-dark transition-colors cursor-pointer">
                        <Save size={14} />
                        Save Changes
                    </button>
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-red-400 text-sm font-medium hover:bg-red-500/10 transition-colors cursor-pointer"
                    >
                        <LogOut size={14} />
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
}
