import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  leaderboard: defineTable({
    userName: v.string(),
    score: v.number(),
    difficulty: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_difficulty_score", ["difficulty", "score"])
    .index("by_userName_difficulty", ["userName", "difficulty"]),
});
