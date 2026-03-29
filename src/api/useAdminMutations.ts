import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from './supabaseClient';
import { adminKeys } from './useIsAdmin';
import type {
    AdminUserRow,
    SetLicenseActivePayload,
    SetMaxPropertiesPayload,
    SetNotesPayload,
} from '../types/admin';

// ══════════════════════════════════════════════════════════════
// useSetLicenseActive
// ══════════════════════════════════════════════════════════════

export function useSetLicenseActive() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: SetLicenseActivePayload): Promise<void> => {
            const { error } = await supabase.rpc('admin_set_license_active', {
                p_target_user_id: payload.target_user_id,
                p_is_active: payload.is_active,
            });
            if (error) throw error;
        },

        onMutate: async (payload) => {
            await queryClient.cancelQueries({ queryKey: adminKeys.users });
            const previous = queryClient.getQueryData<AdminUserRow[]>(adminKeys.users);

            queryClient.setQueryData<AdminUserRow[]>(adminKeys.users, (old) =>
                old?.map((u) =>
                    u.user_id === payload.target_user_id
                        ? { ...u, is_active: payload.is_active }
                        : u,
                ) ?? [],
            );

            return { previous };
        },

        onError: (_err, _payload, context) => {
            if (context?.previous !== undefined) {
                queryClient.setQueryData(adminKeys.users, context.previous);
            }
        },

        onSettled: (_data, _err, payload) => {
            queryClient.invalidateQueries({ queryKey: adminKeys.users });
            queryClient.invalidateQueries({
                queryKey: adminKeys.auditLog(payload.target_user_id),
            });
        },
    });
}

// ══════════════════════════════════════════════════════════════
// useSetMaxProperties
// ══════════════════════════════════════════════════════════════

export function useSetMaxProperties() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: SetMaxPropertiesPayload): Promise<void> => {
            const { error } = await supabase.rpc('admin_set_max_properties', {
                p_target_user_id: payload.target_user_id,
                p_max_properties: payload.max_properties,
            });
            if (error) throw error;
        },

        onMutate: async (payload) => {
            await queryClient.cancelQueries({ queryKey: adminKeys.users });
            const previous = queryClient.getQueryData<AdminUserRow[]>(adminKeys.users);

            queryClient.setQueryData<AdminUserRow[]>(adminKeys.users, (old) =>
                old?.map((u) =>
                    u.user_id === payload.target_user_id
                        ? { ...u, max_properties: payload.max_properties }
                        : u,
                ) ?? [],
            );

            return { previous };
        },

        onError: (_err, _payload, context) => {
            if (context?.previous !== undefined) {
                queryClient.setQueryData(adminKeys.users, context.previous);
            }
        },

        onSettled: (_data, _err, payload) => {
            queryClient.invalidateQueries({ queryKey: adminKeys.users });
            queryClient.invalidateQueries({
                queryKey: adminKeys.auditLog(payload.target_user_id),
            });
        },
    });
}

// ══════════════════════════════════════════════════════════════
// useSetNotes
// ══════════════════════════════════════════════════════════════

export function useSetNotes() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: SetNotesPayload): Promise<void> => {
            const { error } = await supabase.rpc('admin_set_notes', {
                p_target_user_id: payload.target_user_id,
                p_notes: payload.notes,
            });
            if (error) throw error;
        },

        onSettled: (_data, _err, payload) => {
            queryClient.invalidateQueries({ queryKey: adminKeys.users });
            queryClient.invalidateQueries({
                queryKey: adminKeys.auditLog(payload.target_user_id),
            });
        },
    });
}
