-- ============================================================
-- CeTech Academy - Full Supabase Setup (Idempotent)
-- Run this entire file in the Supabase SQL Editor
-- It's safe to run multiple times.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------
-- TABLES
-- -----------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT DEFAULT '',
  avatar_url TEXT,
  payment_status TEXT DEFAULT 'unpaid',
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.verification_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  mux_playback_id TEXT,
  youtube_id TEXT,
  duration TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  content_markdown TEXT,
  type TEXT DEFAULT 'video',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  payment_status TEXT NOT NULL DEFAULT 'unpaid',
  paystack_reference TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  last_watched_position NUMERIC,
  completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  passing_score INTEGER DEFAULT 70,
  time_limit_minutes INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT DEFAULT 'mcq',
  options JSONB,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  order_index INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  passed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  video_timestamp NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  title TEXT,
  video_timestamp NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ,
  max_points INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.assignment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  submission_url TEXT,
  content TEXT,
  score INTEGER,
  feedback TEXT,
  submitted_at TIMESTAMPTZ DEFAULT now()
);

-- -----------------------------------------------------------
-- FIX MISSING COLUMNS (safe to re-run)
-- -----------------------------------------------------------

ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS price NUMERIC;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS mux_playback_id TEXT;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS youtube_id TEXT;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS duration TEXT;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS content_markdown TEXT;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'video';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS full_name TEXT DEFAULT '';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
ALTER TABLE public.enrollments ADD COLUMN IF NOT EXISTS paystack_reference TEXT;
ALTER TABLE public.user_progress ADD COLUMN IF NOT EXISTS last_watched_position NUMERIC;
ALTER TABLE public.user_progress ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS passing_score INTEGER DEFAULT 70;
ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS time_limit_minutes INTEGER;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS question_type TEXT DEFAULT 'mcq';
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS options JSONB;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS explanation TEXT;
ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS due_date TIMESTAMPTZ;
ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS max_points INTEGER;
ALTER TABLE public.assignment_submissions ADD COLUMN IF NOT EXISTS submission_url TEXT;
ALTER TABLE public.assignment_submissions ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE public.assignment_submissions ADD COLUMN IF NOT EXISTS score INTEGER;
ALTER TABLE public.assignment_submissions ADD COLUMN IF NOT EXISTS feedback TEXT;
ALTER TABLE public.user_notes ADD COLUMN IF NOT EXISTS video_timestamp NUMERIC;
ALTER TABLE public.user_bookmarks ADD COLUMN IF NOT EXISTS title TEXT;

-- -----------------------------------------------------------
-- INDEXES (idempotent via IF NOT EXISTS)
-- -----------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_verification_codes_user_id ON public.verification_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_codes_code ON public.verification_codes(code);
CREATE INDEX IF NOT EXISTS idx_courses_created ON public.courses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_units_course_id ON public.units(course_id);
CREATE INDEX IF NOT EXISTS idx_units_order ON public.units(order_index);
CREATE INDEX IF NOT EXISTS idx_lessons_unit_id ON public.lessons(unit_id);
CREATE INDEX IF NOT EXISTS idx_lessons_order ON public.lessons(order_index);
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON public.enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON public.enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_lesson_id ON public.user_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_lesson_id ON public.quizzes(lesson_id);
CREATE INDEX IF NOT EXISTS idx_questions_quiz_id ON public.questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_questions_order ON public.questions(order_index);
CREATE INDEX IF NOT EXISTS idx_quiz_results_user_id ON public.quiz_results(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_quiz_id ON public.quiz_results(quiz_id);
CREATE INDEX IF NOT EXISTS idx_user_notes_user_id ON public.user_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notes_lesson_id ON public.user_notes(lesson_id);
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_user_id ON public.user_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_lesson_id ON public.user_bookmarks(lesson_id);
CREATE INDEX IF NOT EXISTS idx_assignments_lesson_id ON public.assignments(lesson_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_user_id ON public.assignment_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_assignment_id ON public.assignment_submissions(assignment_id);

-- -----------------------------------------------------------
-- UNIQUE CONSTRAINTS (safely add if they don't exist)
-- -----------------------------------------------------------

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'enrollments_user_id_course_id_key'
  ) THEN
    ALTER TABLE public.enrollments ADD CONSTRAINT enrollments_user_id_course_id_key UNIQUE (user_id, course_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_progress_user_id_lesson_id_key'
  ) THEN
    ALTER TABLE public.user_progress ADD CONSTRAINT user_progress_user_id_lesson_id_key UNIQUE (user_id, lesson_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'assignment_submissions_user_id_assignment_id_key'
  ) THEN
    ALTER TABLE public.assignment_submissions ADD CONSTRAINT assignment_submissions_user_id_assignment_id_key UNIQUE (user_id, assignment_id);
  END IF;
END $$;

-- -----------------------------------------------------------
-- ROW LEVEL SECURITY
-- -----------------------------------------------------------

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them idempotently
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view own verification codes" ON public.verification_codes;
DROP POLICY IF EXISTS "Users can delete own verification codes" ON public.verification_codes;
DROP POLICY IF EXISTS "Courses are publicly readable" ON public.courses;
DROP POLICY IF EXISTS "Units are publicly readable" ON public.units;
DROP POLICY IF EXISTS "Lessons are publicly readable" ON public.lessons;
DROP POLICY IF EXISTS "Users can view own enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Users can view own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can insert own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Quizzes are publicly readable" ON public.quizzes;
DROP POLICY IF EXISTS "Questions are publicly readable" ON public.questions;
DROP POLICY IF EXISTS "Users can view own quiz results" ON public.quiz_results;
DROP POLICY IF EXISTS "Users can insert own quiz results" ON public.quiz_results;
DROP POLICY IF EXISTS "Users can view own notes" ON public.user_notes;
DROP POLICY IF EXISTS "Users can insert own notes" ON public.user_notes;
DROP POLICY IF EXISTS "Users can update own notes" ON public.user_notes;
DROP POLICY IF EXISTS "Users can delete own notes" ON public.user_notes;
DROP POLICY IF EXISTS "Users can view own bookmarks" ON public.user_bookmarks;
DROP POLICY IF EXISTS "Users can insert own bookmarks" ON public.user_bookmarks;
DROP POLICY IF EXISTS "Users can delete own bookmarks" ON public.user_bookmarks;
DROP POLICY IF EXISTS "Assignments are publicly readable" ON public.assignments;
DROP POLICY IF EXISTS "Users can view own submissions" ON public.assignment_submissions;
DROP POLICY IF EXISTS "Users can insert own submissions" ON public.assignment_submissions;

-- Recreate policies
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can view own verification codes" ON public.verification_codes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own verification codes" ON public.verification_codes FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Courses are publicly readable" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Units are publicly readable" ON public.units FOR SELECT USING (true);
CREATE POLICY "Lessons are publicly readable" ON public.lessons FOR SELECT USING (true);
CREATE POLICY "Users can view own enrollments" ON public.enrollments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own progress" ON public.user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON public.user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON public.user_progress FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Quizzes are publicly readable" ON public.quizzes FOR SELECT USING (true);
CREATE POLICY "Questions are publicly readable" ON public.questions FOR SELECT USING (true);
CREATE POLICY "Users can view own quiz results" ON public.quiz_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own quiz results" ON public.quiz_results FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own notes" ON public.user_notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notes" ON public.user_notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notes" ON public.user_notes FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own notes" ON public.user_notes FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can view own bookmarks" ON public.user_bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bookmarks" ON public.user_bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own bookmarks" ON public.user_bookmarks FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Assignments are publicly readable" ON public.assignments FOR SELECT USING (true);
CREATE POLICY "Users can view own submissions" ON public.assignment_submissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own submissions" ON public.assignment_submissions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- -----------------------------------------------------------
-- SEED DATA
-- -----------------------------------------------------------

INSERT INTO public.courses (id, title, description, price, created_at)
SELECT gen_random_uuid(), 'UI/UX Design Masterclass', 'Learn how to map immersive digital interfaces.', 0, now()
WHERE NOT EXISTS (SELECT 1 FROM public.courses WHERE title = 'UI/UX Design Masterclass');

DO $$
DECLARE
  v_course_id UUID;
  v_unit_id UUID;
  v_lesson1_id UUID;
  v_quiz_id UUID;
BEGIN
  SELECT id INTO v_course_id FROM public.courses WHERE title = 'UI/UX Design Masterclass' LIMIT 1;

  IF v_course_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.units WHERE course_id = v_course_id AND title = 'UNIT 1: INTRODUCTION') THEN
    INSERT INTO public.units (id, course_id, title, order_index, created_at)
    VALUES (gen_random_uuid(), v_course_id, 'UNIT 1: INTRODUCTION', 1, now())
    RETURNING id INTO v_unit_id;

    INSERT INTO public.lessons (id, unit_id, title, description, video_url, youtube_id, duration, order_index, type, created_at)
    VALUES
      (gen_random_uuid(), v_unit_id, '1.1 What is User Experience?', 'An introduction to the fundamental concepts of User Experience design.', 'https://www.w3schools.com/html/mov_bbb.mp4', 'SRec6L7TbRE', '15 mins', 1, 'video', now()),
      (gen_random_uuid(), v_unit_id, '1.2 Design Thinking Process', 'Understanding the 5 stages of design thinking: Empathize, Define, Ideate, Prototype, Test.', 'https://www.w3schools.com/html/mov_bbb.mp4', 'UBVVV0GvK18', '22 mins', 2, 'video', now()),
      (gen_random_uuid(), v_unit_id, '1.3 Wireframing Basics', 'How to sketch out your digital interfaces quickly and effectively.', 'https://www.w3schools.com/html/mov_bbb.mp4', 's3BjaX3xrOA', '18 mins', 3, 'video', now());

    SELECT id INTO v_lesson1_id FROM public.lessons WHERE unit_id = v_unit_id ORDER BY order_index LIMIT 1;

    IF v_lesson1_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.quizzes WHERE lesson_id = v_lesson1_id AND title = 'UI/UX Fundamentals') THEN
      INSERT INTO public.quizzes (id, lesson_id, title, passing_score, created_at)
      VALUES (gen_random_uuid(), v_lesson1_id, 'UI/UX Fundamentals', 70, now())
      RETURNING id INTO v_quiz_id;

      INSERT INTO public.questions (quiz_id, question_text, question_type, options, correct_answer, order_index)
      VALUES
        (v_quiz_id, 'What does UX stand for?', 'mcq', '["User Experience", "User Experiment", "Universal Experience", "User Extension"]', '0', 1),
        (v_quiz_id, 'Which of these is NOT a primary design principle?', 'mcq', '["Contrast", "Repetition", "Entropy", "Proximity"]', '2', 2),
        (v_quiz_id, 'What is the first stage of the Design Thinking process?', 'mcq', '["Ideate", "Define", "Prototype", "Empathize"]', '3', 3),
        (v_quiz_id, 'What is a "Wireframe" in UI design?', 'mcq', '["A high-fidelity mockup", "A low-fidelity structural sketch", "A final coded version", "A user testing report"]', '1', 4),
        (v_quiz_id, 'Which tool is most commonly used for collaborative UI design?', 'mcq', '["Adobe Photoshop", "Figma", "Microsoft Word", "Notepad++"]', '1', 5);
    END IF;
  END IF;
END $$;
