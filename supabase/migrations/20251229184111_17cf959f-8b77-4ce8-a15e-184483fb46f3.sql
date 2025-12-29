-- SECURITY FIX: Remove dangerous public INSERT policy on bf_payouts
-- Edge functions use service_role_key which bypasses RLS anyway,
-- so this policy only exposed the app to client-side fraud

DROP POLICY IF EXISTS "Allow payout inserts from edge functions" ON bf_payouts;