-- Allow anyone to view campaigns by self_register_code for seller self-registration
CREATE POLICY "Anyone can view campaigns by self_register_code"
ON bf_campaigns
FOR SELECT
USING (
  self_register_code IS NOT NULL 
  AND tracking_mode = 'self_register'
);

-- Allow anonymous users to register as sellers for self_register campaigns
CREATE POLICY "Anyone can self-register as a seller"
ON bf_students
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM bf_campaigns 
    WHERE bf_campaigns.organization_id = bf_students.organization_id
    AND bf_campaigns.tracking_mode = 'self_register'
    AND (bf_campaigns.self_registration_open = true OR bf_campaigns.status = 'draft')
  )
);

-- Allow anonymous users to join campaigns via self-registration
CREATE POLICY "Anyone can join self_register campaigns"
ON bf_campaign_students
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM bf_campaigns 
    WHERE bf_campaigns.id = bf_campaign_students.campaign_id
    AND bf_campaigns.tracking_mode = 'self_register'
    AND (bf_campaigns.self_registration_open = true OR bf_campaigns.status = 'draft')
  )
);