import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();
  },
});

export const getOrCreateByClerkId = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existing) {
      return existing;
    }

    // Auto-generate username from email
    const baseUsername = args.email.split("@")[0]?.replace(/[^a-z0-9_]/g, "_").slice(0, 20) || `user_${Date.now()}`;
    
    // Check if username exists
    let username = baseUsername;
    let counter = 1;
    while (await ctx.db.query("users").withIndex("by_username", q => q.eq("username", username)).unique()) {
      username = `${baseUsername}_${counter}`;
      counter++;
    }

    const id = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      username,
      email: args.email,
      name: args.name,
      avatarUrl: args.avatarUrl,
      themeColor: "#6366f1",
      themeName: "default",
    });

    return await ctx.db.get(id);
  },
});

export const getByUsername = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .unique();
  },
});

export const upsertFromClerk = mutation({
  args: {
    clerkId: v.string(),
    username: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        username: args.username,
        email: args.email,
        name: args.name,
        avatarUrl: args.avatarUrl,
      });
      return existing._id;
    }

    return await ctx.db.insert("users", {
      clerkId: args.clerkId,
      username: args.username,
      email: args.email,
      name: args.name,
      avatarUrl: args.avatarUrl,
      themeColor: "#6366f1",
      themeName: "default",
    });
  },
});

export const updateProfile = mutation({
  args: {
    clerkId: v.string(),
    username: v.optional(v.string()),
    name: v.optional(v.string()),
    bio: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    themeColor: v.optional(v.string()),
    themeName: v.optional(v.string()),
    twitterUrl: v.optional(v.string()),
    instagramUrl: v.optional(v.string()),
    youtubeUrl: v.optional(v.string()),
    tiktokUrl: v.optional(v.string()),
    websiteUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) throw new Error("User not found");

    const { clerkId: _, ...updates } = args;
    // Filter out undefined values
    const filteredUpdates: Record<string, string> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        filteredUpdates[key] = value;
      }
    }

    await ctx.db.patch(user._id, filteredUpdates);

    return await ctx.db.get(user._id);
  },
});
