import { v } from "convex/values";
import { query } from "../_generated/server";

export const getUserProgress = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const progress = await ctx.db
      .query("userProgress")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
    return progress;
  },
});

export const getLessonProgress = query({
  args: {
    userId: v.id("users"),
    lessonId: v.id("lessons"),
  },
  handler: async (ctx, args) => {
    const progress = await ctx.db
      .query("userProgress")
      .withIndex("by_user_lesson", (q) =>
        q.eq("userId", args.userId).eq("lessonId", args.lessonId)
      )
      .first();
    return progress;
  },
});

export const getCourseProgress = query({
  args: {
    userId: v.id("users"),
    courseId: v.id("courses"),
  },
  handler: async (ctx, args) => {
    const units = await ctx.db
      .query("units")
      .withIndex("by_courseId", (q) => q.eq("courseId", args.courseId))
      .collect();

    const lessonIds: string[] = [];
    for (const unit of units) {
      const lessons = await ctx.db
        .query("lessons")
        .withIndex("by_unitId", (q) => q.eq("unitId", unit._id))
        .collect();
      lessonIds.push(...lessons.map((l) => l._id));
    }

    const progress = await ctx.db
      .query("userProgress")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    const completedCount = progress.filter(
      (p) => p.completed && lessonIds.includes(p.lessonId)
    ).length;

    return {
      totalLessons: lessonIds.length,
      completedLessons: completedCount,
      percent: lessonIds.length > 0
        ? Math.round((completedCount / lessonIds.length) * 100)
        : 0,
    };
  },
});
