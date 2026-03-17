import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const track = mutation({
  args: {
    userId: v.id("users"),
    eventType: v.string(),
    metadata: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("analytics", args);
    return { success: true, id };
  },
});

export const getStats = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query("analytics")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    const pageViews = events.filter((e) => e.eventType === "page_view").length;
    const linkClicks = events.filter(
      (e) => e.eventType === "link_click"
    ).length;

    const orders = await ctx.db
      .query("orders")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    const completedOrders = orders.filter((o) => o.status === "completed");
    const totalRevenue = completedOrders.reduce(
      (sum, o) => sum + o.amount,
      0
    );

    const recentEvents = events
      .sort((a, b) => (b._creationTime ?? 0) - (a._creationTime ?? 0))
      .slice(0, 50)
      .map((e) => ({
        id: e._id,
        eventType: e.eventType,
        metadata: e.metadata ?? null,
        createdAt: new Date(e._creationTime).toISOString(),
      }));

    return {
      counts: {
        pageViews,
        linkClicks,
        orders: completedOrders.length,
      },
      totalRevenue,
      recentEvents,
    };
  },
});
