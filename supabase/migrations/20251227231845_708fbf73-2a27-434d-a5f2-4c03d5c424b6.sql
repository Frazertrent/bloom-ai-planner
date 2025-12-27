-- Add refund tracking columns to bf_orders
ALTER TABLE public.bf_orders 
ADD COLUMN IF NOT EXISTS refund_status text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS refunded_at timestamp with time zone DEFAULT NULL,
ADD COLUMN IF NOT EXISTS refund_amount numeric DEFAULT NULL,
ADD COLUMN IF NOT EXISTS stripe_refund_id text DEFAULT NULL;

-- Create index for refund status lookups
CREATE INDEX IF NOT EXISTS idx_bf_orders_refund_status ON public.bf_orders(refund_status) WHERE refund_status IS NOT NULL;

-- Add refund tracking to payouts (for reversal records)
ALTER TABLE public.bf_payouts 
ADD COLUMN IF NOT EXISTS is_reversal boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS original_payout_id uuid REFERENCES public.bf_payouts(id);

-- Create bf_platform_stats table for admin dashboard
CREATE TABLE IF NOT EXISTS public.bf_platform_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stat_date date NOT NULL UNIQUE,
  total_orders integer DEFAULT 0,
  total_revenue numeric DEFAULT 0,
  total_platform_fees numeric DEFAULT 0,
  total_processing_fees numeric DEFAULT 0,
  total_florist_payouts numeric DEFAULT 0,
  total_org_payouts numeric DEFAULT 0,
  total_refunds numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on platform stats (admin only)
ALTER TABLE public.bf_platform_stats ENABLE ROW LEVEL SECURITY;

-- Platform stats are read-only and managed by system
-- No user policies needed - accessed via service role only