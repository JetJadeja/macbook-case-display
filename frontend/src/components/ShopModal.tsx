import { useEffect } from "react";
import { ShopItem } from "./ShopItem";

/**
 * ShopModal Component
 *
 * Full-screen modal overlay for the power-up shop
 */

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  coins: number;
  onPurchase: (itemId: string, cost: number) => void;
  phase?: "waiting" | "warmup" | "active" | "ended";
  warmupTimeRemaining?: number | null;
}

// Shop items configuration (placeholder for now)
const SHOP_ITEMS = [
  {
    id: "ban-shield",
    icon: "🛡️",
    name: "BAN SHIELD",
    description: "Immunity to bans for 30 seconds",
    cost: 15,
  },
  {
    id: "pause-shield",
    icon: "🛡️",
    name: "PAUSE SHIELD",
    description: "Immunity to pauses for 30 seconds",
    cost: 15,
  },
  {
    id: "full-shield",
    icon: "🔰",
    name: "FULL SHIELD",
    description: "Immunity to all attacks for 15 seconds",
    cost: 50,
  },
  {
    id: "click-multiplier",
    icon: "⚡",
    name: "2X CLICKS",
    description: "Double click value for 10 seconds",
    cost: 20,
  },
  {
    id: "coin-multiplier",
    icon: "💎",
    name: "2X COINS",
    description: "Double coin earnings for 10 seconds",
    cost: 20,
  },
  {
    id: "point-bonus",
    icon: "🌟",
    name: "POINT BONUS",
    description: "Instant +20 points to your team",
    cost: 15,
  },
];

export function ShopModal({
  isOpen,
  onClose,
  coins,
  onPurchase,
  phase = "active",
  warmupTimeRemaining = null,
}: ShopModalProps) {
  // Close modal on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isLocked = phase === "warmup" || phase === "waiting";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-lg"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative w-full max-w-4xl bg-gradient-to-br from-purple-950 to-violet-950 rounded-2xl border-8 border-purple-500 shadow-2xl shadow-purple-500/50 overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 to-violet-600 rounded-2xl blur-xl opacity-30 animate-pulse"></div>

        {/* Content */}
        <div className="relative pixel-font">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-900 to-violet-900 border-b-4 border-purple-500 px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white glitch-text">
                  💰 POWER-UP SHOP
                </h2>
                <div className="text-sm text-purple-300 mt-1">
                  Purchase upgrades and abilities
                </div>
              </div>
              <div className="bg-black/50 px-6 py-3 rounded-lg border-2 border-yellow-400">
                <div className="text-xs text-yellow-400/70">YOUR COINS</div>
                <div className="text-2xl font-bold text-yellow-400 tabular-nums">
                  {coins.toString().padStart(4, "0")}
                </div>
              </div>
            </div>
          </div>

          {/* Shop Grid */}
          <div className="p-8 relative">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {SHOP_ITEMS.map((item) => (
                <ShopItem
                  key={item.id}
                  icon={item.icon}
                  name={item.name}
                  description={item.description}
                  cost={item.cost}
                  canAfford={!isLocked && coins >= item.cost}
                  onPurchase={() => onPurchase(item.id, item.cost)}
                />
              ))}
            </div>

            {/* Lock Overlay during warmup */}
            {isLocked && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center rounded-lg">
                <div className="text-8xl mb-4">🔒</div>
                <div className="text-3xl font-bold text-yellow-400 mb-2">
                  SHOP LOCKED
                </div>
                <div className="text-lg text-yellow-200 mb-4">
                  {phase === "warmup"
                    ? "Available after warmup phase"
                    : "Waiting for game to start"}
                </div>
                {warmupTimeRemaining !== null && warmupTimeRemaining > 0 && (
                  <div className="text-2xl text-white tabular-nums">
                    Available in: 0:{warmupTimeRemaining.toString().padStart(2, "0")}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gradient-to-r from-purple-900 to-violet-900 border-t-4 border-purple-500 px-8 py-4">
            <div className="text-center text-sm text-purple-300">
              Press <span className="text-white font-bold">ESC</span> to close
              or{" "}
              <button
                onClick={onClose}
                className="text-white font-bold hover:text-purple-300 underline"
              >
                CLICK HERE
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
