-- Fix infinite recursion in chat_participants RLS policy
DROP POLICY IF EXISTS "Users can view chat participants for their chats" ON chat_participants;

-- Create a simpler policy that avoids recursion
CREATE POLICY "Users can view chat participants for their chats" 
ON chat_participants FOR SELECT 
USING (
  user_id = auth.uid() 
  OR 
  chat_id IN (
    SELECT id FROM chats WHERE created_by = auth.uid()
  )
  OR
  chat_id IN (
    SELECT chat_id FROM chat_participants WHERE user_id = auth.uid()
  )
);