-- ==========================================
-- Notifications Table Creation and Setup
-- ==========================================

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION trigger_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error', 'system')),
  status VARCHAR(50) NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'archived')),
  link VARCHAR(255),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_status_idx ON public.notifications(status);
CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON public.notifications(created_at);

-- Add trigger for updated_at on notifications
CREATE TRIGGER update_notifications_timestamp
BEFORE UPDATE ON public.notifications
FOR EACH ROW
EXECUTE FUNCTION trigger_update_timestamp();

-- Enable RLS on notifications table
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for notifications
CREATE POLICY "Users can read their own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
ON public.notifications
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Only service role can insert notifications"
ON public.notifications
FOR INSERT
WITH CHECK (current_setting('role') = 'service_role');

-- Function to create a notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_title VARCHAR(255),
  p_message TEXT,
  p_type VARCHAR(50),
  p_link VARCHAR(255) DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.notifications (
    user_id,
    title,
    message,
    type,
    link,
    metadata
  ) VALUES (
    p_user_id,
    p_title,
    p_message,
    p_type,
    p_link,
    p_metadata
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;

-- Insert some example notifications (for development)
DO $$
DECLARE
  example_user_id UUID;
BEGIN
  -- Get a user ID (you'll need to replace this with an actual user ID in your system)
  SELECT id INTO example_user_id FROM auth.users LIMIT 1;
  
  IF example_user_id IS NOT NULL THEN
    -- Welcome notification
    PERFORM create_notification(
      example_user_id,
      'Welcome to Nox!',
      'Thank you for joining Nox. We''re excited to have you on board.',
      'success'
    );
    
    -- Subscription notification
    PERFORM create_notification(
      example_user_id,
      'Subscription activated',
      'Your subscription has been successfully activated. Enjoy all the premium features!',
      'info',
      '/dashboard/billing'
    );
    
    -- Payment notification
    PERFORM create_notification(
      example_user_id,
      'Payment successful',
      'Your payment for the Pro plan has been processed successfully.',
      'success',
      '/dashboard/billing',
      '{"invoice_id": "INV-12345"}'::jsonb
    );
    
    -- Security alert
    PERFORM create_notification(
      example_user_id,
      'New login detected',
      'A new login was detected from Mumbai, India. Was this you?',
      'warning',
      '/dashboard/settings/security'
    );
    
    -- System notification
    PERFORM create_notification(
      example_user_id,
      'System maintenance',
      'We will be performing maintenance on our servers on Saturday, June 15, 2024 from 2:00 AM to 4:00 AM UTC. Some services may be temporarily unavailable during this time.',
      'system'
    );
  END IF;
END $$; 