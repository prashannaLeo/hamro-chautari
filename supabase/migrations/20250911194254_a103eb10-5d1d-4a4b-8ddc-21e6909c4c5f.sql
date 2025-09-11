-- Update notifications type constraint to include friend_request
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_type_check
  CHECK (type IN (
    'like',
    'reaction',
    'comment',
    'follow',
    'mention',
    'message',
    'system',
    'friend_request'
  ));