/**
 * StatusPanel Component
 *
 * Displays the game's current status:
 * - Countdown during reset
 * - Waiting state when no game is active
 * - Active state during gameplay
 * - Visual score differential bar showing which team is ahead
 */

interface StatusPanelProps {
  status: string;
  resetCountdown?: number;
  iovineScore: number;
  youngScore: number;
}

export function StatusPanel({
  status,
  resetCountdown,
  iovineScore,
  youngScore,
}: StatusPanelProps) {
  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg blur opacity-60 group-hover:opacity-100 transition"></div>
      <div className="relative bg-black border-4 border-purple-500 rounded-lg p-4 arcade-box-shadow h-full flex flex-col items-center justify-center">
        <div className="text-sm text-purple-400 mb-4 tracking-widest">
          SYSTEM STATUS
        </div>

        {status === "ending" && resetCountdown ? (
          <div className="text-center">
            <div className="text-xl text-red-400 mb-4 animate-pulse">
              !!! RESET !!!
            </div>
            <div className="text-6xl font-bold text-red-500 mb-2 animate-bounce">
              {resetCountdown}
            </div>
            <div className="text-xs text-gray-500">SECONDS</div>
          </div>
        ) : status === "waiting" ? (
          <div className="text-center">
            <div className="text-2xl text-gray-500 mb-4">READY</div>
            <div className="text-xs text-gray-600 animate-pulse">
              INSERT COIN
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-3xl text-green-400 mb-2 animate-pulse">
              ACTIVE
            </div>
            <div className="flex gap-1 justify-center">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-ping delay-100"></div>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-ping delay-200"></div>
            </div>
          </div>
        )}

        {/* Score Difference Bar */}
        <div className="w-full mt-4">
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden relative">
            <div
              className="absolute h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-300"
              style={{
                width: `${Math.abs(
                  (iovineScore / (iovineScore + youngScore + 1)) * 100
                )}%`,
                left: iovineScore > youngScore ? "50%" : "auto",
                right: youngScore > iovineScore ? "50%" : "auto",
              }}
            ></div>
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
