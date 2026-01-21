import { useRef } from "react";
import { useDarkMode } from "../hooks/useDarkMode";
import { useGameRenderer } from "../hooks/useGameRenderer";
import { useScoreAnimation } from "../hooks/useScoreAnimation";
import { useSwipeControls } from "../hooks/useSwipeControls";
import type { GameState, Position } from "../types/game";
import GameControls from "./GameControls";
import GameStatus from "./GameStatus";

interface GameBoardProps {
  gameState: GameState;
  resetGame: () => void;
  togglePause: () => void;
  onDirectionChange: (direction: Position) => void;
}

export default function GameBoard({
  gameState,
  resetGame,
  togglePause,
  onDirectionChange,
}: GameBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDarkMode = useDarkMode();
  const { isGolden } = useScoreAnimation(gameState.score);

  // Enable swipe controls for mobile devices
  useSwipeControls({
    onSwipe: onDirectionChange,
    disabled:
      gameState.gameOver ||
      gameState.gamePaused ||
      gameState.gameWon ||
      !gameState.gameStarted,
  });

  useGameRenderer(canvasRef, gameState, { isDarkMode });

  const canvasWidth = gameState.boardSize * gameState.cellSize;
  const canvasHeight = gameState.boardSize * gameState.cellSize;

  return (
    <>
      <div className="flex flex-col items-center justify-center space-y-2 rounded-lg bg-white p-2 shadow-lg sm:space-y-3 sm:p-3 md:space-y-4 md:p-4 lg:space-y-6 lg:p-6 dark:bg-[#1A1F26]">
        {/* Score Display */}
        <div className="mt-4 text-center">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-gray-900 md:text-xl lg:text-2xl dark:text-white">
              Online Snake Game
            </h2>
            <img
              className="size-4 lg:size-5"
              src="/snake.svg"
              alt="Snake Logo"
            />
          </div>
          <p
            className={`text-2xl font-bold transition-all duration-500 lg:text-3xl ${
              isGolden
                ? "scale-105 text-amber-400"
                : "scale-100 text-emerald-500"
            }`}
          >
            Score: {gameState.score}
          </p>
        </div>

        {/* Canvas */}
        <div className="m-2 max-w-full overflow-hidden">
          <canvas
            ref={canvasRef}
            width={canvasWidth}
            height={canvasHeight}
            className="max-w-full border-2 border-gray-300 bg-gray-50 sm:border-4 dark:border-gray-700 dark:bg-[#0C1116]"
            style={{
              width: "100%",
              height: "auto",
              maxWidth: `${canvasWidth}px`,
              transform: "scale(1)",
              transformOrigin: "center",
            }}
          />
        </div>

        {/* Game Status */}
        <div className="h-6 text-center sm:h-7">
          <GameStatus
            gameStarted={gameState.gameStarted}
            gameOver={gameState.gameOver}
            gamePaused={gameState.gamePaused}
            gameWon={gameState.gameWon}
          />
        </div>

        {/* Controls */}
        <GameControls
          gameOver={gameState.gameOver}
          gameWon={gameState.gameWon}
          gameStarted={gameState.gameStarted}
          gamePaused={gameState.gamePaused}
          onReset={resetGame}
          onTogglePause={togglePause}
        />

        {/* Instructions */}
        <p className="text-center text-xs text-gray-500 sm:text-sm dark:text-gray-400">
          <span className="hidden sm:inline">
            <b>Controls:</b> Arrow Keys, WASD, or Swipe • Space to pause
          </span>
          <span className="sm:hidden">
            <b>Swipe</b> to control the snake
          </span>
        </p>
      </div>
    </>
  );
}
