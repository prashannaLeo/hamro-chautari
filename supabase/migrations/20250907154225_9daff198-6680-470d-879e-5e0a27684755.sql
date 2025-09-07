-- Fix infinite recursion in chats RLS policy by creating a security definer function
CREATE OR REPLACE FUNCTION public.is_chat_participant(chat_id_param uuid, user_id_param uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM chat_participants 
    WHERE chat_id = chat_id_param AND user_id = user_id_param
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view chats they participate in" ON public.chats;

-- Create new policy using the security definer function
CREATE POLICY "Users can view chats they participate in" ON public.chats
FOR SELECT USING (
  public.is_chat_participant(id, auth.uid())
);

-- Also fix any issues with chat_participants policies
DROP POLICY IF EXISTS "Users can view chat participants for their chats" ON public.chat_participants;

CREATE POLICY "Users can view chat participants for their chats" ON public.chat_participants
FOR SELECT USING (
  user_id = auth.uid() OR 
  public.is_chat_participant(chat_id, auth.uid())
);