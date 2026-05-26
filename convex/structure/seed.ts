import { internalMutation } from "../_generated/server";

export const seed = internalMutation({
  handler: async (ctx) => {
    const existingCourses = await ctx.db.query("courses").collect();
    if (existingCourses.length > 0) return;

    const courseId = await ctx.db.insert("courses", {
      title: "UI/UX Design Masterclass",
      description: "Learn how to map immersive digital interfaces.",
      price: 0,
      createdAt: Date.now(),
    });

    const unitId = await ctx.db.insert("units", {
      courseId,
      title: "UNIT 1: INTRODUCTION",
      orderIndex: 1,
      createdAt: Date.now(),
    });

    await ctx.db.insert("lessons", {
      unitId,
      title: "1.1 What is User Experience?",
      description: "An introduction to the fundamental concepts of User Experience design.",
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      youtubeId: "SRec6L7TbRE",
      duration: "15 mins",
      orderIndex: 1,
      type: "video",
      createdAt: Date.now(),
    });

    await ctx.db.insert("lessons", {
      unitId,
      title: "1.2 Design Thinking Process",
      description: "Understanding the 5 stages of design thinking: Empathize, Define, Ideate, Prototype, Test.",
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      youtubeId: "UBVVV0GvK18",
      duration: "22 mins",
      orderIndex: 2,
      type: "video",
      createdAt: Date.now(),
    });

    await ctx.db.insert("lessons", {
      unitId,
      title: "1.3 Wireframing Basics",
      description: "How to sketch out your digital interfaces quickly and effectively.",
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      youtubeId: "s3BjaX3xrOA",
      duration: "18 mins",
      orderIndex: 3,
      type: "video",
      createdAt: Date.now(),
    });

    const firstLesson = await ctx.db
      .query("lessons")
      .withIndex("by_unitId", (q) => q.eq("unitId", unitId))
      .first();

    const quizId = await ctx.db.insert("quizzes", {
      lessonId: firstLesson!._id,
      title: "UI/UX Fundamentals",
      passingScore: 70,
      createdAt: Date.now(),
    });

    const questions = [
      {
        questionText: "What does UX stand for?",
        options: ["User Experience", "User Experiment", "Universal Experience", "User Extension"],
        correctAnswer: "0",
      },
      {
        questionText: "Which of these is NOT a primary design principle?",
        options: ["Contrast", "Repetition", "Entropy", "Proximity"],
        correctAnswer: "2",
      },
      {
        questionText: "What is the first stage of the Design Thinking process?",
        options: ["Ideate", "Define", "Prototype", "Empathize"],
        correctAnswer: "3",
      },
      {
        questionText: 'What is a "Wireframe" in UI design?',
        options: ["A high-fidelity mockup", "A low-fidelity structural sketch", "A final coded version", "A user testing report"],
        correctAnswer: "1",
      },
      {
        questionText: "Which tool is most commonly used for collaborative UI design?",
        options: ["Adobe Photoshop", "Figma", "Microsoft Word", "Notepad++"],
        correctAnswer: "1",
      },
    ];

    for (let i = 0; i < questions.length; i++) {
      await ctx.db.insert("questions", {
        quizId,
        questionText: questions[i].questionText,
        questionType: "mcq",
        options: questions[i].options,
        correctAnswer: questions[i].correctAnswer,
        orderIndex: i + 1,
      });
    }
  },
});
