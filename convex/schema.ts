import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    password: v.string(),
    fullName: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    paymentStatus: v.optional(v.string()),
    isVerified: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_created", ["createdAt"]),

  verificationCodes: defineTable({
    userId: v.id("users"),
    code: v.string(),
    expiresAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_code", ["code"]),

  courses: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    thumbnailUrl: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_created", ["createdAt"]),

  units: defineTable({
    courseId: v.id("courses"),
    title: v.string(),
    orderIndex: v.number(),
    createdAt: v.number(),
  })
    .index("by_courseId", ["courseId"])
    .index("by_order", ["orderIndex"]),

  lessons: defineTable({
    unitId: v.id("units"),
    title: v.string(),
    description: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    muxPlaybackId: v.optional(v.string()),
    youtubeId: v.optional(v.string()),
    duration: v.optional(v.string()),
    orderIndex: v.number(),
    contentMarkdown: v.optional(v.string()),
    type: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_unitId", ["unitId"])
    .index("by_order", ["orderIndex"]),

  enrollments: defineTable({
    userId: v.id("users"),
    courseId: v.id("courses"),
    paymentStatus: v.string(),
    paystackReference: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_courseId", ["courseId"])
    .index("by_user_course", ["userId", "courseId"]),

  userProgress: defineTable({
    userId: v.id("users"),
    lessonId: v.id("lessons"),
    completed: v.boolean(),
    lastWatchedPosition: v.optional(v.number()),
    completedAt: v.optional(v.number()),
  })
    .index("by_userId", ["userId"])
    .index("by_lessonId", ["lessonId"])
    .index("by_user_lesson", ["userId", "lessonId"]),

  quizzes: defineTable({
    lessonId: v.id("lessons"),
    title: v.string(),
    passingScore: v.optional(v.number()),
    timeLimitMinutes: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_lessonId", ["lessonId"]),

  questions: defineTable({
    quizId: v.id("quizzes"),
    questionText: v.string(),
    questionType: v.string(),
    options: v.optional(v.array(v.string())),
    correctAnswer: v.string(),
    explanation: v.optional(v.string()),
    orderIndex: v.number(),
  })
    .index("by_quizId", ["quizId"])
    .index("by_order", ["orderIndex"]),

  quizResults: defineTable({
    userId: v.id("users"),
    quizId: v.id("quizzes"),
    score: v.number(),
    passed: v.boolean(),
    completedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_quizId", ["quizId"]),

  userNotes: defineTable({
    userId: v.id("users"),
    lessonId: v.id("lessons"),
    content: v.string(),
    videoTimestamp: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_lessonId", ["lessonId"])
    .index("by_user_lessonId", ["userId", "lessonId"]),

  userBookmarks: defineTable({
    userId: v.id("users"),
    lessonId: v.id("lessons"),
    title: v.optional(v.string()),
    videoTimestamp: v.number(),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_lessonId", ["lessonId"]),

  assignments: defineTable({
    lessonId: v.id("lessons"),
    title: v.string(),
    description: v.optional(v.string()),
    dueDate: v.optional(v.number()),
    maxPoints: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_lessonId", ["lessonId"]),

  assignmentSubmissions: defineTable({
    userId: v.id("users"),
    assignmentId: v.id("assignments"),
    submissionUrl: v.optional(v.string()),
    content: v.optional(v.string()),
    score: v.optional(v.number()),
    feedback: v.optional(v.string()),
    submittedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_assignmentId", ["assignmentId"])
    .index("by_user_assignment", ["userId", "assignmentId"]),
});
