import { useEffect, useState } from "react";

/**
 * VictoryModal Component
 *
 * Shows when a team wins:
 * - Winning team announcement
 * - Celebration animation
 * - Auto-redirects to home after 8 seconds
 */

interface VictoryModalProps {
  winner: "iovine" | "young";
  playerTeam: "iovine" | "young";
  onRedirect: () => void;
}

export function VictoryModal({
  winner,
  playerTeam,
  onRedirect,
}: VictoryModalProps) {
  const [countdown, setCountdown] = useState(8);
  const isWinner = winner === playerTeam;

  useEffect(() => {
    // Auto-redirect after 8 seconds
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onRedirect();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onRedirect]);

  const colors = {
    iovine: {
      gradient: "from-cyan-500 to-blue-500",
      text: "text-cyan-300",
      glow: "shadow-cyan-500/50",
    },
    young: {
      gradient: "from-red-500 to-pink-500",
      text: "text-red-300",
      glow: "shadow-red-500/50",
    },
  };

  const theme = colors[winner];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/95 backdrop-blur-lg"></div>

      {/* Modal */}
      <div
        className={`relative w-full max-w-3xl bg-gradient-to-br from-black to-gray-900 rounded-2xl border-8 border-${winner === "iovine" ? "cyan" : "red"}-500 shadow-2xl ${theme.glow} overflow-hidden`}
      >
        {/* Animated background glow */}
        <div
          className={`absolute -inset-4 bg-gradient-to-r ${theme.gradient} rounded-2xl blur-xl opacity-50 animate-pulse`}
        ></div>

        {/* Content */}
        <div className="relative pixel-font">
          {/* Victory Banner */}
          <div
            className={`bg-gradient-to-r ${theme.gradient} border-b-4 border-${winner === "iovine" ? "cyan" : "red"}-400 px-8 py-8`}
          >
            <h2 className="text-5xl font-bold text-white text-center mb-2 glitch-text">
              {isWinner ? "🏆 VICTORY! 🏆" : "💀 DEFEAT 💀"}
            </h2>
            <div className="text-2xl text-white text-center">
              TEAM {winner.toUpperCase()} WINS!
            </div>
          </div>

          {/* Body */}
          <div className="p-8 text-center space-y-6">
            {isWinner ? (
              <>
                <div className="text-4xl text-yellow-400 animate-bounce">
                  ⭐ CONGRATULATIONS! ⭐
                </div>
                <div className="text-xl text-green-400">
                  Your team reached the win threshold first!
                </div>
              </>
            ) : (
              <>
                <div className="text-4xl text-gray-400 animate-pulse">
                  Better luck next time...
                </div>
                <div className="text-xl text-gray-300">
                  Team {winner.toUpperCase()} was faster to the goal!
                </div>
              </>
            )}

            <div className="bg-black/50 border-2 border-gray-700 rounded-lg p-6 mt-6">
              <div className="text-sm text-gray-400 mb-2">
                Returning to lobby in...
              </div>
              <div className="text-6xl font-bold text-white tabular-nums animate-pulse">
                {countdown}
              </div>
            </div>
          </div>
        </div>

        {/* Confetti animation (for winners) */}
        {isWinner && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-0 left-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-ping delay-100"></div>
            <div className="absolute top-0 left-1/2 w-2 h-2 bg-green-400 rounded-full animate-ping delay-200"></div>
            <div className="absolute top-0 left-3/4 w-2 h-2 bg-blue-400 rounded-full animate-ping delay-300"></div>
          </div>
        )}
      </div>
    </div>
  );
}
