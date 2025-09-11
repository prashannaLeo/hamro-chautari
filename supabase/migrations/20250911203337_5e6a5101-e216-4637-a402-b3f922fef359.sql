-- Fix Critical Security Issue: Anyone Can Create Fake System Notifications
-- Replace direct notification insertion with a secure function

-- 1. Remove the overly permissive policy
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;

-- 2. Create a secure function to handle notification creation
CREATE OR REPLACE FUNCTION public.create_notification(
  target_user_id uuid,
  notification_type text,
  notification_title text,
  notification_message text,
  notification_data jsonb DEFAULT null
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  notification_id uuid;
  sender_id uuid;
BEGIN
  -- Get the authenticated user ID
  sender_id := auth.uid();
  
  -- Verify the sender is authenticated
  IF sender_id IS NULL THEN
    RAISE EXCEPTION 'Must be authenticated to create notifications';
  END IF;
  
  -- Verify the target user exists
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE user_id = target_user_id) THEN
    RAISE EXCEPTION 'Target user does not exist';
  END IF;
  
  -- Prevent users from sending notifications to themselves (except for system notifications)
  IF sender_id = target_user_id AND notification_type NOT IN ('system', 'reminder', 'achievement') THEN
    RAISE EXCEPTION 'Cannot send notifications to yourself';
  END IF;
  
  -- Rate limiting: Prevent spam (max 10 notifications per minute per user)
  IF (
    SELECT COUNT(*) 
    FROM public.notifications 
    WHERE created_at > (now() - interval '1 minute')
    AND data->>'from_user_id' = sender_id::text
  ) > 10 THEN
    RAISE EXCEPTION 'Rate limit exceeded. Please wait before sending more notifications.';
  END IF;
  
  -- Insert the notification
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    data
  ) VALUES (
    target_user_id,
    notification_type,
    notification_title,
    notification_message,
    COALESCE(notification_data, '{}'::jsonb) || jsonb_build_object('from_user_id', sender_id)
  )
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$function$;

-- 3. Create a restricted policy that only allows users to create notifications through the function
CREATE POLICY "Users can only create notifications through secure function"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (false); -- This prevents direct inserts, forcing use of the function

-- 4. Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION public.create_notification TO authenticated;