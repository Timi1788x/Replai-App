import { useQuery } from '@tanstack/react-query';
import { supabase } from './supabaseClient';
import { useAuth } from './useAuth';

export const adminKeys = {
    isAdmin: ['admin', 'is_admin'] as const,
    users: ['admin', 'users'] as const,
    auditLog: (userId: string) => ['admin', 'audit_log', userId] as const,
};

/**
 * Checks whether the current user is an admin by calling the
 * is_admin() SECURITY DEFINER RPC — never trusts JWT claims alone.
 *
 * Cached for 10 minutes (admin status rarely changes mid-session).
 * Returns false while loading so UI defaults to non-admin.
 */
export function useIsAdmin() {
    const { user, isAuthenticated, loading: authLoading } = useAuth();

    const { data, isLoading: queryLoading } = useQuery({
        queryKey: adminKeys.isAdmin,
        queryFn: async (): Promise<boolean> => {
            if (!user) return false;
            const { data, error } = await supabase.rpc('is_admin', { uid: user.id });
            if (error) throw error;
            return data === true;
        },
        // Only fire once auth has fully resolved — prevents a false `isAdmin: false`
        // while the session is still being read from storage.
        enabled: !authLoading && isAuthenticated,
        staleTime: 10 * 60 * 1000,
        retry: false,
    });

    return {
        isAdmin: data ?? false,
        // Still loading if auth hasn't resolved OR the RPC is in flight.
        isLoading: authLoading || queryLoading,
    };
}
