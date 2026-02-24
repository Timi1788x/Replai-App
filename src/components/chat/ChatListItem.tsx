import type { Chat } from '../../types/chat';
import ChannelIcon from './ChannelIcon';

interface ChatListItemProps {
    chat: Chat;
    isSelected: boolean;
    onSelect: (id: string) => void;
}

function timeAgo(timestamp: string): string {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'now';
    if (diffMin < 60) return `${diffMin}m`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h`;
    const diffDay = Math.floor(diffHr / 24);
    return `${diffDay}d`;
}

export default function ChatListItem({ chat, isSelected, onSelect }: ChatListItemProps) {
    return (
        <button
            onClick={() => onSelect(chat.id)}
            className={`w-full text-left p-4 transition-all duration-200 border-b border-dark-800 cursor-pointer group
        ${isSelected
                    ? 'bg-accent-glow border-l-2 border-l-accent'
                    : 'hover:bg-dark-800/60 border-l-2 border-l-transparent'
                }`}
        >
            <div className="flex items-start gap-3">
                {/* Channel icon */}
                <ChannelIcon channel={chat.channel} size={16} />

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                        <span className={`text-sm font-semibold truncate ${chat.unread ? 'text-white' : 'text-dark-300'}`}>
                            {chat.guestName}
                        </span>
                        <span className="text-xs text-dark-400 shrink-0 ml-2">{timeAgo(chat.timestamp)}</span>
                    </div>

                    <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-dark-700 text-dark-300 truncate">
                            {chat.property}
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <p className={`text-xs truncate max-w-[200px] ${chat.unread ? 'text-dark-200' : 'text-dark-400'}`}>
                            {chat.lastMessage}
                        </p>
                        {chat.unreadCount > 0 && (
                            <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-accent text-white text-[10px] font-bold shrink-0">
                                {chat.unreadCount}
                            </span>
                        )}
                    </div>

                    {chat.aiDraft && chat.aiDraft.status === 'pending' && (
                        <div className="flex items-center gap-1 mt-2">
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                                AI Draft Ready
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </button>
    );
}
