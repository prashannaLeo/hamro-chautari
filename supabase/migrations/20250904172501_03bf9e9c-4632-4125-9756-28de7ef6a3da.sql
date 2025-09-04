-- Create functions to manage comment counts
CREATE OR REPLACE FUNCTION public.increment_comments(post_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE posts 
  SET comments_count = comments_count + 1 
  WHERE id = post_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.decrement_comments(post_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE posts 
  SET comments_count = GREATEST(comments_count - 1, 0) 
  WHERE id = post_id;
END;
$$;