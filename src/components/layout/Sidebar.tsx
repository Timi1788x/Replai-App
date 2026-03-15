import { NavLink } from 'react-router-dom';
import { Inbox, CalendarDays, Settings, User, Zap } from 'lucide-react';

const navItems = [
    { to: '/inbox', icon: Inbox, label: 'Inbox' },
    { to: '/calendar', icon: CalendarDays, label: 'Calendar' },
    { to: '/config', icon: Settings, label: 'Config' },
    { to: '/profile', icon: User, label: 'Profile' },
];

export default function Sidebar() {
    return (
        <aside className="w-[72px] h-screen bg-dark-900 border-r border-dark-800 flex flex-col items-center py-4 shrink-0">
            {/* Logo */}
            <div className="mb-8 flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center shadow-lg shadow-accent/20">
                    <Zap size={20} className="text-white" />
                </div>
                <span className="text-[9px] font-bold tracking-widest uppercase mt-1 text-center leading-tight">
                    <span className="text-dark-400 block">Host</span>
                    <span className="text-accent block">Buddy</span>
                </span>
            </div>

            {/* Nav items */}
            <nav className="flex-1 flex flex-col gap-1 w-full px-2">
                {navItems.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                            `flex flex-col items-center gap-1 py-3 rounded-xl transition-all duration-200 group
              ${isActive
                                ? 'bg-accent/15 text-accent'
                                : 'text-dark-500 hover:text-dark-300 hover:bg-dark-800'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                                <span className="text-[10px] font-medium">{label}</span>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Bottom indicator */}
            <div className="w-8 h-1 rounded-full bg-dark-700 mt-4" />
        </aside>
    );
}
