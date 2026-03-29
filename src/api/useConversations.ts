import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from './supabaseClient';
import { useAuth } from './useAuth';
import { useChatStore } from '../store/useChatStore';
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
    const { isAuthenticated } = useAuth();

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
                    // Realtime payloads only contain the table columns (no joins).
                    // We must merge the updated fields into the existing cached row
                    // to preserve the `property` and `guest` relation objects.
                    const selectedChatId = useChatStore.getState().selectedChatId;
                    const isSelected = payload.new.id === selectedChatId;

                    queryClient.setQueryData<ConversationRow[]>(
                        conversationKeys.all,
                        (old) => {
                            if (!old) return [];
                            const updated = old.map((c) => {
                                if (c.id === payload.new.id) {
                                    // Keep existing relations, overwrite primitive columns,
                                    // and ensure boolean values are correctly parsed (Postgres sometimes sends 't'/'f')
                                    const parsedUnread =
                                        typeof payload.new.unread === 'string'
                                            ? payload.new.unread === 't'
                                            : !!payload.new.unread;

                                    return {
                                        ...c,
                                        ...payload.new,
                                        // Suppress unread status if the user is already viewing this conversation
                                        unread: isSelected ? false : parsedUnread,
                                        unread_count: isSelected ? 0 : (payload.new.unread_count ?? c.unread_count),
                                        property: c.property,
                                        guest: c.guest
                                    };
                                }
                                return c;
                            });
                            // Re-sort by last_message_at so new messages bubble conversations to the top
                            return updated.sort((a, b) =>
                                new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
                            );
                        }
                    );

                    // If the user is viewing this conversation, tell the server it's read
                    if (isSelected && payload.new.unread) {
                        supabase
                            .from('conversations')
                            .update({ unread_count: 0, unread: false })
                            .eq('id', payload.new.id)
                            .then();
                    }
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
        enabled: isAuthenticated,   // Don't fetch until authenticated
        staleTime: 1000 * 60,       // 1 min — Realtime keeps it fresh
        refetchOnWindowFocus: true,  // Catch up when tab becomes active
    });
}
