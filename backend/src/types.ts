export type Team = 'left' | 'right';

export interface Player {
  id: string;
  name: string;
  team: Team;
  clicks: number;
}

export interface GameState {
  players: Map<string, Player>;
  scores: {
    left: number;
    right: number;
  };
  status: 'waiting' | 'active' | 'ended';
  winner: Team | null;
}

export interface GameStateResponse {
  players: {
    left: Array<{ name: string; clicks: number }>;
    right: Array<{ name: string; clicks: number }>;
  };
  scores: {
    left: number;
    right: number;
  };
  status: 'waiting' | 'active' | 'ended';
  winner: Team | null;
}
