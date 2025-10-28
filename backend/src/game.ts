import { GameState, Player, Team, GameStateResponse } from './types';
import { randomUUID } from 'crypto';

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
      winThreshold: null
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
      activeEffects: []
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
   * Uses 1.5 power scaling: largestTeam^1.5 × 11,180
   * 20 players = 1,000,000 points
   */
  private calculateWinThreshold(): number {
    const iovineCount = Array.from(this.state.players.values())
      .filter(p => p.team === 'iovine').length;
    const youngCount = Array.from(this.state.players.values())
      .filter(p => p.team === 'young').length;
    const largestTeam = Math.max(iovineCount, youngCount);

    // Linear formula: 10k base + 5.5k per player on largest team
    const threshold = 10000 + (largestTeam * 5500);

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
  registerClick(playerId: string): { success: boolean; scores: { iovine: number; young: number }; coins: number } {
    const player = this.state.players.get(playerId);

    if (!player) {
      return { success: false, scores: this.state.scores, coins: 0 };
    }

    // Increment personal click counter
    player.clicks += 1;

    // Increment coins (1:1 ratio for now, can be modified with multipliers later)
    player.coins += 1;

    player.lastSeen = Date.now();

    // Increment team score (1:1 for now, can be modified with multipliers later)
    if (player.team === 'iovine') {
      this.state.scores.iovine += 1;
    } else {
      this.state.scores.young += 1;
    }

    return { success: true, scores: this.state.scores, coins: player.coins };
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
   * Get current game state (only active players)
   */
  getGameState(): GameStateResponse {
    const now = Date.now();
    const INACTIVE_THRESHOLD = 5000; // 5 seconds
    const EMPTY_TEAM_RESET_THRESHOLD = 15000; // 15 seconds

    // Check for phase transitions
    this.checkWarmupExpiration();
    this.checkWinCondition();

    // Filter only active players (seen in last 5 seconds)
    const iovinePlayers = Array.from(this.state.players.values())
      .filter(p => p.team === 'iovine' && (now - p.lastSeen) < INACTIVE_THRESHOLD)
      .map(p => ({ name: p.name, clicks: p.clicks, coins: p.coins, activeEffects: p.activeEffects }));

    const youngPlayers = Array.from(this.state.players.values())
      .filter(p => p.team === 'young' && (now - p.lastSeen) < INACTIVE_THRESHOLD)
      .map(p => ({ name: p.name, clicks: p.clicks, coins: p.coins, activeEffects: p.activeEffects }));

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
      winThreshold: null
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
}

export const gameManager = new GameManager();
