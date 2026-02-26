import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from './supabaseClient';
import type { MessageRow } from '../types/database';

// ─── Query Key Factory ────────────────────────────────────────
export const messageKeys = {
    all: ['messages'] as const,
    byConversation: (conversationId: string) =>
        ['messages', conversationId] as const,
};

// ─── Fetch function ───────────────────────────────────────────
async function fetchMessages(conversationId: string): Promise<MessageRow[]> {
    const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

    if (error) throw error;
    return data ?? [];
}

// ─── Hook ─────────────────────────────────────────────────────
/**
 * Fetches the chronological list of messages for a conversation
 * and subscribes to Supabase Realtime for live updates.
 *
 * When a new message arrives via Realtime (e.g. guest reply
 * processed by n8n), it is immediately pushed into the React
 * Query cache — no polling required.
 */
export function useMessages(conversationId: string | null) {
    const queryClient = useQueryClient();

    // ── Realtime subscription ──
    useEffect(() => {
        if (!conversationId) return;

        const channel = supabase
            .channel(`messages:${conversationId}`)
            .on<MessageRow>(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${conversationId}`,
                },
                (payload) => {
                    // Push the new message directly into the cache
                    queryClient.setQueryData<MessageRow[]>(
                        messageKeys.byConversation(conversationId),
                        (old) => {
                            if (!old) return [payload.new];
                            // Avoid duplicates (optimistic update may already exist)
                            const exists = old.some((m) => m.id === payload.new.id);
                            return exists ? old : [...old, payload.new];
                        },
                    );
                },
            )
            .on<MessageRow>(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${conversationId}`,
                },
                (payload) => {
                    // Update existing message in cache (e.g. status change)
                    queryClient.setQueryData<MessageRow[]>(
                        messageKeys.byConversation(conversationId),
                        (old) =>
                            old?.map((m) =>
                                m.id === payload.new.id ? payload.new : m,
                            ) ?? [],
                    );
                },
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [conversationId, queryClient]);

    // ── Query ──
    return useQuery({
        queryKey: messageKeys.byConversation(conversationId ?? '__none__'),
        queryFn: () => fetchMessages(conversationId!),
        enabled: !!conversationId,
        staleTime: 1000 * 60,       // 1 min — Realtime keeps it fresh
        refetchOnWindowFocus: false, // Realtime handles live updates
    });
}
