import { v } from "convex/values";
import { query } from "../_generated/server";

export const getUser = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;
    return {
      _id: user._id,
      email: user.email,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      paymentStatus: user.paymentStatus,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    };
  },
});

export const getUserByEmail = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) return null;
    return {
      _id: user._id,
      email: user.email,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      paymentStatus: user.paymentStatus,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      password: user.password, // Return password for internal verification
    };
  },
});
