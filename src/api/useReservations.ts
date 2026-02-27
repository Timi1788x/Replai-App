import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from './supabaseClient';
import { useAuth } from './useAuth';
import type { ReservationRow } from '../types/database';

// ─── Query Key Factory ────────────────────────────────────────
export const reservationKeys = {
    all: ['reservations'] as const,
};

// ─── Fetch function ───────────────────────────────────────────
async function fetchReservations(): Promise<ReservationRow[]> {
    const { data, error } = await supabase
        .from('reservations')
        .select('*, property:properties(name), guest:guests(display_name, avatar_url)')
        .order('check_in', { ascending: true });

    if (error) throw error;
    return (data ?? []) as unknown as ReservationRow[];
}

// ─── Hook ─────────────────────────────────────────────────────
/**
 * Fetches all reservations with joined property/guest names
 * and subscribes to Supabase Realtime for live updates.
 */
export function useReservations() {
    const queryClient = useQueryClient();
    const { isAuthenticated } = useAuth();

    // ── Realtime subscription ──
    useEffect(() => {
        const channel = supabase
            .channel('reservations')
            .on<ReservationRow>(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'reservations',
                },
                () => {
                    queryClient.invalidateQueries({
                        queryKey: reservationKeys.all,
                    });
                },
            )
            .on<ReservationRow>(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'reservations',
                },
                () => {
                    queryClient.invalidateQueries({
                        queryKey: reservationKeys.all,
                    });
                },
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [queryClient]);

    // ── Query ──
    return useQuery({
        queryKey: reservationKeys.all,
        queryFn: fetchReservations,
        enabled: isAuthenticated,
        staleTime: 1000 * 60 * 5, // 5 min — calendar data rarely changes
        refetchOnWindowFocus: true,
    });
}
