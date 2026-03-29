import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from './supabaseClient';
import { useAuth } from './useAuth';
import type { HostSettingsRow } from '../types/database';

export const hostSettingsKeys = {
    own: ['host_settings'] as const,
};

async function fetchHostSettings(): Promise<HostSettingsRow | null> {
    const { data, error } = await supabase
        .from('host_settings')
        .select('*')
        .maybeSingle();

    if (error) throw error;
    return data as HostSettingsRow | null;
}

/** Returns the current host's global settings (auto_respond_enabled, etc.) */
export function useHostSettings() {
    const { isAuthenticated } = useAuth();

    const { data, isLoading } = useQuery({
        queryKey: hostSettingsKeys.own,
        queryFn: fetchHostSettings,
        enabled: isAuthenticated,
        staleTime: 1000 * 60 * 5,
    });

    return {
        settings: data ?? null,
        autoRespondEnabled: data?.auto_respond_enabled ?? false,
        isLoading,
    };
}

/** Toggles auto_respond_enabled globally for this host. Upserts the settings row. */
export function useToggleAutoRespond() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: async (enabled: boolean): Promise<HostSettingsRow> => {
            if (!user) throw new Error('Not authenticated');
            const { data, error } = await supabase
                .from('host_settings')
                .upsert({ user_id: user.id, auto_respond_enabled: enabled })
                .select()
                .single();
            if (error) throw error;
            return data as HostSettingsRow;
        },

        onMutate: async (enabled) => {
            await queryClient.cancelQueries({ queryKey: hostSettingsKeys.own });
            const previous = queryClient.getQueryData<HostSettingsRow>(hostSettingsKeys.own);
            queryClient.setQueryData<HostSettingsRow | null>(hostSettingsKeys.own, (old) =>
                old ? { ...old, auto_respond_enabled: enabled } : null,
            );
            return { previous };
        },

        onError: (_err, _enabled, context) => {
            if (context?.previous !== undefined) {
                queryClient.setQueryData(hostSettingsKeys.own, context.previous);
            }
        },

        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: hostSettingsKeys.own });
        },
    });
}
