import { useMutation, useQuery } from "convex/react";
import { useCallback } from "react";
import { api } from "../../convex/_generated/api";
import type { Difficulty, LeaderboardEntry } from "../types/game";
import {
  convertLeaderboardEntries,
  processScoreUpdate,
} from "../utils/leaderboard";

export const useLeaderboard = () => {
  // Reactive query - updates automatically when data changes!
  const convexEntries = useQuery(api.leaderboard.getAll);
  const entries = convertLeaderboardEntries(convexEntries);

  // Mutations
  const createMutation = useMutation(api.leaderboard.create);
  const updateMutation = useMutation(api.leaderboard.update);

  const addOrUpdateScore = useCallback(
    async (
      name: string,
      score: number,
      difficulty: Difficulty,
    ): Promise<{
      entries: LeaderboardEntry[];
      isNewHighscore: boolean;
      previousHighscore: number | null;
      scoreTooLow: boolean;
    }> => {
      const result = await processScoreUpdate(
        name,
        score,
        difficulty,
        // Find existing entry in current data
        async (args) => {
          const existing = entries.find(
            (e) =>
              e.userName.toLowerCase() === args.userName.toLowerCase() &&
              e.difficulty === args.difficulty,
          );
          if (!existing) return null;
          return {
            id: existing.id!,
            userName: existing.userName,
            score: existing.score,
            difficulty: existing.difficulty,
            createdAt: new Date(existing.timestamp).toISOString(),
            updatedAt: new Date(existing.timestamp).toISOString(),
          };
        },
        createMutation,
        updateMutation,
      );

      return {
        ...result,
        entries, // Will be updated automatically via useQuery!
      };
    },
    [entries, createMutation, updateMutation],
  );

  return {
    leaderboard: entries,
    addOrUpdateScore,
    isLoading: convexEntries === undefined,
  };
};
