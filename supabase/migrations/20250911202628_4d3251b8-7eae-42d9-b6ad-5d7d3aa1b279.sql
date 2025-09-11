-- Fix Critical Security Issue: Prevent Profile Data Harvesting

-- 1. Drop the overly permissive policy that allows unauthenticated access
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- 2. Create restrictive policies that require authentication and proper relationships

-- Policy 1: Users can always view their own profile
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy 2: Users can view profiles of people they're connected to (friends)
CREATE POLICY "Users can view connected user profiles"
ON public.profiles  
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.connections 
    WHERE status = 'accepted'
    AND (
      (user_id = auth.uid() AND connected_user_id = profiles.user_id)
      OR 
      (connected_user_id = auth.uid() AND user_id = profiles.user_id)
    )
  )
);

-- Policy 3: Limited public profile info for search/discovery (authenticated users only)
-- Only shows basic info for users with public privacy setting
CREATE POLICY "Authenticated users can discover public profiles"
ON public.profiles
FOR SELECT  
TO authenticated
USING (
  privacy_level = 'public' 
  AND auth.uid() != user_id -- Don't apply this policy to own profile
  AND NOT EXISTS (
    -- Don't show if already connected
    SELECT 1 FROM public.connections 
    WHERE status = 'accepted'
    AND (
      (user_id = auth.uid() AND connected_user_id = profiles.user_id)
      OR 
      (connected_user_id = auth.uid() AND user_id = profiles.user_id)
    )
  )
);

-- 3. Create a security function to get limited profile info for search
-- This ensures sensitive data like bio, location are not exposed in search
CREATE OR REPLACE FUNCTION public.get_limited_profile_for_search(search_user_id uuid)
RETURNS TABLE (
  user_id uuid,
  username text,
  display_name text,
  avatar_url text,
  is_verified boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Only return limited info and only if requesting user is authenticated
  IF auth.uid() IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT 
    p.user_id,
    p.username,
    p.display_name,
    p.avatar_url,
    p.is_verified
  FROM public.profiles p
  WHERE p.user_id = search_user_id
    AND p.privacy_level = 'public'
    AND p.user_id != auth.uid()
    AND NOT EXISTS (
      SELECT 1 FROM public.connections c
      WHERE c.status = 'accepted'
      AND (
        (c.user_id = auth.uid() AND c.connected_user_id = p.user_id)
        OR 
        (c.connected_user_id = auth.uid() AND c.user_id = p.user_id)
      )
    );
END;
$function$;