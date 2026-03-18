-- Migration 0007: Prevent direct client-side modification of plan and role columns
-- The authenticated role can no longer UPDATE plan or role on profiles.
-- Plan changes go through:
--   - polar-webhook Edge Function (service role, handles upgrades via Polar checkout)
--   - cancel-subscription Edge Function (service role, handles Free downgrade)
-- Both use the service role key which bypasses column-level privileges.

REVOKE UPDATE (plan, role) ON public.profiles FROM authenticated;
