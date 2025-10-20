/**
 * TeamSelectButton Component
 *
 * Arcade-style team selection button with:
 * - Customizable color schemes (cyan/red/other colors)
 * - Glow effects on hover and selection
 * - Selected state indicator
 * - Scale animation on selection
 */

interface TeamSelectButtonProps {
  teamName: string;
  isSelected: boolean;
  onClick: () => void;
  colorScheme: "cyan" | "red" | "green" | "purple" | "yellow";
}

export function TeamSelectButton({
  teamName,
  isSelected,
  onClick,
  colorScheme,
}: TeamSelectButtonProps) {
  const colors = {
    cyan: {
      border: "border-cyan-400",
      borderDark: "border-cyan-800",
      borderHover: "hover:border-cyan-600",
      bg: "bg-cyan-950/50",
      glow: "bg-cyan-500",
      text: "text-cyan-300",
      textDim: "text-cyan-600",
      textIndicator: "text-cyan-400",
    },
    red: {
      border: "border-red-400",
      borderDark: "border-red-800",
      borderHover: "hover:border-red-600",
      bg: "bg-red-950/50",
      glow: "bg-red-500",
      text: "text-red-300",
      textDim: "text-red-600",
      textIndicator: "text-red-400",
    },
    green: {
      border: "border-green-400",
      borderDark: "border-green-800",
      borderHover: "hover:border-green-600",
      bg: "bg-green-950/50",
      glow: "bg-green-500",
      text: "text-green-300",
      textDim: "text-green-600",
      textIndicator: "text-green-400",
    },
    purple: {
      border: "border-purple-400",
      borderDark: "border-purple-800",
      borderHover: "hover:border-purple-600",
      bg: "bg-purple-950/50",
      glow: "bg-purple-500",
      text: "text-purple-300",
      textDim: "text-purple-600",
      textIndicator: "text-purple-400",
    },
    yellow: {
      border: "border-yellow-400",
      borderDark: "border-yellow-800",
      borderHover: "hover:border-yellow-600",
      bg: "bg-yellow-950/50",
      glow: "bg-yellow-500",
      text: "text-yellow-300",
      textDim: "text-yellow-600",
      textIndicator: "text-yellow-400",
    },
  };

  const theme = colors[colorScheme];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative group h-24 rounded-lg border-4 transition-all ${
        isSelected
          ? `${theme.border} ${theme.bg} scale-105`
          : `${theme.borderDark} bg-black ${theme.borderHover}`
      }`}
    >
      <div
        className={`absolute inset-0 rounded-lg blur transition ${
          isSelected
            ? `${theme.glow}/30`
            : `${theme.glow}/10 group-hover:${theme.glow}/20`
        }`}
      ></div>
      <div className="relative h-full flex flex-col items-center justify-center">
        <div
          className={`text-2xl font-bold mb-2 ${
            isSelected ? theme.text : theme.textDim
          }`}
        >
          {teamName}
        </div>
        {isSelected && (
          <div className={`text-xs ${theme.textIndicator} animate-pulse`}>
            &gt;&gt; SELECTED &lt;&lt;
          </div>
        )}
      </div>
    </button>
  );
}
