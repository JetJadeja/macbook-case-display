import { useEffect } from "react";

/**
 * PostWarmupModal Component
 *
 * Shows after warmup ends with:
 * - Win threshold
 * - Shop availability notice
 * - Manual close via button or backdrop click
 */

interface PostWarmupModalProps {
  winThreshold: number;
  onClose: () => void;
}

export function PostWarmupModal({
  winThreshold,
  onClose,
}: PostWarmupModalProps) {
  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  // Format threshold with commas
  const formattedThreshold = winThreshold.toLocaleString();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop - no click to close */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-lg"></div>

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-gradient-to-br from-purple-950 to-violet-950 rounded-2xl border-8 border-purple-500 shadow-2xl shadow-purple-500/50 overflow-hidden animate-slide-down">
        {/* Glow effect */}
        <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 to-violet-600 rounded-2xl blur-xl opacity-30 animate-pulse"></div>

        {/* Content */}
        <div className="relative pixel-font">
          {/* Close X button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-red-600 hover:bg-red-500 border-2 border-red-400 text-white font-bold text-xl transition-all hover:scale-110"
          >
            ×
          </button>

          {/* Header */}
          <div className="bg-gradient-to-r from-purple-900 to-violet-900 border-b-4 border-purple-500 px-8 py-6">
            <h2 className="text-3xl font-bold text-white text-center glitch-text">
              🎮 GAME START! 🎮
            </h2>
          </div>

          {/* Body */}
          <div className="p-8 text-center space-y-6">
            <div>
              <div className="text-sm text-purple-300 mb-2">
                FIRST TEAM TO REACH
              </div>
              <div className="text-6xl font-bold text-yellow-400 tabular-nums">
                {formattedThreshold}
              </div>
              <div className="text-sm text-purple-300 mt-2">POINTS WINS!</div>
            </div>

            <div className="bg-purple-900/50 border-2 border-purple-500 rounded-lg p-4">
              <div className="text-lg text-white mb-2">💰 Shop Now Available!</div>
              <div className="text-sm text-purple-200">
                Use your coins to buy multipliers, shields, and power-ups
              </div>
            </div>

            <div className="text-xs text-gray-400 mt-4">
              Press ESC or click × to close
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
