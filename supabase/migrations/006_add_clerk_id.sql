-- Add clerk_id column to users table for Clerk auth integration
ALTER TABLE public.users ADD COLUMN clerk_id TEXT UNIQUE;

-- Remove foreign key to auth.users (Clerk manages its own auth)
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey;

-- Add index for fast Clerk ID lookups
CREATE INDEX idx_users_clerk_id ON public.users (clerk_id);

-- Allow service_role to insert users (for Clerk webhook)
CREATE POLICY "Service role can insert users"
  ON public.users FOR INSERT
  WITH CHECK (true);
