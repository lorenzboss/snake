import { ConvexReactClient } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Difficulty, LeaderboardEntry } from "../types/game";

// Initialize Convex client
const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

interface ConvexLeaderboardEntry {
  id: string;
  userName: string;
  score: number;
  difficulty: string;
  createdAt: string;
  updatedAt: string;
}

// Convert Convex response to frontend format
const convexToLocal = (
  convexEntry: ConvexLeaderboardEntry,
): LeaderboardEntry => ({
  userName: convexEntry.userName,
  score: convexEntry.score,
  difficulty: convexEntry.difficulty as Difficulty,
  timestamp: new Date(convexEntry.updatedAt).getTime(),
  id: convexEntry.id,
});

export const loadLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  try {
    const entries = await convex.query(api.leaderboard.getAll);
    return entries.map(convexToLocal);
  } catch (error) {
    console.error("Failed to load leaderboard from Convex:", error);
    return [];
  }
};

const MIN_SCORE_FOR_LEADERBOARD = 3;

export const addOrUpdateScore = async (
  name: string,
  score: number,
  difficulty: Difficulty,
  currentLeaderboard?: LeaderboardEntry[],
): Promise<{
  entries: LeaderboardEntry[];
  isNewHighscore: boolean;
  previousHighscore: number | null;
  scoreTooLow: boolean;
}> => {
  try {
    // Check if score meets minimum requirement
    if (score < MIN_SCORE_FOR_LEADERBOARD) {
      const entries = await loadLeaderboard();
      return {
        entries,
        isNewHighscore: false,
        previousHighscore: null,
        scoreTooLow: true,
      };
    }

    // Find existing entry for this player and difficulty (case-insensitive)
    const existingEntry = await convex.query(
      api.leaderboard.findByUserAndDifficulty,
      {
        userName: name,
        difficulty,
      },
    );

    const previousHighscore = existingEntry?.score ?? null;
    let isNewHighscore = false;

    if (existingEntry && existingEntry.id) {
      // Update only if new score is HIGHER
      if (score > existingEntry.score) {
        await convex.mutation(api.leaderboard.update, {
          id: existingEntry.id as any,
          score,
        });
        isNewHighscore = true;
      }
      // If score is same or lower, don't update
    } else {
      // Create new entry (first time playing this difficulty)
      await convex.mutation(api.leaderboard.create, {
        userName: name,
        score,
        difficulty,
      });
      isNewHighscore = true;
    }

    // If we updated or created an entry, reload from Convex to get fresh data
    // Otherwise, use the cached data we already have
    const entries = isNewHighscore
      ? await loadLeaderboard()
      : currentLeaderboard || (await loadLeaderboard());

    return { entries, isNewHighscore, previousHighscore, scoreTooLow: false };
  } catch (error) {
    console.error("Failed to add/update score:", error);
    return {
      entries: [],
      isNewHighscore: false,
      previousHighscore: null,
      scoreTooLow: false,
    };
  }
};
