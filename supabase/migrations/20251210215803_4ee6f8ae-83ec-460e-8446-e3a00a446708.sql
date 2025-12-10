-- Add city and state columns to bf_florists for location display
ALTER TABLE bf_florists 
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS state text;

-- Drop existing restrictive policies that may conflict
DROP POLICY IF EXISTS "Users can view their own florist profile" ON bf_florists;
DROP POLICY IF EXISTS "Users can update their own florist profile" ON bf_florists;
DROP POLICY IF EXISTS "Users can insert their own florist profile" ON bf_florists;

-- Allow authenticated users to view verified florists (for campaign selection)
CREATE POLICY "Authenticated users can view verified florists"
ON bf_florists FOR SELECT
TO authenticated
USING (is_verified = true);

-- Florists can view their own profile (even if not verified)
CREATE POLICY "Florists can view own profile"
ON bf_florists FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Florists can insert their own profile
CREATE POLICY "Florists can insert own profile"
ON bf_florists FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Florists can update their own profile
CREATE POLICY "Florists can update own profile"
ON bf_florists FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());