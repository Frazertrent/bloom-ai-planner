-- Drop existing policy
DROP POLICY IF EXISTS "View order items for accessible orders" ON public.bf_order_items;

-- Create updated policy with magic link seller support
CREATE POLICY "View order items for accessible orders"
ON public.bf_order_items FOR SELECT
USING (
  order_id IN (
    SELECT id FROM public.bf_orders o
    WHERE bf_user_can_access_campaign(o.campaign_id)
    OR o.customer_id IN (
      SELECT id FROM public.bf_customers 
      WHERE email = auth.jwt() ->> 'email'
    )
    OR EXISTS (
      SELECT 1 FROM bf_campaign_students cs
      WHERE cs.campaign_id = o.campaign_id
      AND cs.magic_link_code IS NOT NULL
    )
  )
);