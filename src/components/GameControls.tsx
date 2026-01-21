interface GameControlsProps {
  gameOver: boolean;
  gameWon: boolean;
  gameStarted: boolean;
  gamePaused: boolean;
  onReset: () => void;
  onTogglePause: () => void;
}

export default function GameControls({
  gameOver,
  gameWon,
  gameStarted,
  gamePaused,
  onReset,
  onTogglePause,
}: GameControlsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
      <button
        onClick={onReset}
        className="min-w-20 rounded-lg bg-emerald-500 px-3 py-1.5 text-base font-semibold text-white transition active:scale-95 sm:min-w-24 sm:px-4 sm:py-2"
      >
        Restart
      </button>
      <button
        onClick={onTogglePause}
        disabled={gameOver || gameWon}
        className="min-w-20 rounded-lg bg-blue-500 px-3 py-1.5 text-base font-semibold text-white transition active:scale-95 disabled:cursor-not-allowed disabled:bg-gray-400 sm:min-w-24 sm:px-4 sm:py-2"
      >
        {!gameStarted ? "Start" : gamePaused ? "Resume" : "Pause"}
      </button>
    </div>
  );
}
