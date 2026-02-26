import { useChatStore } from '../../store/useChatStore';
import { useConversations } from '../../api/useConversations';
import type { ChannelType } from '../../types/database';
import { Filter, X } from 'lucide-react';

const channels: { value: ChannelType | 'all'; label: string }[] = [
    { value: 'all', label: 'All Channels' },
    { value: 'airbnb', label: 'Airbnb' },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'email', label: 'Email' },
    { value: 'sms', label: 'SMS' },
];

export default function FilterBar() {
    const { filters, setFilter, resetFilters } = useChatStore();
    const { data: conversations } = useConversations();

    // Derive property list from actual conversation data (joined from properties table)
    const properties = Array.from(
        new Set((conversations ?? []).map((c) => c.property?.name).filter(Boolean) as string[])
    ).sort();

    const hasActiveFilters =
        filters.channel !== 'all' ||
        filters.unread !== null ||
        filters.property !== 'all';

    return (
        <div className="p-3 border-b border-dark-800 space-y-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-dark-300">
                    <Filter size={14} />
                    <span className="text-xs font-medium uppercase tracking-wider">Filters</span>
                </div>
                {hasActiveFilters && (
                    <button
                        onClick={resetFilters}
                        className="flex items-center gap-1 text-[10px] text-accent hover:text-accent-light transition-colors cursor-pointer"
                    >
                        <X size={10} />
                        Clear
                    </button>
                )}
            </div>

            <div className="flex flex-wrap gap-1.5">
                {/* Channel filter */}
                <select
                    value={filters.channel}
                    onChange={(e) => setFilter('channel', e.target.value as ChannelType | 'all')}
                    className="text-xs bg-dark-800 text-dark-200 border border-dark-700 rounded-lg px-2.5 py-1.5 outline-none focus:border-accent/50 transition-colors cursor-pointer"
                >
                    {channels.map((ch) => (
                        <option key={ch.value} value={ch.value}>{ch.label}</option>
                    ))}
                </select>

                {/* Property filter */}
                <select
                    value={filters.property}
                    onChange={(e) => setFilter('property', e.target.value)}
                    className="text-xs bg-dark-800 text-dark-200 border border-dark-700 rounded-lg px-2.5 py-1.5 outline-none focus:border-accent/50 transition-colors cursor-pointer"
                >
                    <option value="all">All Properties</option>
                    {properties.map((p) => (
                        <option key={p} value={p}>{p}</option>
                    ))}
                </select>

                {/* Unread filter */}
                <select
                    value={filters.unread === null ? 'all' : filters.unread ? 'unread' : 'read'}
                    onChange={(e) => {
                        const val = e.target.value;
                        setFilter('unread', val === 'all' ? null : val === 'unread');
                    }}
                    className="text-xs bg-dark-800 text-dark-200 border border-dark-700 rounded-lg px-2.5 py-1.5 outline-none focus:border-accent/50 transition-colors cursor-pointer"
                >
                    <option value="all">All Messages</option>
                    <option value="unread">Unread Only</option>
                    <option value="read">Read Only</option>
                </select>

                {/* Date sort */}
                <select
                    value={filters.date}
                    onChange={(e) => setFilter('date', e.target.value as 'newest' | 'oldest')}
                    className="text-xs bg-dark-800 text-dark-200 border border-dark-700 rounded-lg px-2.5 py-1.5 outline-none focus:border-accent/50 transition-colors cursor-pointer"
                >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                </select>
            </div>
        </div>
    );
}
