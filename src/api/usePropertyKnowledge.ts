import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from './supabaseClient';
import { useAuth } from './useAuth';
import type { PropertyKnowledgePayload, PropertyKnowledgeRow } from '../types/database';

// ─── Query Keys ───────────────────────────────────────────────
export const propertyKnowledgeKeys = {
    all: ['property-knowledge'] as const,
    detail: (propertyId: string) => ['property-knowledge', propertyId] as const,
};

// ─── Fetch ────────────────────────────────────────────────────
async function fetchPropertyKnowledge(
    propertyId: string,
): Promise<PropertyKnowledgeRow | null> {
    const { data, error } = await supabase
        .from('property_knowledge')
        .select('*')
        .eq('property_id', propertyId)
        .maybeSingle();

    if (error) throw error;
    return data as PropertyKnowledgeRow | null;
}

// ─── Upsert ───────────────────────────────────────────────────
async function upsertPropertyKnowledge(params: {
    property_id: string;
    knowledge_payload: PropertyKnowledgePayload;
}): Promise<PropertyKnowledgeRow> {
    const { data, error } = await supabase
        .from('property_knowledge')
        .upsert(
            {
                property_id: params.property_id,
                knowledge_payload: params.knowledge_payload as unknown as Record<string, unknown>,
            },
            { onConflict: 'property_id' },
        )
        .select()
        .single();

    if (error) throw error;
    return data as unknown as PropertyKnowledgeRow;
}

// ─── Hooks ────────────────────────────────────────────────────

/** Fetch knowledge for a specific property */
export function usePropertyKnowledge(propertyId: string | null) {
    const { isAuthenticated } = useAuth();

    return useQuery({
        queryKey: propertyKnowledgeKeys.detail(propertyId ?? ''),
        queryFn: () => fetchPropertyKnowledge(propertyId!),
        enabled: isAuthenticated && !!propertyId,
    });
}

/** Upsert knowledge payload for a property */
export function useUpsertPropertyKnowledge() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: upsertPropertyKnowledge,
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: propertyKnowledgeKeys.detail(variables.property_id),
            });
        },
    });
}
