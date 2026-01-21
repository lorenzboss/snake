import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Query: Get all leaderboard entries
export const getAll = query({
  handler: async (ctx) => {
    const entries = await ctx.db.query("leaderboard").collect();
    return entries.map((entry) => ({
      id: entry._id,
      userName: entry.userName,
      score: entry.score,
      difficulty: entry.difficulty,
      createdAt: new Date(entry.createdAt).toISOString(),
      updatedAt: new Date(entry.updatedAt).toISOString(),
    }));
  },
});

// Mutation: Create a new leaderboard entry
export const create = mutation({
  args: {
    userName: v.string(),
    score: v.number(),
    difficulty: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const id = await ctx.db.insert("leaderboard", {
      userName: args.userName,
      score: args.score,
      difficulty: args.difficulty,
      createdAt: now,
      updatedAt: now,
    });

    const entry = await ctx.db.get(id);
    if (!entry) throw new Error("Failed to create entry");

    return {
      id: entry._id,
      userName: entry.userName,
      score: entry.score,
      difficulty: entry.difficulty,
      createdAt: new Date(entry.createdAt).toISOString(),
      updatedAt: new Date(entry.updatedAt).toISOString(),
    };
  },
});

// Mutation: Update an existing leaderboard entry
export const update = mutation({
  args: {
    id: v.id("leaderboard"),
    userName: v.optional(v.string()),
    score: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new Error("Entry not found");
    }

    const now = Date.now();
    await ctx.db.patch(args.id, {
      ...(args.userName !== undefined && { userName: args.userName }),
      ...(args.score !== undefined && { score: args.score }),
      updatedAt: now,
    });

    const updated = await ctx.db.get(args.id);
    if (!updated) throw new Error("Failed to update entry");

    return {
      id: updated._id,
      userName: updated.userName,
      score: updated.score,
      difficulty: updated.difficulty,
      createdAt: new Date(updated.createdAt).toISOString(),
      updatedAt: new Date(updated.updatedAt).toISOString(),
    };
  },
});

// Query: Find entry by userName and difficulty
export const findByUserAndDifficulty = query({
  args: {
    userName: v.string(),
    difficulty: v.string(),
  },
  handler: async (ctx, args) => {
    const entries = await ctx.db
      .query("leaderboard")
      .withIndex("by_userName_difficulty", (q) =>
        q.eq("userName", args.userName).eq("difficulty", args.difficulty),
      )
      .collect();

    if (entries.length === 0) return null;

    const entry = entries[0];
    return {
      id: entry._id,
      userName: entry.userName,
      score: entry.score,
      difficulty: entry.difficulty,
      createdAt: new Date(entry.createdAt).toISOString(),
      updatedAt: new Date(entry.updatedAt).toISOString(),
    };
  },
});
