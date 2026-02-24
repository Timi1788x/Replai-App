import { useState } from 'react';
import { useChatStore } from '../../store/useChatStore';
import { Sparkles, Check, Pencil, Trash2, X } from 'lucide-react';

interface AiDraftBannerProps {
    chatId: string;
}

export default function AiDraftBanner({ chatId }: AiDraftBannerProps) {
    const chat = useChatStore((s) => s.chats.find((c) => c.id === chatId));
    const { approveAiDraft, editAiDraft, deleteAiDraft } = useChatStore();

    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState('');

    if (!chat?.aiDraft || chat.aiDraft.status !== 'pending') return null;

    const handleEdit = () => {
        setEditText(chat.aiDraft!.text);
        setIsEditing(true);
    };

    const handleSaveEdit = () => {
        editAiDraft(chatId, editText);
        setIsEditing(false);
        approveAiDraft(chatId);
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
                        {chat.aiDraft.text}
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
                            onClick={() => approveAiDraft(chatId)}
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
                            onClick={() => deleteAiDraft(chatId)}
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
