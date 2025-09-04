-- Create function to increment likes count
CREATE OR REPLACE FUNCTION increment_likes(post_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE posts 
  SET likes_count = likes_count + 1 
  WHERE id = post_id;
END;
$$;

-- Create function to decrement likes count
CREATE OR REPLACE FUNCTION decrement_likes(post_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE posts 
  SET likes_count = GREATEST(likes_count - 1, 0) 
  WHERE id = post_id;
END;
$$;