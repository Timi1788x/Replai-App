-- ═══════════════════════════════════════════════════════════════
-- Auto-respond global migration
-- Moves auto_respond_enabled from per-property → per-host (global)
-- Run after: auto_respond_migration.sql
-- ═══════════════════════════════════════════════════════════════

-- ── 1. host_settings table ───────────────────────────────────

CREATE TABLE IF NOT EXISTS public.host_settings (
    user_id    UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    auto_respond_enabled BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.host_settings ENABLE ROW LEVEL SECURITY;

-- Hosts can read and write only their own row
CREATE POLICY "host_settings_own"
    ON public.host_settings
    USING  (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Auto-create a settings row when a new user signs up
CREATE OR REPLACE FUNCTION public.create_host_settings()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    INSERT INTO public.host_settings (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_host_settings ON auth.users;
CREATE TRIGGER on_auth_user_created_host_settings
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.create_host_settings();

-- Back-fill a row for every existing user
INSERT INTO public.host_settings (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- ── 2. Remove per-property auto-respond columns ──────────────
-- (added by auto_respond_migration.sql — safe to drop now)

ALTER TABLE public.properties
    DROP COLUMN IF EXISTS auto_respond_enabled,
    DROP COLUMN IF EXISTS auto_respond_delay_seconds;

-- ── 3. Update auto_send_draft() to check host_settings ───────

CREATE OR REPLACE FUNCTION public.auto_send_draft(p_conversation_id UUID)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_draft    TEXT;
    v_status   draft_status;
    v_paused   TIMESTAMPTZ;
    v_host_id  UUID;
    v_enabled  BOOLEAN;
BEGIN
    -- Fetch conversation + host_id
    SELECT
        c.ai_draft_reply,
        c.ai_draft_status,
        c.auto_respond_paused_until,
        c.host_id
    INTO v_draft, v_status, v_paused, v_host_id
    FROM   public.conversations c
    WHERE  c.id = p_conversation_id
    FOR UPDATE OF c;

    -- Fetch global auto-respond setting for this host
    SELECT COALESCE(hs.auto_respond_enabled, false)
    INTO   v_enabled
    FROM   public.host_settings hs
    WHERE  hs.user_id = v_host_id;

    -- Guard rails (all must pass)
    IF v_draft   IS NULL                          THEN RETURN false; END IF;
    IF v_status  != 'pending'                     THEN RETURN false; END IF;
    IF NOT COALESCE(v_enabled, false)             THEN RETURN false; END IF;
    IF v_paused IS NOT NULL AND v_paused > now()  THEN RETURN false; END IF;

    -- Send: insert message (notify_n8n_outbound_message trigger fires here)
    INSERT INTO public.messages (conversation_id, sender, body, status)
    VALUES (p_conversation_id, 'host', v_draft, 'pending');

    -- Clear draft on conversation
    UPDATE public.conversations
    SET    ai_draft_reply  = NULL,
           ai_draft_status = 'approved'
    WHERE  id = p_conversation_id;

    RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.auto_send_draft(UUID) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.auto_send_draft(UUID) TO service_role;
