-- Add RLS policies for public order page access
-- These allow anonymous users to view campaign data via magic link

-- Allow anyone to view campaign students (needed to look up magic link)
CREATE POLICY "Anyone can view campaign students by magic link code"
ON public.bf_campaign_students
FOR SELECT
USING (true);

-- Note: bf_campaigns already has RLS policies for orgs/florists
-- We need to allow public access for active campaigns
CREATE POLICY "Anyone can view active campaigns"
ON public.bf_campaigns
FOR SELECT
USING (status = 'active');

-- Allow anyone to view organizations for public pages
CREATE POLICY "Anyone can view organizations"
ON public.bf_organizations
FOR SELECT
USING (true);

-- Allow anyone to view students (for name display on order pages)
CREATE POLICY "Anyone can view students"
ON public.bf_students
FOR SELECT
USING (true);

-- Allow anyone to view campaign products for active campaigns
CREATE POLICY "Anyone can view campaign products for active campaigns"
ON public.bf_campaign_products
FOR SELECT
USING (
  campaign_id IN (
    SELECT id FROM bf_campaigns WHERE status = 'active'
  )
);

-- Allow anyone to view products that are in active campaigns
CREATE POLICY "Anyone can view products in active campaigns"
ON public.bf_products
FOR SELECT
USING (
  id IN (
    SELECT product_id FROM bf_campaign_products
    WHERE campaign_id IN (
      SELECT id FROM bf_campaigns WHERE status = 'active'
    )
  )
);