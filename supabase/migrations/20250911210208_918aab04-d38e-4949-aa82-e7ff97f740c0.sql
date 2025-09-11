-- Update calls table structure to match our interface
ALTER TABLE public.calls DROP COLUMN IF EXISTS duration_seconds;
ALTER TABLE public.calls DROP COLUMN IF EXISTS ended_at;
ALTER TABLE public.calls DROP COLUMN IF EXISTS answered_at;
ALTER TABLE public.calls DROP COLUMN IF EXISTS started_at;

-- Rename call_type to type if it exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'calls' AND column_name = 'call_type') THEN
        ALTER TABLE public.calls RENAME COLUMN call_type TO type;
    END IF;
END $$;

-- Add missing columns
ALTER TABLE public.calls ADD COLUMN IF NOT EXISTS caller_name TEXT;
ALTER TABLE public.calls ADD COLUMN IF NOT EXISTS caller_avatar TEXT;
ALTER TABLE public.calls ADD COLUMN IF NOT EXISTS receiver_name TEXT;
ALTER TABLE public.calls ADD COLUMN IF NOT EXISTS receiver_avatar TEXT;

-- Update existing NULL values for new columns
UPDATE public.calls SET caller_name = 'Unknown User' WHERE caller_name IS NULL;
UPDATE public.calls SET receiver_name = 'Unknown User' WHERE receiver_name IS NULL;

-- Make required columns NOT NULL
ALTER TABLE public.calls ALTER COLUMN caller_name SET NOT NULL;
ALTER TABLE public.calls ALTER COLUMN receiver_name SET NOT NULL;

-- Update status constraint to include our values
ALTER TABLE public.calls DROP CONSTRAINT IF EXISTS calls_status_check;
ALTER TABLE public.calls ADD CONSTRAINT calls_status_check 
  CHECK (status IN ('initiating', 'ringing', 'answered', 'ended', 'declined'));

-- Update type constraint  
ALTER TABLE public.calls DROP CONSTRAINT IF EXISTS calls_call_type_check;
ALTER TABLE public.calls DROP CONSTRAINT IF EXISTS calls_type_check;
ALTER TABLE public.calls ADD CONSTRAINT calls_type_check 
  CHECK (type IN ('video', 'voice'));