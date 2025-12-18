-- Drop the existing constraint
ALTER TABLE public.bf_campaigns 
DROP CONSTRAINT IF EXISTS bf_campaigns_status_check;

-- Add new constraint with "scheduled" included
ALTER TABLE public.bf_campaigns 
ADD CONSTRAINT bf_campaigns_status_check 
CHECK (status = ANY (ARRAY['draft'::text, 'scheduled'::text, 'active'::text, 'closed'::text, 'fulfilled'::text, 'completed'::text, 'cancelled'::text]));