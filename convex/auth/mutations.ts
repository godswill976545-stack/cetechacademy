import { v } from "convex/values";
import { mutation, internalMutation } from "../_generated/server";
import { internal } from "../_generated/api";

export const register = internalMutation({
  args: {
    email: v.string(),
    password: v.string(),
    fullName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existing) {
      throw new Error("User with this email already exists");
    }

    const userId = await ctx.db.insert("users", {
      email: args.email,
      password: args.password,
      fullName: args.fullName || "",
      paymentStatus: "unpaid",
      isVerified: false,
      createdAt: Date.now(),
    });

    return { userId, email: args.email };
  },
});

export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    throw new Error("Login is now handled by the loginUser action for security.");
  },
});

export const createOTP = internalMutation({
  args: {
    userId: v.id("users"),
    code: v.string(),
  },
  handler: async (ctx, args) => {
    const expiresAt = Date.now() + 10 * 60 * 1000;
    const existingCode = await ctx.db
      .query("verificationCodes")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (existingCode) {
      await ctx.db.delete(existingCode._id);
    }

    await ctx.db.insert("verificationCodes", {
      userId: args.userId,
      code: args.code,
      expiresAt,
    });
    return { success: true };
  },
});

export const verifyOTP = mutation({
  args: {
    userId: v.id("users"),
    code: v.string(),
  },
  handler: async (ctx, args) => {
    const verificationCode = await ctx.db
      .query("verificationCodes")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (!verificationCode) {
      throw new Error("No verification code found");
    }

    if (verificationCode.code !== args.code) {
      throw new Error("Invalid verification code");
    }

    if (verificationCode.expiresAt < Date.now()) {
      await ctx.db.delete(verificationCode._id);
      throw new Error("Verification code has expired");
    }

    await ctx.db.patch(args.userId, { isVerified: true });
    await ctx.db.delete(verificationCode._id);

    return { success: true };
  },
});

export const resendOTP = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    const existingCode = await ctx.db
      .query("verificationCodes")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (existingCode) {
      await ctx.db.delete(existingCode._id);
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    await ctx.db.insert("verificationCodes", {
      userId: args.userId,
      code: otpCode,
      expiresAt,
    });

    await ctx.scheduler.runAfter(0, internal.email.sendOTP, {
      email: user.email,
      code: otpCode,
    });

    return { success: true };
  },
});
