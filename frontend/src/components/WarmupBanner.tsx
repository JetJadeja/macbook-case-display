import { useEffect, useState } from "react";

/**
 * WarmupBanner Component
 *
 * Displays a prominent banner during the warmup phase with countdown timer
 * Slides down from top, auto-dismisses when warmup ends
 */

interface WarmupBannerProps {
  timeRemaining: number; // seconds
}

export function WarmupBanner({ timeRemaining }: WarmupBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Auto-dismiss when time runs out
    if (timeRemaining <= 0) {
      setIsVisible(false);
    }
  }, [timeRemaining]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 animate-slide-down">
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-orange-600 blur opacity-50"></div>

      {/* Main banner */}
      <div className="relative bg-gradient-to-r from-yellow-600 via-orange-500 to-yellow-600 border-b-4 border-yellow-400 shadow-lg shadow-yellow-500/50">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            {/* Left - Title */}
            <div className="flex items-center gap-3">
              <span className="text-4xl">🏁</span>
              <div>
                <div className="text-2xl font-bold text-white pixel-font tracking-wider">
                  GET READY!
                </div>
                <div className="text-sm text-yellow-100">
                  Gain coins & clicks before competition starts
                </div>
              </div>
            </div>

            {/* Center - Message */}
            <div className="hidden md:block text-center">
              <div className="text-sm text-yellow-100 font-bold">
                Win requirements calculating...
              </div>
              <div className="text-xs text-yellow-200">
                Shop locked • Last chance to join!
              </div>
            </div>

            {/* Right - Countdown */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs text-yellow-100">TIME REMAINING</div>
                <div className="text-5xl font-bold text-white pixel-font tabular-nums animate-pulse">
                  0:{timeRemaining.toString().padStart(2, "0")}
                </div>
              </div>
              <span className="text-4xl">⏱️</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
