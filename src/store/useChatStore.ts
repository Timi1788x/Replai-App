import { create } from 'zustand';
import type { ChannelType } from '../types/database';

// ─── Filter types ─────────────────────────────────────────────
export interface ChatFilters {
    channel: ChannelType | 'all';
    unread: boolean | null;
    property: string | 'all';
    date: 'newest' | 'oldest';
}

interface ChatStore {
    selectedChatId: string | null;
    filters: ChatFilters;

    selectChat: (id: string) => void;
    setFilter: <K extends keyof ChatFilters>(key: K, value: ChatFilters[K]) => void;
    resetFilters: () => void;
}

const defaultFilters: ChatFilters = {
    channel: 'all',
    unread: null,
    property: 'all',
    date: 'newest',
};

/**
 * Thin Zustand store — handles selection and filter state only.
 * All data comes from Supabase via React Query hooks.
 */
export const useChatStore = create<ChatStore>((set) => ({
    selectedChatId: null,
    filters: { ...defaultFilters },

    selectChat: (id) => set({ selectedChatId: id }),

    setFilter: (key, value) =>
        set((state) => ({
            filters: { ...state.filters, [key]: value },
        })),

    resetFilters: () => set({ filters: { ...defaultFilters } }),
}));
