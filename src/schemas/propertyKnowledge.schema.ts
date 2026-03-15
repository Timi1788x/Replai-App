// ═══════════════════════════════════════════════════════════════
// PACKED — Property Knowledge Base Zod Validation Schema
// ═══════════════════════════════════════════════════════════════
// Mirrors the TypeScript interfaces in types/propertyKnowledge.ts.
// Use z.infer<typeof propertyKnowledgePayloadSchema> for type-safe
// form building and API payload validation.
// ═══════════════════════════════════════════════════════════════

import { z } from 'zod';

// ─── Shared Primitives ────────────────────────────────────────

const contactInfoSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    phone: z.string().min(1, 'Phone is required'),
    email: z.string().email('Invalid email').optional(),
    notes: z.string().optional(),
});

// ─── Guest-Facing: Logistics ──────────────────────────────────

const timeString = z.string().regex(/^\d{2}:\d{2}$/, 'Must be HH:MM format');

const flexOptionSchema = z.object({
    available: z.boolean(),
    earliest: timeString.optional(),
    latest: timeString.optional(),
    fee_eur: z.number().nonnegative().optional(),
    instructions: z.string().optional(),
});

const checkInDetailsSchema = z.object({
    standard_time: timeString,
    early_check_in: flexOptionSchema.optional(),
    late_check_in: flexOptionSchema.optional(),
    luggage_drop_off: z.object({
        available: z.boolean(),
        instructions: z.string().optional(),
    }).optional(),
});

const checkOutDetailsSchema = z.object({
    standard_time: timeString,
    late_check_out: flexOptionSchema.optional(),
});

const parkingDetailsSchema = z.object({
    available: z.boolean(),
    type: z.enum(['underground', 'outdoor', 'street', 'garage']).optional(),
    max_height_m: z.number().positive().optional(),
    spot_number: z.string().optional(),
    fee_per_night_eur: z.number().nonnegative().optional(),
    instructions: z.string().optional(),
});

const smartLockInfoSchema = z.object({
    enabled: z.boolean(),
    brand: z.string().optional(),
    instructions: z.string().optional(),
});

const keyboxInfoSchema = z.object({
    enabled: z.boolean(),
    location: z.string().optional(),
    code: z.string().optional(),
});

const accessDetailsSchema = z.object({
    smart_lock: smartLockInfoSchema.optional(),
    keybox: keyboxInfoSchema.optional(),
    building_entry: z.string().optional(),
});

const logisticsSectionSchema = z.object({
    check_in: checkInDetailsSchema,
    check_out: checkOutDetailsSchema,
    parking: parkingDetailsSchema.optional(),
    access: accessDetailsSchema.optional(),
});

// ─── Guest-Facing: Property How-To ───────────────────────────

const wifiInfoSchema = z.object({
    ssid: z.string().min(1, 'SSID is required'),
    password: z.string().min(1, 'Password is required'),
});

const climateInfoSchema = z.object({
    heating_type: z.string().optional(),
    thermostat_brand: z.string().optional(),
    instructions: z.string().optional(),
});

const applianceInfoSchema = z.object({
    brand: z.string().optional(),
    location: z.string().optional(),
    instructions: z.string().optional(),
});

const trashScheduleSchema = z.object({
    residual: z.string().optional(),
    paper: z.string().optional(),
    plastic: z.string().optional(),
    bio: z.string().optional(),
    glass: z.string().optional(),
});

const trashDisposalSchema = z.object({
    recycling_location: z.string().optional(),
    schedule: trashScheduleSchema.optional(),
    special_instructions: z.string().optional(),
});

const propertyHowToSectionSchema = z.object({
    wifi: wifiInfoSchema,
    climate: climateInfoSchema.optional(),
    appliances: z.record(z.string(), applianceInfoSchema).optional(),
    trash_disposal: trashDisposalSchema.optional(),
});

// ─── Guest-Facing: Rules & Compliance ────────────────────────

const quietHoursSchema = z.object({
    from: timeString,
    to: timeString,
    notes: z.string().optional(),
});

const petPolicySchema = z.object({
    allowed: z.boolean(),
    fee_eur: z.number().nonnegative().optional(),
    max_weight_kg: z.number().positive().optional(),
    restrictions: z.string().optional(),
});

const visitorPolicySchema = z.object({
    allowed: z.boolean(),
    max_guests: z.number().int().nonnegative().optional(),
    overnight_allowed: z.boolean().optional(),
    notes: z.string().optional(),
});

const partyPolicySchema = z.object({
    allowed: z.boolean(),
    notes: z.string().optional(),
});

const smokingPolicySchema = z.object({
    allowed: z.boolean(),
    designated_area: z.string().optional(),
    penalty_eur: z.number().nonnegative().optional(),
});

const depositDetailsSchema = z.object({
    amount_eur: z.number().nonnegative(),
    method: z.string().optional(),
    return_policy: z.string().optional(),
});

const cityTaxDetailsSchema = z.object({
    per_person_per_night_eur: z.number().nonnegative(),
    included_in_price: z.boolean(),
    collection_method: z.string().optional(),
});

const rulesSectionSchema = z.object({
    quiet_hours: quietHoursSchema.optional(),
    pets: petPolicySchema.optional(),
    visitors: visitorPolicySchema.optional(),
    parties: partyPolicySchema.optional(),
    smoking: smokingPolicySchema.optional(),
    deposit: depositDetailsSchema.optional(),
    city_tax: cityTaxDetailsSchema.optional(),
});

// ─── Guest-Facing: AI Concierge ──────────────────────────────

const localBusinessSchema = z.object({
    name: z.string().min(1),
    address: z.string().optional(),
    distance_m: z.number().nonnegative().optional(),
    hours: z.string().optional(),
    phone: z.string().optional(),
    emergency_phone: z.string().optional(),
});

const restaurantRecommendationSchema = z.object({
    name: z.string().min(1),
    cuisine: z.string().optional(),
    address: z.string().optional(),
    distance_m: z.number().nonnegative().optional(),
    price_range: z.enum(['€', '€€', '€€€', '€€€€']).optional(),
    host_tip: z.string().optional(),
});

const emergencyContactsSchema = z.object({
    police: z.string().optional(),
    fire: z.string().optional(),
    ambulance: z.string().optional(),
    european_emergency: z.string().optional(),
});

const publicTransportSchema = z.object({
    nearest_stop: z.string().optional(),
    distance_m: z.number().nonnegative().optional(),
    ticket_info: z.string().optional(),
});

const conciergeSectionSchema = z.object({
    supermarkets: z.array(localBusinessSchema).optional(),
    bakeries: z.array(localBusinessSchema).optional(),
    pharmacies: z.array(localBusinessSchema).optional(),
    emergency_contacts: emergencyContactsSchema.optional(),
    restaurants: z.array(restaurantRecommendationSchema).optional(),
    public_transport: publicTransportSchema.optional(),
});

// ─── Guest-Facing Context (composed) ─────────────────────────

const guestFacingContextSchema = z.object({
    logistics: logisticsSectionSchema,
    property_howto: propertyHowToSectionSchema,
    rules: rulesSectionSchema.optional(),
    concierge: conciergeSectionSchema.optional(),
});

// ─── Internal Operations (HIDDEN from guest AI) ──────────────

const linenProviderSchema = z.object({
    company: z.string().min(1),
    phone: z.string().optional(),
    delivery_day: z.string().optional(),
});

const cleaningOpsSchema = z.object({
    crew_contact: contactInfoSchema.optional(),
    backup_contact: contactInfoSchema.omit({ email: true }).optional(),
    schedule_notes: z.string().optional(),
    supplies_location: z.string().optional(),
    linen_provider: linenProviderSchema.optional(),
});

const maintenanceVendorSchema = z.object({
    name: z.string().min(1),
    phone: z.string().min(1),
    notes: z.string().optional(),
});

const hvacVendorSchema = z.object({
    company: z.string().min(1),
    phone: z.string().min(1),
    contract_id: z.string().optional(),
});

const maintenanceOpsSchema = z.object({
    plumber: maintenanceVendorSchema.optional(),
    electrician: maintenanceVendorSchema.optional(),
    general_handyman: maintenanceVendorSchema.optional(),
    hvac: hvacVendorSchema.optional(),
});

const buildingManagementOpsSchema = z.object({
    contact: contactInfoSchema.optional(),
    emergency_contact: contactInfoSchema.omit({ email: true }).optional(),
    notes: z.string().optional(),
});

const wifiRouterAdminSchema = z.object({
    location: z.string().optional(),
    admin_url: z.string().url('Must be a valid URL').optional(),
    admin_user: z.string().optional(),
    admin_password: z.string().optional(),
});

const troubleshootingOpsSchema = z.object({
    main_water_valve: z.string().optional(),
    fuse_box: z.string().optional(),
    gas_shutoff: z.string().optional(),
    wifi_router: wifiRouterAdminSchema.optional(),
    smart_lock_master_code: z.string().optional(),
    spare_keys_location: z.string().optional(),
});

const financialOpsSchema = z.object({
    cleaning_fee_eur: z.number().nonnegative().optional(),
    commission_rate_pct: z.number().min(0).max(100).optional(),
    payout_method: z.string().optional(),
    tax_id: z.string().optional(),
});

const internalOperationsSchema = z.object({
    cleaning: cleaningOpsSchema.optional(),
    maintenance: maintenanceOpsSchema.optional(),
    building_management: buildingManagementOpsSchema.optional(),
    troubleshooting: troubleshootingOpsSchema.optional(),
    financial: financialOpsSchema.optional(),
});

// ─── Top-Level Payload Schema ────────────────────────────────

/**
 * Root validation schema for `property_knowledge.knowledge_payload`.
 *
 * Usage:
 * ```ts
 * import { propertyKnowledgePayloadSchema } from '../schemas/propertyKnowledge.schema';
 *
 * const result = propertyKnowledgePayloadSchema.safeParse(formData);
 * if (!result.success) {
 *   console.error(result.error.flatten());
 * }
 * ```
 */
export const propertyKnowledgePayloadSchema = z.object({
    guest_facing: guestFacingContextSchema,
    internal_ops: internalOperationsSchema.optional(),
});

/** Inferred type — always stays in sync with the Zod schema */
export type PropertyKnowledgePayloadZod = z.infer<typeof propertyKnowledgePayloadSchema>;

// ─── Sub-schema exports (for partial form validation) ────────

export {
    // Guest-Facing sections
    logisticsSectionSchema,
    propertyHowToSectionSchema,
    rulesSectionSchema,
    conciergeSectionSchema,
    guestFacingContextSchema,

    // Internal-Ops sections
    cleaningOpsSchema,
    maintenanceOpsSchema,
    buildingManagementOpsSchema,
    troubleshootingOpsSchema,
    financialOpsSchema,
    internalOperationsSchema,

    // Shared
    contactInfoSchema,
};
