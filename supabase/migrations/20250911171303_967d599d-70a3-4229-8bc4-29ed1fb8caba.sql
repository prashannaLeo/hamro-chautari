-- Fix is_chat_participant function to ensure stable, secure execution without search_path issues
CREATE OR REPLACE FUNCTION public.is_chat_participant(chat_id_param uuid, user_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.chat_participants 
    WHERE chat_id = chat_id_param AND user_id = user_id_param
  );
END;
$function$;

-- Resolve infinite recursion in RLS: remove self-referencing SELECT policy on chat_participants
DROP POLICY IF EXISTS "Users can view participants of chats they are in" ON public.chat_participants;

-- Ensure connections can be managed by either participant (fix friend request accept/decline/remove)
-- Allow both sides to UPDATE their connection rows
CREATE POLICY "Participants can update their connections"
ON public.connections
FOR UPDATE
USING (user_id = auth.uid() OR connected_user_id = auth.uid());

-- Allow both sides to DELETE their connection rows (decline or remove friend)
CREATE POLICY "Participants can delete their connections"
ON public.connections
FOR DELETE
USING (user_id = auth.uid() OR connected_user_id = auth.uid());