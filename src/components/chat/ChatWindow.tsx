import { useState, useRef, useEffect } from 'react';
import { useChatStore } from '../../store/useChatStore';
import ChannelIcon from './ChannelIcon';
import AiDraftBanner from './AiDraftBanner';
import { Send, MoreVertical, MessageSquare } from 'lucide-react';

export default function ChatWindow() {
    const { selectedChatId, chats, sendMessage } = useChatStore();
    const [inputText, setInputText] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const chat = chats.find((c) => c.id === selectedChatId);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chat?.messages.length]);

    const handleSend = () => {
        if (!inputText.trim() || !selectedChatId) return;
        sendMessage(selectedChatId, inputText.trim());
        setInputText('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Empty state
    if (!chat) {
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
                    <ChannelIcon channel={chat.channel} size={18} />
                    <div>
                        <h3 className="text-sm font-semibold text-white">{chat.guestName}</h3>
                        <p className="text-xs text-dark-400">{chat.property}</p>
                    </div>
                </div>
                <button className="p-2 rounded-lg hover:bg-dark-800 transition-colors text-dark-400 hover:text-dark-200 cursor-pointer">
                    <MoreVertical size={16} />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                {chat.messages.map((msg) => {
                    const isHost = msg.sender === 'host';
                    return (
                        <div key={msg.id} className={`flex ${isHost ? 'justify-end' : 'justify-start'}`}>
                            <div
                                className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed
                  ${isHost
                                        ? 'bg-accent text-white rounded-br-md'
                                        : 'bg-dark-800 text-dark-200 rounded-bl-md'
                                    }`}
                            >
                                <p className="whitespace-pre-line">{msg.text}</p>
                                <p className={`text-[10px] mt-1 ${isHost ? 'text-white/60' : 'text-dark-500'}`}>
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* AI Draft Banner */}
            <AiDraftBanner chatId={chat.id} />

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
                        disabled={!inputText.trim()}
                        className="p-3 rounded-xl bg-accent text-white hover:bg-accent-dark disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                    >
                        <Send size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
