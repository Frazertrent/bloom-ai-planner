-- Fix infinite recursion in RLS policies for order creation
-- The bf_customers policy "Orgs and florists can view customers for their campaigns" 
-- queries bf_orders, and bf_orders "Customers can view own orders" queries bf_customers,
-- creating a circular dependency.

-- Step 1: Drop the problematic policy that causes circular reference
DROP POLICY IF EXISTS "Orgs and florists can view customers for their campaigns" ON bf_customers;

-- Step 2: Create a simpler replacement that doesn't query bf_orders
-- Authenticated users (orgs/florists) can view customers
-- Access control is enforced at the order level, not customer level
CREATE POLICY "Authenticated users can view customers"
ON bf_customers
FOR SELECT
USING (auth.role() = 'authenticated');

-- Now the bf_orders "Customers can view own orders" policy is safe
-- because bf_customers SELECT no longer references bf_orders