import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const links = await ctx.db
      .query("links")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
    return links.sort((a, b) => a.order - b.order);
  },
});

export const getActiveByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const links = await ctx.db
      .query("links")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
    return links
      .filter((l) => l.isActive)
      .sort((a, b) => a.order - b.order);
  },
});

export const create = mutation({
  args: {
    userId: v.id("users"),
    title: v.string(),
    url: v.string(),
    icon: v.optional(v.string()),
    iconUrl: v.optional(v.string()),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("links")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
    const maxOrder = existing.reduce((max, l) => Math.max(max, l.order), -1);

    const id = await ctx.db.insert("links", {
      userId: args.userId,
      title: args.title,
      url: args.url,
      icon: args.icon,
      iconUrl: args.iconUrl,
      isActive: args.isActive,
      order: maxOrder + 1,
    });
    return await ctx.db.get(id);
  },
});

export const update = mutation({
  args: {
    id: v.id("links"),
    userId: v.id("users"),
    title: v.optional(v.string()),
    url: v.optional(v.string()),
    icon: v.optional(v.string()),
    iconUrl: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const link = await ctx.db.get(args.id);
    if (!link || link.userId !== args.userId) {
      throw new Error("Not found");
    }

    const { id, userId: _, ...updates } = args;
    const filteredUpdates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        filteredUpdates[key] = value;
      }
    }

    await ctx.db.patch(id, filteredUpdates);
    return await ctx.db.get(id);
  },
});

export const remove = mutation({
  args: { id: v.id("links"), userId: v.id("users") },
  handler: async (ctx, args) => {
    const link = await ctx.db.get(args.id);
    if (!link || link.userId !== args.userId) {
      throw new Error("Not found");
    }
    await ctx.db.delete(args.id);
    return { success: true };
  },
});

export const reorder = mutation({
  args: {
    userId: v.id("users"),
    items: v.array(v.object({ id: v.id("links"), order: v.number() })),
  },
  handler: async (ctx, args) => {
    for (const item of args.items) {
      const link = await ctx.db.get(item.id);
      if (!link || link.userId !== args.userId) {
        throw new Error("Forbidden");
      }
      await ctx.db.patch(item.id, { order: item.order });
    }
    return { success: true };
  },
});
