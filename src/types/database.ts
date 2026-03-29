// ─── Supabase Row Types ───────────────────────────────────────
// These types mirror the Supabase database schema.

export type ChannelType =
    | 'whatsapp'
    | 'email'
    | 'airbnb'
    | 'booking_com'
    | 'vrbo'
    | 'direct'
    | 'sms'
    | 'telegram';

export type MessageStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
export type MessageSender = 'host' | 'guest' | 'system';
export type DraftStatus = 'pending' | 'approved' | 'edited' | 'deleted';

// ─── Row types ────────────────────────────────────────────────

/** Row shape: `properties` table */
export interface PropertyRow {
    id: string;
    host_id: string;
    name: string;
    external_id: string | null;
    address: string | null;
    timezone: string;
    metadata: Record<string, unknown>;
    created_at: string;
    updated_at: string;
}

/** Row shape: `guests` table */
export interface GuestRow {
    id: string;
    host_id: string;
    display_name: string;
    email: string | null;
    phone: string | null;
    avatar_url: string | null;
    external_id: string | null;
    notes: string | null;
    metadata: Record<string, unknown>;
    created_at: string;
    updated_at: string;
}

/** Row shape: `conversations` table (with joined relations) */
export interface ConversationRow {
    id: string;
    host_id: string;
    property_id: string | null;
    guest_id: string | null;
    channel: ChannelType;
    external_thread_id: string | null;
    subject: string | null;
    last_message: string;
    last_message_at: string;
    unread: boolean;
    unread_count: number;
    ai_draft_reply: string | null;
    ai_draft_status: DraftStatus | null;
    archived: boolean;
    metadata: Record<string, unknown>;
    created_at: string;
    updated_at: string;
    auto_respond_paused_until: string | null;
    // Joined from FK relations (populated by select query)
    property: { name: string } | null;
    guest: { display_name: string; avatar_url: string | null } | null;
}

/** Attachment stored in messages.attachments JSONB array */
export interface Attachment {
    type: 'image' | 'video' | 'audio' | 'file';
    url: string;
    filename: string;
    size_bytes?: number;
}

/** Row shape: `messages` table */
export interface MessageRow {
    id: string;
    conversation_id: string;
    sender: MessageSender;
    body: string;
    external_message_id: string | null;
    status: MessageStatus;
    attachments: Attachment[];
    ai_draft_reply: string | null;
    metadata: Record<string, unknown>;
    created_at: string;
}

/** Payload for inserting a new message */
export interface InsertMessagePayload {
    conversation_id: string;
    sender: 'host';
    body: string;
    status: 'pending';
}

/** Enhanced payload for useSendMessage (supports attachments) */
export interface SendMessagePayload {
    conversation_id: string;
    message_text: string;
    attachment_url?: string;
}

/** Payload for useMarkAsRead */
export interface MarkAsReadPayload {
    conversation_id: string;
}

/** Payload for useUpdateDraft */
export interface UpdateDraftPayload {
    conversation_id: string;
    edited_text: string;
}

/** Payload for useDeleteMessage */
export interface DeleteMessagePayload {
    message_id: string;
    conversation_id: string;
}

/** Payload for usePauseAutoRespond */
export interface PauseAutoRespondPayload {
    conversation_id: string;
    duration_seconds: number;
}

/** Row shape: `host_settings` table */
export interface HostSettingsRow {
    user_id: string;
    auto_respond_enabled: boolean;
    onboarding_completed: boolean;
    created_at: string;
    updated_at: string;
}

// ─── Reservations ─────────────────────────────────────────────

export type ReservationStatus = 'confirmed' | 'pending' | 'cancelled';

/** Row shape: `reservations` table (with joined relations) */
export interface ReservationRow {
    id: string;
    host_id: string;
    property_id: string;
    guest_id: string;
    check_in: string; // DATE as ISO string
    check_out: string;
    status: ReservationStatus;
    external_id: string | null;
    notes: string | null;
    metadata: Record<string, unknown>;
    created_at: string;
    updated_at: string;
    // Joined from FK relations (populated by select query)
    property: { name: string } | null;
    guest: { display_name: string; avatar_url: string | null } | null;
}

/** Payload for the knowledge-base sync webhook */
export interface KnowledgeBaseSyncPayload {
    property_id: string;
    property_name: string;
    wifi_name: string;
    wifi_password: string;
    check_in_time: string;
    check_out_time: string;
    check_in_instructions: string;
    parking_rules: string;
    house_rules: string;
    additional_documents?: string[];
}

// ─── Property Knowledge Base ──────────────────────────────────
// Deep JSONB AI knowledge — re-exported for single entry point.

export type {
    PropertyKnowledgePayload,
    PropertyKnowledgeRow,
    GuestFacingContext,
    InternalOperations,
    MemoryType,
    PropertyKnowledgeEmbeddingRow,
    GuestMemoryEmbeddingRow,
    PropertyKnowledgeMatch,
    GuestMemoryMatch,
} from './propertyKnowledge';
