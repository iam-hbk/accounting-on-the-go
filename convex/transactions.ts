import { v } from "convex/values";
import { query, mutation, action, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";
import { paginationOptsValidator } from "convex/server";
import { parseStatementWithAI } from "./aiParser";

export const getTransactions = query({
  args: {
    paginationOpts: paginationOptsValidator,
    categoryId: v.optional(v.id("categories")),
    sortBy: v.optional(v.union(v.literal("date"), v.literal("amount"), v.literal("description"))),
    sortOrder: v.optional(v.union(v.literal("asc"), v.literal("desc"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    let queryBuilder;

    if (args.categoryId) {
      queryBuilder = ctx.db
        .query("transactions")
        .withIndex("by_user_and_category", (q) =>
          q.eq("userId", userId).eq("categoryId", args.categoryId)
        );
    } else {
      queryBuilder = ctx.db
        .query("transactions")
        .withIndex("by_user", (q) => q.eq("userId", userId));
    }

    const order = args.sortOrder === "desc" ? "desc" : "asc";
    const result = await queryBuilder
      .order(order)
      .paginate(args.paginationOpts);

    // Get categories for each transaction
    const transactionsWithCategories = await Promise.all(
      result.page.map(async (transaction) => {
        const category = transaction.categoryId
          ? await ctx.db.get(transaction.categoryId)
          : null;
        return { ...transaction, category };
      })
    );

    return {
      ...result,
      page: transactionsWithCategories,
    };
  },
});

// Get total count for pagination
export const getTransactionCount = query({
  args: {
    categoryId: v.optional(v.id("categories")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    let queryBuilder;

    if (args.categoryId) {
      queryBuilder = ctx.db
        .query("transactions")
        .withIndex("by_user_and_category", (q) =>
          q.eq("userId", userId).eq("categoryId", args.categoryId)
        );
    } else {
      queryBuilder = ctx.db
        .query("transactions")
        .withIndex("by_user", (q) => q.eq("userId", userId));
    }

    const transactions = await queryBuilder.collect();
    return transactions.length;
  },
});

// Get uncategorized transactions (no categoryId)
export const getUncategorizedTransactions = query({
  args: {
    paginationOpts: paginationOptsValidator,
    sortBy: v.optional(v.union(v.literal("date"), v.literal("amount"), v.literal("description"))),
    sortOrder: v.optional(v.union(v.literal("asc"), v.literal("desc"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Query transactions without categoryId
    const queryBuilder = ctx.db
      .query("transactions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("categoryId"), undefined));

    const order = args.sortOrder === "desc" ? "desc" : "asc";
    const result = await queryBuilder
      .order(order)
      .paginate(args.paginationOpts);

    // Return transactions without categories (they're uncategorized by definition)
    return {
      ...result,
      page: result.page.map((transaction) => ({ ...transaction, category: null })),
    };
  },
});

export const updateTransactionCategory = mutation({
  args: {
    transactionId: v.id("transactions"),
    categoryId: v.optional(v.id("categories")),
    categoryNote: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const transaction = await ctx.db.get(args.transactionId);
    if (!transaction || transaction.userId !== userId) {
      throw new Error("Transaction not found");
    }

    await ctx.db.patch(args.transactionId, {
      categoryId: args.categoryId,
      categoryNote: args.categoryNote,
    });
  },
});

// Removed generateUploadUrl - no longer needed since we process files directly

export const processStatement = action({
  args: {
    fileData: v.bytes(), // Raw file data as ArrayBuffer
    fileName: v.string(),
    mediaType: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("processStatement called with file:", args.fileName, "type:", args.mediaType);
    
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Create statement record
    const statementId = await ctx.runMutation(
      internal.transactions.createStatement,
      {
        fileName: args.fileName,
        userId,
        status: "processing" as const,
      }
    );

    try {
      console.log("Processing file with AI...");
      const parsedTransactions = await parseStatementWithAI(args.fileData, args.mediaType, args.fileName);
      console.log("AI parsing completed, transactions:", parsedTransactions?.length || 0);

      if (!parsedTransactions || parsedTransactions.length === 0) {
        throw new Error("No transactions parsed from the file");
      }

      // Save transactions
      await ctx.runMutation(internal.transactions.saveTransactions, {
        transactions: parsedTransactions,
        userId,
        statementId,
      });

      // Update statement status
      await ctx.runMutation(internal.transactions.updateStatementStatus, {
        statementId,
        status: "completed" as const,
        transactionCount: parsedTransactions.length,
      });

      return { success: true, transactionCount: parsedTransactions.length };
    } catch (error) {
      await ctx.runMutation(internal.transactions.updateStatementStatus, {
        statementId,
        status: "failed" as const,
      });
      throw error;
    }
  },
});

export const createStatement = internalMutation({
  args: {
    fileName: v.string(),
    userId: v.id("users"),
    status: v.union(
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("statements", {
      fileName: args.fileName,
      uploadDate: Date.now(),
      userId: args.userId,
      status: args.status,
    });
  },
});

export const saveTransactions = internalMutation({
  args: {
    transactions: v.array(
      v.object({
        date: v.string(),
        description: v.string(),
        amount: v.number(),
        direction: v.union(v.literal("credit"), v.literal("debit")),
      })
    ),
    userId: v.id("users"),
    statementId: v.id("statements"),
  },
  handler: async (ctx, args) => {
    for (const transaction of args.transactions) {
      await ctx.db.insert("transactions", {
        ...transaction,
        userId: args.userId,
        statementId: args.statementId,
      });
    }
  },
});

export const updateStatementStatus = internalMutation({
  args: {
    statementId: v.id("statements"),
    status: v.union(
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed")
    ),
    transactionCount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.statementId, {
      status: args.status,
      ...(args.transactionCount !== undefined && {
        transactionCount: args.transactionCount,
      }),
    });
  },
});
