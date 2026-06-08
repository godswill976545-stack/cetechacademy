-- Seed course data
INSERT INTO public.courses (id, title, description, price, created_at)
VALUES (
  gen_random_uuid(),
  'UI/UX Design Masterclass',
  'Learn how to map immersive digital interfaces.',
  0,
  now()
);

DO $$
DECLARE
  course_id UUID;
  unit_id UUID;
  lesson1_id UUID;
  quiz_id UUID;
BEGIN
  SELECT id INTO course_id FROM public.courses WHERE title = 'UI/UX Design Masterclass' LIMIT 1;

  INSERT INTO public.units (id, course_id, title, order_index, created_at)
  VALUES (gen_random_uuid(), course_id, 'UNIT 1: INTRODUCTION', 1, now())
  RETURNING id INTO unit_id;

  INSERT INTO public.lessons (id, unit_id, title, description, video_url, youtube_id, duration, order_index, type, created_at)
  VALUES
    (gen_random_uuid(), unit_id, '1.1 What is User Experience?', 'An introduction to the fundamental concepts of User Experience design.', 'https://www.w3schools.com/html/mov_bbb.mp4', 'SRec6L7TbRE', '15 mins', 1, 'video', now()),
    (gen_random_uuid(), unit_id, '1.2 Design Thinking Process', 'Understanding the 5 stages of design thinking: Empathize, Define, Ideate, Prototype, Test.', 'https://www.w3schools.com/html/mov_bbb.mp4', 'UBVVV0GvK18', '22 mins', 2, 'video', now()),
    (gen_random_uuid(), unit_id, '1.3 Wireframing Basics', 'How to sketch out your digital interfaces quickly and effectively.', 'https://www.w3schools.com/html/mov_bbb.mp4', 's3BjaX3xrOA', '18 mins', 3, 'video', now());

  SELECT id INTO lesson1_id FROM public.lessons WHERE unit_id = unit_id ORDER BY order_index LIMIT 1;

  INSERT INTO public.quizzes (id, lesson_id, title, passing_score, created_at)
  VALUES (gen_random_uuid(), lesson1_id, 'UI/UX Fundamentals', 70, now())
  RETURNING id INTO quiz_id;

  INSERT INTO public.questions (quiz_id, question_text, question_type, options, correct_answer, order_index)
  VALUES
    (quiz_id, 'What does UX stand for?', 'mcq', '["User Experience", "User Experiment", "Universal Experience", "User Extension"]', '0', 1),
    (quiz_id, 'Which of these is NOT a primary design principle?', 'mcq', '["Contrast", "Repetition", "Entropy", "Proximity"]', '2', 2),
    (quiz_id, 'What is the first stage of the Design Thinking process?', 'mcq', '["Ideate", "Define", "Prototype", "Empathize"]', '3', 3),
    (quiz_id, 'What is a "Wireframe" in UI design?', 'mcq', '["A high-fidelity mockup", "A low-fidelity structural sketch", "A final coded version", "A user testing report"]', '1', 4),
    (quiz_id, 'Which tool is most commonly used for collaborative UI design?', 'mcq', '["Adobe Photoshop", "Figma", "Microsoft Word", "Notepad++"]', '1', 5);
END $$;
