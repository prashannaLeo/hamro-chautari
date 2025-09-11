-- Phase 1: Critical Security Fixes

-- 1. Fix RLS policies for user activity tables to prevent privacy leaks

-- Drop overly permissive policies on likes table
DROP POLICY IF EXISTS "Users can view all likes" ON public.likes;

-- Create restrictive policy for likes - users can only see likes on posts they can view
CREATE POLICY "Users can view likes on visible posts" 
ON public.likes 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.posts 
    WHERE posts.id = likes.post_id 
    AND (posts.visibility = 'public' OR posts.user_id = auth.uid())
  )
);

-- Drop overly permissive policy on reactions table  
DROP POLICY IF EXISTS "Users can view all reactions" ON public.reactions;

-- Create restrictive policy for reactions - users can only see reactions on posts they can view
CREATE POLICY "Users can view reactions on visible posts"
ON public.reactions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.posts 
    WHERE posts.id = reactions.post_id 
    AND (posts.visibility = 'public' OR posts.user_id = auth.uid())
  )
);

-- 2. Secure all database functions by adding SET search_path = public

-- Update increment_likes function
CREATE OR REPLACE FUNCTION public.increment_likes(post_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  UPDATE posts 
  SET likes_count = likes_count + 1 
  WHERE id = post_id;
END;
$function$;

-- Update decrement_likes function
CREATE OR REPLACE FUNCTION public.decrement_likes(post_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  UPDATE posts 
  SET likes_count = GREATEST(likes_count - 1, 0) 
  WHERE id = post_id;
END;
$function$;

-- Update increment_comments function
CREATE OR REPLACE FUNCTION public.increment_comments(post_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  UPDATE posts 
  SET comments_count = comments_count + 1 
  WHERE id = post_id;
END;
$function$;

-- Update decrement_comments function
CREATE OR REPLACE FUNCTION public.decrement_comments(post_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  UPDATE posts 
  SET comments_count = GREATEST(comments_count - 1, 0) 
  WHERE id = post_id;
END;
$function$;

-- Update increment_story_views function
CREATE OR REPLACE FUNCTION public.increment_story_views(story_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  UPDATE stories 
  SET views_count = views_count + 1 
  WHERE id = story_id;
END;
$function$;

-- Update increment_story_shares function
CREATE OR REPLACE FUNCTION public.increment_story_shares(story_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  UPDATE stories SET shares_count = shares_count + 1 WHERE id = story_id;
END;
$function$;

-- Update is_chat_participant function
CREATE OR REPLACE FUNCTION public.is_chat_participant(chat_id_param uuid, user_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.chat_participants 
    WHERE chat_id = chat_id_param AND user_id = user_id_param
  );
END;
$function$;

-- Update update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Update handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
  );
  RETURN NEW;
END;
$function$;

-- Update cleanup_expired_stories function
CREATE OR REPLACE FUNCTION public.cleanup_expired_stories()
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  DELETE FROM public.stories WHERE expires_at < now();
END;
$function$;