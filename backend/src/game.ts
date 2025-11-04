import { GameState, Player, Team, GameStateResponse, PlayerStats, PurchasedItem } from './types';
import { randomUUID } from 'crypto';
import { calculatePlayerStats } from './multiplierEngine';
import { getShopItem } from './shopCatalog';

class GameManager {
  private state: GameState;
  private emptyTeamTimers: {
    iovine: number | null;
    young: number | null;
  };
  private hasHadPlayers: {
    iovine: boolean;
    young: boolean;
  };

  constructor() {
    this.state = {
      players: new Map(),
      scores: { iovine: 0, young: 0 },
      phase: 'waiting',
      winner: null,
      warmupStartTime: null,
      warmupDuration: 30000, // 30 seconds
      winThreshold: null,
      teamUpgrades: { iovine: [], young: [] },
      lastPassiveIncomeUpdate: Date.now()
    };
    this.emptyTeamTimers = {
      iovine: null,
      young: null
    };
    this.hasHadPlayers = {
      iovine: false,
      young: false
    };
  }

  /**
   * Add a player to a team
   * Returns null if joining is blocked (active/ended phase)
   */
  joinGame(name: string, team: Team): Player | null {
    // Block joins during active or ended phases only
    // Allow joins during waiting and warmup
    if (this.state.phase === 'active' || this.state.phase === 'ended') {
      console.log(`Join blocked: game in ${this.state.phase} phase`);
      return null;
    }

    const player: Player = {
      id: randomUUID(),
      name,
      team,
      clicks: 0,
      coins: 0,
      lastSeen: Date.now(),
      activeEffects: [],
      purchasedItems: [],
      selectedBuildPath: undefined
    };

    this.state.players.set(player.id, player);

    // Mark that this team has had players
    this.hasHadPlayers[team] = true;

    // Check if we should start warmup phase (both teams have players)
    this.checkAndStartWarmup();

    return player;
  }

  /**
   * Check if warmup should start (both teams have at least one player)
   */
  private checkAndStartWarmup(): void {
    if (this.state.phase !== 'waiting') return;

    const hasIovine = Array.from(this.state.players.values())
      .some(p => p.team === 'iovine');
    const hasYoung = Array.from(this.state.players.values())
      .some(p => p.team === 'young');

    if (hasIovine && hasYoung) {
      this.state.phase = 'warmup';
      this.state.warmupStartTime = Date.now();
      console.log('🏁 Warmup phase started! Duration: 30 seconds');
    }
  }

  /**
   * Calculate win threshold based on team sizes
   * Linear formula: largestTeam × 2000
   * Designed for ~3 minute games
   */
  private calculateWinThreshold(): number {
    const iovineCount = Array.from(this.state.players.values())
      .filter(p => p.team === 'iovine').length;
    const youngCount = Array.from(this.state.players.values())
      .filter(p => p.team === 'young').length;
    const largestTeam = Math.max(iovineCount, youngCount);

    // Linear formula: largestTeam × 2000
    const threshold = largestTeam * 2000;

    console.log(`Win threshold calculated: ${threshold} (Iovine: ${iovineCount}, Young: ${youngCount}, Largest: ${largestTeam})`);
    return threshold;
  }

  /**
   * Check if warmup phase has expired and transition to active
   */
  private checkWarmupExpiration(): void {
    if (this.state.phase !== 'warmup' || !this.state.warmupStartTime) return;

    const elapsed = Date.now() - this.state.warmupStartTime;

    if (elapsed >= this.state.warmupDuration) {
      // Warmup ended - transition to active phase
      this.state.phase = 'active';
      this.state.winThreshold = this.calculateWinThreshold();

      console.log(`🎮 Game active! Win threshold: ${this.state.winThreshold}`);
    }
  }

  /**
   * Check if a team has reached the win threshold
   */
  private checkWinCondition(): void {
    if (this.state.phase !== 'active' || !this.state.winThreshold) return;

    if (this.state.scores.iovine >= this.state.winThreshold) {
      this.state.phase = 'ended';
      this.state.winner = 'iovine';
      console.log('🏆 Team Iovine wins!');
    } else if (this.state.scores.young >= this.state.winThreshold) {
      this.state.phase = 'ended';
      this.state.winner = 'young';
      console.log('🏆 Team Young wins!');
    }
  }

  /**
   * Register a click for a player
   */
  registerClick(playerId: string): { success: boolean; scores: { iovine: number; young: number }; coins: number; stats: PlayerStats } {
    const player = this.state.players.get(playerId);

    if (!player) {
      return {
        success: false,
        scores: this.state.scores,
        coins: 0,
        stats: {
          totalClickMultiplier: 1,
          totalCoinMultiplier: 1,
          passiveIncomeRate: 0,
          individualClickMultiplier: 1,
          teamClickMultiplier: 1,
          individualCoinMultiplier: 1,
          teamCoinMultiplier: 1
        }
      };
    }

    // Get team upgrades for this player's team
    const teamUpgrades = this.state.teamUpgrades[player.team];

    // Calculate multipliers
    const stats = calculatePlayerStats(player, teamUpgrades, this.state);

    // Increment personal click counter (always 1)
    player.clicks += 1;

    // Apply multipliers to coins and score (NOW DECIMALS!)
    const scoreValue = 1.0 * stats.totalClickMultiplier;
    const coinValue = 1.0 * stats.totalCoinMultiplier;

    console.log(`[CLICK] ${player.name} (Team ${player.team}) clicked!`);
    console.log(`  Score value: ${scoreValue.toFixed(2)} (multiplier: ${stats.totalClickMultiplier.toFixed(2)}x)`);
    console.log(`  Individual click mult: ${stats.individualClickMultiplier.toFixed(2)}x, Team click mult: ${stats.teamClickMultiplier.toFixed(2)}x`);
    console.log(`  Coin value: ${coinValue.toFixed(2)} (multiplier: ${stats.totalCoinMultiplier.toFixed(2)}x)`);
    console.log(`  Individual coin mult: ${stats.individualCoinMultiplier.toFixed(2)}x, Team coin mult: ${stats.teamCoinMultiplier.toFixed(2)}x`);
    console.log(`  Team upgrades count: ${teamUpgrades.length}`);

    player.coins += coinValue;
    player.lastSeen = Date.now();

    // Increment team score with multiplier
    const oldScore = this.state.scores[player.team];
    if (player.team === 'iovine') {
      this.state.scores.iovine += scoreValue;
    } else {
      this.state.scores.young += scoreValue;
    }
    console.log(`[CLICK] Team ${player.team} score: ${oldScore} -> ${this.state.scores[player.team]} (+${scoreValue})`);


    return {
      success: true,
      scores: this.state.scores,
      coins: player.coins,
      stats
    };
  }

  /**
   * Update player's last seen timestamp (heartbeat)
   */
  updateHeartbeat(playerId: string): boolean {
    const player = this.state.players.get(playerId);

    if (!player) {
      return false;
    }

    player.lastSeen = Date.now();
    return true;
  }

  /**
   * Update all players' passive income
   * Called every second from getGameState()
   */
  private updatePassiveIncome(): void {
    const now = Date.now();
    const lastUpdate = this.state.lastPassiveIncomeUpdate || now;
    const elapsedSeconds = (now - lastUpdate) / 1000;

    if (elapsedSeconds < 1) return; // only update every full second

    // Only accrue during active phase
    if (this.state.phase !== 'active') {
      this.state.lastPassiveIncomeUpdate = now;
      return;
    }

    for (const [playerId, player] of this.state.players) {
      const teamUpgrades = this.state.teamUpgrades[player.team];
      const stats = calculatePlayerStats(player, teamUpgrades, this.state);

      if (stats.passiveIncomeRate > 0) {
        const coinGain = stats.passiveIncomeRate * elapsedSeconds;
        player.coins += coinGain;
      }
    }

    this.state.lastPassiveIncomeUpdate = now;
  }

  /**
   * Purchase a shop item
   */
  purchaseItem(playerId: string, itemId: string): { success: boolean; error?: string; newCoins?: number; stats?: PlayerStats } {
    const player = this.state.players.get(playerId);
    if (!player) {
      return { success: false, error: 'Player not found' };
    }

    if (this.state.phase !== 'active') {
      return { success: false, error: 'Game must be active to purchase' };
    }

    const item = getShopItem(itemId);
    if (!item) {
      return { success: false, error: 'Item not found' };
    }

    // Check if player can afford
    if (player.coins < item.cost) {
      return { success: false, error: 'Insufficient coins' };
    }

    const enemyTeam: Team = player.team === 'iovine' ? 'young' : 'iovine';

    // Handle different item types
    if (item.purchaseType === 'team') {
      // Check if team already owns it
      const teamUpgrades = this.state.teamUpgrades[player.team];
      if (teamUpgrades.some(pu => pu.itemId === itemId)) {
        return { success: false, error: 'Team already owns this item' };
      }

      // Deduct coins and add to team upgrades
      player.coins -= item.cost;
      teamUpgrades.push({
        itemId,
        purchasedAt: Date.now(),
        purchasedBy: player.id
      });

      console.log(`\n========== TEAM UPGRADE PURCHASED ==========`);
      console.log(`Team: ${player.team}`);
      console.log(`Item: ${item.name} (${itemId})`);
      console.log(`Buyer: ${player.name} (${player.id})`);
      console.log(`Team Click Bonus: ${item.teamClickBonus || 0}`);
      console.log(`Team Coin Bonus: ${item.teamCoinBonus || 0}`);
      console.log(`Buyer Multiplier: ${item.buyerBonusMultiplier || 1}`);
      console.log(`Total Team Upgrades: ${teamUpgrades.length}`);
      console.log(`==========================================\n`);
    } else if (item.instantScoreDamage) {
      // Sabotage item
      const damage = item.instantScoreDamage;
      const reduction = this.state.scores[enemyTeam] * damage;
      this.state.scores[enemyTeam] = Math.max(0, this.state.scores[enemyTeam] - reduction);

      player.coins -= item.cost;
      console.log(`${player.name} sabotaged Team ${enemyTeam} for ${reduction.toFixed(1)} points!`);
    } else if (item.instantCoinSteal) {
      // Coin heist item
      const stealAmount = item.instantCoinSteal;
      const victim = this.findRichestPlayer(enemyTeam);

      if (victim) {
        const actualSteal = Math.min(stealAmount, victim.coins);
        victim.coins -= actualSteal;
        player.coins -= item.cost;
        player.coins += actualSteal;

        console.log(`${player.name} stole ${actualSteal.toFixed(1)} coins from ${victim.name}!`);
      } else {
        return { success: false, error: 'No valid target for heist' };
      }
    } else {
      // Regular individual item
      player.coins -= item.cost;
      player.purchasedItems.push({
        itemId,
        purchasedAt: Date.now()
      });

      console.log(`${player.name} purchased ${item.name}`);
    }

    // Recalculate stats
    const teamUpgrades = this.state.teamUpgrades[player.team];
    const stats = calculatePlayerStats(player, teamUpgrades, this.state);

    return {
      success: true,
      newCoins: player.coins,
      stats
    };
  }

  /**
   * Find richest player on a team
   */
  private findRichestPlayer(team: Team): Player | null {
    let richest: Player | null = null;
    let maxCoins = 0;

    for (const player of this.state.players.values()) {
      if (player.team === team && player.coins > maxCoins) {
        richest = player;
        maxCoins = player.coins;
      }
    }

    return richest;
  }

  /**
   * Select a build path for a player
   */
  selectBuildPath(playerId: string, pathId: string): { success: boolean; error?: string } {
    const player = this.state.players.get(playerId);
    if (!player) {
      return { success: false, error: 'Player not found' };
    }

    player.selectedBuildPath = pathId;
    console.log(`${player.name} selected build path: ${pathId}`);

    return { success: true };
  }

  /**
   * Get current game state (only active players)
   */
  getGameState(): GameStateResponse {
    const now = Date.now();
    const INACTIVE_THRESHOLD = 5000; // 5 seconds
    const EMPTY_TEAM_RESET_THRESHOLD = 15000; // 15 seconds

    // Update passive income for all players
    this.updatePassiveIncome();

    // Check for phase transitions
    this.checkWarmupExpiration();
    this.checkWinCondition();

    // Filter only active players (seen in last 5 seconds)
    const iovinePlayers = Array.from(this.state.players.values())
      .filter(p => p.team === 'iovine' && (now - p.lastSeen) < INACTIVE_THRESHOLD)
      .map(p => {
        const teamUpgrades = this.state.teamUpgrades[p.team];
        const stats = calculatePlayerStats(p, teamUpgrades, this.state);
        return {
          name: p.name,
          clicks: p.clicks,
          coins: p.coins,
          activeEffects: p.activeEffects,
          passiveIncomeRate: stats.passiveIncomeRate
        };
      });

    const youngPlayers = Array.from(this.state.players.values())
      .filter(p => p.team === 'young' && (now - p.lastSeen) < INACTIVE_THRESHOLD)
      .map(p => {
        const teamUpgrades = this.state.teamUpgrades[p.team];
        const stats = calculatePlayerStats(p, teamUpgrades, this.state);
        return {
          name: p.name,
          clicks: p.clicks,
          coins: p.coins,
          activeEffects: p.activeEffects,
          passiveIncomeRate: stats.passiveIncomeRate
        };
      });

    let resetCountdown: number | undefined = undefined;

    // Check for empty teams and track timing
    // ONLY trigger countdown if team HAD players before (not just starting empty)
    if (iovinePlayers.length === 0 && this.hasHadPlayers.iovine) {
      if (this.emptyTeamTimers.iovine === null) {
        this.emptyTeamTimers.iovine = now;
      } else {
        const elapsed = now - this.emptyTeamTimers.iovine;
        if (elapsed >= EMPTY_TEAM_RESET_THRESHOLD) {
          console.log('Team Iovine empty for 15+ seconds, resetting game...');
          this.resetGame();
        } else {
          // Calculate countdown
          const remaining = EMPTY_TEAM_RESET_THRESHOLD - elapsed;
          resetCountdown = Math.ceil(remaining / 1000);
        }
      }
    } else {
      this.emptyTeamTimers.iovine = null;
    }

    if (youngPlayers.length === 0 && this.hasHadPlayers.young) {
      if (this.emptyTeamTimers.young === null) {
        this.emptyTeamTimers.young = now;
      } else {
        const elapsed = now - this.emptyTeamTimers.young;
        if (elapsed >= EMPTY_TEAM_RESET_THRESHOLD) {
          console.log('Team Young empty for 15+ seconds, resetting game...');
          this.resetGame();
        } else {
          // Calculate countdown
          const remaining = EMPTY_TEAM_RESET_THRESHOLD - elapsed;
          const countdown = Math.ceil(remaining / 1000);
          // Use the smallest countdown if both teams are empty
          resetCountdown = resetCountdown !== undefined ? Math.min(resetCountdown, countdown) : countdown;
        }
      }
    } else {
      this.emptyTeamTimers.young = null;
    }

    const response: GameStateResponse = {
      players: {
        iovine: iovinePlayers,
        young: youngPlayers
      },
      scores: this.state.scores,
      phase: this.state.phase,
      winner: this.state.winner
    };

    // Add warmup countdown if in warmup phase
    if (this.state.phase === 'warmup' && this.state.warmupStartTime) {
      const elapsed = now - this.state.warmupStartTime;
      const remaining = this.state.warmupDuration - elapsed;
      response.warmupTimeRemaining = Math.max(0, Math.ceil(remaining / 1000));
    }

    // Add win threshold if it's been calculated (active or ended phase)
    if (this.state.winThreshold !== null) {
      response.winThreshold = this.state.winThreshold;
    }

    // Add reset countdown if team abandoned
    if (resetCountdown !== undefined) {
      response.resetCountdown = resetCountdown;
    }

    return response;
  }

  /**
   * Reset the game
   */
  resetGame(): void {
    this.state = {
      players: new Map(),
      scores: { iovine: 0, young: 0 },
      phase: 'waiting',
      winner: null,
      warmupStartTime: null,
      warmupDuration: 30000,
      winThreshold: null,
      teamUpgrades: { iovine: [], young: [] },
      lastPassiveIncomeUpdate: Date.now()
    };
    this.emptyTeamTimers = {
      iovine: null,
      young: null
    };
    this.hasHadPlayers = {
      iovine: false,
      young: false
    };
  }

  /**
   * Debug: Update player's coins and clicks directly
   */
  debugUpdatePlayer(playerId: string, coins: number, clicks: number): { success: boolean; error?: string } {
    const player = this.state.players.get(playerId);
    if (!player) {
      return { success: false, error: 'Player not found' };
    }

    player.coins = Math.max(0, coins);
    player.clicks = Math.max(0, clicks);

    console.log(`[DEBUG] Updated ${player.name}: coins=${player.coins}, clicks=${player.clicks}`);

    return { success: true };
  }

  /**
   * Debug: Set scores directly for testing
   */
  debugSetScores(iovine: number, young: number, phase?: string, winThreshold?: number): { success: boolean } {
    this.state.scores.iovine = Math.max(0, iovine);
    this.state.scores.young = Math.max(0, young);

    if (phase && ['waiting', 'warmup', 'active', 'ended'].includes(phase)) {
      this.state.phase = phase as 'waiting' | 'warmup' | 'active' | 'ended';
    }

    if (winThreshold !== undefined && winThreshold > 0) {
      this.state.winThreshold = winThreshold;
    }

    console.log(`[DEBUG] Set scores - Iovine: ${this.state.scores.iovine}, Young: ${this.state.scores.young}`);
    if (phase) console.log(`[DEBUG] Set phase: ${this.state.phase}`);
    if (winThreshold) console.log(`[DEBUG] Set winThreshold: ${this.state.winThreshold}`);

    return { success: true };
  }
}

export const gameManager = new GameManager();
