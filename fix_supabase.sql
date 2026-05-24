-- Fix: Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/kohlegvunumiwxbhfbwb/sql/new)

-- 1. Make sure the profiles table exists with verification columns
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  payment_status TEXT DEFAULT 'unpaid',
  is_verified BOOLEAN DEFAULT false,
  verification_code TEXT,
  verification_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- In case the table already existed, ensure columns are added
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verification_code TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verification_expires_at TIMESTAMP WITH TIME ZONE;

-- 2. Create or replace the trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    RETURN NEW;
  WHEN OTHERS THEN
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Drop and recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Add INSERT policy for profiles (needed for the trigger and manual inserts)
DROP POLICY IF EXISTS "Service role can insert profiles" ON public.profiles;
CREATE POLICY "Service role can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (true);

-- 5. Make sure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 6. Recreate SELECT/UPDATE policies
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
