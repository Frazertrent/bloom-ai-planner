-- Add notification preference columns to bf_florists
ALTER TABLE public.bf_florists
ADD COLUMN IF NOT EXISTS notification_new_orders boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS notification_fulfillment_reminders boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS notification_email text;

-- Create florist notifications table
CREATE TABLE public.bf_florist_notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  florist_id uuid NOT NULL REFERENCES public.bf_florists(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  notification_type text NOT NULL DEFAULT 'info',
  link_url text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create indexes for faster queries
CREATE INDEX idx_bf_florist_notifications_florist_created ON public.bf_florist_notifications(florist_id, created_at DESC);
CREATE INDEX idx_bf_florist_notifications_florist_unread ON public.bf_florist_notifications(florist_id, is_read) WHERE is_read = false;

-- Enable RLS
ALTER TABLE public.bf_florist_notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for florist notifications
CREATE POLICY "Florists can view their own notifications"
ON public.bf_florist_notifications
FOR SELECT
USING (florist_id = bf_get_user_florist_id());

CREATE POLICY "Florists can update their own notifications"
ON public.bf_florist_notifications
FOR UPDATE
USING (florist_id = bf_get_user_florist_id());

CREATE POLICY "Florists can delete their own notifications"
ON public.bf_florist_notifications
FOR DELETE
USING (florist_id = bf_get_user_florist_id());

-- Allow system to insert notifications
CREATE POLICY "Allow florist notification inserts"
ON public.bf_florist_notifications
FOR INSERT
WITH CHECK (true);