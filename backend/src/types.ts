export type Team = 'iovine' | 'young';

export type GamePhase = 'waiting' | 'warmup' | 'active' | 'ended';

export type EffectType = 'ban-shield' | 'pause-shield' | 'full-shield' | 'click-multiplier' | 'coin-multiplier' | 'paused' | 'banned';

export interface ActiveEffect {
  type: EffectType;
  expiresAt: number; // timestamp in milliseconds
  value?: number; // multiplier value or other effect-specific data
}

// Shop System Types
export type ShopItemCategory = 'power' | 'economy' | 'passive' | 'synergy' | 'team-aura' | 'team-economy' | 'team-shield' | 'offensive' | 'special';

export type PurchaseType = 'individual' | 'team';

export interface ShopItemDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: ShopItemCategory;
  purchaseType: PurchaseType;
  cost: number;

  // Effects (all permanent)
  clickMultiplier?: number;
  coinMultiplier?: number;
  passiveIncome?: number;

  // Team effects (only for team items)
  teamClickBonus?: number;
  teamCoinBonus?: number;
  buyerBonusMultiplier?: number;

  // One-time effects
  instantScoreDamage?: number;
  instantCoinSteal?: number;

  // Conditional availability
  onlyWhenLosing?: boolean;
  onlyWhenWinning?: boolean;
  losingThreshold?: number;
  winningThreshold?: number;

  // Build path metadata
  buildPath?: 'power-rush' | 'economist' | 'balanced' | 'team-player' | 'aggressor';
  recommendAfter?: string[];
  tier?: number;
}

export interface PurchasedItem {
  itemId: string;
  purchasedAt: number;
  purchasedBy?: string;
}

export interface TeamUpgrades {
  iovine: PurchasedItem[];
  young: PurchasedItem[];
}

export interface PlayerStats {
  totalClickMultiplier: number;
  totalCoinMultiplier: number;
  passiveIncomeRate: number;
  individualClickMultiplier: number;
  teamClickMultiplier: number;
  individualCoinMultiplier: number;
  teamCoinMultiplier: number;
}

export interface Player {
  id: string;
  name: string;
  team: Team;
  clicks: number;
  coins: number; // shop currency (earned separately from clicks) - NOW SUPPORTS DECIMALS
  lastSeen: number; // timestamp in milliseconds
  activeEffects: ActiveEffect[];
  purchasedItems: PurchasedItem[]; // individual shop purchases
  selectedBuildPath?: string; // selected build path ID
}

export interface GameState {
  players: Map<string, Player>;
  scores: {
    iovine: number; // NOW SUPPORTS DECIMALS (e.g., 1234.5)
    young: number; // NOW SUPPORTS DECIMALS (e.g., 1234.5)
  };
  phase: GamePhase;
  winner: Team | null;
  warmupStartTime: number | null;
  warmupDuration: number; // milliseconds (30000 = 30 seconds)
  winThreshold: number | null;
  teamUpgrades: TeamUpgrades; // team-wide shop purchases
  lastPassiveIncomeUpdate: number; // timestamp for passive income calculation
}

export interface GameStateResponse {
  players: {
    iovine: Array<{ name: string; clicks: number; coins: number; activeEffects: ActiveEffect[] }>;
    young: Array<{ name: string; clicks: number; coins: number; activeEffects: ActiveEffect[] }>;
  };
  scores: {
    iovine: number;
    young: number;
  };
  phase: GamePhase;
  winner: Team | null;
  warmupTimeRemaining?: number; // seconds remaining in warmup phase
  winThreshold?: number; // points needed to win (set after warmup)
  resetCountdown?: number; // seconds remaining before reset
}
