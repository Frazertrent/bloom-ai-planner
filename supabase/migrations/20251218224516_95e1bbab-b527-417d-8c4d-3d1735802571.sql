-- Retroactively calculate payouts for paid orders that don't have payout records
-- and update lifetime earnings for organizations and florists

DO $$
DECLARE
  order_record RECORD;
  campaign_record RECORD;
  florist_payout NUMERIC;
  org_payout NUMERIC;
  platform_fee_percent NUMERIC;
BEGIN
  -- Loop through all paid orders that don't have payouts yet
  FOR order_record IN 
    SELECT o.id, o.subtotal, o.platform_fee, o.processing_fee, o.campaign_id, o.total
    FROM bf_orders o
    WHERE o.payment_status = 'paid'
    AND NOT EXISTS (
      SELECT 1 FROM bf_payouts p WHERE p.campaign_id = o.campaign_id AND p.recipient_type = 'florist'
    )
  LOOP
    -- Get campaign details
    SELECT c.florist_id, c.organization_id, c.florist_margin_percent, c.organization_margin_percent, c.platform_fee_percent
    INTO campaign_record
    FROM bf_campaigns c
    WHERE c.id = order_record.campaign_id;
    
    -- Calculate payouts (after platform and processing fees)
    platform_fee_percent := COALESCE(campaign_record.platform_fee_percent, 10);
    
    -- Net revenue after fees
    DECLARE
      net_revenue NUMERIC := order_record.subtotal - order_record.platform_fee - order_record.processing_fee;
      florist_percent NUMERIC := campaign_record.florist_margin_percent;
      org_percent NUMERIC := campaign_record.organization_margin_percent;
    BEGIN
      florist_payout := net_revenue * (florist_percent / 100);
      org_payout := net_revenue * (org_percent / 100);
      
      -- Insert florist payout if > 0
      IF florist_payout > 0 THEN
        INSERT INTO bf_payouts (campaign_id, recipient_type, recipient_id, amount, status)
        VALUES (order_record.campaign_id, 'florist', campaign_record.florist_id, florist_payout, 'pending')
        ON CONFLICT DO NOTHING;
        
        -- Update florist lifetime earnings
        UPDATE bf_florists
        SET total_lifetime_earnings = COALESCE(total_lifetime_earnings, 0) + florist_payout
        WHERE id = campaign_record.florist_id;
      END IF;
      
      -- Insert organization payout if > 0
      IF org_payout > 0 THEN
        INSERT INTO bf_payouts (campaign_id, recipient_type, recipient_id, amount, status)
        VALUES (order_record.campaign_id, 'organization', campaign_record.organization_id, org_payout, 'pending')
        ON CONFLICT DO NOTHING;
        
        -- Update organization lifetime earnings
        UPDATE bf_organizations
        SET total_lifetime_earnings = COALESCE(total_lifetime_earnings, 0) + org_payout
        WHERE id = campaign_record.organization_id;
      END IF;
    END;
  END LOOP;
END $$;