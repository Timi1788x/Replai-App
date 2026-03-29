import { Loader2 } from 'lucide-react';
import { useAdminAuditLog } from '../../api/useAdminUsers';
import type { AuditLogRow } from '../../types/admin';

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
    'license.activate':           { label: 'Activated',       color: 'text-emerald-400' },
    'license.deactivate':         { label: 'Deactivated',     color: 'text-red-400' },
    'license.set_max_properties': { label: 'Properties limit', color: 'text-blue-400' },
    'license.set_notes':          { label: 'Notes updated',   color: 'text-dark-300' },
};

function AuditEntry({ entry }: { entry: AuditLogRow }) {
    const meta = ACTION_LABELS[entry.action] ?? { label: entry.action, color: 'text-dark-400' };
    return (
        <div className="flex items-start justify-between py-2 border-b border-dark-800 last:border-0 gap-4">
            <div className="min-w-0">
                <span className={`text-xs font-medium ${meta.color}`}>{meta.label}</span>
                {entry.after_value && (
                    <p className="text-[10px] text-dark-500 mt-0.5 font-mono truncate">
                        {JSON.stringify(entry.after_value)}
                    </p>
                )}
            </div>
            <time className="text-[10px] text-dark-500 shrink-0">
                {new Date(entry.created_at).toLocaleString([], {
                    month: 'short', day: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                })}
            </time>
        </div>
    );
}

export default function AdminAuditLogSection({ userId }: { userId: string }) {
    const { data: entries = [], isLoading } = useAdminAuditLog(userId);

    return (
        <div>
            <h4 className="text-xs font-semibold text-dark-400 uppercase tracking-wide mb-3">
                Audit Log
            </h4>
            {isLoading ? (
                <div className="flex justify-center py-4">
                    <Loader2 size={16} className="text-accent animate-spin" />
                </div>
            ) : entries.length === 0 ? (
                <p className="text-xs text-dark-500 py-2">No actions recorded yet.</p>
            ) : (
                <div>
                    {entries.map((e) => <AuditEntry key={e.id} entry={e} />)}
                </div>
            )}
        </div>
    );
}
