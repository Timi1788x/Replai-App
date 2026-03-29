-- ═══════════════════════════════════════════════════════════════
-- Auto-respond migration
-- Run after: admin_panel_migration.sql
-- ═══════════════════════════════════════════════════════════════

-- ── 1. Add auto-respond settings to properties ────────────────

ALTER TABLE public.properties
    ADD COLUMN IF NOT EXISTS auto_respond_enabled      BOOLEAN   NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS auto_respond_delay_seconds INTEGER   NOT NULL DEFAULT 300;

COMMENT ON COLUMN public.properties.auto_respond_enabled IS
    'When true, AI drafts are automatically sent after auto_respond_delay_seconds';
COMMENT ON COLUMN public.properties.auto_respond_delay_seconds IS
    'Delay before auto-sending the draft (seconds). Default 300 = 5 min.';

-- ── 2. Add per-conversation pause to conversations ────────────

ALTER TABLE public.conversations
    ADD COLUMN IF NOT EXISTS auto_respond_paused_until TIMESTAMPTZ;

COMMENT ON COLUMN public.conversations.auto_respond_paused_until IS
    'If set and in the future, auto-respond is suppressed for this conversation.';

-- ── 3. auto_send_draft(p_conversation_id) ────────────────────
--
-- Called by n8n after the delay window expires.
-- Atomically verifies all guard conditions and inserts the host
-- message in one transaction — prevents races during the delay.
--
-- Returns TRUE  → message was sent.
-- Returns FALSE → guard fired (draft gone, status changed, paused, disabled).

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
    v_enabled  BOOLEAN;
BEGIN
    SELECT
        c.ai_draft_reply,
        c.ai_draft_status,
        c.auto_respond_paused_until,
        p.auto_respond_enabled
    INTO v_draft, v_status, v_paused, v_enabled
    FROM   public.conversations c
    JOIN   public.properties    p ON p.id = c.property_id
    WHERE  c.id = p_conversation_id
    FOR UPDATE OF c;                -- lock row to prevent concurrent sends

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

-- ── 4. RLS: allow hosts to pause auto-respond on their conversations ──
-- The host already has UPDATE rights via the existing conversations RLS policy.
-- No extra policy needed — auto_respond_paused_until is just another column.
