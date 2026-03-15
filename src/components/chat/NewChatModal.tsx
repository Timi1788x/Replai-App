import { useState } from 'react';
import { useGuestSearch } from '../../api/useGuestSearch';
import { useProperties } from '../../api/useProperties';
import { useChatStore } from '../../store/useChatStore';
import { supabase } from '../../api/supabaseClient';
import { useAuth } from '../../api/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { conversationKeys } from '../../api/useConversations';
import { X, Search, Loader2, User, MessageSquarePlus } from 'lucide-react';
import type { GuestRow } from '../../types/database';

interface NewChatModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function NewChatModal({ isOpen, onClose }: NewChatModalProps) {
    const { query, setQuery, results, isLoading, debouncedQuery } = useGuestSearch();
    const { data: properties = [] } = useProperties();
    const { selectChat } = useChatStore();
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [creating, setCreating] = useState(false);

    if (!isOpen) return null;

    const handleSelectGuest = async (guest: GuestRow) => {
        if (!user || creating || properties.length === 0) return;
        setCreating(true);

        try {
            // Check for existing active conversation with this guest
            const { data: existing } = await supabase
                .from('conversations')
                .select('id')
                .eq('guest_id', guest.id)
                .eq('archived', false)
                .limit(1)
                .maybeSingle();

            if (existing) {
                // Navigate to existing conversation
                selectChat(existing.id);
            } else {
                // Create new conversation — use the host's first property
                const { data: newConv, error } = await supabase
                    .from('conversations')
                    .insert({
                        guest_id: guest.id,
                        property_id: properties[0].id,
                        channel: 'web' as const,
                        last_message_at: new Date().toISOString(),
                        snippet: '',
                        unread: false,
                        unread_count: 0,
                    })
                    .select()
                    .single();

                if (error) throw error;
                if (newConv) {
                    queryClient.invalidateQueries({ queryKey: conversationKeys.all });
                    selectChat(newConv.id);
                }
            }

            onClose();
            setQuery('');
        } catch (err) {
            console.error('Failed to create conversation:', err);
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-dark-900 rounded-2xl border border-dark-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-dark-800">
                    <div className="flex items-center gap-2">
                        <MessageSquarePlus size={18} className="text-accent" />
                        <h2 className="text-sm font-semibold text-white">New Conversation</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-7 h-7 rounded-lg hover:bg-dark-800 flex items-center justify-center text-dark-400 hover:text-dark-200 transition-colors cursor-pointer"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Search */}
                <div className="p-4">
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search guests by name, email, or phone..."
                            autoFocus
                            className="w-full bg-dark-800 text-dark-200 text-sm rounded-xl pl-9 pr-4 py-2.5 border border-dark-700 outline-none focus:border-accent/50 placeholder:text-dark-500 transition-colors"
                        />
                        {isLoading && (
                            <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-accent animate-spin" />
                        )}
                    </div>
                </div>

                {/* Results */}
                <div className="max-h-64 overflow-y-auto border-t border-dark-800">
                    {debouncedQuery.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-dark-500 gap-2">
                            <Search size={24} />
                            <p className="text-xs">Type to search for a guest</p>
                        </div>
                    ) : results.length === 0 && !isLoading ? (
                        <div className="flex flex-col items-center justify-center py-10 text-dark-500 gap-2">
                            <User size={24} />
                            <p className="text-xs">No guests found for "{debouncedQuery}"</p>
                        </div>
                    ) : (
                        results.map((guest) => (
                            <button
                                key={guest.id}
                                onClick={() => handleSelectGuest(guest)}
                                disabled={creating}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-dark-800 transition-colors text-left group cursor-pointer disabled:opacity-50"
                            >
                                {/* Avatar */}
                                <div className="w-9 h-9 rounded-full bg-dark-700 flex items-center justify-center shrink-0 overflow-hidden">
                                    {guest.avatar_url ? (
                                        <img src={guest.avatar_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={16} className="text-dark-400" />
                                    )}
                                </div>

                                {/* Info */}
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-dark-200 group-hover:text-white truncate transition-colors">
                                        {guest.display_name}
                                    </p>
                                    <p className="text-[11px] text-dark-500 truncate">
                                        {guest.email || guest.phone || 'No contact info'}
                                    </p>
                                </div>

                                {/* Arrow */}
                                <MessageSquarePlus
                                    size={14}
                                    className="text-dark-600 group-hover:text-accent shrink-0 transition-colors"
                                />
                            </button>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
