-- 1. Add email and user_id columns to designers to link with Auth
ALTER TABLE public.designers 
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- 2. Create a Trigger Function
-- This function runs automatically whenever a new user signs up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.designers (id, user_id, email, name, avatar)
  VALUES (
    gen_random_uuid(), -- Generate a new public ID for the designer
    new.id,            -- The secure Auth ID
    new.email,         -- Their email
    COALESCE(new.raw_user_meta_data->>'full_name', 'New Designer'), -- Name from metadata or default
    COALESCE(new.raw_user_meta_data->>'avatar_url', '') -- Avatar from metadata
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create the Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. Update RLS (Row Level Security) Policies
-- Allow users to update ONLY their own profile
ALTER TABLE public.designers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all designers" 
ON public.designers FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.designers FOR UPDATE 
USING (auth.uid() = user_id);
