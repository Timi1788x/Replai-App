-- ============================================================================
-- Onboarding Migration
-- Adds onboarding_completed flag to host_settings so we can show/hide
-- the onboarding checklist card on the inbox page.
-- Run AFTER: admin_panel_migration.sql
-- Idempotent: safe to re-run.
-- ============================================================================

ALTER TABLE public.host_settings
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false;

-- Ensure RLS is still enabled (it should be from the base schema)
ALTER TABLE public.host_settings ENABLE ROW LEVEL SECURITY;
