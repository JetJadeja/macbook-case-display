import { useState, useEffect } from "react";

/**
 * ActiveEffectsBar Component
 *
 * Displays active buffs and debuffs with countdown timers
 */

export interface ActiveEffect {
  type: string;
  expiresAt: number; // timestamp in milliseconds
  value?: number;
}

interface ActiveEffectsBarProps {
  effects: ActiveEffect[];
}

// Effect metadata for display
const EFFECT_METADATA: Record<
  string,
  { icon: string; label: string; color: string }
> = {
  "ban-shield": { icon: "🛡️", label: "BAN SHIELD", color: "bg-green-600" },
  "pause-shield": { icon: "🛡️", label: "PAUSE SHIELD", color: "bg-green-600" },
  "full-shield": { icon: "🔰", label: "FULL SHIELD", color: "bg-green-600" },
  "click-multiplier": { icon: "⚡", label: "CLICK BOOST", color: "bg-blue-600" },
  "coin-multiplier": { icon: "💎", label: "COIN BOOST", color: "bg-yellow-600" },
  paused: { icon: "⏸️", label: "PAUSED", color: "bg-red-600" },
  banned: { icon: "🚫", label: "BANNED", color: "bg-red-600" },
};

export function ActiveEffectsBar({ effects }: ActiveEffectsBarProps) {
  const [now, setNow] = useState(Date.now());

  // Update timer every second
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Filter out expired effects
  const activeEffects = effects.filter((effect) => effect.expiresAt > now);

  if (activeEffects.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2 justify-center">
        {activeEffects.map((effect, index) => {
          const metadata = EFFECT_METADATA[effect.type] || {
            icon: "❓",
            label: effect.type.toUpperCase(),
            color: "bg-gray-600",
          };
          const remainingSeconds = Math.ceil((effect.expiresAt - now) / 1000);

          return (
            <div
              key={`${effect.type}-${index}`}
              className={`
                ${metadata.color}
                px-4 py-2 rounded-lg
                border-2 border-white/30
                flex items-center gap-2
                animate-pulse-slow
                shadow-lg
              `}
            >
              <span className="text-lg">{metadata.icon}</span>
              <div>
                <div className="text-xs text-white/90 font-bold">
                  {metadata.label}
                </div>
                <div className="text-sm text-white tabular-nums">
                  {remainingSeconds}s
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
