import { v } from "convex/values";
import { mutation } from "../_generated/server";

export const createEnrollment = mutation({
  args: {
    userId: v.id("users"),
    courseId: v.id("courses"),
    paymentStatus: v.string(),
    paystackReference: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("enrollments")
      .withIndex("by_user_course", (q) =>
        q.eq("userId", args.userId).eq("courseId", args.courseId)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        paymentStatus: args.paymentStatus,
        paystackReference: args.paystackReference,
      });
      return existing._id;
    }

    const enrollmentId = await ctx.db.insert("enrollments", {
      userId: args.userId,
      courseId: args.courseId,
      paymentStatus: args.paymentStatus,
      paystackReference: args.paystackReference,
      createdAt: Date.now(),
    });

    await ctx.db.patch(args.userId, { paymentStatus: args.paymentStatus });

    return enrollmentId;
  },
});

export const updatePaymentStatus = mutation({
  args: {
    enrollmentId: v.id("enrollments"),
    paymentStatus: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.enrollmentId, {
      paymentStatus: args.paymentStatus,
    });
  },
});
