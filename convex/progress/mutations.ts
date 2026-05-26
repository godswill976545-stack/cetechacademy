import { v } from "convex/values";
import { mutation } from "../_generated/server";

export const updateProgress = mutation({
  args: {
    userId: v.id("users"),
    lessonId: v.id("lessons"),
    completed: v.boolean(),
    lastWatchedPosition: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("userProgress")
      .withIndex("by_user_lesson", (q) =>
        q.eq("userId", args.userId).eq("lessonId", args.lessonId)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        completed: args.completed,
        lastWatchedPosition: args.lastWatchedPosition ?? existing.lastWatchedPosition,
        completedAt: args.completed ? Date.now() : undefined,
      });
      return existing._id;
    }

    const progressId = await ctx.db.insert("userProgress", {
      userId: args.userId,
      lessonId: args.lessonId,
      completed: args.completed,
      lastWatchedPosition: args.lastWatchedPosition,
      completedAt: args.completed ? Date.now() : undefined,
    });

    return progressId;
  },
});


