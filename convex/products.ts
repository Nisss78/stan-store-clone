import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const products = await ctx.db
      .query("products")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
    return products.sort(
      (a, b) => (b._creationTime ?? 0) - (a._creationTime ?? 0)
    );
  },
});

export const getActiveByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const products = await ctx.db
      .query("products")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
    return products
      .filter((p) => p.isActive)
      .sort((a, b) => (b._creationTime ?? 0) - (a._creationTime ?? 0));
  },
});

export const getById = query({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    userId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    price: v.number(),
    currency: v.string(),
    thumbnailUrl: v.optional(v.string()),
    fileUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("products", {
      ...args,
      isActive: true,
    });
    return await ctx.db.get(id);
  },
});

export const update = mutation({
  args: {
    id: v.id("products"),
    userId: v.id("users"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    thumbnailUrl: v.optional(v.string()),
    fileUrl: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.id);
    if (!product || product.userId !== args.userId) {
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
  args: { id: v.id("products"), userId: v.id("users") },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.id);
    if (!product || product.userId !== args.userId) {
      throw new Error("Not found");
    }
    await ctx.db.delete(args.id);
    return { success: true };
  },
});
