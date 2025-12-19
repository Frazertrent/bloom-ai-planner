-- Create custom options table for managing dropdown options
CREATE TABLE public.bf_custom_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_type TEXT NOT NULL CHECK (owner_type IN ('organization', 'florist')),
  owner_id UUID NOT NULL,
  option_category TEXT NOT NULL,
  option_value TEXT NOT NULL,
  option_label TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(owner_id, option_category, option_value)
);

-- Enable RLS
ALTER TABLE public.bf_custom_options ENABLE ROW LEVEL SECURITY;

-- Organizations can manage their own options
CREATE POLICY "Organizations can view their own options"
ON public.bf_custom_options
FOR SELECT
USING (
  owner_type = 'organization' AND owner_id = bf_get_user_organization_id()
);

CREATE POLICY "Organizations can insert their own options"
ON public.bf_custom_options
FOR INSERT
WITH CHECK (
  owner_type = 'organization' AND owner_id = bf_get_user_organization_id()
);

CREATE POLICY "Organizations can update their own options"
ON public.bf_custom_options
FOR UPDATE
USING (
  owner_type = 'organization' AND owner_id = bf_get_user_organization_id()
);

CREATE POLICY "Organizations can delete their own options"
ON public.bf_custom_options
FOR DELETE
USING (
  owner_type = 'organization' AND owner_id = bf_get_user_organization_id()
);

-- Florists can manage their own options
CREATE POLICY "Florists can view their own options"
ON public.bf_custom_options
FOR SELECT
USING (
  owner_type = 'florist' AND owner_id = bf_get_user_florist_id()
);

CREATE POLICY "Florists can insert their own options"
ON public.bf_custom_options
FOR INSERT
WITH CHECK (
  owner_type = 'florist' AND owner_id = bf_get_user_florist_id()
);

CREATE POLICY "Florists can update their own options"
ON public.bf_custom_options
FOR UPDATE
USING (
  owner_type = 'florist' AND owner_id = bf_get_user_florist_id()
);

CREATE POLICY "Florists can delete their own options"
ON public.bf_custom_options
FOR DELETE
USING (
  owner_type = 'florist' AND owner_id = bf_get_user_florist_id()
);

-- Add updated_at trigger
CREATE TRIGGER update_bf_custom_options_updated_at
BEFORE UPDATE ON public.bf_custom_options
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();