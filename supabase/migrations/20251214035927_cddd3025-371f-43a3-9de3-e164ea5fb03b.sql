-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Anyone can view campaign products for active campaigns" ON bf_campaign_products;
DROP POLICY IF EXISTS "Anyone can view campaigns via magic link" ON bf_campaigns;
DROP POLICY IF EXISTS "Anyone can view organizations for active campaigns" ON bf_organizations;

-- Recreate: Allow anyone to view campaign products for active/draft campaigns
CREATE POLICY "Anyone can view campaign products for active campaigns"
ON bf_campaign_products
FOR SELECT
USING (
  campaign_id IN (SELECT id FROM bf_campaigns WHERE status IN ('active', 'draft'))
);

-- Allow anyone to view campaigns that have campaign_students with magic links
CREATE POLICY "Anyone can view campaigns via magic link"
ON bf_campaigns
FOR SELECT
USING (
  id IN (SELECT campaign_id FROM bf_campaign_students WHERE magic_link_code IS NOT NULL)
);

-- Allow anyone to view organizations for active/draft campaigns
CREATE POLICY "Anyone can view organizations for active campaigns"
ON bf_organizations
FOR SELECT
USING (
  id IN (SELECT organization_id FROM bf_campaigns WHERE status IN ('active', 'draft'))
);