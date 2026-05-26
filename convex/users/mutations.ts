import { v } from "convex/values";
import { mutation } from "../_generated/server";

export const updateProfile = mutation({
  args: {
    userId: v.id("users"),
    fullName: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const patch: Record<string, string> = {};
    if (args.fullName !== undefined) patch.fullName = args.fullName;
    if (args.avatarUrl !== undefined) patch.avatarUrl = args.avatarUrl;
    await ctx.db.patch(args.userId, patch);
  },
});

export const saveNote = mutation({
  args: {
    userId: v.id("users"),
    lessonId: v.id("lessons"),
    content: v.string(),
    videoTimestamp: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("userNotes")
      .withIndex("by_user_lessonId", (q) => q.eq("userId", args.userId).eq("lessonId", args.lessonId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        content: args.content,
        videoTimestamp: args.videoTimestamp,
        updatedAt: Date.now(),
      });
      return existing._id;
    }

    return await ctx.db.insert("userNotes", {
      userId: args.userId,
      lessonId: args.lessonId,
      content: args.content,
      videoTimestamp: args.videoTimestamp,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const addBookmark = mutation({
  args: {
    userId: v.id("users"),
    lessonId: v.id("lessons"),
    title: v.optional(v.string()),
    videoTimestamp: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("userBookmarks", {
      userId: args.userId,
      lessonId: args.lessonId,
      title: args.title,
      videoTimestamp: args.videoTimestamp,
      createdAt: Date.now(),
    });
  },
});

export const removeBookmark = mutation({
  args: {
    bookmarkId: v.id("userBookmarks"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.bookmarkId);
  },
});

export const submitQuizResult = mutation({
  args: {
    userId: v.id("users"),
    quizId: v.id("quizzes"),
    score: v.number(),
    passed: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("quizResults", {
      userId: args.userId,
      quizId: args.quizId,
      score: args.score,
      passed: args.passed,
      completedAt: Date.now(),
    });
  },
});
