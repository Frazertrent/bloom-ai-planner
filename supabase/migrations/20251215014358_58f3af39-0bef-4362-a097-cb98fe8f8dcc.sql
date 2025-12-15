-- Fix: Allow anonymous users to SELECT from bf_customers
-- Required for order creation flow where we:
-- 1. Check if customer exists by email
-- 2. Insert new customer and select the ID back

-- Add anonymous SELECT policy
CREATE POLICY "Anyone can view customers for order flow"
ON bf_customers
FOR SELECT
USING (true);