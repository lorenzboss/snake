import { useEffect, useRef, useState } from "react";
import DifficultySwitcher from "../components/DifficultySwitcher";
import Footer from "../components/Footer";
import GameBoard from "../components/GameBoard";
import Leaderboard from "../components/Leaderboard";
import PlayerNameDialog from "../components/PlayerNameDialog";
import WinDialog from "../components/WinDialog";
import { useSnakeGame } from "../hooks/useSnakeGame";

export default function Home() {
  const {
    gameState,
    leaderboard,
    setDifficulty,
    resetGame,
    togglePause,
    saveScore,
    changeDirection,
  } = useSnakeGame();
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [playerName, setPlayerName] = useState<string | null>(null);
  const [showMobileLeaderboard, setShowMobileLeaderboard] = useState(false);
  const [isLeaderboardAnimating, setIsLeaderboardAnimating] = useState(false);
  const [isNewHighscore, setIsNewHighscore] = useState(false);
  const [previousHighscore, setPreviousHighscore] = useState<number | null>(
    null,
  );
  const [scoreTooLow, setScoreTooLow] = useState(false);
  const [scoreSaved, setScoreSaved] = useState(false);
  const [lastGameEndState, setLastGameEndState] = useState({
    gameOver: false,
    gameWon: false,
  });
  const scoreSaveInProgressRef = useRef(false);

  // Handle leaderboard animation
  useEffect(() => {
    if (showMobileLeaderboard) {
      setIsLeaderboardAnimating(true);
    }
  }, [showMobileLeaderboard]);

  const handleCloseMobileLeaderboard = () => {
    setIsLeaderboardAnimating(false);
    setTimeout(() => {
      setShowMobileLeaderboard(false);
    }, 300);
  };

  useEffect(() => {
    // Check if player name exists in localStorage
    const savedName = localStorage.getItem("snake-game-player-name");
    if (savedName) {
      setPlayerName(savedName);
    } else {
      setShowNameDialog(true);
    }
  }, []);

  const handleSaveName = (name: string) => {
    localStorage.setItem("snake-game-player-name", name);
    setPlayerName(name);
    setShowNameDialog(false);
  };

  const handlePlayAgain = () => {
    resetGame();
    setIsNewHighscore(false);
    setPreviousHighscore(null);
    setScoreTooLow(false);
    setScoreSaved(false);
    setLastGameEndState({ gameOver: false, gameWon: false });
    scoreSaveInProgressRef.current = false;
  };

  const showDialog = gameState.gameOver || gameState.gameWon;

  // Save score when game ends (only once per game!)
  useEffect(() => {
    const currentGameEndState = {
      gameOver: gameState.gameOver,
      gameWon: gameState.gameWon,
    };

    // Only save if game just ended (state changed from not-ended to ended)
    const gameJustEnded =
      (currentGameEndState.gameOver || currentGameEndState.gameWon) &&
      !lastGameEndState.gameOver &&
      !lastGameEndState.gameWon;

    // Reset dialog states when game starts (transitioning from ended to not-ended)
    const gameJustStarted =
      !currentGameEndState.gameOver &&
      !currentGameEndState.gameWon &&
      (lastGameEndState.gameOver || lastGameEndState.gameWon);

    if (gameJustStarted) {
      setScoreSaved(false);
      setIsNewHighscore(false);
      setPreviousHighscore(null);
      setScoreTooLow(false);
      setLastGameEndState(currentGameEndState);
      return;
    }

    if (gameJustEnded && playerName && !scoreSaveInProgressRef.current) {
      scoreSaveInProgressRef.current = true;
      setScoreSaved(false); // Reset before saving
      saveScore(playerName)
        .then((result) => {
          setIsNewHighscore(result.isNewHighscore);
          setPreviousHighscore(result.previousHighscore);
          setScoreTooLow(result.scoreTooLow);
          setScoreSaved(true); // Mark as saved
          scoreSaveInProgressRef.current = false;
        })
        .catch((error) => {
          console.error("[HOME] Error saving score:", error);
          setScoreSaved(true); // Still show dialog even if save failed
          scoreSaveInProgressRef.current = false;
        });
      setLastGameEndState(currentGameEndState);
    }
  }, [
    gameState.gameOver,
    gameState.gameWon,
    playerName,
    lastGameEndState,
    saveScore,
  ]);

  return (
    <div
      className="page-container fixed inset-0 flex flex-col"
      style={{ height: "100dvh" }}
    >
      <div className="flex-1 overflow-y-auto">
        <div className="flex min-h-full flex-col items-center justify-start py-12 sm:py-4 md:py-6 lg:justify-center lg:py-0">
          <div className="w-full max-w-6xl space-y-2 px-2 sm:space-y-4 sm:px-4 md:space-y-6 lg:space-y-8">
            <div className="flex flex-col gap-8 lg:flex-row">
              {/* Leaderboard and Difficulty (Desktop - Left Sidebar) */}
              <aside className="hidden w-80 lg:flex lg:flex-col lg:justify-center">
                <div className="flex flex-col gap-6 rounded-lg bg-white p-6 shadow-lg dark:bg-[#1A1F26]">
                  <Leaderboard
                    difficulty={gameState.difficulty}
                    entries={leaderboard}
                    currentPlayerName={playerName}
                  />
                  <DifficultySwitcher
                    currentDifficulty={gameState.difficulty}
                    onDifficultyChange={setDifficulty}
                    disabled={gameState.gameStarted}
                  />
                </div>
              </aside>

              {/* Game Board (Center/Right) */}
              <div className="flex-1 lg:max-w-2xl">
                <GameBoard
                  gameState={gameState}
                  resetGame={resetGame}
                  togglePause={togglePause}
                  onDirectionChange={changeDirection}
                />

                {/* Mobile Leaderboard Toggle Button */}
                <div className="mt-4 px-4 lg:hidden">
                  <button
                    onClick={() => {
                      if (showMobileLeaderboard) {
                        handleCloseMobileLeaderboard();
                      } else {
                        setShowMobileLeaderboard(true);
                      }
                    }}
                    disabled={
                      gameState.gameStarted &&
                      !gameState.gameOver &&
                      !gameState.gameWon
                    }
                    className="w-full rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600 active:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                  >
                    Show Leaderboard & Settings
                  </button>
                </div>
              </div>
            </div>

            {/* Leaderboard and Difficulty (Mobile - Collapsible) */}
            {showMobileLeaderboard && (
              <div
                className={`fixed inset-0 z-40 flex items-end justify-center bg-black/40 transition-opacity duration-300 ease-in-out lg:hidden ${
                  isLeaderboardAnimating ? "opacity-100" : "opacity-0"
                }`}
                onClick={handleCloseMobileLeaderboard}
              >
                <div
                  className={`max-h-[80vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-2xl transition-transform duration-300 ease-out dark:bg-[#1A1F26] ${
                    isLeaderboardAnimating
                      ? "translate-y-0"
                      : "translate-y-full"
                  }`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-[#1A1F26]">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Settings & Leaderboard
                    </h3>
                    <button
                      onClick={handleCloseMobileLeaderboard}
                      className="text-3xl text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      ×
                    </button>
                  </div>
                  <div className="flex flex-col gap-4 p-4">
                    <div className="rounded-lg bg-gray-50 p-3 dark:bg-[#0C1116]">
                      <Leaderboard
                        difficulty={gameState.difficulty}
                        entries={leaderboard}
                        currentPlayerName={playerName}
                      />
                    </div>
                    <div className="rounded-lg bg-gray-50 p-3 dark:bg-[#0C1116]">
                      <DifficultySwitcher
                        currentDifficulty={gameState.difficulty}
                        onDifficultyChange={setDifficulty}
                        disabled={gameState.gameStarted}
                      />
                    </div>

                    <div className="lg:hidden">
                      <Footer />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="hidden lg:block">
        <Footer />
      </div>

      {showNameDialog && <PlayerNameDialog onSaveName={handleSaveName} />}

      {showDialog && playerName && scoreSaved && (
        <WinDialog
          score={gameState.score}
          won={gameState.gameWon}
          isNewHighscore={isNewHighscore}
          previousHighscore={previousHighscore}
          scoreTooLow={scoreTooLow}
          onPlayAgain={handlePlayAgain}
          leaderboard={leaderboard}
          difficulty={gameState.difficulty}
        />
      )}
    </div>
  );
}
