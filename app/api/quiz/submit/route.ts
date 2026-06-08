import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { lessonId, answers } = await req.json();

    if (!lessonId || !answers) {
      return NextResponse.json({ success: false, error: 'lessonId and answers required' }, { status: 400 });
    }

    // 1. Authenticate user via Clerk
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Use admin client for sensitive operations
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    // 3. Resolve Clerk user to Supabase user
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single();

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // 4. Find the quiz associated with this lesson
    const { data: quiz, error: quizError } = await supabaseAdmin
      .from('quizzes')
      .select('id')
      .eq('lesson_id', lessonId)
      .single();

    if (quizError || !quiz) {
      return NextResponse.json({ success: false, error: 'Quiz not found for this lesson' }, { status: 404 });
    }

    // 5. Fetch questions and their correct answers
    const { data: questions, error: qError } = await supabaseAdmin
      .from('questions')
      .select(`
        id,
        order_index,
        question_answers (
          correct_answer
        )
      `)
      .eq('quiz_id', quiz.id)
      .order('order_index', { ascending: true });

    if (qError || !questions) {
      return NextResponse.json({ success: false, error: 'Failed to fetch questions' }, { status: 500 });
    }

    // 6. Grade the quiz
    let correctCount = 0;
    const totalCount = questions.length;

    questions.forEach((q, idx) => {
      const userAnswer = answers[idx];
      const correctAnswer = q.question_answers?.[0]?.correct_answer;
      if (userAnswer !== undefined && String(userAnswer) === correctAnswer) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / totalCount) * 100);
    const passed = score >= 70;

    // 7. Update user progress
    await supabaseAdmin.from('user_progress').upsert({
      user_id: user.id,
      lesson_id: lessonId,
      completed: passed,
      completed_at: passed ? new Date().toISOString() : null,
    }, { onConflict: 'user_id, lesson_id' });

    return NextResponse.json({
      success: true,
      score,
      correctCount,
      totalCount,
      passed
    });

  } catch (err: any) {
    console.error('Quiz submission error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Internal server error' }, { status: 500 });
  }
}
