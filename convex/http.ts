import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

// Clerk webhook for user sync
http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    const eventType = body.type;

    if (eventType === "user.created" || eventType === "user.updated") {
      const userData = body.data;
      const email =
        userData.email_addresses?.[0]?.email_address ?? "";
      const username =
        userData.username ??
        email.split("@")[0]?.replace(/[^a-z0-9_]/g, "_").slice(0, 20) ??
        `user_${userData.id.slice(-8)}`;

      await ctx.runMutation(api.users.upsertFromClerk, {
        clerkId: userData.id,
        username,
        email,
        name:
          [userData.first_name, userData.last_name]
            .filter(Boolean)
            .join(" ") || undefined,
        avatarUrl: userData.image_url || undefined,
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

export default http;
