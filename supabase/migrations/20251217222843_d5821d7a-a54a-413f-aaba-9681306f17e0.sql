-- Allow anyone to view campaigns via campaign_link_code (for 'none' and 'individual' tracking mode order links)
CREATE POLICY "Anyone can view campaigns by campaign_link_code"
ON bf_campaigns FOR SELECT
USING (campaign_link_code IS NOT NULL);