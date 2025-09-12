-- Fix profile discovery RLS policy to be more restrictive
DROP POLICY IF EXISTS "Authenticated users can discover public profiles" ON public.profiles;

-- Create more restrictive profile discovery policy
CREATE POLICY "Limited public profile discovery for search" 
ON public.profiles 
FOR SELECT 
USING (
  -- Only allow viewing basic profile info for search purposes
  privacy_level = 'public' 
  AND auth.uid() IS NOT NULL 
  AND auth.uid() <> user_id
  AND NOT EXISTS (
    SELECT 1 FROM connections
    WHERE status = 'accepted'
    AND (
      (user_id = auth.uid() AND connected_user_id = profiles.user_id)
      OR 
      (connected_user_id = auth.uid() AND user_id = profiles.user_id)
    )
  )
);

-- Add rate limiting function for profile searches
CREATE OR REPLACE FUNCTION public.check_search_rate_limit(search_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_searches integer;
BEGIN
  -- Count searches in last minute (this would need a search_logs table in real implementation)
  -- For now, just allow the search but this demonstrates where rate limiting would go
  RETURN true;
END;
$$;

-- Create function to get minimal profile info for search (more secure than direct table access)
CREATE OR REPLACE FUNCTION public.search_public_profiles(search_term text, search_limit integer DEFAULT 10)
RETURNS TABLE(
  user_id uuid, 
  username text, 
  display_name text, 
  avatar_url text, 
  is_verified boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate inputs
  IF search_term IS NULL OR LENGTH(TRIM(search_term)) < 2 THEN
    RETURN;
  END IF;
  
  IF search_limit IS NULL OR search_limit < 1 OR search_limit > 50 THEN
    search_limit := 10;
  END IF;
  
  -- Check if user is authenticated
  IF auth.uid() IS NULL THEN
    RETURN;
  END IF;
  
  -- Return limited profile info for search
  RETURN QUERY
  SELECT 
    p.user_id,
    p.username,
    p.display_name,
    p.avatar_url,
    p.is_verified
  FROM public.profiles p
  WHERE p.privacy_level = 'public'
    AND p.user_id != auth.uid()
    AND (
      p.username ILIKE '%' || search_term || '%' 
      OR p.display_name ILIKE '%' || search_term || '%'
    )
    AND NOT EXISTS (
      SELECT 1 FROM public.connections c
      WHERE c.status = 'accepted'
      AND (
        (c.user_id = auth.uid() AND c.connected_user_id = p.user_id)
        OR 
        (c.connected_user_id = auth.uid() AND c.user_id = p.user_id)
      )
    )
  ORDER BY 
    CASE 
      WHEN p.username ILIKE search_term || '%' THEN 1
      WHEN p.display_name ILIKE search_term || '%' THEN 2
      ELSE 3
    END,
    p.is_verified DESC,
    p.username
  LIMIT search_limit;
END;
$$;

-- Update notification creation function to have better rate limiting
DROP FUNCTION IF EXISTS public.create_notification(uuid, text, text, text, jsonb);

CREATE OR REPLACE FUNCTION public.create_notification(
  target_user_id uuid, 
  notification_type text, 
  notification_title text, 
  notification_message text, 
  notification_data jsonb DEFAULT NULL::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  notification_id uuid;
  sender_id uuid;
  recent_notifications integer;
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
  
  -- Enhanced rate limiting: max 5 notifications per minute per user
  SELECT COUNT(*) INTO recent_notifications
  FROM public.notifications 
  WHERE created_at > (now() - interval '1 minute')
    AND data->>'from_user_id' = sender_id::text;
    
  IF recent_notifications > 5 THEN
    RAISE EXCEPTION 'Rate limit exceeded. Please wait before sending more notifications.';
  END IF;
  
  -- Additional rate limiting for friend requests: max 3 per hour
  IF notification_type = 'friend_request' THEN
    SELECT COUNT(*) INTO recent_notifications
    FROM public.notifications 
    WHERE created_at > (now() - interval '1 hour')
      AND type = 'friend_request'
      AND data->>'from_user_id' = sender_id::text;
      
    IF recent_notifications > 3 THEN
      RAISE EXCEPTION 'Too many friend requests. Please try again later.';
    END IF;
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
$$;