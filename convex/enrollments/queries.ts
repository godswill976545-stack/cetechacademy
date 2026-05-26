import { v } from "convex/values";
import { query } from "../_generated/server";

export const getUserEnrollments = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const enrollments = await ctx.db
      .query("enrollments")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    const enrollmentsWithCourse = await Promise.all(
      enrollments.map(async (enrollment) => {
        const course = await ctx.db.get(enrollment.courseId);
        return { ...enrollment, course };
      })
    );

    return enrollmentsWithCourse;
  },
});

export const checkEnrollment = query({
  args: {
    userId: v.id("users"),
    courseId: v.id("courses"),
  },
  handler: async (ctx, args) => {
    const enrollment = await ctx.db
      .query("enrollments")
      .withIndex("by_user_course", (q) =>
        q.eq("userId", args.userId).eq("courseId", args.courseId)
      )
      .first();
    return enrollment;
  },
});
