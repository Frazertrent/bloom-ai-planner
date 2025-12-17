-- Add customer_name column to bf_orders to store per-order customer name
ALTER TABLE public.bf_orders 
ADD COLUMN customer_name text;

-- Backfill existing orders with customer name from bf_customers
UPDATE public.bf_orders o
SET customer_name = c.full_name
FROM public.bf_customers c
WHERE o.customer_id = c.id AND o.customer_name IS NULL;