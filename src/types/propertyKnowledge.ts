// ═══════════════════════════════════════════════════════════════
// PACKED — Property Knowledge Base TypeScript Interfaces
// ═══════════════════════════════════════════════════════════════
// These interfaces mirror the JSONB structure stored in
// property_knowledge.knowledge_payload.
//
// Top-level split:
//   • guest_facing   → sent to the LLM for AI guest communication
//   • internal_ops   → NEVER exposed to the AI / guest
// ═══════════════════════════════════════════════════════════════

// ─── Shared Primitives ────────────────────────────────────────

export interface ContactInfo {
    name: string;
    phone: string;
    email?: string;
    notes?: string;
}

// ─── Guest-Facing: Logistics ──────────────────────────────────

export interface FlexOption {
    available: boolean;
    earliest?: string;          // HH:MM
    latest?: string;            // HH:MM
    fee_eur?: number;
    instructions?: string;
}

export interface CheckInDetails {
    standard_time: string;      // HH:MM
    early_check_in?: FlexOption;
    late_check_in?: FlexOption;
    luggage_drop_off?: {
        available: boolean;
        instructions?: string;
    };
}

export interface CheckOutDetails {
    standard_time: string;      // HH:MM
    late_check_out?: FlexOption;
}

export interface ParkingDetails {
    available: boolean;
    type?: 'underground' | 'outdoor' | 'street' | 'garage';
    max_height_m?: number;
    spot_number?: string;
    fee_per_night_eur?: number;
    instructions?: string;
}

export interface SmartLockInfo {
    enabled: boolean;
    brand?: string;
    instructions?: string;
}

export interface KeyboxInfo {
    enabled: boolean;
    location?: string;
    code?: string;
}

export interface AccessDetails {
    smart_lock?: SmartLockInfo;
    keybox?: KeyboxInfo;
    building_entry?: string;
}

export interface LogisticsSection {
    check_in: CheckInDetails;
    check_out: CheckOutDetails;
    parking?: ParkingDetails;
    access?: AccessDetails;
}

// ─── Guest-Facing: Property How-To ───────────────────────────

export interface WifiInfo {
    ssid: string;
    password: string;
}

export interface ClimateInfo {
    heating_type?: string;
    thermostat_brand?: string;
    instructions?: string;
}

export interface ApplianceInfo {
    brand?: string;
    location?: string;
    instructions?: string;
}

export interface TrashSchedule {
    residual?: string;
    paper?: string;
    plastic?: string;
    bio?: string;
    glass?: string;
}

export interface TrashDisposal {
    recycling_location?: string;
    schedule?: TrashSchedule;
    special_instructions?: string;
}

export interface PropertyHowToSection {
    wifi: WifiInfo;
    climate?: ClimateInfo;
    appliances?: Record<string, ApplianceInfo>;
    trash_disposal?: TrashDisposal;
}

// ─── Guest-Facing: Rules & Compliance ────────────────────────

export interface QuietHours {
    from: string;               // HH:MM
    to: string;                 // HH:MM
    notes?: string;
}

export interface PetPolicy {
    allowed: boolean;
    fee_eur?: number;
    max_weight_kg?: number;
    restrictions?: string;
}

export interface VisitorPolicy {
    allowed: boolean;
    max_guests?: number;
    overnight_allowed?: boolean;
    notes?: string;
}

export interface PartyPolicy {
    allowed: boolean;
    notes?: string;
}

export interface SmokingPolicy {
    allowed: boolean;
    designated_area?: string;
    penalty_eur?: number;
}

export interface DepositDetails {
    amount_eur: number;
    method?: string;
    return_policy?: string;
}

export interface CityTaxDetails {
    per_person_per_night_eur: number;
    included_in_price: boolean;
    collection_method?: string;
}

export interface RulesSection {
    quiet_hours?: QuietHours;
    pets?: PetPolicy;
    visitors?: VisitorPolicy;
    parties?: PartyPolicy;
    smoking?: SmokingPolicy;
    deposit?: DepositDetails;
    city_tax?: CityTaxDetails;
}

// ─── Guest-Facing: AI Concierge (Local Guide) ────────────────

export interface LocalBusiness {
    name: string;
    address?: string;
    distance_m?: number;
    hours?: string;
    phone?: string;
    emergency_phone?: string;
}

export interface RestaurantRecommendation {
    name: string;
    cuisine?: string;
    address?: string;
    distance_m?: number;
    price_range?: '€' | '€€' | '€€€' | '€€€€';
    host_tip?: string;
}

export interface EmergencyContacts {
    police?: string;
    fire?: string;
    ambulance?: string;
    european_emergency?: string;
}

export interface PublicTransport {
    nearest_stop?: string;
    distance_m?: number;
    ticket_info?: string;
}

export interface ConciergeSection {
    supermarkets?: LocalBusiness[];
    bakeries?: LocalBusiness[];
    pharmacies?: LocalBusiness[];
    emergency_contacts?: EmergencyContacts;
    restaurants?: RestaurantRecommendation[];
    public_transport?: PublicTransport;
}

// ─── Guest-Facing Context (composed) ─────────────────────────

export interface GuestFacingContext {
    logistics: LogisticsSection;
    property_howto: PropertyHowToSection;
    rules?: RulesSection;
    concierge?: ConciergeSection;
}

// ─── Internal Operations (HIDDEN from guest AI) ──────────────

export interface LinenProvider {
    company: string;
    phone?: string;
    delivery_day?: string;
}

export interface CleaningOps {
    crew_contact?: ContactInfo;
    backup_contact?: Omit<ContactInfo, 'email'>;
    schedule_notes?: string;
    supplies_location?: string;
    linen_provider?: LinenProvider;
}

export interface MaintenanceVendor {
    name: string;
    phone: string;
    notes?: string;
}

export interface HvacVendor {
    company: string;
    phone: string;
    contract_id?: string;
}

export interface MaintenanceOps {
    plumber?: MaintenanceVendor;
    electrician?: MaintenanceVendor;
    general_handyman?: MaintenanceVendor;
    hvac?: HvacVendor;
}

export interface BuildingManagementOps {
    contact?: ContactInfo;
    emergency_contact?: Omit<ContactInfo, 'email'>;
    notes?: string;
}

export interface WifiRouterAdmin {
    location?: string;
    admin_url?: string;
    admin_user?: string;
    admin_password?: string;
}

export interface TroubleshootingOps {
    main_water_valve?: string;
    fuse_box?: string;
    gas_shutoff?: string;
    wifi_router?: WifiRouterAdmin;
    smart_lock_master_code?: string;
    spare_keys_location?: string;
}

export interface FinancialOps {
    cleaning_fee_eur?: number;
    commission_rate_pct?: number;
    payout_method?: string;
    tax_id?: string;
}

export interface InternalOperations {
    cleaning?: CleaningOps;
    maintenance?: MaintenanceOps;
    building_management?: BuildingManagementOps;
    troubleshooting?: TroubleshootingOps;
    financial?: FinancialOps;
}

// ─── Top-Level Payload ───────────────────────────────────────

/**
 * The complete JSONB structure stored in
 * `property_knowledge.knowledge_payload`.
 *
 * @example
 * // n8n AI prompt (SAFE — only guest data):
 * // SELECT knowledge_payload->'guest_facing' FROM property_knowledge
 *
 * // Internal workflow (cleaning dispatch):
 * // SELECT knowledge_payload->'internal_ops'->'cleaning' FROM property_knowledge
 */
export interface PropertyKnowledgePayload {
    guest_facing: GuestFacingContext;
    internal_ops?: InternalOperations;
}

// ─── Database Row ────────────────────────────────────────────

/** Row shape: `property_knowledge` table */
export interface PropertyKnowledgeRow {
    id: string;
    property_id: string;
    knowledge_payload: PropertyKnowledgePayload;
    created_at: string;
    updated_at: string;
}

// ─── Vector RAG Types ────────────────────────────────────────

/** Memory compaction tier for guest episodic memory */
export type MemoryType = 'message_summary' | 'session_summary' | 'reservation_summary';

/** Row shape: `property_knowledge_embeddings` table */
export interface PropertyKnowledgeEmbeddingRow {
    id: string;
    property_id: string;
    content: string;
    metadata: Record<string, unknown>;
    embedding: number[];                // vector(1536) as float array
    created_at: string;
    updated_at: string;
}

/** Row shape: `guest_memory_embeddings` table */
export interface GuestMemoryEmbeddingRow {
    id: string;
    guest_id: string;
    reservation_id: string | null;
    memory_type: MemoryType;
    content: string;
    metadata: Record<string, unknown>;
    embedding: number[];                // vector(1536) as float array
    created_at: string;
}

/** Return type from the `match_property_knowledge` RPC function */
export interface PropertyKnowledgeMatch {
    id: string;
    content: string;
    metadata: Record<string, unknown>;
    similarity: number;
}

/** Return type from the `match_guest_memory` RPC function */
export interface GuestMemoryMatch {
    id: string;
    reservation_id: string | null;
    memory_type: MemoryType;
    content: string;
    metadata: Record<string, unknown>;
    similarity: number;
}
