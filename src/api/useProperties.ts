import { useQuery } from '@tanstack/react-query';
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
