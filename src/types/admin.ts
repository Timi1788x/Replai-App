// ─── Admin Types ──────────────────────────────────────────────

export interface PlanRow {
    id: string;
    name: string;
    max_properties: number;
    price_monthly: number;
    created_at: string;
}

export interface UserLicenseRow {
    id: string;
    user_id: string;
    plan_id: string;
    is_active: boolean;
    max_properties: number;
    activated_at: string;
    expires_at: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

/** Shape returned by the admin_get_all_users() RPC */
export interface AdminUserRow {
    user_id: string;
    email: string;
    created_at: string;
    license_id: string | null;
    plan_name: string;
    is_active: boolean;
    max_properties: number;
    activated_at: string | null;
    expires_at: string | null;
    notes: string | null;
    property_count: number;
}

export interface AuditLogRow {
    id: string;
    admin_id: string;
    target_user_id: string | null;
    action: string;
    before_value: Record<string, unknown> | null;
    after_value: Record<string, unknown> | null;
    created_at: string;
}

// ─── Mutation Payloads ────────────────────────────────────────

export interface SetLicenseActivePayload {
    target_user_id: string;
    is_active: boolean;
}

export interface SetMaxPropertiesPayload {
    target_user_id: string;
    max_properties: number;
}

export interface SetNotesPayload {
    target_user_id: string;
    notes: string;
}
