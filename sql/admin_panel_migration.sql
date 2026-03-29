-- ══════════════════════════════════════════════════════════════════════════════
-- PACKED — Admin Panel Migration
-- Run in: Supabase Dashboard → SQL Editor
-- Prerequisites: supabase_schema.sql + cloud_sync_migration.sql applied
-- ══════════════════════════════════════════════════════════════════════════════
--
-- After running this migration:
--   1. Enable Google OAuth in Supabase Dashboard → Authentication → Providers → Google
--   2. Add an admin user manually via service_role:
--      INSERT INTO public.admin_users (user_id) VALUES ('<your-uuid>');
-- ══════════════════════════════════════════════════════════════════════════════

BEGIN;


-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  1. PLANS  (billing stub — data model only, no payment implementation) ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

CREATE TABLE IF NOT EXISTS public.plans (
    id               UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
    name             TEXT        NOT NULL UNIQUE,       -- 'free', 'starter', 'pro'
    max_properties   INTEGER     NOT NULL DEFAULT 1,
    price_monthly    NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.plans
    IS 'Available subscription plans. Billing not yet implemented — data model stub only.';

-- Seed the free plan so the default FK in user_licenses always resolves.
INSERT INTO public.plans (id, name, max_properties, price_monthly)
VALUES ('00000000-0000-0000-0000-000000000001', 'free', 1, 0.00)
ON CONFLICT (name) DO NOTHING;

-- RLS: authenticated users can read (needed to display plan name in the host app).
-- Only service_role can write.
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read plans"
    ON public.plans FOR SELECT
    USING (auth.role() = 'authenticated');


-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  2. ADMIN_USERS  (server-side admin truth — never trust client JWT)    ║
-- ╚══════════════════════════════════════════════════════════════════════════╝
-- The is_admin() SECURITY DEFINER function reads this table.
-- No authenticated client can read or write it directly.

CREATE TABLE IF NOT EXISTS public.admin_users (
    user_id     UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by  UUID        REFERENCES auth.users(id) ON DELETE SET NULL
);

COMMENT ON TABLE public.admin_users
    IS 'Server-side admin registry. Access ONLY via is_admin() RPC. Never trust JWT metadata for admin checks.';

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Explicit deny-all for every client role — service_role bypasses RLS automatically.
CREATE POLICY "No client access to admin_users"
    ON public.admin_users FOR ALL
    USING (false)
    WITH CHECK (false);


-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  3. USER_LICENSES                                                      ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

CREATE TABLE IF NOT EXISTS public.user_licenses (
    id               UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id          UUID        NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id          UUID        NOT NULL REFERENCES public.plans(id) ON DELETE RESTRICT
                                 DEFAULT '00000000-0000-0000-0000-000000000001',
    is_active        BOOLEAN     NOT NULL DEFAULT true,
    max_properties   INTEGER     NOT NULL DEFAULT 1,
    activated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at       TIMESTAMPTZ,               -- NULL = perpetual
    notes            TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.user_licenses
    IS 'Per-user license state. max_properties is enforced by the host app before INSERT on properties.';

CREATE INDEX IF NOT EXISTS idx_user_licenses_user   ON public.user_licenses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_licenses_active ON public.user_licenses(is_active);

CREATE TRIGGER trg_user_licenses_updated
    BEFORE UPDATE ON public.user_licenses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.user_licenses ENABLE ROW LEVEL SECURITY;

-- A host can read their own license (needed for the app to enforce limits).
CREATE POLICY "User can read own license"
    ON public.user_licenses FOR SELECT
    USING (auth.uid() = user_id);

-- Admins can do everything — checked via is_admin() defined below.
-- NOTE: these policies reference is_admin(), which must be created first.
-- We create is_admin() in section 5 and use DO $$ to add admin policies after.


-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  4. ADMIN_AUDIT_LOG  (append-only — no UPDATE or DELETE for anyone)    ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

CREATE TABLE IF NOT EXISTS public.admin_audit_log (
    id             UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    target_user_id UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
    action         TEXT        NOT NULL,
    -- Examples: 'license.activate', 'license.deactivate',
    --           'license.set_max_properties', 'license.set_notes'
    before_value   JSONB,
    after_value    JSONB,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.admin_audit_log
    IS 'Append-only admin action log. INSERT via SECURITY DEFINER functions only. No UPDATE/DELETE ever.';

CREATE INDEX IF NOT EXISTS idx_audit_log_admin  ON public.admin_audit_log(admin_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_target ON public.admin_audit_log(target_user_id, created_at DESC);

ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
-- INSERT/UPDATE/DELETE policies intentionally omitted for client roles.
-- Inserts happen inside SECURITY DEFINER functions (service-level trust).
-- Admin SELECT policy added after is_admin() is defined below.


-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  5. SECURITY DEFINER FUNCTIONS                                         ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

-- ── 5a. is_admin(uid) ───────────────────────────────────────────────────────
-- Called from RLS policies and the frontend to verify admin status.
-- STABLE → PostgreSQL can cache the result within a single statement.
-- SECURITY DEFINER → runs as the function owner (postgres), can read admin_users.

CREATE OR REPLACE FUNCTION public.is_admin(uid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.admin_users WHERE user_id = uid
    );
$$;

COMMENT ON FUNCTION public.is_admin(uuid)
    IS 'Returns true if uid has a row in admin_users. Called from RLS policies and frontend RPC. Bypasses RLS via SECURITY DEFINER.';

GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;


-- ── Now that is_admin() exists, add the admin RLS policies ─────────────────

CREATE POLICY "Admins can read all licenses"
    ON public.user_licenses FOR SELECT
    USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert licenses"
    ON public.user_licenses FOR INSERT
    WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update licenses"
    ON public.user_licenses FOR UPDATE
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can read audit log"
    ON public.admin_audit_log FOR SELECT
    USING (public.is_admin(auth.uid()));

-- Allow admins to see all properties (needed for the detail panel property list).
CREATE POLICY "Admins can read all properties"
    ON public.properties FOR SELECT
    USING (public.is_admin(auth.uid()));


-- ── 5b. admin_get_all_users() ───────────────────────────────────────────────
-- Reads auth.users (inaccessible to the authenticated role directly).
-- Returns the customer table rows for the admin dashboard.

CREATE OR REPLACE FUNCTION public.admin_get_all_users()
RETURNS TABLE (
    user_id        UUID,
    email          TEXT,
    created_at     TIMESTAMPTZ,
    license_id     UUID,
    plan_name      TEXT,
    is_active      BOOLEAN,
    max_properties INTEGER,
    activated_at   TIMESTAMPTZ,
    expires_at     TIMESTAMPTZ,
    notes          TEXT,
    property_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NOT public.is_admin(auth.uid()) THEN
        RETURN; -- silently return empty for non-admins
    END IF;

    RETURN QUERY
    SELECT
        u.id                                              AS user_id,
        u.email::TEXT                                     AS email,
        u.created_at                                      AS created_at,
        ul.id                                             AS license_id,
        COALESCE(p.name, 'no license')::TEXT              AS plan_name,
        COALESCE(ul.is_active, false)                     AS is_active,
        COALESCE(ul.max_properties, 0)                    AS max_properties,
        ul.activated_at                                   AS activated_at,
        ul.expires_at                                     AS expires_at,
        ul.notes                                          AS notes,
        COUNT(pr.id)                                      AS property_count
    FROM auth.users u
    LEFT JOIN public.user_licenses ul ON ul.user_id = u.id
    LEFT JOIN public.plans p          ON p.id = ul.plan_id
    LEFT JOIN public.properties pr    ON pr.host_id = u.id
    GROUP BY u.id, u.email, u.created_at,
             ul.id, p.name, ul.is_active, ul.max_properties,
             ul.activated_at, ul.expires_at, ul.notes
    ORDER BY u.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_get_all_users() TO authenticated;


-- ── 5c. admin_set_license_active(target_user_id, is_active) ────────────────

CREATE OR REPLACE FUNCTION public.admin_set_license_active(
    p_target_user_id UUID,
    p_is_active      BOOLEAN
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_before JSONB;
    v_after  JSONB;
BEGIN
    IF NOT public.is_admin(auth.uid()) THEN
        RAISE EXCEPTION '[admin] Unauthorized: caller is not an admin';
    END IF;

    SELECT to_jsonb(ul) INTO v_before
    FROM public.user_licenses ul WHERE ul.user_id = p_target_user_id;

    INSERT INTO public.user_licenses (user_id, is_active)
    VALUES (p_target_user_id, p_is_active)
    ON CONFLICT (user_id) DO UPDATE
        SET is_active = EXCLUDED.is_active, updated_at = now();

    SELECT to_jsonb(ul) INTO v_after
    FROM public.user_licenses ul WHERE ul.user_id = p_target_user_id;

    INSERT INTO public.admin_audit_log (admin_id, target_user_id, action, before_value, after_value)
    VALUES (
        auth.uid(), p_target_user_id,
        CASE WHEN p_is_active THEN 'license.activate' ELSE 'license.deactivate' END,
        v_before, v_after
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_set_license_active(uuid, boolean) TO authenticated;


-- ── 5d. admin_set_max_properties(target_user_id, max_properties) ───────────

CREATE OR REPLACE FUNCTION public.admin_set_max_properties(
    p_target_user_id UUID,
    p_max_properties INTEGER
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_before JSONB;
    v_after  JSONB;
BEGIN
    IF NOT public.is_admin(auth.uid()) THEN
        RAISE EXCEPTION '[admin] Unauthorized: caller is not an admin';
    END IF;

    IF p_max_properties < 0 THEN
        RAISE EXCEPTION '[admin] max_properties cannot be negative';
    END IF;

    SELECT to_jsonb(ul) INTO v_before
    FROM public.user_licenses ul WHERE ul.user_id = p_target_user_id;

    INSERT INTO public.user_licenses (user_id, max_properties)
    VALUES (p_target_user_id, p_max_properties)
    ON CONFLICT (user_id) DO UPDATE
        SET max_properties = EXCLUDED.max_properties, updated_at = now();

    SELECT to_jsonb(ul) INTO v_after
    FROM public.user_licenses ul WHERE ul.user_id = p_target_user_id;

    INSERT INTO public.admin_audit_log (admin_id, target_user_id, action, before_value, after_value)
    VALUES (auth.uid(), p_target_user_id, 'license.set_max_properties', v_before, v_after);
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_set_max_properties(uuid, integer) TO authenticated;


-- ── 5e. admin_set_notes(target_user_id, notes) ─────────────────────────────

CREATE OR REPLACE FUNCTION public.admin_set_notes(
    p_target_user_id UUID,
    p_notes          TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NOT public.is_admin(auth.uid()) THEN
        RAISE EXCEPTION '[admin] Unauthorized: caller is not an admin';
    END IF;

    INSERT INTO public.user_licenses (user_id, notes)
    VALUES (p_target_user_id, p_notes)
    ON CONFLICT (user_id) DO UPDATE
        SET notes = EXCLUDED.notes, updated_at = now();

    INSERT INTO public.admin_audit_log (admin_id, target_user_id, action, after_value)
    VALUES (auth.uid(), p_target_user_id, 'license.set_notes',
            jsonb_build_object('notes', p_notes));
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_set_notes(uuid, text) TO authenticated;


COMMIT;

-- ══════════════════════════════════════════════════════════════════════════════
-- ✅  Admin panel migration complete.
--
-- Verify:
--   SELECT tablename FROM pg_tables
--   WHERE tablename IN ('plans','admin_users','user_licenses','admin_audit_log');
--
--   SELECT proname FROM pg_proc
--   WHERE proname IN ('is_admin','admin_get_all_users','admin_set_license_active',
--                     'admin_set_max_properties','admin_set_notes');
--
-- Add first admin (replace with your actual UUID):
--   INSERT INTO public.admin_users (user_id)
--   VALUES ('<your-supabase-user-uuid>');
--
-- Test is_admin RPC (run as authenticated user):
--   SELECT public.is_admin(auth.uid());
-- ══════════════════════════════════════════════════════════════════════════════
