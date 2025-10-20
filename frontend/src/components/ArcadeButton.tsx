/**
 * ArcadeButton Component
 *
 * Main action button with arcade aesthetics:
 * - Gradient background with glow effects
 * - Border styling
 * - Disabled state support
 * - Loading state support
 * - Customizable color schemes
 */

interface ArcadeButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  loading?: boolean;
  colorScheme?: "green" | "blue" | "red" | "purple" | "yellow";
  className?: string;
}

export function ArcadeButton({
  children,
  onClick,
  type = "button",
  disabled = false,
  loading = false,
  colorScheme = "green",
  className = "",
}: ArcadeButtonProps) {
  const colors = {
    green: {
      gradient: "from-green-600 to-emerald-600",
      gradientHover: "group-hover:from-green-500 group-hover:to-emerald-500",
      glow: "bg-green-400/20 group-hover:bg-green-400/30",
      border: "border-green-400",
    },
    blue: {
      gradient: "from-blue-600 to-cyan-600",
      gradientHover: "group-hover:from-blue-500 group-hover:to-cyan-500",
      glow: "bg-blue-400/20 group-hover:bg-blue-400/30",
      border: "border-blue-400",
    },
    red: {
      gradient: "from-red-600 to-rose-600",
      gradientHover: "group-hover:from-red-500 group-hover:to-rose-500",
      glow: "bg-red-400/20 group-hover:bg-red-400/30",
      border: "border-red-400",
    },
    purple: {
      gradient: "from-purple-600 to-pink-600",
      gradientHover: "group-hover:from-purple-500 group-hover:to-pink-500",
      glow: "bg-purple-400/20 group-hover:bg-purple-400/30",
      border: "border-purple-400",
    },
    yellow: {
      gradient: "from-yellow-600 to-amber-600",
      gradientHover: "group-hover:from-yellow-500 group-hover:to-amber-500",
      glow: "bg-yellow-400/20 group-hover:bg-yellow-400/30",
      border: "border-yellow-400",
    },
  };

  const theme = colors[colorScheme];

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`w-full relative group h-12 rounded-lg overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-r ${theme.gradient} ${theme.gradientHover} transition`}
      ></div>
      <div className={`absolute inset-0 ${theme.glow} blur`}></div>
      <div
        className={`relative h-full flex items-center justify-center border-4 ${theme.border} rounded-lg`}
      >
        <span className="text-base text-white font-bold tracking-widest">
          {loading ? "LOADING..." : children}
        </span>
      </div>
    </button>
  );
}
