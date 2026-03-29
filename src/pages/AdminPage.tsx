import { Search, RefreshCw, Users, CheckCircle, XCircle } from 'lucide-react';
import { useAdminStore } from '../store/useAdminStore';
import { useAdminUsers } from '../api/useAdminUsers';
import { useIsAdmin } from '../api/useIsAdmin';
import AdminCustomerTable from '../components/admin/AdminCustomerTable';
import AdminUserDetailPanel from '../components/admin/AdminUserDetailPanel';
import { useQueryClient } from '@tanstack/react-query';
import { adminKeys } from '../api/useIsAdmin';

function StatCard({ label, value, icon: Icon, color }: {
    label: string;
    value: number | string;
    icon: React.ElementType;
    color: string;
}) {
    return (
        <div className="bg-dark-900 border border-dark-800 rounded-xl px-5 py-4 flex items-center gap-4">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
                <Icon size={16} />
            </div>
            <div>
                <p className="text-xl font-bold text-white leading-none">{value}</p>
                <p className="text-xs text-dark-400 mt-0.5">{label}</p>
            </div>
        </div>
    );
}

export default function AdminPage() {
    const { isAdmin } = useIsAdmin();
    const { data: users = [], isLoading, dataUpdatedAt } = useAdminUsers(isAdmin);
    const { searchQuery, selectedUserId, setSearch } = useAdminStore();
    const queryClient = useQueryClient();

    const activeCount = users.filter((u) => u.is_active).length;
    const inactiveCount = users.length - activeCount;

    const refresh = () => queryClient.invalidateQueries({ queryKey: adminKeys.users });

    const lastUpdated = dataUpdatedAt
        ? new Date(dataUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : null;

    return (
        <div className="h-full flex overflow-hidden">
            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden p-6 gap-5 min-w-0">

                {/* Header */}
                <div className="flex items-center justify-between shrink-0">
                    <div>
                        <h1 className="text-xl font-bold text-white">Customers</h1>
                        {lastUpdated && (
                            <p className="text-xs text-dark-500 mt-0.5">Updated {lastUpdated}</p>
                        )}
                    </div>
                    <button
                        onClick={refresh}
                        disabled={isLoading}
                        title="Refresh"
                        className="p-2 rounded-lg text-dark-400 hover:text-dark-200 hover:bg-dark-800 transition-colors cursor-pointer disabled:opacity-40"
                    >
                        <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                </div>

                {/* Stats strip */}
                <div className="grid grid-cols-3 gap-3 shrink-0">
                    <StatCard label="Total customers" value={users.length} icon={Users}       color="bg-dark-800 text-dark-300" />
                    <StatCard label="Active licenses"  value={activeCount}  icon={CheckCircle} color="bg-emerald-500/10 text-emerald-400" />
                    <StatCard label="Inactive"         value={inactiveCount} icon={XCircle}    color="bg-red-500/10 text-red-400" />
                </div>

                {/* Search */}
                <div className="relative shrink-0">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by email…"
                        className="w-full bg-dark-800 text-dark-200 text-sm rounded-xl pl-9 pr-4 py-2.5 border border-dark-700 outline-none focus:border-accent/50 placeholder:text-dark-600 transition-colors"
                    />
                </div>

                {/* Table */}
                <AdminCustomerTable users={users} isLoading={isLoading} />
            </div>

            {/* Right: user detail panel */}
            {selectedUserId && <AdminUserDetailPanel />}
        </div>
    );
}
