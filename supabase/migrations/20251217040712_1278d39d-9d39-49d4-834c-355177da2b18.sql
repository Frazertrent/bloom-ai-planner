-- Add stripe_session_id column to bf_orders for payment tracking
ALTER TABLE public.bf_orders 
ADD COLUMN IF NOT EXISTS stripe_session_id text;