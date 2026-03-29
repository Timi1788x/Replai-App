import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from './supabaseClient';
import { useAuth } from './useAuth';
import type { PropertyRow } from '../types/database';

export const propertyKeys = {
    all: ['properties'] as const,
};

async function fetchProperties(): Promise<PropertyRow[]> {
    const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('name');

    if (error) throw error;
    return (data ?? []) as PropertyRow[];
}

export interface CreatePropertyPayload {
    name: string;
    address?: string;
    timezone?: string;
}

/** Fetch all properties for the authenticated host */
export function useProperties() {
    const { isAuthenticated } = useAuth();

    return useQuery({
        queryKey: propertyKeys.all,
        queryFn: fetchProperties,
        enabled: isAuthenticated,
        staleTime: 1000 * 60 * 5, // 5 min
    });
}

/** Insert a new property for the authenticated host. */
export function useCreateProperty() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: async (payload: CreatePropertyPayload): Promise<PropertyRow> => {
            if (!user) throw new Error('Not authenticated');
            const { data, error } = await supabase
                .from('properties')
                .insert({
                    host_id: user.id,
                    name: payload.name.trim(),
                    address: payload.address?.trim() || null,
                    timezone: payload.timezone?.trim() || 'Europe/Zurich',
                    metadata: {},
                })
                .select()
                .single();
            if (error) throw error;
            return data as PropertyRow;
        },

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: propertyKeys.all });
        },
    });
}
