import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from './supabaseClient';
import { messageKeys } from './useMessages';
import type { MessageRow, InsertMessagePayload } from '../types/database';

// ─── Mutation function ────────────────────────────────────────
async function insertMessage(payload: InsertMessagePayload): Promise<MessageRow> {
    const { data, error } = await supabase
        .from('messages')
        .insert(payload)
        .select()
        .single();

    if (error) throw error;
    return data;
}

// ─── Hook ─────────────────────────────────────────────────────
/**
 * Sends a host message by inserting into the Supabase `messages`
 * table with `status: 'pending'`.
 *
 * Optimistic UI: the message appears in the chat immediately as
 * "pending" before the server confirms the insert. On error the
 * optimistic entry is rolled back.
 *
 * Backend Supabase triggers (or n8n) will pick up the pending
 * message and relay it to the appropriate channel.
 */
export function useSendMessage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: InsertMessagePayload) => insertMessage(payload),

        // ── Optimistic update ──────────────────────────────────
        onMutate: async (payload) => {
            const queryKey = messageKeys.byConversation(payload.conversation_id);

            // Cancel any in-flight refetches so they don't overwrite
            await queryClient.cancelQueries({ queryKey });

            // Snapshot current cache for rollback
            const previous = queryClient.getQueryData<MessageRow[]>(queryKey);

            // Optimistically add the new message
            const optimistic: MessageRow = {
                id: `optimistic-${Date.now()}`,
                conversation_id: payload.conversation_id,
                sender: payload.sender,
                body: payload.body,
                external_message_id: null,
                status: 'pending',
                attachments: [],
                ai_draft_reply: null,
                metadata: {},
                created_at: new Date().toISOString(),
            };


            queryClient.setQueryData<MessageRow[]>(queryKey, (old) => [
                ...(old ?? []),
                optimistic,
            ]);

            return { previous, optimisticId: optimistic.id, conversationId: payload.conversation_id };
        },

        // ── Success: replace optimistic entry with real data ───
        onSuccess: (serverMessage, _payload, context) => {
            const queryKey = messageKeys.byConversation(context!.conversationId);
            queryClient.setQueryData<MessageRow[]>(queryKey, (old) =>
                old?.map((m) =>
                    m.id === context?.optimisticId ? serverMessage : m,
                ) ?? [serverMessage],
            );
        },

        // ── Error: rollback ────────────────────────────────────
        onError: (_err, _payload, context) => {
            if (context?.previous) {
                const queryKey = messageKeys.byConversation(context.conversationId);
                queryClient.setQueryData(queryKey, context.previous);
            }
        },

        // ── Always refetch to ensure consistency ───────────────
        onSettled: (_data, _error, _payload, context) => {
            if (context?.conversationId) {
                const queryKey = messageKeys.byConversation(context.conversationId);
                queryClient.invalidateQueries({ queryKey });
            }
        },
    });
}
