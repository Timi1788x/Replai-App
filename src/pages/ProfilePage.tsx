import { useState } from 'react';
import { User, Mail, Lock, Bell, LogOut, Shield, Save } from 'lucide-react';

export default function ProfilePage() {
    const [profile, setProfile] = useState({
        name: 'Alex Fuchs',
        email: 'alex@antigravity.app',
        phone: '+41 79 123 45 67',
    });

    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        sms: false,
    });

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
                        AF
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-white">{profile.name}</h2>
                        <p className="text-xs text-dark-400">{profile.email}</p>
                        <p className="text-[10px] text-dark-500 mt-1">Host since January 2024</p>
                    </div>
                </div>

                {/* Profile info */}
                <div className="bg-dark-900 rounded-2xl border border-dark-800 p-6 space-y-4">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                        <Mail size={14} className="text-accent" />
                        Account Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-dark-400 mb-1.5">Full Name</label>
                            <input
                                value={profile.name}
                                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                className="w-full bg-dark-800 text-dark-200 text-sm rounded-lg px-3 py-2 border border-dark-700 outline-none focus:border-accent/50 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-dark-400 mb-1.5">Email</label>
                            <input
                                value={profile.email}
                                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                className="w-full bg-dark-800 text-dark-200 text-sm rounded-lg px-3 py-2 border border-dark-700 outline-none focus:border-accent/50 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-dark-400 mb-1.5">Phone</label>
                            <input
                                value={profile.phone}
                                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                className="w-full bg-dark-800 text-dark-200 text-sm rounded-lg px-3 py-2 border border-dark-700 outline-none focus:border-accent/50 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-dark-400 mb-1.5">Password</label>
                            <button className="flex items-center gap-2 text-xs text-accent hover:text-accent-light transition-colors cursor-pointer">
                                <Lock size={12} />
                                Change Password
                            </button>
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
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-red-400 text-sm font-medium hover:bg-red-500/10 transition-colors cursor-pointer">
                        <LogOut size={14} />
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
}
