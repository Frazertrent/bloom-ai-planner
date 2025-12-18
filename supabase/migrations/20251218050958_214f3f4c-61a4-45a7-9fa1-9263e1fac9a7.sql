-- Add lifetime earnings tracking to florists and organizations
ALTER TABLE bf_florists 
ADD COLUMN IF NOT EXISTS total_lifetime_earnings NUMERIC DEFAULT 0;

ALTER TABLE bf_organizations 
ADD COLUMN IF NOT EXISTS total_lifetime_earnings NUMERIC DEFAULT 0;

-- Add RLS policy to allow payout inserts (edge functions use service role, but good to have)
CREATE POLICY "Allow payout inserts from edge functions" 
ON bf_payouts 
FOR INSERT 
WITH CHECK (true);