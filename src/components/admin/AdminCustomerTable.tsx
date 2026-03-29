import { useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, Loader2, Users } from 'lucide-react';
import { useAdminStore } from '../../store/useAdminStore';
import AdminLicenseToggle from './AdminLicenseToggle';
import AdminMaxPropertiesInput from './AdminMaxPropertiesInput';
import type { AdminUserRow } from '../../types/admin';

// ── Plan badge ────────────────────────────────────────────────
function PlanBadge({ name }: { name: string }) {
    const colors: Record<string, string> = {
        free: 'bg-dark-700 text-dark-400',
        starter: 'bg-blue-500/15 text-blue-400 border border-blue-500/20',
        pro: 'bg-accent/15 text-accent border border-accent/20',
    };
    return (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${colors[name] ?? 'bg-dark-700 text-dark-400'}`}>
            {name}
        </span>
    );
}

// ── Sortable column header ────────────────────────────────────
type SortBy = 'created_at' | 'email' | 'is_active' | 'property_count';

function SortHeader({
    label, field, current, dir, onSort,
}: {
    label: string;
    field: SortBy;
    current: SortBy;
    dir: 'asc' | 'desc';
    onSort: (f: SortBy, d: 'asc' | 'desc') => void;
}) {
    const active = current === field;
    const toggle = () => onSort(field, active && dir === 'asc' ? 'desc' : 'asc');
    return (
        <th
            className="px-4 py-3 text-left text-[10px] font-semibold text-dark-400 uppercase tracking-wide cursor-pointer select-none hover:text-dark-200 transition-colors"
            onClick={toggle}
        >
            <div className="flex items-center gap-1">
                {label}
                {active ? (
                    dir === 'asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} />
                ) : (
                    <ChevronsUpDown size={11} className="opacity-40" />
                )}
            </div>
        </th>
    );
}

// ── Main table ────────────────────────────────────────────────
interface Props {
    users: AdminUserRow[];
    isLoading: boolean;
}

export default function AdminCustomerTable({ users, isLoading }: Props) {
    const { selectedUserId, selectUser, searchQuery, sortBy, sortDir, setSort } = useAdminStore();

    const filtered = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        const base = q ? users.filter((u) => u.email.toLowerCase().includes(q)) : users;

        return [...base].sort((a, b) => {
            let cmp = 0;
            switch (sortBy) {
                case 'email':          cmp = a.email.localeCompare(b.email); break;
                case 'is_active':      cmp = Number(b.is_active) - Number(a.is_active); break;
                case 'property_count': cmp = a.property_count - b.property_count; break;
                default:               cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
            }
            return sortDir === 'asc' ? cmp : -cmp;
        });
    }, [users, searchQuery, sortBy, sortDir]);

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <Loader2 size={24} className="text-accent animate-spin" />
            </div>
        );
    }

    if (filtered.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-dark-500 gap-3">
                <Users size={32} className="text-dark-700" />
                <p className="text-sm">{searchQuery ? 'No customers match your search.' : 'No customers yet.'}</p>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-auto rounded-xl border border-dark-800">
            <table className="w-full text-sm border-collapse">
                <thead className="sticky top-0 bg-dark-900 z-10">
                    <tr className="border-b border-dark-800">
                        <SortHeader label="Email"      field="email"          current={sortBy} dir={sortDir} onSort={setSort} />
                        <th className="px-4 py-3 text-left text-[10px] font-semibold text-dark-400 uppercase tracking-wide">Plan</th>
                        <SortHeader label="Properties" field="property_count" current={sortBy} dir={sortDir} onSort={setSort} />
                        <SortHeader label="License"    field="is_active"      current={sortBy} dir={sortDir} onSort={setSort} />
                        <SortHeader label="Joined"     field="created_at"     current={sortBy} dir={sortDir} onSort={setSort} />
                        <th className="px-4 py-3" />
                    </tr>
                </thead>
                <tbody>
                    {filtered.map((user) => {
                        const isSelected = selectedUserId === user.user_id;
                        return (
                            <tr
                                key={user.user_id}
                                className={`border-b border-dark-800/50 transition-colors ${
                                    isSelected
                                        ? 'bg-accent/5 border-l-2 border-l-accent'
                                        : 'hover:bg-dark-800/40 cursor-pointer'
                                }`}
                                onClick={() => selectUser(isSelected ? null : user.user_id)}
                            >
                                {/* Email */}
                                <td className="px-4 py-3">
                                    <span className="text-sm text-dark-200 truncate max-w-[200px] block">{user.email}</span>
                                </td>

                                {/* Plan */}
                                <td className="px-4 py-3">
                                    <PlanBadge name={user.plan_name} />
                                </td>

                                {/* Properties */}
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                        <span className="text-dark-200">{user.property_count}</span>
                                        <span className="text-dark-600">/</span>
                                        <AdminMaxPropertiesInput userId={user.user_id} value={user.max_properties} />
                                    </div>
                                </td>

                                {/* License toggle */}
                                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                    <AdminLicenseToggle userId={user.user_id} isActive={user.is_active} />
                                </td>

                                {/* Joined */}
                                <td className="px-4 py-3">
                                    <span className="text-xs text-dark-500">
                                        {new Date(user.created_at).toLocaleDateString([], {
                                            year: 'numeric', month: 'short', day: 'numeric',
                                        })}
                                    </span>
                                </td>

                                {/* View */}
                                <td className="px-4 py-3 text-right">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); selectUser(user.user_id); }}
                                        className="text-xs text-accent hover:underline cursor-pointer"
                                    >
                                        View
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
