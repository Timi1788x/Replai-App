import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from './supabaseClient';
import { messageKeys } from './useMessages';
import { conversationKeys } from './useConversations';
import type {
    MessageRow,
    ConversationRow,
    Attachment,
    SendMessagePayload,
    MarkAsReadPayload,
    UpdateDraftPayload,
    DeleteMessagePayload,
    PauseAutoRespondPayload,
} from '../types/database';

// ══════════════════════════════════════════════════════════════
// useSendMessage
// ══════════════════════════════════════════════════════════════

/**
 * Sends a host message by inserting into the Supabase `messages`
 * table with `status: 'pending'`.
 *
 * Accepts `conversation_id`, `message_text`, and an optional
 * `attachment_url`.
 *
 * Optimistic UI:
 *  1. Injects a synthetic pending message into the messages cache.
 *  2. Patches the conversations cache so the chat list shows the
 *     new message text / timestamp immediately.
 *
 * On success the optimistic entry is swapped for the real server
 * row; on error it is rolled back to the previous snapshot.
 */
export function useSendMessage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: SendMessagePayload): Promise<MessageRow> => {
            // Build the attachments JSONB array
            const attachments: Attachment[] = payload.attachment_url
                ? [{
                    type: 'file',
                    url: payload.attachment_url,
                    filename: payload.attachment_url.split('/').pop() ?? 'attachment',
                }]
                : [];

            const { data, error } = await supabase
                .from('messages')
                .insert({
                    conversation_id: payload.conversation_id,
                    sender: 'host' as const,
                    body: payload.message_text,
                    status: 'pending' as const,
                    attachments,
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        },

        // ── Optimistic update ──────────────────────────────────
        onMutate: async (payload) => {
            const msgKey = messageKeys.byConversation(payload.conversation_id);
            const convKey = conversationKeys.all;

            // Cancel in-flight refetches so they don't overwrite
            await queryClient.cancelQueries({ queryKey: msgKey });
            await queryClient.cancelQueries({ queryKey: convKey });

            // Snapshot current caches for rollback
            const previousMessages = queryClient.getQueryData<MessageRow[]>(msgKey);
            const previousConversations = queryClient.getQueryData<ConversationRow[]>(convKey);

            // Build optimistic message
            const now = new Date().toISOString();
            const optimistic: MessageRow = {
                id: `optimistic-${Date.now()}`,
                conversation_id: payload.conversation_id,
                sender: 'host',
                body: payload.message_text,
                external_message_id: null,
                status: 'pending',
                attachments: payload.attachment_url
                    ? [{
                        type: 'file',
                        url: payload.attachment_url,
                        filename: payload.attachment_url.split('/').pop() ?? 'attachment',
                    }]
                    : [],
                ai_draft_reply: null,
                metadata: {},
                created_at: now,
            };

            // Inject into messages cache
            queryClient.setQueryData<MessageRow[]>(msgKey, (old) => [
                ...(old ?? []),
                optimistic,
            ]);

            // Patch conversations cache (chat list preview)
            queryClient.setQueryData<ConversationRow[]>(convKey, (old) =>
                old?.map((c) =>
                    c.id === payload.conversation_id
                        ? { ...c, last_message: payload.message_text, last_message_at: now }
                        : c,
                ) ?? [],
            );

            return {
                previousMessages,
                previousConversations,
                optimisticId: optimistic.id,
                conversationId: payload.conversation_id,
            };
        },

        // ── Success: swap optimistic entry with real data ──────
        onSuccess: (serverMessage, _payload, context) => {
            if (!context) return;
            const msgKey = messageKeys.byConversation(context.conversationId);
            queryClient.setQueryData<MessageRow[]>(msgKey, (old) =>
                old?.map((m) =>
                    m.id === context.optimisticId ? serverMessage : m,
                ) ?? [serverMessage],
            );
        },

        // ── Error: rollback ────────────────────────────────────
        onError: (_err, _payload, context) => {
            if (!context) return;
            const msgKey = messageKeys.byConversation(context.conversationId);
            if (context.previousMessages !== undefined) {
                queryClient.setQueryData(msgKey, context.previousMessages);
            }
            if (context.previousConversations !== undefined) {
                queryClient.setQueryData(conversationKeys.all, context.previousConversations);
            }
        },

        // ── Refetch messages to ensure consistency ────────────────
        // Only invalidate messages, not conversations — a blanket conversation
        // refetch races with realtime and can overwrite unread statuses.
        onSettled: (_data, _error, _payload, context) => {
            if (!context) return;
            queryClient.invalidateQueries({
                queryKey: messageKeys.byConversation(context.conversationId),
            });
        },
    });
}

// ══════════════════════════════════════════════════════════════
// useMarkAsRead
// ══════════════════════════════════════════════════════════════

/**
 * Marks a conversation as read by setting `unread_count: 0` and
 * `unread: false` in Supabase.
 *
 * Optimistic UI: the conversation's badge disappears instantly
 * before the server round-trip completes.
 */
export function useMarkAsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: MarkAsReadPayload): Promise<ConversationRow> => {
            const { data, error } = await supabase
                .from('conversations')
                .update({ unread_count: 0, unread: false })
                .eq('id', payload.conversation_id)
                .select('*, property:properties(name), guest:guests(display_name, avatar_url)')
                .single();

            if (error) throw error;
            return data as unknown as ConversationRow;
        },

        // ── Optimistic update ──────────────────────────────────
        onMutate: async (payload) => {
            const convKey = conversationKeys.all;
            await queryClient.cancelQueries({ queryKey: convKey });

            const previousConversations = queryClient.getQueryData<ConversationRow[]>(convKey);

            queryClient.setQueryData<ConversationRow[]>(convKey, (old) =>
                old?.map((c) =>
                    c.id === payload.conversation_id
                        ? { ...c, unread: false, unread_count: 0 }
                        : c,
                ) ?? [],
            );

            return { previousConversations, conversationId: payload.conversation_id };
        },

        // ── Success: patch with server row ─────────────────────
        onSuccess: (serverConversation, _payload, context) => {
            if (!context) return;
            queryClient.setQueryData<ConversationRow[]>(
                conversationKeys.all,
                (old) =>
                    old?.map((c) =>
                        c.id === context.conversationId ? serverConversation : c,
                    ) ?? [],
            );
        },

        // ── Error: rollback + refetch ───────────────────────────
        onError: (_err, _payload, context) => {
            if (context?.previousConversations !== undefined) {
                queryClient.setQueryData(conversationKeys.all, context.previousConversations);
            }
            queryClient.invalidateQueries({ queryKey: conversationKeys.all });
        },

        // NOTE: no onSettled refetch — optimistic update + onSuccess + realtime
        // keep the cache correct. A blanket refetch races with realtime and can
        // overwrite incoming unread statuses for OTHER conversations.
    });
}

// ══════════════════════════════════════════════════════════════
// useUpdateDraft
// ══════════════════════════════════════════════════════════════

/**
 * Updates the AI draft reply for a conversation when the host
 * edits the suggestion before sending.
 *
 * Writes `ai_draft_reply` and sets `ai_draft_status: 'edited'`
 * on the conversations table.
 *
 * Optimistic UI: the draft text updates instantly in the local
 * cache so the host sees their edits reflected without delay.
 */
export function useUpdateDraft() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: UpdateDraftPayload): Promise<ConversationRow> => {
            const { data, error } = await supabase
                .from('conversations')
                .update({
                    ai_draft_reply: payload.edited_text,
                    ai_draft_status: 'edited' as const,
                })
                .eq('id', payload.conversation_id)
                .select('*, property:properties(name), guest:guests(display_name, avatar_url)')
                .single();

            if (error) throw error;
            return data as unknown as ConversationRow;
        },

        // ── Optimistic update ──────────────────────────────────
        onMutate: async (payload) => {
            const convKey = conversationKeys.all;
            await queryClient.cancelQueries({ queryKey: convKey });

            const previousConversations = queryClient.getQueryData<ConversationRow[]>(convKey);

            queryClient.setQueryData<ConversationRow[]>(convKey, (old) =>
                old?.map((c) =>
                    c.id === payload.conversation_id
                        ? { ...c, ai_draft_reply: payload.edited_text, ai_draft_status: 'edited' as const }
                        : c,
                ) ?? [],
            );

            return { previousConversations, conversationId: payload.conversation_id };
        },

        // ── Success: patch with server row ─────────────────────
        onSuccess: (serverConversation, _payload, context) => {
            if (!context) return;
            queryClient.setQueryData<ConversationRow[]>(
                conversationKeys.all,
                (old) =>
                    old?.map((c) =>
                        c.id === context.conversationId ? serverConversation : c,
                    ) ?? [],
            );
        },

        // ── Error: rollback ────────────────────────────────────
        onError: (_err, _payload, context) => {
            if (context?.previousConversations !== undefined) {
                queryClient.setQueryData(conversationKeys.all, context.previousConversations);
            }
        },

        // ── Always refetch ─────────────────────────────────────
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: conversationKeys.all });
        },
    });
}

// ══════════════════════════════════════════════════════════════
// usePauseAutoRespond
// ══════════════════════════════════════════════════════════════

/**
 * Pauses auto-respond for a conversation for `duration_seconds`.
 *
 * Sets `auto_respond_paused_until` to now + duration. The
 * AiDraftBanner will switch back to manual-approve mode until
 * the timestamp expires or n8n calls auto_send_draft() first.
 *
 * Optimistic UI: the conversation's paused_until is set instantly.
 */
export function usePauseAutoRespond() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: PauseAutoRespondPayload): Promise<void> => {
            const pausedUntil = new Date(
                Date.now() + payload.duration_seconds * 1000,
            ).toISOString();
            const { error } = await supabase
                .from('conversations')
                .update({ auto_respond_paused_until: pausedUntil })
                .eq('id', payload.conversation_id);
            if (error) throw error;
        },

        onMutate: async (payload) => {
            const convKey = conversationKeys.all;
            await queryClient.cancelQueries({ queryKey: convKey });

            const previous = queryClient.getQueryData<ConversationRow[]>(convKey);
            const pausedUntil = new Date(
                Date.now() + payload.duration_seconds * 1000,
            ).toISOString();

            queryClient.setQueryData<ConversationRow[]>(convKey, (old) =>
                old?.map((c) =>
                    c.id === payload.conversation_id
                        ? { ...c, auto_respond_paused_until: pausedUntil }
                        : c,
                ) ?? [],
            );

            return { previous };
        },

        onError: (_err, _payload, context) => {
            if (context?.previous !== undefined) {
                queryClient.setQueryData(conversationKeys.all, context.previous);
            }
        },

        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: conversationKeys.all });
        },
    });
}

// ══════════════════════════════════════════════════════════════
// useDeleteMessage
// ══════════════════════════════════════════════════════════════

/**
 * Deletes a host-sent message from the `messages` table.
 *
 * Optimistic UI: the message is removed from the cache immediately.
 * On error it is restored. On settle, both message and conversation
 * caches are invalidated so the chat list preview stays accurate.
 *
 * Only call this for host messages — guest messages must not be deleted.
 */
export function useDeleteMessage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: DeleteMessagePayload): Promise<void> => {
            const { error } = await supabase
                .from('messages')
                .delete()
                .eq('id', payload.message_id);
            if (error) throw error;
        },

        // ── Optimistic update ──────────────────────────────────
        onMutate: async (payload) => {
            const msgKey = messageKeys.byConversation(payload.conversation_id);
            await queryClient.cancelQueries({ queryKey: msgKey });

            const previousMessages = queryClient.getQueryData<MessageRow[]>(msgKey);

            queryClient.setQueryData<MessageRow[]>(msgKey, (old) =>
                old?.filter((m) => m.id !== payload.message_id) ?? [],
            );

            return { previousMessages, conversationId: payload.conversation_id };
        },

        // ── Error: restore the removed message ─────────────────
        onError: (_err, _payload, context) => {
            if (!context) return;
            if (context.previousMessages !== undefined) {
                queryClient.setQueryData(
                    messageKeys.byConversation(context.conversationId),
                    context.previousMessages,
                );
            }
        },

        // ── Refetch both caches so last_message preview updates ─
        onSettled: (_data, _error, _payload, context) => {
            if (!context) return;
            queryClient.invalidateQueries({
                queryKey: messageKeys.byConversation(context.conversationId),
            });
            queryClient.invalidateQueries({ queryKey: conversationKeys.all });
        },
    });
}
