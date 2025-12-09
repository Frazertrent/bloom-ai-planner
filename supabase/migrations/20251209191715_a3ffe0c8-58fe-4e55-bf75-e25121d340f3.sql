-- Create bf_florists table
CREATE TABLE public.bf_florists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name text NOT NULL,
  business_address text,
  business_phone text,
  stripe_account_id text,
  is_verified boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id)
);

-- Create bf_organizations table
CREATE TABLE public.bf_organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  org_type text NOT NULL CHECK (org_type IN ('school', 'sports', 'dance', 'cheer', 'church', 'other')),
  address text,
  contact_phone text,
  stripe_account_id text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.bf_florists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bf_organizations ENABLE ROW LEVEL SECURITY;

-- RLS policies for bf_florists
CREATE POLICY "Users can view their own florist profile"
ON public.bf_florists FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own florist profile"
ON public.bf_florists FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own florist profile"
ON public.bf_florists FOR UPDATE
USING (user_id = auth.uid());

-- RLS policies for bf_organizations
CREATE POLICY "Users can view their own organization"
ON public.bf_organizations FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own organization"
ON public.bf_organizations FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own organization"
ON public.bf_organizations FOR UPDATE
USING (user_id = auth.uid());

-- Updated_at triggers
CREATE TRIGGER update_bf_florists_updated_at
BEFORE UPDATE ON public.bf_florists
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bf_organizations_updated_at
BEFORE UPDATE ON public.bf_organizations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();