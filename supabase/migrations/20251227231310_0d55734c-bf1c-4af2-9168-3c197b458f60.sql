-- Add order_id column to bf_payouts for better tracking
ALTER TABLE public.bf_payouts 
ADD COLUMN order_id uuid REFERENCES public.bf_orders(id);

-- Add failure_reason column to track why payouts failed
ALTER TABLE public.bf_payouts 
ADD COLUMN failure_reason text;

-- Create index for faster order-based lookups
CREATE INDEX idx_bf_payouts_order_id ON public.bf_payouts(order_id);

-- Create index for faster status lookups
CREATE INDEX idx_bf_payouts_status ON public.bf_payouts(status);