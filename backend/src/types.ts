export type Team = 'iovine' | 'young';

export interface Player {
  id: string;
  name: string;
  team: Team;
  clicks: number;
  lastSeen: number; // timestamp in milliseconds
}

export interface GameState {
  players: Map<string, Player>;
  scores: {
    iovine: number;
    young: number;
  };
  status: 'waiting' | 'active' | 'ended';
  winner: Team | null;
}

export interface GameStateResponse {
  players: {
    iovine: Array<{ name: string; clicks: number }>;
    young: Array<{ name: string; clicks: number }>;
  };
  scores: {
    iovine: number;
    young: number;
  };
  status: 'waiting' | 'active' | 'ended';
  winner: Team | null;
}
