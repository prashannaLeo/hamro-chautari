-- Story interactions: reactions, comments, shares

-- 1) Reactions table
CREATE TABLE IF NOT EXISTS public.story_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL,
  user_id UUID NOT NULL,
  reaction_type TEXT NOT NULL DEFAULT 'like',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.story_reactions ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX IF NOT EXISTS ux_story_reactions_user_story ON public.story_reactions (story_id, user_id);

CREATE POLICY "Anyone can view reactions on active stories"
ON public.story_reactions
FOR SELECT
USING (EXISTS (SELECT 1 FROM public.stories s WHERE s.id = story_id AND s.expires_at > now()));

CREATE POLICY "Users can react to stories"
ON public.story_reactions
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can remove their reactions"
ON public.story_reactions
FOR DELETE
USING (user_id = auth.uid());

-- 2) Comments table
CREATE TABLE IF NOT EXISTS public.story_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.story_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments on active stories"
ON public.story_comments
FOR SELECT
USING (EXISTS (SELECT 1 FROM public.stories s WHERE s.id = story_id AND s.expires_at > now()));

CREATE POLICY "Users can comment on stories"
ON public.story_comments
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their comments"
ON public.story_comments
FOR DELETE
USING (user_id = auth.uid());

-- 3) Shares table
CREATE TABLE IF NOT EXISTS public.story_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.story_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can record their shares"
ON public.story_shares
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Story shares are selectable on active stories"
ON public.story_shares
FOR SELECT
USING (EXISTS (SELECT 1 FROM public.stories s WHERE s.id = story_id AND s.expires_at > now()));

-- 4) Add shares_count to stories if missing
ALTER TABLE public.stories
ADD COLUMN IF NOT EXISTS shares_count INTEGER NOT NULL DEFAULT 0;

-- 5) Function to increment shares count
CREATE OR REPLACE FUNCTION public.increment_story_shares(story_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE stories SET shares_count = shares_count + 1 WHERE id = story_id;
END;
$$;

-- 6) Enable realtime for new tables
ALTER TABLE public.story_comments REPLICA IDENTITY FULL;
ALTER TABLE public.story_reactions REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.story_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.story_reactions;