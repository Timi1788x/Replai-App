import { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';
import { useAdminStore } from '../../store/useAdminStore';
import { useAdminUsers } from '../../api/useAdminUsers';
import { useSetNotes } from '../../api/useAdminMutations';
import { useIsAdmin } from '../../api/useIsAdmin';
import AdminLicenseToggle from './AdminLicenseToggle';
import AdminMaxPropertiesInput from './AdminMaxPropertiesInput';
import AdminAuditLogSection from './AdminAuditLogSection';

function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);
    const copy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };
    return (
        <button onClick={copy} className="text-dark-500 hover:text-dark-300 transition-colors cursor-pointer">
            {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
        </button>
    );
}

function PlanBadge({ name }: { name: string }) {
    const colors: Record<string, string> = {
        free: 'bg-dark-700 text-dark-300',
        starter: 'bg-blue-500/15 text-blue-400',
        pro: 'bg-accent/15 text-accent',
    };
    return (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${colors[name] ?? 'bg-dark-700 text-dark-400'}`}>
            {name}
        </span>
    );
}

export default function AdminUserDetailPanel() {
    const { selectedUserId, selectUser } = useAdminStore();
    const { isAdmin } = useIsAdmin();
    const { data: users = [] } = useAdminUsers(isAdmin);
    const { mutate: setNotes } = useSetNotes();

    const user = users.find((u) => u.user_id === selectedUserId);

    const [notesDraft, setNotesDraft] = useState<string | null>(null);

    if (!user) return null;

    const notesValue = notesDraft ?? user.notes ?? '';

    const handleNotesBlur = () => {
        if (notesDraft !== null && notesDraft !== user.notes) {
            setNotes({ target_user_id: user.user_id, notes: notesDraft });
        }
        setNotesDraft(null);
    };

    return (
        <aside className="w-96 border-l border-dark-800 bg-dark-900 flex flex-col overflow-hidden shrink-0">
            {/* Panel header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-dark-800">
                <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{user.email}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] text-dark-500 font-mono">
                            {user.user_id.slice(0, 12)}…
                        </span>
                        <CopyButton text={user.user_id} />
                    </div>
                </div>
                <button
                    onClick={() => selectUser(null)}
                    className="text-dark-500 hover:text-dark-200 transition-colors cursor-pointer p-1"
                >
                    <X size={16} />
                </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">

                {/* License */}
                <section className="space-y-3">
                    <h4 className="text-xs font-semibold text-dark-400 uppercase tracking-wide">License</h4>

                    <div className="bg-dark-800 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-dark-400">Status</span>
                            <div className="flex items-center gap-2">
                                <span className={`text-xs font-medium ${user.is_active ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {user.is_active ? 'Active' : 'Inactive'}
                                </span>
                                <AdminLicenseToggle userId={user.user_id} isActive={user.is_active} />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-xs text-dark-400">Plan</span>
                            <PlanBadge name={user.plan_name} />
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-xs text-dark-400">Max properties</span>
                            <AdminMaxPropertiesInput userId={user.user_id} value={user.max_properties} />
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-xs text-dark-400">Properties used</span>
                            <span className="text-xs text-dark-200">{user.property_count}</span>
                        </div>

                        {user.expires_at && (
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-dark-400">Expires</span>
                                <span className="text-xs text-dark-200">
                                    {new Date(user.expires_at).toLocaleDateString()}
                                </span>
                            </div>
                        )}

                        {user.activated_at && (
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-dark-400">Activated</span>
                                <span className="text-xs text-dark-200">
                                    {new Date(user.activated_at).toLocaleDateString()}
                                </span>
                            </div>
                        )}
                    </div>
                </section>

                {/* Notes */}
                <section className="space-y-2">
                    <h4 className="text-xs font-semibold text-dark-400 uppercase tracking-wide">
                        Internal Notes
                    </h4>
                    <textarea
                        value={notesValue}
                        onChange={(e) => setNotesDraft(e.target.value)}
                        onBlur={handleNotesBlur}
                        placeholder="Add notes about this customer…"
                        rows={3}
                        className="w-full bg-dark-800 text-dark-200 text-xs rounded-xl px-3 py-2.5 border border-dark-700 outline-none focus:border-accent/50 resize-none placeholder:text-dark-600 transition-colors"
                    />
                    <p className="text-[10px] text-dark-600">Saved on blur. Visible only to admins.</p>
                </section>

                {/* Account info */}
                <section className="space-y-2">
                    <h4 className="text-xs font-semibold text-dark-400 uppercase tracking-wide">Account</h4>
                    <div className="bg-dark-800 rounded-xl p-4 space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-dark-400">Joined</span>
                            <span className="text-xs text-dark-200">
                                {new Date(user.created_at).toLocaleDateString()}
                            </span>
                        </div>
                        <div className="flex items-start justify-between gap-2">
                            <span className="text-xs text-dark-400">User ID</span>
                            <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-dark-400 font-mono">{user.user_id.slice(0, 16)}…</span>
                                <CopyButton text={user.user_id} />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Audit log */}
                <section>
                    <AdminAuditLogSection userId={user.user_id} />
                </section>
            </div>
        </aside>
    );
}
