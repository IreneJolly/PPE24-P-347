-- Add is_first_login column with default true
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS is_first_login BOOLEAN DEFAULT true;

-- Update existing users to have is_first_login = true if they don't have a full_name
UPDATE public.users 
SET is_first_login = true 
WHERE full_name IS NULL OR full_name = ''; 