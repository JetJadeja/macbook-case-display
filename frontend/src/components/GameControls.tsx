import { ArcadeButton } from "./ArcadeButton";

/**
 * GameControls Component
 *
 * Bottom controls panel showing:
 * - Shop button
 * - Leave game button
 */

interface GameControlsProps {
  onLeaveGame: () => void;
  onOpenShop: () => void;
}

export function GameControls({ onLeaveGame, onOpenShop }: GameControlsProps) {
  return (
    <div className="flex items-center justify-center gap-4">
      <ArcadeButton
        onClick={onOpenShop}
        colorScheme="purple"
        className="max-w-xs"
      >
        💰 SHOP
      </ArcadeButton>
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
