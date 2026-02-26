import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from './supabaseClient';
import type { ConversationRow } from '../types/database';

// ─── Query Key Factory ────────────────────────────────────────
export const conversationKeys = {
    all: ['conversations'] as const,
    detail: (id: string) => ['conversations', id] as const,
};

// ─── Fetch function ───────────────────────────────────────────
async function fetchConversations(): Promise<ConversationRow[]> {
    const { data, error } = await supabase
        .from('conversations')
        .select('*, property:properties(name), guest:guests(display_name, avatar_url)')
        .eq('archived', false)
        .order('last_message_at', { ascending: false });

    if (error) throw error;
    return (data ?? []) as unknown as ConversationRow[];
}


// ─── Hook ─────────────────────────────────────────────────────
/**
 * Fetches all active conversations and subscribes to Supabase
 * Realtime for live updates.
 *
 * INSERT events (new conversation) → invalidate query so full
 * list is refetched in correct sort order.
 *
 * UPDATE events (new message, read status change) → patch the
 * individual row in the cache for instant UI feedback.
 */
export function useConversations() {
    const queryClient = useQueryClient();

    // ── Realtime subscription ──
    useEffect(() => {
        const channel = supabase
            .channel('conversations')
            .on<ConversationRow>(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'conversations',
                },
                () => {
                    // New conversation → refetch to get correct sort order
                    queryClient.invalidateQueries({
                        queryKey: conversationKeys.all,
                    });
                },
            )
            .on<ConversationRow>(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'conversations',
                },
                (payload) => {
                    // Patch the updated row into the cached list
                    queryClient.setQueryData<ConversationRow[]>(
                        conversationKeys.all,
                        (old) =>
                            old?.map((c) =>
                                c.id === payload.new.id ? payload.new : c,
                            ) ?? [],
                    );
                },
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [queryClient]);

    // ── Query ──
    return useQuery({
        queryKey: conversationKeys.all,
        queryFn: fetchConversations,
        staleTime: 1000 * 60,       // 1 min — Realtime keeps it fresh
        refetchOnWindowFocus: true,  // Catch up when tab becomes active
    });
}
