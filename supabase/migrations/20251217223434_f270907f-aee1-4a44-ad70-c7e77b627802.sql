-- Add per-product org profit percent column to bf_campaign_products
ALTER TABLE bf_campaign_products
ADD COLUMN IF NOT EXISTS org_profit_percent NUMERIC DEFAULT 25;