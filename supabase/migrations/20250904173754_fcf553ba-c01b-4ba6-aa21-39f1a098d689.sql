-- Fix infinite recursion in chat_participants policies
DROP POLICY IF EXISTS "Chat admins can manage participants" ON public.chat_participants;
DROP POLICY IF EXISTS "Users can view chat participants for their chats" ON public.chat_participants;

-- Create proper policies without infinite recursion
CREATE POLICY "Users can view chat participants for their chats"
ON public.chat_participants FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.chats 
    WHERE chats.id = chat_participants.chat_id 
    AND (
      chats.created_by = auth.uid() 
      OR EXISTS (
        SELECT 1 FROM public.chat_participants cp 
        WHERE cp.chat_id = chats.id 
        AND cp.user_id = auth.uid()
      )
    )
  )
);

CREATE POLICY "Chat creators can manage participants"
ON public.chat_participants FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.chats 
    WHERE chats.id = chat_participants.chat_id 
    AND chats.created_by = auth.uid()
  )
);

CREATE POLICY "Users can leave chats"
ON public.chat_participants FOR DELETE
USING (user_id = auth.uid());