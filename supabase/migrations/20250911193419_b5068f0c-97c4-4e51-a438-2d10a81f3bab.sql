-- Expand allowed reaction types and notification types to match UI usage
-- 1) Reactions: allow multiple emoji types used by the app
ALTER TABLE public.reactions DROP CONSTRAINT IF EXISTS reactions_reaction_type_check;
ALTER TABLE public.reactions
  ADD CONSTRAINT reactions_reaction_type_check
  CHECK (reaction_type IN ('like', 'thumbs_up', 'laugh', 'angry', 'sad'));

-- 2) Notifications: allow types used by the app
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_type_check
  CHECK (type IN (
    'like',            -- when someone likes your post
    'reaction',        -- when someone reacts to your post
    'comment',         -- when someone comments on your post
    'follow',          -- when someone follows/connects
    'mention',         -- when someone mentions you
    'message',         -- direct messages
    'system'           -- system updates
  ));
