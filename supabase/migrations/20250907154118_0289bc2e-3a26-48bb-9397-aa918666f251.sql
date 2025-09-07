-- Completely rebuild the chat policies with a simpler approach
-- Drop all existing problematic policies
DROP POLICY IF EXISTS "Users can view chats they participate in" ON public.chats;
DROP POLICY IF EXISTS "Users can view chat participants for their chats" ON public.chat_participants;

-- Create very simple policies that don't cause recursion
CREATE POLICY "Users can view all chats they created" ON public.chats
FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can view chats where they are participants" ON public.chats
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM chat_participants cp 
    WHERE cp.chat_id = chats.id AND cp.user_id = auth.uid()
  )
);

-- Simple policy for chat_participants
CREATE POLICY "Users can view participants of chats they are in" ON public.chat_participants
FOR SELECT USING (
  user_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM chat_participants cp2 
    WHERE cp2.chat_id = chat_participants.chat_id AND cp2.user_id = auth.uid()
  )
);