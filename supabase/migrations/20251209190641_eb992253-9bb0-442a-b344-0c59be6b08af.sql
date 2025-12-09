-- Create BloomFundr role enum
CREATE TYPE public.bf_user_role AS ENUM ('florist', 'org_admin', 'org_member', 'customer');

-- Create BloomFundr user profiles table
CREATE TABLE public.bf_user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create BloomFundr user roles table (separate from profiles for security)
CREATE TABLE public.bf_user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role bf_user_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.bf_user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bf_user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check BloomFundr roles
CREATE OR REPLACE FUNCTION public.bf_has_role(_user_id UUID, _role bf_user_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.bf_user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to get user's BloomFundr role
CREATE OR REPLACE FUNCTION public.bf_get_user_role(_user_id UUID)
RETURNS bf_user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.bf_user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- RLS Policies for bf_user_profiles
CREATE POLICY "Users can view their own profile"
  ON public.bf_user_profiles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON public.bf_user_profiles
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own profile"
  ON public.bf_user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for bf_user_roles
CREATE POLICY "Users can view their own roles"
  ON public.bf_user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own initial role"
  ON public.bf_user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Trigger to update updated_at
CREATE TRIGGER update_bf_user_profiles_updated_at
  BEFORE UPDATE ON public.bf_user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();