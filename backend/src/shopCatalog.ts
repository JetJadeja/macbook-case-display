import { ShopItemDefinition, Player, GameState, Team, PurchasedItem } from './types';

/**
 * Shop Catalog - All 25 permanent shop items
 */
export const SHOP_CATALOG: ShopItemDefinition[] = [
  // ===== INDIVIDUAL ITEMS - POWER TREE =====
  {
    id: 'starter-boost',
    name: 'Starter Boost',
    description: 'Permanently multiply your clicks by 1.2x',
    icon: '⚡',
    category: 'power',
    purchaseType: 'individual',
    cost: 100,
    clickMultiplier: 1.2,
    buildPath: 'power-rush',
    tier: 1
  },
  {
    id: 'power-surge',
    name: 'Power Surge',
    description: 'Permanently multiply your clicks by 1.5x',
    icon: '⚡⚡',
    category: 'power',
    purchaseType: 'individual',
    cost: 300,
    clickMultiplier: 1.5,
    buildPath: 'power-rush',
    recommendAfter: ['starter-boost'],
    tier: 2
  },
  {
    id: 'mega-force',
    name: 'Mega Force',
    description: 'Permanently multiply your clicks by 2x',
    icon: '⚡⚡⚡',
    category: 'power',
    purchaseType: 'individual',
    cost: 800,
    clickMultiplier: 2.0,
    buildPath: 'power-rush',
    recommendAfter: ['power-surge'],
    tier: 3
  },
  {
    id: 'ultra-power',
    name: 'Ultra Power',
    description: 'Permanently multiply your clicks by 3x',
    icon: '⚡⚡⚡⚡',
    category: 'power',
    purchaseType: 'individual',
    cost: 2000,
    clickMultiplier: 3.0,
    buildPath: 'power-rush',
    recommendAfter: ['mega-force'],
    tier: 4
  },
  {
    id: 'god-mode',
    name: 'God Mode',
    description: 'Permanently multiply your clicks by 5x',
    icon: '⚡⚡⚡⚡⚡',
    category: 'power',
    purchaseType: 'individual',
    cost: 5000,
    clickMultiplier: 5.0,
    buildPath: 'power-rush',
    recommendAfter: ['ultra-power'],
    tier: 5
  },
  {
    id: 'transcendent',
    name: 'Transcendent',
    description: 'Permanently multiply your clicks by 10x',
    icon: '💫',
    category: 'power',
    purchaseType: 'individual',
    cost: 12000,
    clickMultiplier: 10.0,
    buildPath: 'power-rush',
    recommendAfter: ['god-mode'],
    tier: 5
  },

  // ===== INDIVIDUAL ITEMS - ECONOMY TREE =====
  {
    id: 'penny-saver',
    name: 'Penny Saver',
    description: 'Permanently multiply coins earned by 1.5x',
    icon: '💰',
    category: 'economy',
    purchaseType: 'individual',
    cost: 150,
    coinMultiplier: 1.5,
    buildPath: 'economist',
    tier: 1
  },
  {
    id: 'money-maker',
    name: 'Money Maker',
    description: 'Permanently multiply coins earned by 2x',
    icon: '💰💰',
    category: 'economy',
    purchaseType: 'individual',
    cost: 400,
    coinMultiplier: 2.0,
    buildPath: 'economist',
    recommendAfter: ['penny-saver'],
    tier: 2
  },
  {
    id: 'tycoon',
    name: 'Tycoon',
    description: 'Permanently multiply coins earned by 3x',
    icon: '💰💰💰',
    category: 'economy',
    purchaseType: 'individual',
    cost: 1000,
    coinMultiplier: 3.0,
    buildPath: 'economist',
    recommendAfter: ['money-maker'],
    tier: 3
  },

  // ===== INDIVIDUAL ITEMS - PASSIVE INCOME =====
  {
    id: 'interest-i',
    name: 'Interest I',
    description: 'Earn +1 coin per second passively',
    icon: '🏦',
    category: 'passive',
    purchaseType: 'individual',
    cost: 300,
    passiveIncome: 1,
    buildPath: 'economist',
    tier: 2
  },
  {
    id: 'interest-ii',
    name: 'Interest II',
    description: 'Earn +3 coins per second passively',
    icon: '🏦🏦',
    category: 'passive',
    purchaseType: 'individual',
    cost: 800,
    passiveIncome: 3,
    buildPath: 'economist',
    recommendAfter: ['interest-i'],
    tier: 3
  },
  {
    id: 'interest-iii',
    name: 'Interest III',
    description: 'Earn +10 coins per second passively',
    icon: '🏦🏦🏦',
    category: 'passive',
    purchaseType: 'individual',
    cost: 2500,
    passiveIncome: 10,
    buildPath: 'economist',
    recommendAfter: ['interest-ii'],
    tier: 4
  },

  // ===== INDIVIDUAL ITEMS - SYNERGY =====
  {
    id: 'synergy-boost',
    name: 'Synergy Boost',
    description: 'All your multipliers gain +20% effectiveness',
    icon: '✨',
    category: 'synergy',
    purchaseType: 'individual',
    cost: 1000,
    buildPath: 'balanced',
    tier: 3
  },
  {
    id: 'compound-growth',
    name: 'Compound Growth',
    description: 'Passive income increases by 50% every minute',
    icon: '📈',
    category: 'synergy',
    purchaseType: 'individual',
    cost: 2000,
    buildPath: 'economist',
    recommendAfter: ['interest-i'],
    tier: 4
  },

  // ===== TEAM ITEMS - AURAS =====
  {
    id: 'rally-cry',
    name: 'Rally Cry',
    description: 'Team gets +10% clicks (you get +12.5%)',
    icon: '📣',
    category: 'team-aura',
    purchaseType: 'team',
    cost: 1200,
    teamClickBonus: 0.10,
    buyerBonusMultiplier: 1.25,
    buildPath: 'team-player',
    tier: 2
  },
  {
    id: 'war-drums',
    name: 'War Drums',
    description: 'Team gets +20% clicks (you get +25%)',
    icon: '🥁',
    category: 'team-aura',
    purchaseType: 'team',
    cost: 3000,
    teamClickBonus: 0.20,
    buyerBonusMultiplier: 1.25,
    buildPath: 'team-player',
    recommendAfter: ['rally-cry'],
    tier: 4
  },
  {
    id: 'battle-hymn',
    name: 'Battle Hymn',
    description: 'Team gets +40% clicks (you get +50%)',
    icon: '🎺',
    category: 'team-aura',
    purchaseType: 'team',
    cost: 7000,
    teamClickBonus: 0.40,
    buyerBonusMultiplier: 1.25,
    buildPath: 'team-player',
    recommendAfter: ['war-drums'],
    tier: 5
  },

  // ===== TEAM ITEMS - ECONOMY =====
  {
    id: 'team-treasury',
    name: 'Team Treasury',
    description: 'Team gets +15% coins (you get +18.75%)',
    icon: '💎',
    category: 'team-economy',
    purchaseType: 'team',
    cost: 1500,
    teamCoinBonus: 0.15,
    buyerBonusMultiplier: 1.25,
    buildPath: 'team-player',
    tier: 2
  },
  {
    id: 'empire-fund',
    name: 'Empire Fund',
    description: 'Team gets +30% coins (you get +37.5%)',
    icon: '💎💎',
    category: 'team-economy',
    purchaseType: 'team',
    cost: 4000,
    teamCoinBonus: 0.30,
    buyerBonusMultiplier: 1.25,
    buildPath: 'team-player',
    recommendAfter: ['team-treasury'],
    tier: 4
  },

  // ===== OFFENSIVE ITEMS - SABOTAGE =====
  {
    id: 'minor-sabotage',
    name: 'Minor Sabotage',
    description: 'Reduce enemy score by 5% immediately',
    icon: '💣',
    category: 'offensive',
    purchaseType: 'individual',
    cost: 500,
    instantScoreDamage: 0.05,
    buildPath: 'aggressor',
    tier: 2
  },
  {
    id: 'major-sabotage',
    name: 'Major Sabotage',
    description: 'Reduce enemy score by 12% immediately',
    icon: '💣💣',
    category: 'offensive',
    purchaseType: 'individual',
    cost: 2000,
    instantScoreDamage: 0.12,
    buildPath: 'aggressor',
    recommendAfter: ['minor-sabotage'],
    tier: 4
  },
  {
    id: 'devastate',
    name: 'Devastate',
    description: 'Reduce enemy score by 20% immediately',
    icon: '💣💣💣',
    category: 'offensive',
    purchaseType: 'individual',
    cost: 5000,
    instantScoreDamage: 0.20,
    buildPath: 'aggressor',
    recommendAfter: ['major-sabotage'],
    tier: 5
  },

  // ===== OFFENSIVE ITEMS - DISRUPTION =====
  {
    id: 'coin-heist',
    name: 'Coin Heist',
    description: 'Steal 500 coins from richest enemy player',
    icon: '🎭',
    category: 'offensive',
    purchaseType: 'individual',
    cost: 700,
    instantCoinSteal: 500,
    buildPath: 'aggressor',
    tier: 2
  },
  {
    id: 'grand-heist',
    name: 'Grand Heist',
    description: 'Steal 2000 coins from richest enemy player',
    icon: '🎭🎭',
    category: 'offensive',
    purchaseType: 'individual',
    cost: 3000,
    instantCoinSteal: 2000,
    buildPath: 'aggressor',
    recommendAfter: ['coin-heist'],
    tier: 4
  },

  // ===== SPECIAL ITEMS - COMEBACK =====
  {
    id: 'underdog-bonus',
    name: 'Underdog Bonus',
    description: '2x personal multiplier while losing by 15%+',
    icon: '🐶',
    category: 'special',
    purchaseType: 'individual',
    cost: 800,
    clickMultiplier: 2.0,
    onlyWhenLosing: true,
    losingThreshold: 0.15,
    tier: 3
  },
  {
    id: 'desperation',
    name: 'Desperation',
    description: '3x personal multiplier (only when losing by 30%+)',
    icon: '🔥',
    category: 'special',
    purchaseType: 'individual',
    cost: 2500,
    clickMultiplier: 3.0,
    onlyWhenLosing: true,
    losingThreshold: 0.30,
    tier: 4
  }
];

/**
 * Get shop item by ID
 */
export function getShopItem(itemId: string): ShopItemDefinition | null {
  return SHOP_CATALOG.find(item => item.id === itemId) || null;
}

/**
 * Get available items for a player based on game state and conditions
 */
export function getAvailableItems(
  player: Player,
  gameState: GameState
): ShopItemDefinition[] {
  // Filter items based on:
  // 1. Game phase must be 'active' or 'warmup' (warmup = can see but not buy)
  if (gameState.phase !== 'active' && gameState.phase !== 'warmup') {
    return [];
  }

  const playerTeam = player.team;
  const enemyTeam: Team = playerTeam === 'iovine' ? 'young' : 'iovine';
  const teamScore = gameState.scores[playerTeam];
  const enemyScore = gameState.scores[enemyTeam];
  const totalScore = teamScore + enemyScore;

  // Calculate if losing/winning
  let losingBy = 0;
  let winningBy = 0;
  if (totalScore > 0) {
    if (enemyScore > teamScore) {
      losingBy = (enemyScore - teamScore) / totalScore;
    } else if (teamScore > enemyScore) {
      winningBy = (teamScore - enemyScore) / totalScore;
    }
  }

  const teamUpgrades = gameState.teamUpgrades[playerTeam];
  const teamItemIds = teamUpgrades.map(item => item.itemId);

  // Get all items the player has purchased (individual + team)
  const playerItemIds = player.purchasedItems.map(p => p.itemId);
  const allOwnedItems = [...playerItemIds, ...teamItemIds];

  return SHOP_CATALOG.filter(item => {
    // 2. Team items: check if team already owns it
    if (item.purchaseType === 'team' && teamItemIds.includes(item.id)) {
      return false;
    }

    // 3. Conditional availability: losing threshold
    if (item.onlyWhenLosing && (!item.losingThreshold || losingBy < item.losingThreshold)) {
      return false;
    }

    // 4. Conditional availability: winning threshold
    if (item.onlyWhenWinning && (!item.winningThreshold || winningBy < item.winningThreshold)) {
      return false;
    }

    // 5. TIER PROGRESSION: Must own prerequisites first
    if (item.recommendAfter && item.recommendAfter.length > 0) {
      // Check if player owns at least one of the recommended prerequisite items
      const hasPrerequisite = item.recommendAfter.some(prereqId => allOwnedItems.includes(prereqId));
      if (!hasPrerequisite) {
        return false; // Cannot see this item until you buy one of the prerequisites
      }
    }

    return true;
  });
}
