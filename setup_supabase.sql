-- CeTech Academy Database Schema Setup

-- 1. Create the tables
-- Courses table
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price INTEGER DEFAULT 0, -- Price in Naira
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Units table (Belongs to a course)
CREATE TABLE IF NOT EXISTS public.units (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Lessons/Modules table (Belongs to a unit)
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  unit_id UUID REFERENCES public.units(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT, -- Legacy support
  mux_playback_id TEXT, -- Mux playback ID for adaptive bitrate streaming
  duration TEXT, -- e.g., "15 mins"
  order_index INTEGER NOT NULL DEFAULT 0,
  content_markdown TEXT, -- For text-based lessons or lesson notes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Profiles table (Extended for identity)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  payment_status TEXT DEFAULT 'unpaid', -- 'unpaid', 'paid', 'pending'
  is_verified BOOLEAN DEFAULT false,
  verification_code TEXT,
  verification_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Function to handle new user signups via Google OAuth
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on every auth signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enrollments table (Mapping of users to paid courses)
CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  payment_status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'failed'
  paystack_reference TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, course_id)
);

-- User Progress table
CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  completed BOOLEAN DEFAULT false,
  last_watched_position INTEGER DEFAULT 0, -- In seconds
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, lesson_id)
);

-- Quizzes table
CREATE TABLE IF NOT EXISTS public.quizzes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  passing_score INTEGER DEFAULT 70,
  time_limit_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Questions table
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL, -- 'mcq', 'tf', 'fill'
  options JSONB, -- For MCQ: ["Option A", "Option B", ...]
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  order_index INTEGER NOT NULL DEFAULT 0
);

-- Quiz Results table
CREATE TABLE IF NOT EXISTS public.quiz_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
  score INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- User Notes table
CREATE TABLE IF NOT EXISTS public.user_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  video_timestamp INTEGER, -- Optional: link note to a specific time
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- User Bookmarks table
CREATE TABLE IF NOT EXISTS public.user_bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  video_timestamp INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Setup Storage Bucket for Videos
-- This requires the 'storage' schema to be available (standard in Supabase)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('course-videos', 'course-videos', false) -- Private bucket, requires auth
ON CONFLICT (id) DO NOTHING;

-- Create public assets bucket for images
INSERT INTO storage.buckets (id, name, public)
VALUES ('assets', 'assets', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_bookmarks ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only read/update their own profile
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Enrollments: Users can only read their own enrollments
DROP POLICY IF EXISTS "Users can read own enrollments" ON public.enrollments;
CREATE POLICY "Users can read own enrollments" ON public.enrollments FOR SELECT USING (auth.uid() = user_id);

-- Courses/Units: Authenticated users can read
DROP POLICY IF EXISTS "Allow authenticated to read courses" ON public.courses;
CREATE POLICY "Allow authenticated to read courses" ON public.courses FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated to read units" ON public.units;
CREATE POLICY "Allow authenticated to read units" ON public.units FOR SELECT TO authenticated USING (true);

-- Lessons: Only users with a 'paid' enrollment can read lesson details (Mux IDs, content)
DROP POLICY IF EXISTS "Allow paid students to read lessons" ON public.lessons;
CREATE POLICY "Allow paid students to read lessons" 
ON public.lessons FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.enrollments e
    JOIN public.units u ON u.course_id = e.course_id
    WHERE e.user_id = auth.uid() 
    AND e.payment_status = 'paid'
    AND u.id = public.lessons.unit_id
  )
);

-- User Progress: Users can only read/write their own progress
DROP POLICY IF EXISTS "Users can manage own progress" ON public.user_progress;
CREATE POLICY "Users can manage own progress" ON public.user_progress FOR ALL USING (auth.uid() = user_id);

-- Quizzes/Questions: Authenticated users can read
DROP POLICY IF EXISTS "Allow authenticated to read quizzes" ON public.quizzes;
CREATE POLICY "Allow authenticated to read quizzes" ON public.quizzes FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated to read questions" ON public.questions;
CREATE POLICY "Allow authenticated to read questions" ON public.questions FOR SELECT TO authenticated USING (true);

-- Quiz Results: Users can only read/write their own results
DROP POLICY IF EXISTS "Users can manage own quiz results" ON public.quiz_results;
CREATE POLICY "Users can manage own quiz results" ON public.quiz_results FOR ALL USING (auth.uid() = user_id);

-- User Notes/Bookmarks: Users can only read/write their own
DROP POLICY IF EXISTS "Users can manage own notes" ON public.user_notes;
CREATE POLICY "Users can manage own notes" ON public.user_notes FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own bookmarks" ON public.user_bookmarks;
CREATE POLICY "Users can manage own bookmarks" ON public.user_bookmarks FOR ALL USING (auth.uid() = user_id);

-- Storage Policies for 'course-videos' bucket
-- Authenticated users can view videos
DROP POLICY IF EXISTS "Allow authenticated to read course videos" ON storage.objects;
CREATE POLICY "Allow authenticated to read course videos"
ON storage.objects FOR SELECT
TO authenticated
USING ( bucket_id = 'course-videos' );

-- Storage Policies for 'assets' bucket
-- Public can read assets
DROP POLICY IF EXISTS "Allow public to read assets" ON storage.objects;
CREATE POLICY "Allow public to read assets"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'assets' );


-- Admins (or service role) would be the ones inserting/updating, so we restrict those:
-- By default, if no INSERT/UPDATE/DELETE policy is defined, it is restricted.

-- 4. Insert Dummy Data for the UI/UX Masterclass (For testing purposes)

-- Insert a Course
INSERT INTO public.courses (id, title, description)
VALUES (
  '11111111-1111-1111-1111-111111111111', 
  'UI/UX Design Masterclass', 
  'Learn how to map immersive digital interfaces.'
) ON CONFLICT (id) DO NOTHING;

-- Insert a Unit
INSERT INTO public.units (id, course_id, title, order_index)
VALUES (
  '22222222-2222-2222-2222-222222222222', 
  '11111111-1111-1111-1111-111111111111', 
  'UNIT 1: INTRODUCTION', 
  1
) ON CONFLICT (id) DO NOTHING;

-- Insert Lessons
INSERT INTO public.lessons (id, unit_id, title, description, video_url, duration, order_index)
VALUES 
  (
    '33333333-3333-3333-3333-333333333331', 
    '22222222-2222-2222-2222-222222222222', 
    '1.1 What is User Experience?', 
    'An introduction to the fundamental concepts of User Experience design.', 
    'https://www.w3schools.com/html/mov_bbb.mp4', -- Replace with your Supabase Storage URL later
    '15 mins', 
    1
  ),
  (
    '33333333-3333-3333-3333-333333333332', 
    '22222222-2222-2222-2222-222222222222', 
    '1.2 Design Thinking Process', 
    'Understanding the 5 stages of design thinking: Empathize, Define, Ideate, Prototype, Test.', 
    'https://www.w3schools.com/html/mov_bbb.mp4', 
    '22 mins', 
    2
  ),
  (
    '33333333-3333-3333-3333-333333333333', 
    '22222222-2222-2222-2222-222222222222', 
    '1.3 Wireframing Basics', 
    'How to sketch out your digital interfaces quickly and effectively.', 
    'https://www.w3schools.com/html/mov_bbb.mp4', 
    '18 mins', 
    3
  )
ON CONFLICT (id) DO NOTHING;

-- Assignments table
CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  max_points INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Assignment Submissions table
CREATE TABLE IF NOT EXISTS public.assignment_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE NOT NULL,
  submission_url TEXT, -- Link to submitted file or work
  content TEXT, -- For text-based submissions
  score INTEGER,
  feedback TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, assignment_id)
);

-- Enable RLS
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Allow authenticated to read assignments" ON public.assignments;
CREATE POLICY "Allow authenticated to read assignments" ON public.assignments FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can manage own assignment submissions" ON public.assignment_submissions;
CREATE POLICY "Users can manage own assignment submissions" ON public.assignment_submissions FOR ALL USING (auth.uid() = user_id);

-- Add type to lessons to distinguish them in UI
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'video'; -- 'video', 'quiz', 'assignment'
