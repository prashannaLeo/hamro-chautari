-- Create function to increment story views
CREATE OR REPLACE FUNCTION public.increment_story_views(story_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE stories 
  SET views_count = views_count + 1 
  WHERE id = story_id;
END;
$function$