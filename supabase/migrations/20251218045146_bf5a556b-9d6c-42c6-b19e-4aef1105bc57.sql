-- Add 'delivered' to bf_orders.fulfillment_status CHECK constraint
ALTER TABLE bf_orders DROP CONSTRAINT IF EXISTS bf_orders_fulfillment_status_check;
ALTER TABLE bf_orders ADD CONSTRAINT bf_orders_fulfillment_status_check 
  CHECK (fulfillment_status IN ('pending', 'in_production', 'ready', 'picked_up', 'delivered'));