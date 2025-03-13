-- First, disable RLS temporarily
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "users_select_policy" ON public.users;
DROP POLICY IF EXISTS "users_insert_policy" ON public.users;
DROP POLICY IF EXISTS "users_update_policy" ON public.users;
DROP POLICY IF EXISTS "users_delete_policy" ON public.users;

-- Revoke all existing permissions
REVOKE ALL ON public.users FROM anon, authenticated;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;

-- Grant basic permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.users TO authenticated;
GRANT SELECT ON public.users TO anon;

-- Create a simple SELECT policy that allows:
-- 1. Authenticated users to see their own records
-- 2. Anon users to see records during signup/login
CREATE POLICY "users_select_policy" ON public.users
FOR SELECT TO authenticated, anon
USING (true);

-- Create an INSERT policy that only allows inserting your own record
CREATE POLICY "users_insert_policy" ON public.users
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id);

-- Create an UPDATE policy that only allows updating your own record
CREATE POLICY "users_update_policy" ON public.users
FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Create a DELETE policy that only allows deleting your own record
CREATE POLICY "users_delete_policy" ON public.users
FOR DELETE TO authenticated
USING (auth.uid() = id);

-- Re-enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Verify that RLS is enabled and policies are in place
DO $$
BEGIN
  -- Check if RLS is enabled
  IF NOT EXISTS (
    SELECT 1
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename = 'users'
      AND rowsecurity = true
  ) THEN
    RAISE EXCEPTION 'RLS is not enabled on public.users';
  END IF;

  -- Check if policies exist
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'users'
      AND policyname = 'users_update_policy'
  ) THEN
    RAISE EXCEPTION 'Update policy is missing';
  END IF;
END
$$; 