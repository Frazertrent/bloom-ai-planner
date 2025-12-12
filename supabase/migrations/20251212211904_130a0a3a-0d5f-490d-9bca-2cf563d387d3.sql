-- Allow authenticated users (including orgs) to view products from verified florists
CREATE POLICY "Anyone can view products from verified florists" 
ON bf_products
FOR SELECT
USING (
  florist_id IN (
    SELECT id FROM bf_florists WHERE is_verified = true
  )
);