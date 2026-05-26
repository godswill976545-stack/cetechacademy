import { v } from "convex/values";
import { action, internalAction } from "./_generated/server";

export const sendOTP = internalAction({
  args: {
    email: v.string(),
    code: v.string(),
  },
  handler: async (_, args) => {
    console.log(`>>> sendOTP handler started for: ${args.email}`);
    
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("!!! RESEND_API_KEY is MISSING in environment variables");
      return { success: false, error: "Missing Resend API key" };
    }

    try {
      console.log(`Attempting to fetch Resend API for ${args.email}...`);
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "info@cetechacademy.com",
          to: [args.email],
          subject: "Your CeTech Verification Code",
          html: `
            <div style="font-family:sans-serif;text-align:center;padding:40px;background:#070b10;color:white;">
              <h2 style="color:#00d2ff;">Verify Your Identity</h2>
              <p style="font-size:18px;color:#cbd5e1;">Your 6-digit code is:</p>
              <div style="font-size:32px;font-weight:bold;letter-spacing:8px;margin:20px 0;padding:10px;background:rgba(255,255,255,0.1);border-radius:12px;">${args.code}</div>
              <p style="font-size:14px;color:#94a3b8;">Expires in 10 minutes.</p>
            </div>
          `,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        console.error(`Resend API responded with error ${res.status}: ${err}`);
        return { success: false, error: err };
      }

      console.log(`Successfully sent email to ${args.email}`);
      return { success: true };
    } catch (error) {
      console.error(`Critical network error sending email to ${args.email}:`, error);
      return { success: false, error: error.message };
    }
  },
});

export const sendContactEmail = internalAction({
  args: {
    name: v.string(),
    email: v.string(),
    program: v.string(),
  },
  handler: async (_, args) => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn("RESEND_API_KEY not set — skipping contact email");
      return { success: false };
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "CeTech Academy <info@cetechacademy.com>",
        to: ["info@cetechacademy.com"],
        subject: `New Inquiry: ${args.program}`,
        html: `
          <div style="font-family:sans-serif;padding:40px;">
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${args.name}</p>
            <p><strong>Email:</strong> ${args.email}</p>
            <p><strong>Program:</strong> ${args.program}</p>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Resend error:", res.status, err);
      throw new Error(`Contact email failed: ${err}`);
    }

    return { success: true };
  },
});
