-- Create bf_products table
CREATE TABLE public.bf_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  florist_id uuid NOT NULL REFERENCES public.bf_florists(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  category text NOT NULL CHECK (category IN ('boutonniere', 'corsage', 'bouquet', 'custom')),
  base_cost decimal(10,2) NOT NULL,
  image_url text,
  is_active boolean DEFAULT true,
  customization_options jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create bf_campaigns table
CREATE TABLE public.bf_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.bf_organizations(id) ON DELETE CASCADE,
  florist_id uuid NOT NULL REFERENCES public.bf_florists(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  start_date date NOT NULL,
  end_date date NOT NULL,
  pickup_date date,
  pickup_location text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'closed', 'fulfilled', 'completed')),
  florist_margin_percent decimal(5,2) NOT NULL,
  organization_margin_percent decimal(5,2) NOT NULL,
  platform_fee_percent decimal(5,2) DEFAULT 10,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create bf_campaign_products table
CREATE TABLE public.bf_campaign_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.bf_campaigns(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.bf_products(id) ON DELETE CASCADE,
  retail_price decimal(10,2) NOT NULL,
  max_quantity integer,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(campaign_id, product_id)
);

-- Create bf_students table
CREATE TABLE public.bf_students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.bf_organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text,
  phone text,
  grade text,
  team_group text,
  unique_code text UNIQUE NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create bf_campaign_students table
CREATE TABLE public.bf_campaign_students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.bf_campaigns(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.bf_students(id) ON DELETE CASCADE,
  magic_link_code text UNIQUE NOT NULL,
  total_sales decimal(10,2) DEFAULT 0,
  order_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(campaign_id, student_id)
);

-- Enable RLS on all tables
ALTER TABLE public.bf_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bf_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bf_campaign_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bf_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bf_campaign_students ENABLE ROW LEVEL SECURITY;

-- Helper function to get florist_id for current user
CREATE OR REPLACE FUNCTION public.bf_get_user_florist_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.bf_florists WHERE user_id = auth.uid() LIMIT 1
$$;

-- Helper function to get organization_id for current user
CREATE OR REPLACE FUNCTION public.bf_get_user_organization_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.bf_organizations WHERE user_id = auth.uid() LIMIT 1
$$;

-- RLS policies for bf_products (Florists can CRUD their own products)
CREATE POLICY "Florists can view their own products"
ON public.bf_products FOR SELECT
USING (florist_id = bf_get_user_florist_id());

CREATE POLICY "Florists can insert their own products"
ON public.bf_products FOR INSERT
WITH CHECK (florist_id = bf_get_user_florist_id());

CREATE POLICY "Florists can update their own products"
ON public.bf_products FOR UPDATE
USING (florist_id = bf_get_user_florist_id());

CREATE POLICY "Florists can delete their own products"
ON public.bf_products FOR DELETE
USING (florist_id = bf_get_user_florist_id());

-- RLS policies for bf_campaigns
CREATE POLICY "Organizations can view their own campaigns"
ON public.bf_campaigns FOR SELECT
USING (organization_id = bf_get_user_organization_id());

CREATE POLICY "Florists can view campaigns assigned to them"
ON public.bf_campaigns FOR SELECT
USING (florist_id = bf_get_user_florist_id());

CREATE POLICY "Organizations can insert their own campaigns"
ON public.bf_campaigns FOR INSERT
WITH CHECK (organization_id = bf_get_user_organization_id());

CREATE POLICY "Organizations can update their own campaigns"
ON public.bf_campaigns FOR UPDATE
USING (organization_id = bf_get_user_organization_id());

CREATE POLICY "Organizations can delete their own campaigns"
ON public.bf_campaigns FOR DELETE
USING (organization_id = bf_get_user_organization_id());

-- RLS policies for bf_campaign_products
CREATE POLICY "View campaign products for own campaigns"
ON public.bf_campaign_products FOR SELECT
USING (
  campaign_id IN (
    SELECT id FROM public.bf_campaigns 
    WHERE organization_id = bf_get_user_organization_id() 
       OR florist_id = bf_get_user_florist_id()
  )
);

CREATE POLICY "Organizations can manage campaign products"
ON public.bf_campaign_products FOR INSERT
WITH CHECK (
  campaign_id IN (
    SELECT id FROM public.bf_campaigns 
    WHERE organization_id = bf_get_user_organization_id()
  )
);

CREATE POLICY "Organizations can update campaign products"
ON public.bf_campaign_products FOR UPDATE
USING (
  campaign_id IN (
    SELECT id FROM public.bf_campaigns 
    WHERE organization_id = bf_get_user_organization_id()
  )
);

CREATE POLICY "Organizations can delete campaign products"
ON public.bf_campaign_products FOR DELETE
USING (
  campaign_id IN (
    SELECT id FROM public.bf_campaigns 
    WHERE organization_id = bf_get_user_organization_id()
  )
);

-- RLS policies for bf_students (Organizations can CRUD their own students)
CREATE POLICY "Organizations can view their own students"
ON public.bf_students FOR SELECT
USING (organization_id = bf_get_user_organization_id());

CREATE POLICY "Organizations can insert their own students"
ON public.bf_students FOR INSERT
WITH CHECK (organization_id = bf_get_user_organization_id());

CREATE POLICY "Organizations can update their own students"
ON public.bf_students FOR UPDATE
USING (organization_id = bf_get_user_organization_id());

CREATE POLICY "Organizations can delete their own students"
ON public.bf_students FOR DELETE
USING (organization_id = bf_get_user_organization_id());

-- RLS policies for bf_campaign_students
CREATE POLICY "View campaign students for own campaigns"
ON public.bf_campaign_students FOR SELECT
USING (
  campaign_id IN (
    SELECT id FROM public.bf_campaigns 
    WHERE organization_id = bf_get_user_organization_id() 
       OR florist_id = bf_get_user_florist_id()
  )
);

CREATE POLICY "Organizations can manage campaign students"
ON public.bf_campaign_students FOR INSERT
WITH CHECK (
  campaign_id IN (
    SELECT id FROM public.bf_campaigns 
    WHERE organization_id = bf_get_user_organization_id()
  )
);

CREATE POLICY "Organizations can update campaign students"
ON public.bf_campaign_students FOR UPDATE
USING (
  campaign_id IN (
    SELECT id FROM public.bf_campaigns 
    WHERE organization_id = bf_get_user_organization_id()
  )
);

CREATE POLICY "Organizations can delete campaign students"
ON public.bf_campaign_students FOR DELETE
USING (
  campaign_id IN (
    SELECT id FROM public.bf_campaigns 
    WHERE organization_id = bf_get_user_organization_id()
  )
);

-- Updated_at triggers
CREATE TRIGGER update_bf_products_updated_at
BEFORE UPDATE ON public.bf_products
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bf_campaigns_updated_at
BEFORE UPDATE ON public.bf_campaigns
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bf_students_updated_at
BEFORE UPDATE ON public.bf_students
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();