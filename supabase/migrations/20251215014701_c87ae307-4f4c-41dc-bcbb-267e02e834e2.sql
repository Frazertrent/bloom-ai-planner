-- Fix: Allow anonymous users to SELECT from bf_orders
-- Required for order confirmation after checkout where we use .select("id, order_number")

CREATE POLICY "Anyone can view orders for confirmation"
ON bf_orders
FOR SELECT
USING (true);