-- Fix function search path security issue by setting it explicitly
CREATE OR REPLACE FUNCTION public.is_chat_participant(chat_id_param uuid, user_id_param uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.chat_participants 
    WHERE chat_id = chat_id_param AND user_id = user_id_param
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;