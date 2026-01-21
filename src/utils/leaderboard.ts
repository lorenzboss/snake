import type { Difficulty, LeaderboardEntry } from "../types/game";

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

// Helper to convert Convex entries - used by hooks
export const convertLeaderboardEntries = (
  entries: ConvexLeaderboardEntry[] | undefined,
): LeaderboardEntry[] => {
  if (!entries) return [];
  return entries.map(convexToLocal);
};

const MIN_SCORE_FOR_LEADERBOARD = 3;

// Helper function to process score addition/update
// This is called from the hook with the mutation function and current data
export const processScoreUpdate = async (
  name: string,
  score: number,
  difficulty: Difficulty,
  findByUserAndDifficulty: (args: {
    userName: string;
    difficulty: string;
  }) => Promise<ConvexLeaderboardEntry | null>,
  createMutation: (args: {
    userName: string;
    score: number;
    difficulty: string;
  }) => Promise<any>,
  updateMutation: (args: { id: any; score: number }) => Promise<any>,
): Promise<{
  isNewHighscore: boolean;
  previousHighscore: number | null;
  scoreTooLow: boolean;
}> => {
  try {
    // Check if score meets minimum requirement
    if (score < MIN_SCORE_FOR_LEADERBOARD) {
      return {
        isNewHighscore: false,
        previousHighscore: null,
        scoreTooLow: true,
      };
    }

    // Find existing entry for this player and difficulty
    const existingEntry = await findByUserAndDifficulty({
      userName: name,
      difficulty,
    });

    const previousHighscore = existingEntry?.score ?? null;
    let isNewHighscore = false;

    if (existingEntry && existingEntry.id) {
      // Update only if new score is HIGHER
      if (score > existingEntry.score) {
        await updateMutation({
          id: existingEntry.id as any,
          score,
        });
        isNewHighscore = true;
      }
    } else {
      // Create new entry (first time playing this difficulty)
      await createMutation({
        userName: name,
        score,
        difficulty,
      });
      isNewHighscore = true;
    }

    return { isNewHighscore, previousHighscore, scoreTooLow: false };
  } catch (error) {
    console.error("Failed to add/update score:", error);
    return {
      isNewHighscore: false,
      previousHighscore: null,
      scoreTooLow: false,
    };
  }
};
