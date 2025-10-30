/**
 * Build Paths - Static definitions for 5 distinct play styles
 */

export interface BuildPath {
  id: string;
  name: string;
  description: string;
  strategy: string;
  icon: string;
  color: string;
  itemSequence: string[];
  timeline: string;
}

export const BUILD_PATHS: BuildPath[] = [
  {
    id: 'power-rush',
    name: 'Power Rush',
    description: 'Maximize personal click power early',
    strategy: 'Buy cheap multipliers immediately to get ahead. Focus on Starter → Power Surge → Mega Force. Ignore economy, just click fast and scale your points. Best for aggressive players who want immediate impact.',
    icon: '⚡',
    color: 'yellow',
    itemSequence: [
      'starter-boost',
      'power-surge',
      'mega-force',
      'ultra-power',
      'god-mode'
    ],
    timeline: 'Min 1: Starter (1.2x) → Min 2: Power Surge (1.8x) → Min 4: Mega Force (3.6x) → Min 6: Ultra Power (10.8x)'
  },

  {
    id: 'economist',
    name: 'Economist',
    description: 'Invest in coin generation for late-game power',
    strategy: 'Sacrifice early power for massive late game. Buy Penny Saver + Money Maker + Interest items to generate tons of coins. Around minute 4-5, cash out with big multipliers. Requires patience and planning.',
    icon: '💰',
    color: 'green',
    itemSequence: [
      'penny-saver',
      'interest-i',
      'money-maker',
      'interest-ii',
      'tycoon',
      'ultra-power'
    ],
    timeline: 'Min 1-3: Economy setup (1.5x → 2x → 3x coins) → Min 4-6: Cash out with high-tier power items'
  },

  {
    id: 'team-player',
    name: 'Team Player',
    description: 'Sacrifice personal power to buff entire team',
    strategy: 'Coordinate with teammates. You buy 1-2 team auras (Rally Cry, War Drums) to give everyone +10-20% boost. Your team will carry you if they buy personal multipliers. Works best with 5+ teammates.',
    icon: '👥',
    color: 'purple',
    itemSequence: [
      'penny-saver',
      'rally-cry',
      'starter-boost',
      'war-drums',
      'power-surge'
    ],
    timeline: 'Min 2-3: Rally Cry (team +10%) → Min 5: War Drums (team +20%) → Rest: personal boosts'
  },

  {
    id: 'balanced',
    name: 'Balanced',
    description: 'Mix of economy and power for flexibility',
    strategy: 'The safe pick. Buy cheap economy early (Penny Saver), then layer in power items (Starter, Power Surge, Mega Force). Adapts well to game state. Good for beginners or uncertain situations.',
    icon: '⚖️',
    color: 'cyan',
    itemSequence: [
      'starter-boost',
      'penny-saver',
      'power-surge',
      'money-maker',
      'mega-force',
      'ultra-power'
    ],
    timeline: 'Mix throughout - always have economy + power scaling together. Flexible timing based on game state.'
  },

  {
    id: 'aggressor',
    name: 'Aggressor',
    description: 'Attack enemy team with sabotage and disruption',
    strategy: 'Get basic economy, then spend on offensive items (Minor Sabotage, Heist, Major Sabotage). Reduce enemy score by 10-20% total and steal their coins. High risk, high reward. Best when you have a lead.',
    icon: '⚔️',
    color: 'red',
    itemSequence: [
      'penny-saver',
      'starter-boost',
      'minor-sabotage',
      'coin-heist',
      'major-sabotage',
      'devastate'
    ],
    timeline: 'Min 1-2: Setup economy → Min 3: Minor Sabotage (enemy -5%) → Min 5: Major Sabotage (enemy -12%)'
  }
];

/**
 * Get build path by ID
 */
export function getBuildPath(pathId: string): BuildPath | null {
  return BUILD_PATHS.find(path => path.id === pathId) || null;
}
