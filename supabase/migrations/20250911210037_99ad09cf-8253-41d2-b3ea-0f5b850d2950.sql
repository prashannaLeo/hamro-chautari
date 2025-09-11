-- Create calls table for WebRTC calling functionality
CREATE TABLE public.calls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('video', 'voice')),
  caller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  caller_name TEXT NOT NULL,
  caller_avatar TEXT,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_name TEXT NOT NULL,
  receiver_avatar TEXT,
  status TEXT NOT NULL DEFAULT 'initiating' CHECK (status IN ('initiating', 'ringing', 'answered', 'ended', 'declined')),
  offer JSONB,
  answer JSONB,
  ice_candidates JSONB[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;

-- Create policies for calls
CREATE POLICY "Users can view calls they are part of" 
ON public.calls 
FOR SELECT 
USING (auth.uid() = caller_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can create calls" 
ON public.calls 
FOR INSERT 
WITH CHECK (auth.uid() = caller_id);

CREATE POLICY "Users can update calls they are part of" 
ON public.calls 
FOR UPDATE 
USING (auth.uid() = caller_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can delete their own calls" 
ON public.calls 
FOR DELETE 
USING (auth.uid() = caller_id OR auth.uid() = receiver_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_calls_updated_at
  BEFORE UPDATE ON public.calls
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for the calls table
ALTER TABLE public.calls REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.calls;