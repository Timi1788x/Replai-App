import { useState } from 'react';
import { supabase } from '../../api/supabaseClient';
import { useSendMessage } from '../../api/useSendMessage';
import type { ConversationRow } from '../../types/database';
import { Sparkles, Check, Pencil, Trash2, X } from 'lucide-react';

interface AiDraftBannerProps {
    conversation: ConversationRow;
}

export default function AiDraftBanner({ conversation }: AiDraftBannerProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState('');
    const sendMessageMutation = useSendMessage();

    if (!conversation.ai_draft_reply || conversation.ai_draft_status !== 'pending') return null;

    const handleApprove = async () => {
        // Send the draft as a host message
        sendMessageMutation.mutate({
            conversation_id: conversation.id,
            sender: 'host',
            body: conversation.ai_draft_reply!,
            status: 'pending',
        });
        // Update the conversation to mark draft as approved
        await supabase
            .from('conversations')
            .update({ ai_draft_status: 'approved' })
            .eq('id', conversation.id);
    };

    const handleEdit = () => {
        setEditText(conversation.ai_draft_reply!);
        setIsEditing(true);
    };

    const handleSaveEdit = async () => {
        // Send the edited text as a host message
        sendMessageMutation.mutate({
            conversation_id: conversation.id,
            sender: 'host',
            body: editText,
            status: 'pending',
        });
        // Mark draft as edited
        await supabase
            .from('conversations')
            .update({ ai_draft_status: 'edited', ai_draft_reply: editText })
            .eq('id', conversation.id);
        setIsEditing(false);
    };

    const handleDelete = async () => {
        await supabase
            .from('conversations')
            .update({ ai_draft_status: 'deleted' })
            .eq('id', conversation.id);
    };

    return (
        <div className="mx-4 mb-3 rounded-xl border border-accent/25 bg-gradient-to-r from-accent/5 to-accent/10 overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-2.5 bg-accent/10 border-b border-accent/15">
                <Sparkles size={14} className="text-accent" />
                <span className="text-xs font-semibold text-accent">AI Suggested Reply</span>
            </div>

            {/* Body */}
            <div className="p-4">
                {isEditing ? (
                    <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full bg-dark-800 text-dark-200 text-sm rounded-lg p-3 border border-dark-600 outline-none focus:border-accent/50 resize-none min-h-[80px]"
                        rows={4}
                    />
                ) : (
                    <p className="text-sm text-dark-200 leading-relaxed whitespace-pre-line">
                        {conversation.ai_draft_reply}
                    </p>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 px-4 py-3 border-t border-accent/15">
                {isEditing ? (
                    <>
                        <button
                            onClick={handleSaveEdit}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-white text-xs font-medium hover:bg-accent-dark transition-colors cursor-pointer"
                        >
                            <Check size={12} />
                            Send Edited
                        </button>
                        <button
                            onClick={() => setIsEditing(false)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-700 text-dark-300 text-xs font-medium hover:bg-dark-600 transition-colors cursor-pointer"
                        >
                            <X size={12} />
                            Cancel
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            onClick={handleApprove}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-white text-xs font-medium hover:bg-accent-dark transition-colors cursor-pointer"
                        >
                            <Check size={12} />
                            Approve & Send
                        </button>
                        <button
                            onClick={handleEdit}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-700 text-dark-300 text-xs font-medium hover:bg-dark-600 transition-colors cursor-pointer"
                        >
                            <Pencil size={12} />
                            Edit
                        </button>
                        <button
                            onClick={handleDelete}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-700 text-red-400 text-xs font-medium hover:bg-red-500/15 transition-colors cursor-pointer"
                        >
                            <Trash2 size={12} />
                            Delete
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
