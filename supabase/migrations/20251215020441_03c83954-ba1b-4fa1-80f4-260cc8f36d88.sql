-- Allow anonymous users to UPDATE orders (for payment status updates from checkout page)
CREATE POLICY "Anyone can update order payment status"
ON bf_orders
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Allow anonymous users to UPDATE campaign student stats
CREATE POLICY "Anyone can update campaign student stats"
ON bf_campaign_students
FOR UPDATE
USING (true)
WITH CHECK (true);