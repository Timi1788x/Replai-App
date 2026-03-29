import { useState, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { useSetMaxProperties } from '../../api/useAdminMutations';

interface Props {
    userId: string;
    value: number;
}

export default function AdminMaxPropertiesInput({ userId, value }: Props) {
    const { mutate, isPending } = useSetMaxProperties();
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(String(value));
    const inputRef = useRef<HTMLInputElement>(null);

    const startEdit = () => {
        setDraft(String(value));
        setEditing(true);
        setTimeout(() => inputRef.current?.select(), 0);
    };

    const commit = () => {
        const parsed = parseInt(draft, 10);
        if (!isNaN(parsed) && parsed >= 0 && parsed !== value) {
            mutate({ target_user_id: userId, max_properties: parsed });
        }
        setEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') commit();
        if (e.key === 'Escape') setEditing(false);
    };

    if (isPending) {
        return <Loader2 size={14} className="text-accent animate-spin" />;
    }

    if (editing) {
        return (
            <input
                ref={inputRef}
                type="number"
                min={0}
                max={999}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={commit}
                onKeyDown={handleKeyDown}
                className="w-16 bg-dark-700 text-white text-sm rounded px-2 py-0.5 border border-accent/50 outline-none text-center"
            />
        );
    }

    return (
        <button
            onClick={startEdit}
            title="Click to edit"
            className="text-sm text-dark-200 hover:text-white hover:underline decoration-dotted cursor-pointer transition-colors"
        >
            {value}
        </button>
    );
}
