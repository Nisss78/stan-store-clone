import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    const ordersWithProduct = await Promise.all(
      orders.map(async (order) => {
        const product = await ctx.db.get(order.productId);
        return {
          ...order,
          product: product
            ? {
                id: product._id,
                title: product.title,
                thumbnailUrl: product.thumbnailUrl,
              }
            : null,
        };
      })
    );

    return ordersWithProduct.sort(
      (a, b) => (b._creationTime ?? 0) - (a._creationTime ?? 0)
    );
  },
});

export const getById = query({
  args: { id: v.id("orders") },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.id);
    if (!order) return null;

    const product = await ctx.db.get(order.productId);
    if (!product) return null;

    const user = await ctx.db.get(product.userId);

    return {
      ...order,
      product: {
        ...product,
        user: user
          ? { id: user._id, username: user.username, name: user.name }
          : null,
      },
    };
  },
});

export const create = mutation({
  args: {
    productId: v.id("products"),
    userId: v.id("users"),
    buyerEmail: v.string(),
    amount: v.number(),
    currency: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("orders", args);
    return await ctx.db.get(id);
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("orders"),
    status: v.string(),
    stripePaymentId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const updates: Record<string, unknown> = { status: args.status };
    if (args.stripePaymentId) {
      updates.stripePaymentId = args.stripePaymentId;
    }
    await ctx.db.patch(args.id, updates);
    return await ctx.db.get(args.id);
  },
});
