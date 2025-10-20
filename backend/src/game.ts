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
      status: 'waiting',
      winner: null
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
   */
  joinGame(name: string, team: Team): Player {
    const player: Player = {
      id: randomUUID(),
      name,
      team,
      clicks: 0,
      lastSeen: Date.now()
    };

    this.state.players.set(player.id, player);

    // Mark that this team has had players
    this.hasHadPlayers[team] = true;

    // Start game if not already active
    if (this.state.status === 'waiting') {
      this.state.status = 'active';
    }

    return player;
  }

  /**
   * Register a click for a player
   */
  registerClick(playerId: string): { success: boolean; scores: { iovine: number; young: number } } {
    const player = this.state.players.get(playerId);

    if (!player) {
      return { success: false, scores: this.state.scores };
    }

    player.clicks += 1;
    player.lastSeen = Date.now();

    if (player.team === 'iovine') {
      this.state.scores.iovine += 1;
    } else {
      this.state.scores.young += 1;
    }

    return { success: true, scores: this.state.scores };
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

    // Filter only active players (seen in last 5 seconds)
    const iovinePlayers = Array.from(this.state.players.values())
      .filter(p => p.team === 'iovine' && (now - p.lastSeen) < INACTIVE_THRESHOLD)
      .map(p => ({ name: p.name, clicks: p.clicks }));

    const youngPlayers = Array.from(this.state.players.values())
      .filter(p => p.team === 'young' && (now - p.lastSeen) < INACTIVE_THRESHOLD)
      .map(p => ({ name: p.name, clicks: p.clicks }));

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

    // Determine game status based on player activity
    let status: 'waiting' | 'active' | 'ended' | 'ending';

    const hasAnyCurrentPlayers = iovinePlayers.length > 0 || youngPlayers.length > 0;
    const hasEverHadPlayers = this.hasHadPlayers.iovine || this.hasHadPlayers.young;
    const inCountdown = resetCountdown !== undefined;

    if (!hasEverHadPlayers && !hasAnyCurrentPlayers) {
      // Game hasn't started yet - no players have ever joined
      status = 'waiting';
    } else if (inCountdown) {
      // Countdown active - team(s) abandoned
      status = 'ending';
    } else {
      // Normal gameplay
      status = 'active';
    }

    const response: GameStateResponse = {
      players: {
        iovine: iovinePlayers,
        young: youngPlayers
      },
      scores: this.state.scores,
      status,
      winner: this.state.winner
    };

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
      status: 'waiting',
      winner: null
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
