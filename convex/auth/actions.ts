import { v } from "convex/values";
import { action } from "../_generated/server";
import { internal } from "../_generated/api";

async function safeHash(password: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

export const registerUser = action({
  args: {
    email: v.string(),
    password: v.string(),
    fullName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      const hashedPassword = await safeHash(args.password);
      const result = await ctx.runMutation(internal["auth/mutations"].register, {
        email: args.email,
        password: hashedPassword,
        fullName: args.fullName,
      });

      // Generate and send OTP for new registration
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      await ctx.runMutation(internal["auth/mutations"].createOTP, {
        userId: result.userId,
        code: otpCode,
      });

      const emailResult = await ctx.runAction(internal.email.sendOTP, {
        email: result.email,
        code: otpCode,
      });

      if (!emailResult.success) {
        console.error("Failed to send registration OTP:", emailResult.error);
        // We still return success: true because the user is created, 
        // but they'll need to use "Resend Code" if the initial email fails.
      }

      return { success: true, userId: result.userId, email: result.email };
    } catch (error) {
      return { success: false, error: error.message || "Internal server error" };
    }
  },
});

export const loginUser = action({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const hashedPassword = await safeHash(args.password);
      const user = await ctx.runQuery(internal["auth/queries"].getUserByEmail, { email: args.email });

      if (!user || user.password !== hashedPassword) {
        return { success: false, error: "Invalid email or password" };
      }

      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      await ctx.runMutation(internal["auth/mutations"].createOTP, {
        userId: user._id,
        code: otpCode,
      });

      const emailResult = await ctx.runAction(internal.email.sendOTP, {
        email: user.email,
        code: otpCode,
      });

      if (!emailResult.success) {
        throw new Error(`Failed to send verification code: ${emailResult.error}`);
      }

      return { success: true, userId: user._id, email: user.email };
    } catch (error) {
      return { success: false, error: error.message || "Internal server error" };
    }
  },
});
