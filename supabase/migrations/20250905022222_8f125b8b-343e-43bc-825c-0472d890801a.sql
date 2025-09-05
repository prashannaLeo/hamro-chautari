-- Create reactions table for enhanced post reactions
CREATE TABLE public.reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  post_id UUID NOT NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'love', 'laugh', 'angry', 'sad')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, post_id, reaction_type)
);

-- Enable Row Level Security
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;

-- Create policies for reactions
CREATE POLICY "Users can create their own reactions" 
ON public.reactions 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own reactions" 
ON public.reactions 
FOR DELETE 
USING (user_id = auth.uid());

CREATE POLICY "Users can view all reactions" 
ON public.reactions 
FOR SELECT 
USING (true);

-- Add shared_post_id column to posts table for sharing functionality
ALTER TABLE public.posts 
ADD COLUMN shared_post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX idx_reactions_post_id ON public.reactions(post_id);
CREATE INDEX idx_reactions_user_id ON public.reactions(user_id);
CREATE INDEX idx_posts_shared_post_id ON public.posts(shared_post_id);