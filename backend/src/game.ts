import { GameState, Player, Team, GameStateResponse } from './types';
import { randomUUID } from 'crypto';

class GameManager {
  private state: GameState;
  private emptyTeamTimers: {
    iovine: number | null;
    young: number | null;
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

    // Check for empty teams and track timing
    if (iovinePlayers.length === 0) {
      if (this.emptyTeamTimers.iovine === null) {
        this.emptyTeamTimers.iovine = now;
      } else if (now - this.emptyTeamTimers.iovine >= EMPTY_TEAM_RESET_THRESHOLD) {
        console.log('Team Iovine empty for 15+ seconds, resetting game...');
        this.resetGame();
      }
    } else {
      this.emptyTeamTimers.iovine = null;
    }

    if (youngPlayers.length === 0) {
      if (this.emptyTeamTimers.young === null) {
        this.emptyTeamTimers.young = now;
      } else if (now - this.emptyTeamTimers.young >= EMPTY_TEAM_RESET_THRESHOLD) {
        console.log('Team Young empty for 15+ seconds, resetting game...');
        this.resetGame();
      }
    } else {
      this.emptyTeamTimers.young = null;
    }

    return {
      players: {
        iovine: iovinePlayers,
        young: youngPlayers
      },
      scores: this.state.scores,
      status: this.state.status,
      winner: this.state.winner
    };
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
  }
}

export const gameManager = new GameManager();
