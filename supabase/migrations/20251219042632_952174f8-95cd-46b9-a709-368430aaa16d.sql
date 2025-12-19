-- Add personal_goal column to bf_campaign_students for seller-defined goals
ALTER TABLE public.bf_campaign_students
ADD COLUMN personal_goal numeric NULL;

-- Add a comment for documentation
COMMENT ON COLUMN public.bf_campaign_students.personal_goal IS 'Seller-defined sales goal. When NULL, uses dynamic calculation.';
