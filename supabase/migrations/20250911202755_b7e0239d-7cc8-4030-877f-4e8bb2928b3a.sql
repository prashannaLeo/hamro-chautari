-- Fix Critical Security Issue: Private User Interactions Exposed to Public
-- Require authentication for all social interaction tables

-- 1. Fix COMMENTS table - require authentication
DROP POLICY IF EXISTS "Users can view comments on visible posts" ON public.comments;

CREATE POLICY "Authenticated users can view comments on visible posts" 
ON public.comments 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.posts 
    WHERE posts.id = comments.post_id 
    AND (posts.visibility = 'public' OR posts.user_id = auth.uid())
  )
);

-- 2. Fix POSTS table - require authentication for viewing posts
DROP POLICY IF EXISTS "Public posts are viewable by everyone" ON public.posts;

CREATE POLICY "Authenticated users can view public posts" 
ON public.posts 
FOR SELECT 
TO authenticated
USING (visibility = 'public' OR user_id = auth.uid());

-- 3. Fix STORY_SHARES table - require authentication  
DROP POLICY IF EXISTS "Story shares are selectable on active stories" ON public.story_shares;

CREATE POLICY "Authenticated users can view story shares on active stories"
ON public.story_shares
FOR SELECT
TO authenticated  
USING (
  EXISTS (
    SELECT 1 FROM public.stories s
    WHERE s.id = story_shares.story_id 
    AND s.expires_at > now()
  )
);

-- 4. Update STORY_COMMENTS to require authentication (if not already)
DROP POLICY IF EXISTS "Anyone can view comments on active stories" ON public.story_comments;

CREATE POLICY "Authenticated users can view story comments"
ON public.story_comments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.stories s
    WHERE s.id = story_comments.story_id 
    AND s.expires_at > now()
  )
);

-- 5. Update STORY_REACTIONS to require authentication (if not already)  
DROP POLICY IF EXISTS "Anyone can view reactions on active stories" ON public.story_reactions;

CREATE POLICY "Authenticated users can view story reactions"
ON public.story_reactions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.stories s
    WHERE s.id = story_reactions.story_id 
    AND s.expires_at > now()
  )
);

-- 6. Ensure STORIES table requires authentication for viewing
DROP POLICY IF EXISTS "Public stories are viewable by everyone" ON public.stories;

CREATE POLICY "Authenticated users can view active stories"
ON public.stories
FOR SELECT
TO authenticated
USING (expires_at > now());

-- 7. Create a security function for safe public post discovery (if needed for landing pages)
-- This function provides minimal post info without exposing user interactions
CREATE OR REPLACE FUNCTION public.get_public_post_preview()
RETURNS TABLE (
  id uuid,
  content text,
  created_at timestamp with time zone,
  post_type text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Only return minimal post info for public discovery
  -- No user_id, likes_count, comments_count to prevent interaction analysis
  RETURN QUERY
  SELECT 
    p.id,
    CASE 
      WHEN length(p.content) > 150 THEN left(p.content, 147) || '...'
      ELSE p.content
    END as content,
    p.created_at,
    p.post_type
  FROM public.posts p
  WHERE p.visibility = 'public'
    AND p.created_at > (now() - interval '7 days') -- Only recent posts
  ORDER BY p.created_at DESC
  LIMIT 10;
END;
$function$;