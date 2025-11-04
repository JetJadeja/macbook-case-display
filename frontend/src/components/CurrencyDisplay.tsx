import { formatCoins } from "../utils/formatNumber";

/**
 * CurrencyDisplay Component
 *
 * Displays the player's coin balance with arcade styling
 */

interface CurrencyDisplayProps {
  coins: number;
  passiveIncomeRate?: number;
}

export function CurrencyDisplay({ coins, passiveIncomeRate = 0 }: CurrencyDisplayProps) {
  // Ensure coins is a valid number (default to 0 if undefined/null)
  const displayCoins = coins ?? 0;

  return (
    <div className="bg-black/50 px-6 py-3 rounded-lg border-2 border-yellow-400 backdrop-blur-sm shadow-lg shadow-yellow-500/30">
      <div className="flex items-center gap-2">
        <span className="text-yellow-400 text-lg">💰</span>
        <div>
          <div className="text-xs text-yellow-400/70 tracking-widest">
            COINS
          </div>
          <div className="text-2xl font-bold text-yellow-400 tabular-nums">
            {formatCoins(displayCoins)}
          </div>
          {passiveIncomeRate > 0 && (
            <div className="text-xs text-green-400 tracking-wide animate-pulse">
              +{formatCoins(passiveIncomeRate)}/sec
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
