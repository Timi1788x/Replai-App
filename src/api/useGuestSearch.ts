import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from './supabaseClient';
import { useAuth } from './useAuth';
import type { GuestRow } from '../types/database';

// ─── Debounce Hook ────────────────────────────────────────────
function useDebouncedValue(value: string, delayMs: number): string {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delayMs);
        return () => clearTimeout(timer);
    }, [value, delayMs]);

    return debounced;
}

// ─── Fetch ────────────────────────────────────────────────────
async function searchGuests(query: string): Promise<GuestRow[]> {
    const term = `%${query}%`;

    const { data, error } = await supabase
        .from('guests')
        .select('*')
        .or(`display_name.ilike.${term},email.ilike.${term},phone.ilike.${term}`)
        .order('display_name')
        .limit(10);

    if (error) throw error;
    return (data ?? []) as GuestRow[];
}

// ─── Hook ─────────────────────────────────────────────────────

/**
 * Debounced, server-side guest search.
 *
 * Waits 300ms after the user stops typing, then queries Supabase
 * with ilike on display_name, email, and phone. Returns max 10 results.
 *
 * @example
 * const { query, setQuery, results, isLoading } = useGuestSearch();
 */
export function useGuestSearch() {
    const [query, setQuery] = useState('');
    const debouncedQuery = useDebouncedValue(query, 300);
    const { isAuthenticated } = useAuth();

    const { data: results = [], isLoading, isError } = useQuery({
        queryKey: ['guest-search', debouncedQuery],
        queryFn: () => searchGuests(debouncedQuery),
        enabled: isAuthenticated && debouncedQuery.length >= 1,
        staleTime: 1000 * 30, // 30s — search results don't change fast
    });

    return { query, setQuery, results, isLoading, isError, debouncedQuery };
}
