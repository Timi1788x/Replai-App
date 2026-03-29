import { useState, useRef, useEffect } from 'react';
import { useChatStore } from '../../store/useChatStore';
import { useConversations } from '../../api/useConversations';
import { useMessages } from '../../api/useMessages';
import { useSendMessage } from '../../api/useSendMessage';
import { useMarkAsRead, useDeleteMessage } from '../../api/useChatMutations';
import ChannelIcon from './ChannelIcon';
import AiDraftBanner from './AiDraftBanner';
import { Send, MoreVertical, MessageSquare, Loader2, MoreHorizontal, Trash2 } from 'lucide-react';

export default function ChatWindow() {
    const { selectedChatId } = useChatStore();
    const { data: conversations } = useConversations();
    const { data: messages, isLoading: messagesLoading } = useMessages(selectedChatId);
    const sendMessageMutation = useSendMessage();
    const markAsReadMutation = useMarkAsRead();

    const deleteMessageMutation = useDeleteMessage();

    const [inputText, setInputText] = useState('');
    const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const conversation = conversations?.find((c) => c.id === selectedChatId);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages?.length]);

    // Mark as read only when the user clicks into a conversation (selection changes).
    // Do NOT react to conversation.unread changing — that causes a race where
    // realtime sets unread=true and this effect immediately clears it.
    useEffect(() => {
        if (conversation && conversation.unread) {
            markAsReadMutation.mutate({ conversation_id: conversation.id });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [conversation?.id]);

    const handleSend = () => {
        if (!inputText.trim() || !selectedChatId) return;
        sendMessageMutation.mutate({
            conversation_id: selectedChatId,
            sender: 'host',
            body: inputText.trim(),
            status: 'pending',
        });
        setInputText('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Empty state — no conversation selected
    if (!selectedChatId || !conversation) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-dark-950 text-dark-500 gap-4">
                <div className="w-20 h-20 rounded-2xl bg-dark-900 flex items-center justify-center">
                    <MessageSquare size={32} className="text-dark-600" />
                </div>
                <div className="text-center">
                    <p className="text-lg font-medium text-dark-400">Select a conversation</p>
                    <p className="text-sm text-dark-500 mt-1">Choose a chat from the inbox to view messages</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-dark-950 h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-dark-800 bg-dark-900/50 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <ChannelIcon channel={conversation.channel} size={18} />
                    <div>
                        <h3 className="text-sm font-semibold text-white">{conversation.guest?.display_name ?? 'Unknown Guest'}</h3>
                        <p className="text-xs text-dark-400">{conversation.property?.name ?? 'No property'}</p>
                    </div>
                </div>
                <button className="p-2 rounded-lg hover:bg-dark-800 transition-colors text-dark-400 hover:text-dark-200 cursor-pointer">
                    <MoreVertical size={16} />
                </button>
            </div>

            {/* Click-outside overlay — closes any open message menu */}
            {openMenuId && (
                <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                {messagesLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 size={24} className="text-accent animate-spin" />
                    </div>
                ) : (
                    (messages ?? []).map((msg) => {
                        const isHost = msg.sender === 'host';
                        const isMenuOpen = openMenuId === msg.id;
                        const isHovered = hoveredMessageId === msg.id;
                        return (
                            <div
                                key={msg.id}
                                className={`flex items-end gap-1.5 ${isHost ? 'justify-end' : 'justify-start'}`}
                                onMouseEnter={() => isHost && setHoveredMessageId(msg.id)}
                                onMouseLeave={() => { setHoveredMessageId(null); }}
                            >
                                {/* Action button — only for host messages, left of bubble */}
                                {isHost && (
                                    <div className="relative z-20 self-center">
                                        <button
                                            className={`p-1 rounded-md text-dark-500 hover:text-dark-300 hover:bg-dark-800 transition-all ${
                                                isHovered || isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                                            }`}
                                            onClick={() => setOpenMenuId(isMenuOpen ? null : msg.id)}
                                        >
                                            <MoreHorizontal size={14} />
                                        </button>
                                        {isMenuOpen && (
                                            <div className="absolute bottom-full right-0 mb-1 bg-dark-800 border border-dark-700 rounded-xl shadow-xl py-1 min-w-[140px]">
                                                <button
                                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-400 hover:bg-dark-700 transition-colors rounded-lg mx-0.5"
                                                    onClick={() => {
                                                        deleteMessageMutation.mutate({
                                                            message_id: msg.id,
                                                            conversation_id: msg.conversation_id,
                                                        });
                                                        setOpenMenuId(null);
                                                    }}
                                                >
                                                    <Trash2 size={14} />
                                                    Delete message
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Bubble */}
                                <div
                                    className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed
                                        ${isHost
                                            ? 'bg-accent text-white rounded-br-md'
                                            : 'bg-dark-800 text-dark-200 rounded-bl-md'
                                        }`}
                                >
                                    <p className="whitespace-pre-line">{msg.body}</p>
                                    <p className={`text-[10px] mt-1 ${isHost ? 'text-white/60' : 'text-dark-500'}`}>
                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* AI Draft Banner */}
            <AiDraftBanner conversation={conversation} />

            {/* Input */}
            <div className="px-4 py-3 border-t border-dark-800 bg-dark-900/50 backdrop-blur-sm">
                <div className="flex items-end gap-2">
                    <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        rows={1}
                        className="flex-1 bg-dark-800 text-dark-200 text-sm rounded-xl px-4 py-3 border border-dark-700 outline-none focus:border-accent/50 resize-none placeholder:text-dark-500 transition-colors"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!inputText.trim() || sendMessageMutation.isPending}
                        className="p-3 rounded-xl bg-accent text-white hover:bg-accent-dark disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                    >
                        <Send size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
