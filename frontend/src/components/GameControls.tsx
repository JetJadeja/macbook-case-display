import { ArcadeButton } from "./ArcadeButton";

/**
 * GameControls Component
 *
 * Bottom controls panel showing:
 * - Leave game button
 * - Additional game controls/info
 */

interface GameControlsProps {
  onLeaveGame: () => void;
}

export function GameControls({ onLeaveGame }: GameControlsProps) {
  return (
    <div className="flex items-center justify-center gap-4">
      <ArcadeButton
        onClick={onLeaveGame}
        colorScheme="red"
        className="max-w-xs"
      >
        ◀ LEAVE GAME
      </ArcadeButton>
    </div>
  );
}
