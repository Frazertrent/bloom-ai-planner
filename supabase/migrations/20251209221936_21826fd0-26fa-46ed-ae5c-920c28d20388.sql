-- Create notification preferences columns on bf_organizations
ALTER TABLE public.bf_organizations
ADD COLUMN IF NOT EXISTS notification_new_orders boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS notification_daily_summary boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS notification_campaign_alerts boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS notification_email text;

-- Create in-app notifications table
CREATE TABLE public.bf_notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES public.bf_organizations(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  notification_type text NOT NULL DEFAULT 'info',
  link_url text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_bf_notifications_org_created ON public.bf_notifications(organization_id, created_at DESC);
CREATE INDEX idx_bf_notifications_org_unread ON public.bf_notifications(organization_id, is_read) WHERE is_read = false;

-- Enable RLS
ALTER TABLE public.bf_notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for notifications
CREATE POLICY "Organizations can view their own notifications"
ON public.bf_notifications
FOR SELECT
USING (organization_id = bf_get_user_organization_id());

CREATE POLICY "Organizations can update their own notifications"
ON public.bf_notifications
FOR UPDATE
USING (organization_id = bf_get_user_organization_id());

CREATE POLICY "Organizations can delete their own notifications"
ON public.bf_notifications
FOR DELETE
USING (organization_id = bf_get_user_organization_id());

-- Allow system to insert notifications (using service role)
CREATE POLICY "Allow notification inserts"
ON public.bf_notifications
FOR INSERT
WITH CHECK (true);