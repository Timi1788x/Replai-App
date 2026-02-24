import { useChatStore } from '../../store/useChatStore';
import ChatListItem from './ChatListItem';
import FilterBar from './FilterBar';
import { Inbox } from 'lucide-react';

export default function ChatList() {
    const { getFilteredChats, selectedChatId, selectChat } = useChatStore();
    const filteredChats = getFilteredChats();

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
                        <p className="text-[10px] text-dark-400">{filteredChats.length} conversations</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <FilterBar />

            {/* Chat list */}
            <div className="flex-1 overflow-y-auto">
                {filteredChats.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-dark-500 gap-2 p-6">
                        <Inbox size={32} />
                        <p className="text-sm">No conversations match your filters</p>
                    </div>
                ) : (
                    filteredChats.map((chat) => (
                        <ChatListItem
                            key={chat.id}
                            chat={chat}
                            isSelected={selectedChatId === chat.id}
                            onSelect={selectChat}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
