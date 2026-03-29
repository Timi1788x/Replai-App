import { Outlet } from 'react-router-dom';
import { Shield, LogOut } from 'lucide-react';
import { useAuth } from '../../api/useAuth';

function AdminTopNav() {
    const { user, signOut } = useAuth();

    return (
        <header className="flex items-center justify-between px-6 py-3 border-b border-dark-800 bg-dark-900/80 backdrop-blur-sm shrink-0">
            <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center shadow-sm shadow-accent/20">
                    <span className="text-white text-xs font-bold">H</span>
                </div>
                <span className="text-sm font-semibold text-white">Hostbuddy</span>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20">
                    <Shield size={10} className="text-accent" />
                    <span className="text-[10px] font-semibold text-accent uppercase tracking-wide">Admin</span>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <span className="text-xs text-dark-400">{user?.email}</span>
                <button
                    onClick={signOut}
                    className="flex items-center gap-1.5 text-xs text-dark-400 hover:text-red-400 transition-colors cursor-pointer"
                >
                    <LogOut size={13} />
                    Sign out
                </button>
            </div>
        </header>
    );
}

export default function AdminLayout() {
    return (
        <div className="flex flex-col h-screen bg-dark-950 overflow-hidden">
            <AdminTopNav />
            <main className="flex-1 overflow-hidden">
                <Outlet />
            </main>
        </div>
    );
}
