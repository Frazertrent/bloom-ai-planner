-- Create bf_customers table
CREATE TABLE public.bf_customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  full_name text NOT NULL,
  phone text,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(email)
);

-- Create sequence for order numbers
CREATE SEQUENCE IF NOT EXISTS bf_order_number_seq START WITH 1;

-- Function to generate order numbers
CREATE OR REPLACE FUNCTION public.bf_generate_order_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  year_part text;
  seq_part text;
BEGIN
  year_part := to_char(CURRENT_DATE, 'YYYY');
  seq_part := lpad(nextval('bf_order_number_seq')::text, 6, '0');
  RETURN 'BF-' || year_part || '-' || seq_part;
END;
$$;

-- Create bf_orders table
CREATE TABLE public.bf_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL DEFAULT bf_generate_order_number(),
  campaign_id uuid NOT NULL REFERENCES public.bf_campaigns(id) ON DELETE RESTRICT,
  customer_id uuid NOT NULL REFERENCES public.bf_customers(id) ON DELETE RESTRICT,
  attributed_student_id uuid REFERENCES public.bf_students(id) ON DELETE SET NULL,
  subtotal decimal(10,2) NOT NULL,
  platform_fee decimal(10,2) NOT NULL DEFAULT 0,
  processing_fee decimal(10,2) NOT NULL DEFAULT 0,
  total decimal(10,2) NOT NULL,
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  stripe_payment_intent_id text,
  paid_at timestamp with time zone,
  fulfillment_status text NOT NULL DEFAULT 'pending' CHECK (fulfillment_status IN ('pending', 'in_production', 'ready', 'picked_up')),
  entry_method text NOT NULL DEFAULT 'online' CHECK (entry_method IN ('online', 'manual')),
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create bf_order_items table
CREATE TABLE public.bf_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.bf_orders(id) ON DELETE CASCADE,
  campaign_product_id uuid NOT NULL REFERENCES public.bf_campaign_products(id) ON DELETE RESTRICT,
  quantity integer NOT NULL DEFAULT 1,
  unit_price decimal(10,2) NOT NULL,
  customizations jsonb,
  recipient_name text,
  created_at timestamp with time zone DEFAULT now()
);

-- Create bf_payouts table
CREATE TABLE public.bf_payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.bf_campaigns(id) ON DELETE RESTRICT,
  recipient_type text NOT NULL CHECK (recipient_type IN ('florist', 'organization')),
  recipient_id uuid NOT NULL,
  amount decimal(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  stripe_transfer_id text,
  processed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.bf_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bf_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bf_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bf_payouts ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user owns a campaign (as org or florist)
CREATE OR REPLACE FUNCTION public.bf_user_can_access_campaign(campaign_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.bf_campaigns
    WHERE id = campaign_uuid
    AND (
      organization_id = bf_get_user_organization_id()
      OR florist_id = bf_get_user_florist_id()
    )
  )
$$;

-- RLS policies for bf_customers
CREATE POLICY "Customers can view own record"
ON public.bf_customers FOR SELECT
USING (email = auth.jwt() ->> 'email');

CREATE POLICY "Anyone can insert customers"
ON public.bf_customers FOR INSERT
WITH CHECK (true);

CREATE POLICY "Orgs and florists can view customers for their campaigns"
ON public.bf_customers FOR SELECT
USING (
  id IN (
    SELECT customer_id FROM public.bf_orders
    WHERE bf_user_can_access_campaign(campaign_id)
  )
);

-- RLS policies for bf_orders
CREATE POLICY "Customers can view own orders"
ON public.bf_orders FOR SELECT
USING (
  customer_id IN (
    SELECT id FROM public.bf_customers 
    WHERE email = auth.jwt() ->> 'email'
  )
);

CREATE POLICY "Orgs can view orders for their campaigns"
ON public.bf_orders FOR SELECT
USING (
  campaign_id IN (
    SELECT id FROM public.bf_campaigns 
    WHERE organization_id = bf_get_user_organization_id()
  )
);

CREATE POLICY "Florists can view orders for their campaigns"
ON public.bf_orders FOR SELECT
USING (
  campaign_id IN (
    SELECT id FROM public.bf_campaigns 
    WHERE florist_id = bf_get_user_florist_id()
  )
);

CREATE POLICY "Allow order creation"
ON public.bf_orders FOR INSERT
WITH CHECK (true);

CREATE POLICY "Orgs can update orders for their campaigns"
ON public.bf_orders FOR UPDATE
USING (
  campaign_id IN (
    SELECT id FROM public.bf_campaigns 
    WHERE organization_id = bf_get_user_organization_id()
  )
);

CREATE POLICY "Florists can update orders for their campaigns"
ON public.bf_orders FOR UPDATE
USING (
  campaign_id IN (
    SELECT id FROM public.bf_campaigns 
    WHERE florist_id = bf_get_user_florist_id()
  )
);

-- RLS policies for bf_order_items
CREATE POLICY "View order items for accessible orders"
ON public.bf_order_items FOR SELECT
USING (
  order_id IN (
    SELECT id FROM public.bf_orders o
    WHERE bf_user_can_access_campaign(o.campaign_id)
    OR o.customer_id IN (
      SELECT id FROM public.bf_customers 
      WHERE email = auth.jwt() ->> 'email'
    )
  )
);

CREATE POLICY "Allow order item creation"
ON public.bf_order_items FOR INSERT
WITH CHECK (true);

-- RLS policies for bf_payouts
CREATE POLICY "Orgs can view payouts for their campaigns"
ON public.bf_payouts FOR SELECT
USING (
  campaign_id IN (
    SELECT id FROM public.bf_campaigns 
    WHERE organization_id = bf_get_user_organization_id()
  )
);

CREATE POLICY "Florists can view payouts for their campaigns"
ON public.bf_payouts FOR SELECT
USING (
  campaign_id IN (
    SELECT id FROM public.bf_campaigns 
    WHERE florist_id = bf_get_user_florist_id()
  )
);

-- Updated_at trigger for orders
CREATE TRIGGER update_bf_orders_updated_at
BEFORE UPDATE ON public.bf_orders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();