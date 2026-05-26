import { v } from "convex/values";
import { query } from "../_generated/server";

export const listCourses = query({
  handler: async (ctx) => {
    const courses = await ctx.db
      .query("courses")
      .withIndex("by_created")
      .order("desc")
      .collect();
    return courses;
  },
});

export const getCourse = query({
  args: {
    courseId: v.id("courses"),
  },
  handler: async (ctx, args) => {
    const course = await ctx.db.get(args.courseId);
    if (!course) throw new Error("Course not found");

    const units = await ctx.db
      .query("units")
      .withIndex("by_courseId", (q) => q.eq("courseId", args.courseId))
      .order("asc")
      .collect();

    const unitsWithLessons = await Promise.all(
      units.map(async (unit) => {
        const lessons = await ctx.db
          .query("lessons")
          .withIndex("by_unitId", (q) => q.eq("unitId", unit._id))
          .order("asc")
          .collect();
        return { ...unit, lessons };
      })
    );

    return { ...course, units: unitsWithLessons };
  },
});

export const listUnits = query({
  args: {
    courseId: v.id("courses"),
  },
  handler: async (ctx, args) => {
    const units = await ctx.db
      .query("units")
      .withIndex("by_courseId", (q) => q.eq("courseId", args.courseId))
      .order("asc")
      .collect();
    return units;
  },
});

export const getLessonsByUnit = query({
  args: {
    unitId: v.id("units"),
  },
  handler: async (ctx, args) => {
    const lessons = await ctx.db
      .query("lessons")
      .withIndex("by_unitId", (q) => q.eq("unitId", args.unitId))
      .order("asc")
      .collect();
    return lessons;
  },
});

export const getLesson = query({
  args: {
    lessonId: v.id("lessons"),
  },
  handler: async (ctx, args) => {
    const lesson = await ctx.db.get(args.lessonId);
    if (!lesson) throw new Error("Lesson not found");

    const quizzes = await ctx.db
      .query("quizzes")
      .withIndex("by_lessonId", (q) => q.eq("lessonId", args.lessonId))
      .collect();

    const quizzesWithQuestions = await Promise.all(
      quizzes.map(async (quiz) => {
        const questions = await ctx.db
          .query("questions")
          .withIndex("by_quizId", (q) => q.eq("quizId", quiz._id))
          .order("asc")
          .collect();
        return { ...quiz, questions };
      })
    );

    const assignments = await ctx.db
      .query("assignments")
      .withIndex("by_lessonId", (q) => q.eq("lessonId", args.lessonId))
      .collect();

    return {
      ...lesson,
      quizzes: quizzesWithQuestions,
      assignments,
    };
  },
});
