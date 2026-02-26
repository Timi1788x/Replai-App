import { useMutation } from '@tanstack/react-query';
import type { KnowledgeBaseSyncPayload } from '../types/database';

const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL as string;

// ─── Mutation function ────────────────────────────────────────
async function syncKnowledgeBase(
    payload: KnowledgeBaseSyncPayload,
): Promise<{ success: boolean }> {
    if (!N8N_WEBHOOK_URL) {
        throw new Error(
            '[Antigravity] VITE_N8N_WEBHOOK_URL is not set. ' +
            'Cannot sync knowledge base.',
        );
    }

    const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error(
            `Knowledge base sync failed: ${response.status} ${response.statusText}`,
        );
    }

    return response.json();
}

// ─── Hook ─────────────────────────────────────────────────────
/**
 * The ONLY direct call to n8n in the entire app.
 *
 * POSTs the property knowledge-base payload (Wi-Fi, rules, etc.)
 * to an n8n webhook that processes and updates our AI vector store.
 */
export function useSyncKnowledgeBase() {
    return useMutation({
        mutationFn: syncKnowledgeBase,
    });
}
