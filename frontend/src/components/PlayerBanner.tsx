import { CurrencyDisplay } from "./CurrencyDisplay";

/**
 * PlayerBanner Component
 *
 * Displays current player information with arcade styling:
 * - Player name
 * - Team assignment
 * - Coin balance
 * - Glowing border in team color
 * - Animated status indicator
 */

interface PlayerBannerProps {
  playerName: string;
  team: "iovine" | "young";
  coins: number;
}

export function PlayerBanner({ playerName, team, coins }: PlayerBannerProps) {
  const colors = {
    iovine: {
      gradient: "from-cyan-500 to-blue-500",
      border: "border-cyan-400",
      text: "text-cyan-300",
      bg: "bg-cyan-950/50",
      pulse: "bg-cyan-400",
    },
    young: {
      gradient: "from-red-500 to-pink-500",
      border: "border-red-400",
      text: "text-red-300",
      bg: "bg-red-950/50",
      pulse: "bg-red-400",
    },
  };

  const theme = colors[team];

  return (
    <div className="relative group">
      {/* Glow effect */}
      <div
        className={`absolute -inset-0.5 bg-gradient-to-r ${theme.gradient} rounded-lg blur opacity-50 group-hover:opacity-75 transition`}
      ></div>

      {/* Main banner */}
      <div
        className={`relative bg-black border-4 ${theme.border} rounded-lg p-4 flex items-center justify-between`}
      >
        {/* Left side - Status indicator */}
        <div className="flex items-center gap-3">
          <div
            className={`w-3 h-3 ${theme.pulse} rounded-full animate-pulse`}
          ></div>
          <div className="text-xs text-gray-400 tracking-wider">
            ACTIVE PLAYER
          </div>
        </div>

        {/* Center - Player info */}
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">PLAYER</div>
            <div
              className={`text-2xl font-bold ${theme.text} tracking-wider uppercase`}
            >
              {playerName}
            </div>
          </div>
          <div className="h-12 w-px bg-gray-700"></div>
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">TEAM</div>
            <div
              className={`text-2xl font-bold ${theme.text} tracking-wider uppercase`}
            >
              {team}
            </div>
          </div>
        </div>

        {/* Right side - Team indicator and coins */}
        <div className="flex items-center gap-4">
          <CurrencyDisplay coins={coins} />
        </div>
      </div>
    </div>
  );
}
