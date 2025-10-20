import { GameState, Player, Team, GameStateResponse } from './types';
import { randomUUID } from 'crypto';

class GameManager {
  private state: GameState;

  constructor() {
    this.state = {
      players: new Map(),
      scores: { left: 0, right: 0 },
      status: 'waiting',
      winner: null
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
      clicks: 0
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
  registerClick(playerId: string): { success: boolean; scores: { left: number; right: number } } {
    const player = this.state.players.get(playerId);

    if (!player) {
      return { success: false, scores: this.state.scores };
    }

    player.clicks += 1;

    if (player.team === 'left') {
      this.state.scores.left += 1;
    } else {
      this.state.scores.right += 1;
    }

    return { success: true, scores: this.state.scores };
  }

  /**
   * Get current game state
   */
  getGameState(): GameStateResponse {
    const leftPlayers = Array.from(this.state.players.values())
      .filter(p => p.team === 'left')
      .map(p => ({ name: p.name, clicks: p.clicks }));

    const rightPlayers = Array.from(this.state.players.values())
      .filter(p => p.team === 'right')
      .map(p => ({ name: p.name, clicks: p.clicks }));

    return {
      players: {
        left: leftPlayers,
        right: rightPlayers
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
      scores: { left: 0, right: 0 },
      status: 'waiting',
      winner: null
    };
  }
}

export const gameManager = new GameManager();
