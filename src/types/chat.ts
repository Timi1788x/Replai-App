export type ChannelType = 'airbnb' | 'whatsapp' | 'email' | 'sms' | 'telegram';

export interface Message {
    id: string;
    sender: 'host' | 'guest';
    text: string;
    timestamp: string;
}

export interface AiDraft {
    id: string;
    text: string;
    status: 'pending' | 'approved' | 'edited' | 'deleted';
}

export interface Chat {
    id: string;
    guestName: string;
    guestAvatar?: string;
    property: string;
    channel: ChannelType;
    lastMessage: string;
    timestamp: string;
    unread: boolean;
    unreadCount: number;
    messages: Message[];
    aiDraft: AiDraft | null;
}

export type FilterKey = 'channel' | 'unread' | 'property' | 'date';

export interface ChatFilters {
    channel: ChannelType | 'all';
    unread: boolean | null;
    property: string | 'all';
    date: 'newest' | 'oldest';
}
