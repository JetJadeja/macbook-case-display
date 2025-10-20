/**
 * TeamCard Component
 *
 * Displays a team's information including:
 * - Team name
 * - Current score
 * - List of players with their click counts
 *
 * Supports customizable color themes for different teams
 */

interface Player {
  name: string;
  clicks: number;
}

interface TeamCardProps {
  teamName: string;
  score: number;
  players: Player[];
  colorScheme: "cyan" | "red";
}

export function TeamCard({
  teamName,
  score,
  players,
  colorScheme,
}: TeamCardProps) {
  const colors = {
    cyan: {
      gradient: "from-cyan-500 to-blue-500",
      border: "border-cyan-500",
      text: "text-cyan-400",
      textBright: "text-cyan-300",
      textDim: "text-cyan-700",
      bg: "bg-cyan-950/50",
      borderDark: "border-cyan-700",
      borderDarker: "border-cyan-800",
      playerBg: "bg-cyan-950/30",
      pulse: "bg-cyan-400",
    },
    red: {
      gradient: "from-red-500 to-pink-500",
      border: "border-red-500",
      text: "text-red-400",
      textBright: "text-red-300",
      textDim: "text-red-700",
      bg: "bg-red-950/50",
      borderDark: "border-red-700",
      borderDarker: "border-red-800",
      playerBg: "bg-red-950/30",
      pulse: "bg-red-400",
    },
  };

  const theme = colors[colorScheme];

  return (
    <div className="relative group">
      <div
        className={`absolute -inset-0.5 bg-gradient-to-r ${theme.gradient} rounded-lg blur opacity-60 group-hover:opacity-100 transition`}
      ></div>
      <div
        className={`relative bg-black border-4 ${theme.border} rounded-lg p-4 arcade-box-shadow`}
      >
        <div className="flex items-center justify-between mb-2">
          <h2 className={`text-sm ${theme.text} tracking-wider`}>TEAM</h2>
          <div
            className={`h-2 w-2 ${theme.pulse} rounded-full animate-pulse`}
          ></div>
        </div>
        <div className="text-2xl font-bold text-white mb-2 glitch-text">
          {teamName}
        </div>

        {/* Score Display */}
        <div
          className={`${theme.bg} border-2 ${theme.borderDark} p-3 mb-3 rounded`}
        >
          <div className={`text-xs ${theme.text} mb-1`}>SCORE</div>
          <div className={`text-3xl font-bold ${theme.textBright} tabular-nums`}>
            {score.toString().padStart(6, "0")}
          </div>
        </div>

        {/* Players */}
        <div
          className={`bg-black/50 border-2 ${theme.borderDarker} p-2 rounded max-h-24 overflow-y-auto custom-scrollbar`}
        >
          <div className={`text-xs ${theme.text} mb-2 flex items-center gap-2`}>
            <span
              className={`inline-block w-2 h-2 ${theme.pulse} animate-pulse`}
            ></span>
            PLAYERS: {players.length}
          </div>
          {players.length > 0 ? (
            <div className="space-y-1">
              {players.map((player, idx) => (
                <div
                  key={idx}
                  className={`text-xs ${colorScheme === "cyan" ? "text-cyan-200" : "text-red-200"} flex justify-between items-center ${theme.playerBg} px-2 py-1 rounded`}
                >
                  <span className="truncate">{player.name}</span>
                  <span className={`${theme.text} ml-2 tabular-nums`}>
                    {player.clicks}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className={`text-xs ${theme.textDim} italic`}>WAITING...</div>
          )}
        </div>
      </div>
    </div>
  );
}
