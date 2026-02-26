import { useChatStore } from '../../store/useChatStore';
import { useConversations } from '../../api/useConversations';
import ChatListItem from './ChatListItem';
import FilterBar from './FilterBar';
import { Inbox, Loader2, WifiOff } from 'lucide-react';
import { useAuth } from '../../api/useAuth';

export default function ChatList() {
    const { selectedChatId, selectChat, filters } = useChatStore();
    const { user } = useAuth();
    const { data: conversations, isLoading, isError } = useConversations();

    // Apply client-side filters to Supabase data
    let filtered = conversations ?? [];

    if (filters.channel !== 'all') {
        filtered = filtered.filter((c) => c.channel === filters.channel);
    }
    if (filters.unread !== null) {
        filtered = filtered.filter((c) => c.unread === filters.unread);
    }
    if (filters.property !== 'all') {
        filtered = filtered.filter((c) => c.property?.name === filters.property);
    }
    filtered = [...filtered].sort((a, b) => {
        const dateA = new Date(a.last_message_at).getTime();
        const dateB = new Date(b.last_message_at).getTime();
        return filters.date === 'newest' ? dateB - dateA : dateA - dateB;
    });

    // Not signed in
    if (!user) {
        return (
            <div className="flex flex-col h-full bg-dark-900 border-r border-dark-800 items-center justify-center text-dark-500 gap-2 p-6">
                <WifiOff size={32} />
                <p className="text-sm">Sign in to view conversations</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-dark-900 border-r border-dark-800">
            {/* Header */}
            <div className="p-4 border-b border-dark-800">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center">
                        <Inbox size={16} className="text-accent" />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-white">Unified Inbox</h2>
                        <p className="text-[10px] text-dark-400">
                            {isLoading ? 'Loading…' : `${filtered.length} conversations`}
                        </p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <FilterBar />

            {/* Chat list */}
            <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 size={24} className="text-accent animate-spin" />
                    </div>
                ) : isError ? (
                    <div className="flex flex-col items-center justify-center h-full text-red-400 gap-2 p-6">
                        <WifiOff size={32} />
                        <p className="text-sm">Failed to load conversations</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-dark-500 gap-2 p-6">
                        <Inbox size={32} />
                        <p className="text-sm">No conversations match your filters</p>
                    </div>
                ) : (
                    filtered.map((conv) => (
                        <ChatListItem
                            key={conv.id}
                            conversation={conv}
                            isSelected={selectedChatId === conv.id}
                            onSelect={selectChat}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
