import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  categories: defineTable({
    name: v.string(),
    color: v.string(),
    userId: v.id("users"),
  }).index("by_user", ["userId"]),

  transactions: defineTable({
    date: v.string(),
    description: v.string(),
    amount: v.number(),
    direction: v.union(v.literal("credit"), v.literal("debit")),
    categoryId: v.optional(v.id("categories")),
    categoryNote: v.optional(v.string()), // Optional note when categorizing
    userId: v.id("users"),
    statementId: v.id("statements"), // To group transactions from same upload
  })
    .index("by_user", ["userId"])
    .index("by_user_and_statement", ["userId", "statementId"])
    .index("by_user_and_category", ["userId", "categoryId"]),

  statements: defineTable({
    fileName: v.string(),
    uploadDate: v.number(),
    userId: v.id("users"),
    status: v.union(
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed")
    ),
    transactionCount: v.optional(v.number()),
  }).index("by_user", ["userId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
