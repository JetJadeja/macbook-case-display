/**
 * ShopItem Component
 *
 * Reusable power-up item card for the shop
 */

interface ShopItemProps {
  icon: string;
  name: string;
  description: string;
  cost: number;
  canAfford: boolean;
  onPurchase: () => void;
  isPurchased?: boolean;
}

export function ShopItem({
  icon,
  name,
  description,
  cost,
  canAfford,
  onPurchase,
  isPurchased = false,
}: ShopItemProps) {
  return (
    <button
      onClick={canAfford && !isPurchased ? onPurchase : undefined}
      disabled={!canAfford || isPurchased}
      className={`
        relative group
        w-full h-48
        rounded-lg border-4
        bg-gradient-to-br from-purple-900/50 to-violet-900/50
        transition-all duration-200
        ${
          isPurchased
            ? "border-green-600 opacity-60 cursor-not-allowed"
            : canAfford
            ? "border-purple-500 hover:border-purple-400 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50 cursor-pointer"
            : "border-gray-600 opacity-50 cursor-not-allowed grayscale"
        }
      `}
    >
      {/* Glow effect on hover */}
      {canAfford && (
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-violet-600 rounded-lg blur opacity-0 group-hover:opacity-30 transition duration-200"></div>
      )}

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-between p-4">
        {/* Purchased Badge */}
        {isPurchased && (
          <div className="absolute top-2 right-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">
            ✓ OWNED
          </div>
        )}

        {/* Icon */}
        <div className={`text-5xl mb-2 ${isPurchased ? "opacity-50 line-through" : ""}`}>
          {icon}
        </div>

        {/* Name */}
        <div className={`text-sm font-bold text-white tracking-wider text-center ${isPurchased ? "line-through opacity-70" : ""}`}>
          {name}
        </div>

        {/* Description */}
        <div className={`text-xs text-gray-300 text-center flex-1 flex items-center px-2 ${isPurchased ? "opacity-50" : ""}`}>
          {description}
        </div>

        {/* Cost */}
        <div
          className={`
          mt-2 px-4 py-2 rounded-md
          ${isPurchased ? "bg-green-600/60" : canAfford ? "bg-yellow-600/80" : "bg-gray-600/80"}
        `}
        >
          <div className="text-xs text-white/70">{isPurchased ? "PAID" : "COST"}</div>
          <div className="text-lg font-bold text-white tabular-nums">
            {cost} 💰
          </div>
        </div>
      </div>
    </button>
  );
}
