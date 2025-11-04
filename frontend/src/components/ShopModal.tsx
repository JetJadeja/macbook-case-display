import { useEffect, useState } from "react";
import { ShopItem } from "./ShopItem";
import { config } from "../config";

/**
 * ShopModal Component
 *
 * Full-screen modal overlay for the power-up shop
 */

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  coins: number;
  onPurchase: (itemId: string) => void;
  phase?: "waiting" | "warmup" | "active" | "ended";
  warmupTimeRemaining?: number | null;
  playerId?: string | null;
}

interface ShopItemData {
  id: string;
  name: string;
  description: string;
  icon: string;
  cost: number;
  purchaseType: string;
  category: string;
  tier?: number;
  ownedByTeam?: boolean;
  purchasedBy?: string;
  purchasedByYou?: boolean;
}

interface BuildPath {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export function ShopModal({
  isOpen,
  onClose,
  coins,
  onPurchase,
  phase = "active",
  warmupTimeRemaining = null,
  playerId = null,
}: ShopModalProps) {
  const [shopItems, setShopItems] = useState<ShopItemData[]>([]);
  const [buildPaths, setBuildPaths] = useState<BuildPath[]>([]);
  const [purchasedItems, setPurchasedItems] = useState<string[]>([]);
  const [teamPurchasedItems, setTeamPurchasedItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch shop items when modal opens
  useEffect(() => {
    if (isOpen && playerId) {
      fetchShopItems();
    }
  }, [isOpen, playerId]);

  const fetchShopItems = async () => {
    if (!playerId) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${config.backendUrl}/api/shop?playerId=${playerId}`
      );
      const data = await response.json();
      // Combine regular items and owned team items
      const allItems = [...(data.items || []), ...(data.ownedTeamItems || [])];
      setShopItems(allItems);
      setBuildPaths(data.buildPaths || []);
      setPurchasedItems(data.purchasedItems || []);
      setTeamPurchasedItems(data.teamPurchasedItems || []);
    } catch (error) {
      console.error("Failed to fetch shop items:", error);
    } finally {
      setLoading(false);
    }
  };

  // Close modal on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isLocked = phase === "warmup" || phase === "waiting";

  // Separate tier 1 (starter) items from everything else
  const starterItems = shopItems.filter(item => item.tier === 1);
  const higherTierItems = shopItems.filter(item => item.tier !== 1);

  // Sort starters by cost
  starterItems.sort((a, b) => a.cost - b.cost);

  // Organize higher tier items by category
  const categoryOrder = ['power', 'economy', 'passive', 'synergy', 'team-aura', 'team-economy', 'offensive', 'special'];
  const categoryNames: Record<string, string> = {
    'power': '⚡ Power Upgrades',
    'economy': '💰 Economy Upgrades',
    'passive': '🏦 Passive Income',
    'synergy': '✨ Synergy',
    'team-aura': '📣 Team Power',
    'team-economy': '💎 Team Economy',
    'offensive': '💣 Offensive',
    'special': '🔥 Special'
  };

  const organizedItems: Record<string, ShopItemData[]> = {};
  higherTierItems.forEach(item => {
    if (!organizedItems[item.category]) {
      organizedItems[item.category] = [];
    }
    organizedItems[item.category].push(item);
  });

  // Sort each category by cost
  Object.keys(organizedItems).forEach(category => {
    organizedItems[category].sort((a, b) => a.cost - b.cost);
  });

  const isPurchased = (itemId: string) => {
    return purchasedItems.includes(itemId) || teamPurchasedItems.includes(itemId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-gradient-to-br from-purple-950 to-violet-950 rounded-2xl border-8 border-purple-500 shadow-2xl shadow-purple-500/50 flex flex-col">
        {/* Glow effect */}
        <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 to-violet-600 rounded-2xl blur-xl opacity-30 animate-pulse"></div>

        {/* Content */}
        <div className="relative pixel-font flex flex-col min-h-0 flex-1">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-900 to-violet-900 border-b-4 border-purple-500 px-8 py-6 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white glitch-text">
                  💰 POWER-UP SHOP
                </h2>
                <div className="text-sm text-purple-300 mt-1">
                  Purchase upgrades and abilities
                </div>
              </div>
              <div className="bg-black/50 px-6 py-3 rounded-lg border-2 border-yellow-400">
                <div className="text-xs text-yellow-400/70">YOUR COINS</div>
                <div className="text-2xl font-bold text-yellow-400 tabular-nums">
                  {coins.toString().padStart(4, "0")}
                </div>
              </div>
            </div>
          </div>

          {/* Shop Grid - Scrollable */}
          <div className="p-8 relative overflow-y-auto min-h-0 flex-1">
            {loading ? (
              <div className="text-center text-white text-xl py-12">
                Loading shop items...
              </div>
            ) : shopItems.length === 0 ? (
              <div className="text-center text-white text-xl py-12">
                No items available
              </div>
            ) : (
              <div className="space-y-8 pb-4">
                {/* STARTER ITEMS - Always at top */}
                {starterItems.length > 0 && (
                  <div>
                    <h3 className="text-2xl font-bold text-yellow-400 mb-4">
                      🌟 STARTER ITEMS - Pick Your Path
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {starterItems.map((item) => (
                        <ShopItem
                          key={item.id}
                          icon={item.icon}
                          name={item.name}
                          description={item.description}
                          cost={item.cost}
                          canAfford={!isLocked && coins >= item.cost}
                          onPurchase={() => onPurchase(item.id)}
                          isPurchased={isPurchased(item.id)}
                          ownedByTeam={item.ownedByTeam}
                          purchasedBy={item.purchasedBy}
                          purchasedByYou={item.purchasedByYou}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Build Paths Section - More compact */}
                {buildPaths.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-purple-200 mb-3">
                      📋 Build Paths
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {buildPaths.map((path) => (
                        <div
                          key={path.id}
                          className="bg-purple-900/30 border border-purple-500 rounded-lg p-3"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{path.icon}</span>
                            <span className="text-sm font-bold text-white">
                              {path.name}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Higher Tier Items by Category */}
                {categoryOrder.map((category) => {
                  const items = organizedItems[category];
                  if (!items || items.length === 0) return null;

                  return (
                    <div key={category}>
                      <h3 className="text-xl font-bold text-purple-200 mb-4">
                        {categoryNames[category] || category}
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {items.map((item) => (
                          <ShopItem
                            key={item.id}
                            icon={item.icon}
                            name={item.name}
                            description={item.description}
                            cost={item.cost}
                            canAfford={!isLocked && coins >= item.cost}
                            onPurchase={() => onPurchase(item.id)}
                            isPurchased={isPurchased(item.id)}
                            ownedByTeam={item.ownedByTeam}
                            purchasedBy={item.purchasedBy}
                            purchasedByYou={item.purchasedByYou}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Lock Overlay during warmup */}
            {isLocked && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center rounded-lg">
                <div className="text-8xl mb-4">🔒</div>
                <div className="text-3xl font-bold text-yellow-400 mb-2">
                  SHOP LOCKED
                </div>
                <div className="text-lg text-yellow-200 mb-4">
                  {phase === "warmup"
                    ? "Available after warmup phase"
                    : "Waiting for game to start"}
                </div>
                {warmupTimeRemaining !== null && warmupTimeRemaining > 0 && (
                  <div className="text-2xl text-white tabular-nums">
                    Available in: 0:{warmupTimeRemaining.toString().padStart(2, "0")}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gradient-to-r from-purple-900 to-violet-900 border-t-4 border-purple-500 px-8 py-4 flex-shrink-0">
            <div className="text-center text-sm text-purple-300">
              Press <span className="text-white font-bold">ESC</span> to close
              or{" "}
              <button
                onClick={onClose}
                className="text-white font-bold hover:text-purple-300 underline"
              >
                CLICK HERE
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
