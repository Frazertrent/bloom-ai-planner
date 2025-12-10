-- Add tracking mode and link columns to bf_campaigns
ALTER TABLE bf_campaigns 
ADD COLUMN tracking_mode TEXT DEFAULT 'individual' 
  CHECK (tracking_mode IN ('none', 'individual', 'self_register'));

ALTER TABLE bf_campaigns 
ADD COLUMN self_register_code TEXT UNIQUE;

ALTER TABLE bf_campaigns 
ADD COLUMN campaign_link_code TEXT UNIQUE;

ALTER TABLE bf_campaigns 
ADD COLUMN self_registration_open BOOLEAN DEFAULT true;