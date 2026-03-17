import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    username: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    bio: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    themeColor: v.string(),
    themeName: v.string(),
    twitterUrl: v.optional(v.string()),
    instagramUrl: v.optional(v.string()),
    youtubeUrl: v.optional(v.string()),
    tiktokUrl: v.optional(v.string()),
    websiteUrl: v.optional(v.string()),
    stripeAccountId: v.optional(v.string()),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_username", ["username"])
    .index("by_email", ["email"]),

  links: defineTable({
    userId: v.id("users"),
    title: v.string(),
    url: v.string(),
    order: v.number(),
    icon: v.optional(v.string()),
    iconUrl: v.optional(v.string()),
    isActive: v.boolean(),
  }).index("by_userId", ["userId"]),

  products: defineTable({
    userId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    price: v.number(),
    currency: v.string(),
    fileUrl: v.optional(v.string()),
    thumbnailUrl: v.optional(v.string()),
    isActive: v.boolean(),
  }).index("by_userId", ["userId"]),

  orders: defineTable({
    productId: v.id("products"),
    userId: v.id("users"),
    buyerEmail: v.string(),
    buyerName: v.optional(v.string()),
    stripePaymentId: v.optional(v.string()),
    amount: v.number(),
    currency: v.string(),
    status: v.string(),
  })
    .index("by_userId", ["userId"])
    .index("by_productId", ["productId"]),

  analytics: defineTable({
    userId: v.id("users"),
    eventType: v.string(),
    metadata: v.optional(v.string()),
  }).index("by_userId", ["userId"]),
});
