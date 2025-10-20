import { useState } from "react";

/**
 * ClickButton Component
 *
 * The main game interaction button with:
 * - Massive, satisfying click area
 * - Pulse animations and glow effects
 * - Color scheme based on team
 * - Visual feedback on click (ripple effect)
 * - Click count display
 */

interface ClickButtonProps {
  onClick: () => void;
  teamColor: "cyan" | "red";
  personalClicks: number;
}

export function ClickButton({
  onClick,
  teamColor,
  personalClicks,
}: ClickButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  const colors = {
    cyan: {
      gradient: "from-cyan-500 via-blue-500 to-cyan-600",
      border: "border-cyan-400",
      glow: "shadow-cyan-500/50",
      text: "text-cyan-100",
      pulse: "bg-cyan-400",
    },
    red: {
      gradient: "from-red-500 via-rose-500 to-red-600",
      border: "border-red-400",
      glow: "shadow-red-500/50",
      text: "text-red-100",
      pulse: "bg-red-400",
    },
  };

  const theme = colors[teamColor];

  const handleClick = () => {
    setIsPressed(true);
    onClick();
    setTimeout(() => setIsPressed(false), 150);
  };

  return (
    <div className="relative group">
      {/* Glow effect */}
      <div
        className={`absolute -inset-4 bg-gradient-to-r ${theme.gradient} rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition animate-pulse`}
      ></div>

      {/* Main button */}
      <button
        onClick={handleClick}
        className={`relative w-full h-64 rounded-2xl border-8 ${theme.border} bg-gradient-to-br ${theme.gradient}
          transform transition-all duration-150
          ${isPressed ? "scale-95 shadow-lg" : "scale-100 shadow-2xl"}
          ${theme.glow}
          hover:scale-105 active:scale-95
          overflow-hidden`}
      >
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-grid animate-pulse"></div>
        </div>

        {/* Corner accents */}
        <div className={`absolute top-4 left-4 w-4 h-4 ${theme.pulse} rounded-full animate-ping`}></div>
        <div className={`absolute top-4 right-4 w-4 h-4 ${theme.pulse} rounded-full animate-ping delay-100`}></div>
        <div className={`absolute bottom-4 left-4 w-4 h-4 ${theme.pulse} rounded-full animate-ping delay-200`}></div>
        <div className={`absolute bottom-4 right-4 w-4 h-4 ${theme.pulse} rounded-full animate-ping delay-300`}></div>

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center space-y-4">
          {/* Main text */}
          <div className="space-y-2">
            <div className={`text-7xl font-bold ${theme.text} tracking-wider glitch-text`}>
              CLICK!
            </div>
            <div className="text-sm text-white/80 tracking-[0.3em] uppercase">
              ▶ Fire! ◀
            </div>
          </div>

          {/* Click count */}
          <div className="absolute bottom-6 bg-black/40 px-6 py-3 rounded-lg border-2 border-white/30">
            <div className="text-xs text-white/60 mb-1 tracking-wider">YOUR CLICKS</div>
            <div className={`text-3xl font-bold ${theme.text} tabular-nums`}>
              {personalClicks.toString().padStart(4, "0")}
            </div>
          </div>
        </div>

        {/* Click ripple effect */}
        {isPressed && (
          <div className="absolute inset-0 bg-white/20 animate-ping rounded-2xl"></div>
        )}
      </button>

      {/* Instruction text */}
      <div className="text-center mt-4 text-sm text-gray-400 animate-pulse">
        ⚡ CLICK AS FAST AS YOU CAN ⚡
      </div>
    </div>
  );
}
