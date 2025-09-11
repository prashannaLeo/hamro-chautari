-- Fix Critical Security Issue: All User Stories Visible to Any Authenticated User
-- Restrict story visibility to owner and connected friends only

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can view active stories" ON public.stories;

-- Create a secure policy that restricts story viewing to owner and connected friends
CREATE POLICY "Users can view their own stories and connected friends' stories"
ON public.stories
FOR SELECT
TO authenticated
USING (
  expires_at > now() 
  AND (
    -- User can see their own stories
    user_id = auth.uid()
    OR
    -- User can see stories from accepted connections
    EXISTS (
      SELECT 1 
      FROM public.connections c
      WHERE c.status = 'accepted'
      AND (
        (c.user_id = auth.uid() AND c.connected_user_id = stories.user_id)
        OR 
        (c.connected_user_id = auth.uid() AND c.user_id = stories.user_id)
      )
    )
  )
);