/**
 * TugOfWarBar Component
 *
 * Visual tug-of-war style indicator showing:
 * - Which team is winning
 * - Score differential as a horizontal bar
 * - Animated transitions
 * - Center line marker
 */

interface TugOfWarBarProps {
  iovineScore: number;
  youngScore: number;
}

export function TugOfWarBar({ iovineScore, youngScore }: TugOfWarBarProps) {
  const total = iovineScore + youngScore + 1; // +1 to avoid division by zero
  const iovinePercentage = (iovineScore / total) * 100;
  const youngPercentage = (youngScore / total) * 100;

  // Determine which side is winning
  const iovineWinning = iovineScore > youngScore;
  const tied = iovineScore === youngScore;
  const lead = Math.abs(iovineScore - youngScore);

  return (
    <div className="relative">
      {/* Title */}
      <div className="text-center mb-3">
        <div className="text-xs text-purple-400 tracking-widest">
          TUG OF WAR
        </div>
      </div>

      {/* Main bar container */}
      <div className="relative bg-black border-4 border-purple-500 rounded-lg p-4">
        {/* Glow effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg blur opacity-40"></div>

        {/* Bar */}
        <div className="relative">
          {/* Background track */}
          <div className="h-8 bg-gray-900 rounded-full overflow-hidden relative border-2 border-gray-700">
            {/* Iovine (left) fill */}
            <div
              className="absolute left-0 h-full bg-gradient-to-r from-cyan-600 to-cyan-400 transition-all duration-500 ease-out"
              style={{
                width: `${iovinePercentage}%`,
              }}
            >
              <div className="h-full w-full bg-cyan-400/30 animate-pulse"></div>
            </div>

            {/* Young (right) fill */}
            <div
              className="absolute right-0 h-full bg-gradient-to-l from-red-600 to-red-400 transition-all duration-500 ease-out"
              style={{
                width: `${youngPercentage}%`,
              }}
            >
              <div className="h-full w-full bg-red-400/30 animate-pulse"></div>
            </div>

            {/* Center line marker */}
            <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-white transform -translate-x-1/2 z-10">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full">
                <div className="w-3 h-3 bg-white rounded-full border-2 border-purple-500"></div>
              </div>
            </div>
          </div>

          {/* Labels */}
          <div className="flex justify-between mt-2 text-xs">
            <div className="text-cyan-400 font-bold tracking-wider">IOVINE</div>
            <div className="text-red-400 font-bold tracking-wider">YOUNG</div>
          </div>
        </div>

        {/* Status text */}
        <div className="text-center mt-3">
          {tied ? (
            <div className="text-sm text-purple-300 animate-pulse">
              ⚡ PERFECTLY TIED ⚡
            </div>
          ) : (
            <div className={`text-sm ${iovineWinning ? "text-cyan-300" : "text-red-300"}`}>
              {iovineWinning ? "IOVINE" : "YOUNG"} LEADS BY{" "}
              <span className="font-bold text-lg tabular-nums">{lead}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
