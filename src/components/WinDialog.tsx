import type { Difficulty, LeaderboardEntry } from "../types/game";

interface WinDialogProps {
  score: number;
  won: boolean;
  isNewHighscore: boolean;
  previousHighscore: number | null;
  scoreTooLow: boolean;
  onPlayAgain: () => void;
  leaderboard: LeaderboardEntry[];
  difficulty: Difficulty;
}

export default function WinDialog({
  score,
  won,
  isNewHighscore,
  previousHighscore,
  scoreTooLow,
  onPlayAgain,
  leaderboard,
  difficulty,
}: WinDialogProps) {
  // Check if this is the global highest score for the current difficulty
  const difficultyEntries = leaderboard.filter(
    (e) => e.difficulty === difficulty,
  );
  const isGlobalHighscore =
    difficultyEntries.length > 0 &&
    score >= Math.max(...difficultyEntries.map((e) => e.score));

  const getMessage = () => {
    if (won) return "Congratulations";
    if (isGlobalHighscore) return "Global Highscore";
    if (isNewHighscore) return "New Highscore";
    return "Game Over";
  };

  const getSubtext = () => {
    if (won) return "You won the game!";
    if (isGlobalHighscore)
      return "You achieved the highest score in this difficulty!";
    if (isNewHighscore) return "You beat your personal best!";
    if (scoreTooLow) return "Score too low to save (minimum: 3 points)";
    return "Better luck next time!";
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 text-center shadow-2xl sm:p-8 dark:bg-[#1A1F26]">
        {/* <div className="mb-4 text-5xl">{getEmoji()}</div> */}
        <h2
          className={`mb-2 text-2xl font-bold sm:text-3xl ${
            isNewHighscore
              ? "text-yellow-500 dark:text-yellow-400"
              : "text-gray-900 dark:text-white"
          }`}
        >
          {getMessage()}
        </h2>
        <p className="text-base text-gray-600 sm:text-lg dark:text-gray-300">
          {getSubtext()}
        </p>

        {previousHighscore !== null && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Previous Best: {previousHighscore}
          </p>
        )}
        {previousHighscore === null && !scoreTooLow && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            First score for this difficulty!
          </p>
        )}
        <p className="my-3 text-xl font-bold text-emerald-600 sm:text-2xl dark:text-emerald-400">
          Final Score: {score}
        </p>

        <button
          onClick={onPlayAgain}
          className="w-full rounded-lg bg-emerald-500 px-6 py-2.5 font-semibold text-white transition hover:bg-emerald-600 active:bg-emerald-700 sm:w-auto sm:px-8 sm:py-3"
        >
          Play Again
        </button>
      </div>
    </div>
  );
}
