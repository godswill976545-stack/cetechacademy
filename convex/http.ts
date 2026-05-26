import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/api/health",
  method: "GET",
  handler: httpAction(async (_ctx, request) => {
    return new Response(
      JSON.stringify({ status: "ok", message: "CeTech Academy API is running" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }),
});

http.route({
  path: "/api/contact",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    const { name, email, program } = body;

    await ctx.runAction(internal.email.sendContactEmail, { name, email, program });

    return new Response(
      JSON.stringify({ success: true, message: "Inquiry submitted successfully" }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  }),
});

http.route({
  path: "/api/paystack/webhook",
  method: "POST",
  handler: httpAction(async (_ctx, request) => {
    const body = await request.json();
    console.log("Webhook received", body);
    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }),
});

export default http;
