import { useState } from 'react';
import { User, Mail, Bell, LogOut, Shield, Save, Loader2, Zap, AlertTriangle } from 'lucide-react';
import { useAuth } from '../api/useAuth';
import { useHostSettings, useToggleAutoRespond } from '../api/useHostSettings';

export default function ProfilePage() {
    const { user, loading, signOut } = useAuth();
    const { autoRespondEnabled, isLoading: settingsLoading } = useHostSettings();
    const toggleAutoRespond = useToggleAutoRespond();

    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        sms: false,
    });
    const [showAutoRespondConfirm, setShowAutoRespondConfirm] = useState(false);

    const handleSignOut = async () => {
        try {
            await signOut();
        } catch {
            // silently fail
        }
    };

    const handleAutoRespondToggle = () => {
        if (!autoRespondEnabled) {
            // Enabling — show confirmation first
            setShowAutoRespondConfirm(true);
        } else {
            // Disabling — no confirmation needed
            toggleAutoRespond.mutate(false);
        }
    };

    const confirmEnableAutoRespond = () => {
        toggleAutoRespond.mutate(true);
        setShowAutoRespondConfirm(false);
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader2 size={24} className="text-accent animate-spin" />
            </div>
        );
    }

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

                {/* Automation */}
                <div className="bg-dark-900 rounded-2xl border border-dark-800 p-6 space-y-4">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                        <Zap size={14} className="text-accent" />
                        Automation
                    </h3>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-dark-300">Auto-respond</p>
                            <p className="text-[10px] text-dark-500 mt-0.5">
                                AI drafts are sent automatically without host approval. You can pause per conversation.
                            </p>
                        </div>
                        <button
                            onClick={handleAutoRespondToggle}
                            disabled={settingsLoading || toggleAutoRespond.isPending}
                            className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer disabled:opacity-50 ${
                                autoRespondEnabled ? 'bg-accent' : 'bg-dark-600'
                            }`}
                        >
                            <span
                                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                                    autoRespondEnabled ? 'left-5.5' : 'left-0.5'
                                }`}
                            />
                        </button>
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

            {/* ── Auto-respond confirmation modal ── */}
            {showAutoRespondConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-dark-900 border border-dark-700 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
                                <AlertTriangle size={18} className="text-amber-400" />
                            </div>
                            <h2 className="text-base font-semibold text-white">Enable Auto-respond?</h2>
                        </div>
                        <p className="text-sm text-dark-300 leading-relaxed mb-6">
                            AI draft replies will be <span className="text-white font-medium">sent automatically</span> to
                            your guests without requiring your approval. You can pause this per conversation at any time,
                            or turn it off here.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowAutoRespondConfirm(false)}
                                className="flex-1 px-4 py-2.5 rounded-xl bg-dark-800 text-dark-300 text-sm font-medium hover:bg-dark-700 transition-colors cursor-pointer border border-dark-700"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmEnableAutoRespond}
                                className="flex-1 px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-dark transition-colors cursor-pointer"
                            >
                                Enable
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
