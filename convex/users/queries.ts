import { v } from "convex/values";
import { query } from "../_generated/server";

export const getUserNotes = query({
  args: {
    userId: v.id("users"),
    lessonId: v.id("lessons"),
  },
  handler: async (ctx, args) => {
    const notes = await ctx.db
      .query("userNotes")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("lessonId"), args.lessonId))
      .collect();
    return notes;
  },
});

export const getUserBookmarks = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const bookmarks = await ctx.db
      .query("userBookmarks")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    const bookmarksWithLesson = await Promise.all(
      bookmarks.map(async (bm) => {
        const lesson = await ctx.db.get(bm.lessonId);
        return { ...bm, lesson };
      })
    );

    return bookmarksWithLesson;
  },
});

export const getQuizResults = query({
  args: {
    userId: v.id("users"),
    quizId: v.optional(v.id("quizzes")),
  },
  handler: async (ctx, args) => {
    let results = await ctx.db
      .query("quizResults")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    if (args.quizId) {
      results = results.filter((r) => r.quizId === args.quizId);
    }

    return results;
  },
});
