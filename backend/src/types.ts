export type Team = 'iovine' | 'young';

export type GamePhase = 'waiting' | 'warmup' | 'active' | 'ended';

export type EffectType = 'ban-shield' | 'pause-shield' | 'full-shield' | 'click-multiplier' | 'coin-multiplier' | 'paused' | 'banned';

export interface ActiveEffect {
  type: EffectType;
  expiresAt: number; // timestamp in milliseconds
  value?: number; // multiplier value or other effect-specific data
}

export interface Player {
  id: string;
  name: string;
  team: Team;
  clicks: number;
  coins: number; // shop currency (earned separately from clicks)
  lastSeen: number; // timestamp in milliseconds
  activeEffects: ActiveEffect[];
}

export interface GameState {
  players: Map<string, Player>;
  scores: {
    iovine: number;
    young: number;
  };
  phase: GamePhase;
  winner: Team | null;
  warmupStartTime: number | null;
  warmupDuration: number; // milliseconds (30000 = 30 seconds)
  winThreshold: number | null;
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
