-- Fix infinite recursion in RLS policies by removing circular references

-- Drop the problematic policy that causes circular reference
DROP POLICY IF EXISTS "Anyone can view campaigns via magic link" ON bf_campaigns;

-- Add a self-contained policy for draft self_register campaigns (no subqueries to other tables)
CREATE POLICY "Anyone can view draft self_register campaigns"
ON bf_campaigns
FOR SELECT
USING (status = 'draft' AND tracking_mode = 'self_register');

-- Tighten the campaign_students policy to only expose records with valid magic links
DROP POLICY IF EXISTS "Anyone can view campaign students by magic link code" ON bf_campaign_students;
CREATE POLICY "Anyone can view campaign students by magic link code"
ON bf_campaign_students
FOR SELECT
USING (magic_link_code IS NOT NULL);