import { useQuery } from '@tanstack/react-query';
import { supabase } from './supabaseClient';
import { adminKeys } from './useIsAdmin';
import type { AdminUserRow, AuditLogRow } from '../types/admin';

/**
 * Fetches all users with their license/plan data via the
 * admin_get_all_users() SECURITY DEFINER RPC.
 *
 * Returns empty array if caller is not admin (the RPC silently returns nothing).
 */
export function useAdminUsers(isAdmin: boolean) {
    return useQuery({
        queryKey: adminKeys.users,
        queryFn: async (): Promise<AdminUserRow[]> => {
            const { data, error } = await supabase.rpc('admin_get_all_users');
            if (error) throw error;
            return (data as AdminUserRow[]) ?? [];
        },
        enabled: isAdmin,
        staleTime: 30_000,
    });
}

/**
 * Fetches the last 20 audit log entries for a specific target user.
 * Used in the user detail panel.
 */
export function useAdminAuditLog(userId: string | null) {
    return useQuery({
        queryKey: adminKeys.auditLog(userId ?? ''),
        queryFn: async (): Promise<AuditLogRow[]> => {
            const { data, error } = await supabase
                .from('admin_audit_log')
                .select('*')
                .eq('target_user_id', userId!)
                .order('created_at', { ascending: false })
                .limit(20);
            if (error) throw error;
            return (data as AuditLogRow[]) ?? [];
        },
        enabled: !!userId,
        staleTime: 15_000,
    });
}
