import { create } from 'zustand';
import type { Chat, ChatFilters } from '../types/chat';
import { mockChats } from '../data/mockChats';

interface ChatStore {
    chats: Chat[];
    selectedChatId: string | null;
    filters: ChatFilters;

    selectChat: (id: string) => void;
    setFilter: <K extends keyof ChatFilters>(key: K, value: ChatFilters[K]) => void;
    resetFilters: () => void;

    approveAiDraft: (chatId: string) => void;
    editAiDraft: (chatId: string, newText: string) => void;
    deleteAiDraft: (chatId: string) => void;
    sendMessage: (chatId: string, text: string) => void;

    getFilteredChats: () => Chat[];
}

const defaultFilters: ChatFilters = {
    channel: 'all',
    unread: null,
    property: 'all',
    date: 'newest',
};

export const useChatStore = create<ChatStore>((set, get) => ({
    chats: mockChats,
    selectedChatId: null,
    filters: { ...defaultFilters },

    selectChat: (id) =>
        set((state) => ({
            selectedChatId: id,
            chats: state.chats.map((c) =>
                c.id === id ? { ...c, unread: false, unreadCount: 0 } : c
            ),
        })),

    setFilter: (key, value) =>
        set((state) => ({
            filters: { ...state.filters, [key]: value },
        })),

    resetFilters: () => set({ filters: { ...defaultFilters } }),

    approveAiDraft: (chatId) =>
        set((state) => ({
            chats: state.chats.map((c) =>
                c.id === chatId && c.aiDraft
                    ? {
                        ...c,
                        aiDraft: { ...c.aiDraft, status: 'approved' as const },
                        messages: [
                            ...c.messages,
                            {
                                id: `msg-${Date.now()}`,
                                sender: 'host' as const,
                                text: c.aiDraft.text,
                                timestamp: new Date().toISOString(),
                            },
                        ],
                        lastMessage: c.aiDraft.text,
                        timestamp: new Date().toISOString(),
                    }
                    : c
            ),
        })),

    editAiDraft: (chatId, newText) =>
        set((state) => ({
            chats: state.chats.map((c) =>
                c.id === chatId && c.aiDraft
                    ? { ...c, aiDraft: { ...c.aiDraft, text: newText, status: 'edited' as const } }
                    : c
            ),
        })),

    deleteAiDraft: (chatId) =>
        set((state) => ({
            chats: state.chats.map((c) =>
                c.id === chatId ? { ...c, aiDraft: null } : c
            ),
        })),

    sendMessage: (chatId, text) =>
        set((state) => ({
            chats: state.chats.map((c) =>
                c.id === chatId
                    ? {
                        ...c,
                        messages: [
                            ...c.messages,
                            {
                                id: `msg-${Date.now()}`,
                                sender: 'host' as const,
                                text,
                                timestamp: new Date().toISOString(),
                            },
                        ],
                        lastMessage: text,
                        timestamp: new Date().toISOString(),
                    }
                    : c
            ),
        })),

    getFilteredChats: () => {
        const { chats, filters } = get();
        let filtered = [...chats];

        if (filters.channel !== 'all') {
            filtered = filtered.filter((c) => c.channel === filters.channel);
        }

        if (filters.unread !== null) {
            filtered = filtered.filter((c) => c.unread === filters.unread);
        }

        if (filters.property !== 'all') {
            filtered = filtered.filter((c) => c.property === filters.property);
        }

        filtered.sort((a, b) => {
            const dateA = new Date(a.timestamp).getTime();
            const dateB = new Date(b.timestamp).getTime();
            return filters.date === 'newest' ? dateB - dateA : dateA - dateB;
        });

        return filtered;
    },
}));
