-- ============================================================
-- CeTech Academy - Move Quiz Answers to a Secure Table
-- ============================================================

-- 1. Create the new table
CREATE TABLE IF NOT EXISTS public.question_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Migrate existing data
INSERT INTO public.question_answers (question_id, correct_answer, explanation)
SELECT id, correct_answer, explanation FROM public.questions;

-- 3. Remove the columns from the original table
ALTER TABLE public.questions DROP COLUMN IF EXISTS correct_answer;
ALTER TABLE public.questions DROP COLUMN IF EXISTS explanation;

-- 4. Add indexes
CREATE INDEX IF NOT EXISTS idx_question_answers_question_id ON public.question_answers(question_id);

-- 5. Update RLS
-- The questions table is already enabled for RLS.
-- We need to ensure question_answers is also protected.
ALTER TABLE public.question_answers ENABLE ROW LEVEL SECURITY;

-- Only service role can read correct answers (for server-side grading)
-- No policies for authenticated users means they can't read it via Supabase client.
-- (Service role bypasses RLS)

-- 6. Update the view/query logic (This will be handled in the API)
