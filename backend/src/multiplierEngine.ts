import { Player, PurchasedItem, PlayerStats, GameState } from './types';
import { getShopItem } from './shopCatalog';

/**
 * Calculate player's total stats from purchased items and team upgrades
 * This is the core engine that determines click/coin multipliers and passive income
 */
export function calculatePlayerStats(
  player: Player,
  teamUpgrades: PurchasedItem[],
  gameState?: GameState
): PlayerStats {
  // Initialize base values - NOW WE TRACK THE HIGHEST MULTIPLIER ONLY
  let highestClickMult = 1.0;
  let highestCoinMult = 1.0;
  let passiveIncome = 0;
  let synergies = 1.0;
  let compoundGrowthStacks = 0;

  // Calculate if player is losing (for conditional items)
  let isLosing = false;
  let losingBy = 0;
  if (gameState) {
    const enemyTeam = player.team === 'iovine' ? 'young' : 'iovine';
    const myScore = gameState.scores[player.team];
    const enemyScore = gameState.scores[enemyTeam];
    const totalScore = myScore + enemyScore;

    if (totalScore > 0 && enemyScore > myScore) {
      isLosing = true;
      losingBy = (enemyScore - myScore) / totalScore;
    }
  }

  // ===== 1. CALCULATE INDIVIDUAL ITEMS =====
  // NEW LOGIC: Take the highest multiplier, don't stack them
  for (const purchase of player.purchasedItems) {
    const item = getShopItem(purchase.itemId);
    if (!item) {
      console.log(`[DEBUG] Item not found: ${purchase.itemId}`);
      continue;
    }

    // Skip conditional items if conditions not met
    if (item.onlyWhenLosing && (!isLosing || losingBy < (item.losingThreshold || 0))) {
      console.log(`[DEBUG] Skipping ${item.name} - not losing enough (losingBy: ${losingBy}, threshold: ${item.losingThreshold})`);
      continue;
    }
    if (item.onlyWhenWinning) {
      // TODO: implement winning condition check if needed
      continue;
    }

    // Click multipliers: take the highest one
    if (item.clickMultiplier) {
      if (item.clickMultiplier > highestClickMult) {
        console.log(`[DEBUG] New highest click multiplier: ${item.name} (${item.clickMultiplier}x, was ${highestClickMult}x)`);
        highestClickMult = item.clickMultiplier;
      } else {
        console.log(`[DEBUG] Ignoring ${item.name} click multiplier (${item.clickMultiplier}x, current best: ${highestClickMult}x)`);
      }
    }

    // Coin multipliers: take the highest one
    if (item.coinMultiplier) {
      if (item.coinMultiplier > highestCoinMult) {
        console.log(`[DEBUG] New highest coin multiplier: ${item.name} (${item.coinMultiplier}x)`);
        highestCoinMult = item.coinMultiplier;
      }
    }

    // Passive income stacks additively
    if (item.passiveIncome) {
      passiveIncome += item.passiveIncome;
    }

    // Synergy Boost: +20% effectiveness to all multipliers
    if (item.id === 'synergy-boost') {
      synergies = 1.20;
    }

    // Compound Growth: passive income +50% every minute since purchase
    if (item.id === 'compound-growth') {
      const minutesElapsed = Math.floor((Date.now() - purchase.purchasedAt) / 60000);
      compoundGrowthStacks = minutesElapsed;
    }
  }

  // Apply synergy bonus to individual multipliers
  // e.g., if you have 3x from items and synergy boost, you get 1 + (3-1)*1.2 = 3.4x
  const individualClickMult = 1 + ((highestClickMult - 1) * synergies);
  const individualCoinMult = 1 + ((highestCoinMult - 1) * synergies);

  // Apply compound growth to passive income
  // Each minute adds 50%: 1 coin/sec → 1.5 → 2.25 → 3.375 ...
  if (compoundGrowthStacks > 0) {
    passiveIncome *= Math.pow(1.5, compoundGrowthStacks);
  }

  // ===== 2. CALCULATE TEAM UPGRADES =====
  let teamClickBonus = 0;
  let teamCoinBonus = 0;
  let buyerClickBonus = 0;
  let buyerCoinBonus = 0;

  for (const teamPurchase of teamUpgrades) {
    const item = getShopItem(teamPurchase.itemId);
    if (!item) continue;

    // Check if this player bought this team item
    const isBuyer = teamPurchase.purchasedBy === player.id;

    // Team click bonus
    if (item.teamClickBonus) {
      const bonus = item.teamClickBonus;
      teamClickBonus += bonus;

      // Buyer gets extra benefit (e.g., +25% more)
      // If team gets +10%, buyer gets +12.5%
      if (isBuyer && item.buyerBonusMultiplier) {
        const buyerBonus = bonus * item.buyerBonusMultiplier;
        buyerClickBonus += (buyerBonus - bonus); // additional amount beyond team bonus
      }
    }

    // Team coin bonus
    if (item.teamCoinBonus) {
      const bonus = item.teamCoinBonus;
      teamCoinBonus += bonus;

      if (isBuyer && item.buyerBonusMultiplier) {
        const buyerBonus = bonus * item.buyerBonusMultiplier;
        buyerCoinBonus += (buyerBonus - bonus);
      }
    }
  }

  const teamClickMultiplier = 1 + teamClickBonus + buyerClickBonus;
  const teamCoinMultiplier = 1 + teamCoinBonus + buyerCoinBonus;

  // ===== 3. COMBINE EVERYTHING =====
  // Total multipliers are individual × team
  const totalClickMultiplier = individualClickMult * teamClickMultiplier;
  const totalCoinMultiplier = individualCoinMult * teamCoinMultiplier;

  console.log(`[DEBUG] Final stats for ${player.name}:`);
  console.log(`  Individual click mult: ${individualClickMult}, Team mult: ${teamClickMultiplier}`);
  console.log(`  TOTAL CLICK MULTIPLIER: ${totalClickMultiplier}x`);
  console.log(`  Total coin multiplier: ${totalCoinMultiplier}x`);

  return {
    totalClickMultiplier,
    totalCoinMultiplier,
    passiveIncomeRate: passiveIncome,
    individualClickMultiplier: individualClickMult,
    teamClickMultiplier,
    individualCoinMultiplier: individualCoinMult,
    teamCoinMultiplier
  };
}
