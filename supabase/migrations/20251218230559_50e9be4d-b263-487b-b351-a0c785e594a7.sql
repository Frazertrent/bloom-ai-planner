-- Add campaign_link_code to existing self_register campaigns that don't have one
UPDATE bf_campaigns
SET campaign_link_code = substr(md5(random()::text || clock_timestamp()::text), 1, 16)
WHERE tracking_mode = 'self_register'
  AND campaign_link_code IS NULL;