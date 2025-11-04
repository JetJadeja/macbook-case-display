import express, { Request, Response } from 'express';
import cors from 'cors';
import { gameManager } from './game';
import { Team } from './types';
import { getAvailableItems, SHOP_CATALOG } from './shopCatalog';
import { BUILD_PATHS } from './buildPaths';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

/**
 * GET /api/game
 * Get current game state
 */
app.get('/api/game', (req: Request, res: Response) => {
  const gameState = gameManager.getGameState();
  res.json(gameState);
});

/**
 * GET /api/scoreboard
 * Get scoreboard data for physical display
 * Returns scores, phase, winner, winThreshold, and barPosition (-100 to +100)
 */
app.get('/api/scoreboard', (req: Request, res: Response) => {
  const gameState = gameManager.getGameState();

  // Calculate bar position (-100 to +100)
  // -100 = Team Iovine winning (bar left)
  // 0 = Tied (bar center)
  // +100 = Team Young winning (bar right)
  let barPosition = 0;

  const totalScore = gameState.scores.iovine + gameState.scores.young;

  if (totalScore > 0) {
    const iovinePercent = gameState.scores.iovine / totalScore;
    const youngPercent = gameState.scores.young / totalScore;
    barPosition = Math.round((youngPercent - iovinePercent) * 100);
  }

  res.json({
    scores: gameState.scores,
    phase: gameState.phase,
    winner: gameState.winner,
    winThreshold: gameState.winThreshold,
    barPosition
  });
});

/**
 * POST /api/join
 * Join a team
 * Body: { name: string, team: 'iovine' | 'young' }
 */
app.post('/api/join', (req: Request, res: Response) => {
  const { name, team } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ error: 'Name is required' });
  }

  if (team !== 'iovine' && team !== 'young') {
    return res.status(400).json({ error: 'Team must be "iovine" or "young"' });
  }

  const player = gameManager.joinGame(name.trim(), team as Team);

  // If player is null, joining is blocked (warmup/active/ended phase)
  if (!player) {
    const gameState = gameManager.getGameState();
    return res.status(403).json({
      error: 'Game in progress - joining disabled',
      phase: gameState.phase
    });
  }

  const gameState = gameManager.getGameState();

  res.json({
    playerId: player.id,
    gameState
  });
});

/**
 * POST /api/click
 * Register a click
 * Body: { playerId: string }
 */
app.post('/api/click', (req: Request, res: Response) => {
  const { playerId } = req.body;

  if (!playerId || typeof playerId !== 'string') {
    return res.status(400).json({ error: 'Player ID is required' });
  }

  const result = gameManager.registerClick(playerId);

  if (!result.success) {
    return res.status(404).json({ error: 'Player not found' });
  }

  res.json({ scores: result.scores, coins: result.coins, stats: result.stats });
});

/**
 * POST /api/heartbeat
 * Update player's last seen timestamp
 * Body: { playerId: string }
 */
app.post('/api/heartbeat', (req: Request, res: Response) => {
  const { playerId } = req.body;

  if (!playerId || typeof playerId !== 'string') {
    return res.status(400).json({ error: 'Player ID is required' });
  }

  const success = gameManager.updateHeartbeat(playerId);

  if (!success) {
    return res.status(404).json({ error: 'Player not found' });
  }

  res.json({ success: true });
});

/**
 * GET /api/shop
 * Get available shop items for a player
 * Query params: playerId
 */
app.get('/api/shop', (req: Request, res: Response) => {
  const { playerId } = req.query;

  if (!playerId || typeof playerId !== 'string') {
    return res.status(400).json({ error: 'Player ID is required' });
  }

  const gameState = gameManager.getGameState();
  // Find player in the raw internal state (not in response)
  const player = Array.from((gameManager as any).state.players.values())
    .find((p: any) => p.id === playerId);

  if (!player) {
    return res.status(404).json({ error: 'Player not found' });
  }

  const availableItems = getAvailableItems(player, (gameManager as any).state);

  // Get team purchased items with purchaser info
  const teamUpgrades = (gameManager as any).state.teamUpgrades[player.team];
  const teamPurchaseMap = new Map<string, { purchasedBy: string; purchasedByYou: boolean }>();

  for (const upgrade of teamUpgrades) {
    const purchaser = Array.from((gameManager as any).state.players.values())
      .find((p: any) => p.id === upgrade.purchasedBy);
    teamPurchaseMap.set(upgrade.itemId, {
      purchasedBy: purchaser ? purchaser.name : 'Unknown',
      purchasedByYou: upgrade.purchasedBy === playerId
    });
  }

  // Enhance items with ownership info
  const enhancedItems = availableItems.map((item: any) => {
    const teamOwnership = teamPurchaseMap.get(item.id);
    return {
      ...item,
      ownedByTeam: !!teamOwnership,
      purchasedBy: teamOwnership?.purchasedBy,
      purchasedByYou: teamOwnership?.purchasedByYou || false
    };
  });

  // Also include team-owned items that were filtered out
  const ownedTeamItems = SHOP_CATALOG
    .filter(item => item.purchaseType === 'team' && teamPurchaseMap.has(item.id))
    .map(item => {
      const ownership = teamPurchaseMap.get(item.id)!;
      return {
        ...item,
        ownedByTeam: true,
        purchasedBy: ownership.purchasedBy,
        purchasedByYou: ownership.purchasedByYou
      };
    });

  res.json({
    items: enhancedItems,
    ownedTeamItems: ownedTeamItems,
    buildPaths: BUILD_PATHS,
    playerCoins: player.coins,
    selectedBuildPath: player.selectedBuildPath,
    purchasedItems: player.purchasedItems.map((p: any) => p.itemId)
  });
});

/**
 * POST /api/shop/purchase
 * Purchase a shop item
 * Body: { playerId: string, itemId: string }
 */
app.post('/api/shop/purchase', (req: Request, res: Response) => {
  const { playerId, itemId } = req.body;

  if (!playerId || typeof playerId !== 'string') {
    return res.status(400).json({ error: 'Player ID is required' });
  }

  if (!itemId || typeof itemId !== 'string') {
    return res.status(400).json({ error: 'Item ID is required' });
  }

  const result = gameManager.purchaseItem(playerId, itemId);

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  res.json({
    success: true,
    newCoins: result.newCoins,
    stats: result.stats
  });
});

/**
 * POST /api/shop/select-path
 * Select a build path
 * Body: { playerId: string, pathId: string }
 */
app.post('/api/shop/select-path', (req: Request, res: Response) => {
  const { playerId, pathId } = req.body;

  if (!playerId || typeof playerId !== 'string') {
    return res.status(400).json({ error: 'Player ID is required' });
  }

  if (!pathId || typeof pathId !== 'string') {
    return res.status(400).json({ error: 'Path ID is required' });
  }

  const result = gameManager.selectBuildPath(playerId, pathId);

  if (!result.success) {
    return res.status(404).json({ error: result.error });
  }

  res.json({ success: true });
});

/**
 * POST /api/reset
 * Reset the game (for testing)
 */
app.post('/api/reset', (req: Request, res: Response) => {
  gameManager.resetGame();
  res.json({ message: 'Game reset successfully' });
});

/**
 * POST /api/debug/update-player
 * Update player's coins and clicks (for debugging)
 * Body: { playerId: string, coins: number, clicks: number }
 */
app.post('/api/debug/update-player', (req: Request, res: Response) => {
  const { playerId, coins, clicks } = req.body;

  if (!playerId || typeof playerId !== 'string') {
    return res.status(400).json({ error: 'Player ID is required' });
  }

  if (typeof coins !== 'number' || typeof clicks !== 'number') {
    return res.status(400).json({ error: 'Coins and clicks must be numbers' });
  }

  const result = gameManager.debugUpdatePlayer(playerId, coins, clicks);

  if (!result.success) {
    return res.status(404).json({ error: result.error });
  }

  res.json({ success: true, coins, clicks });
});

/**
 * POST /api/debug/set-scores
 * Set team scores directly (for testing scoreboard)
 * Body: { iovine: number, young: number, phase?: string, winThreshold?: number }
 */
app.post('/api/debug/set-scores', (req: Request, res: Response) => {
  const { iovine, young, phase, winThreshold } = req.body;

  if (typeof iovine !== 'number' || typeof young !== 'number') {
    return res.status(400).json({ error: 'Iovine and young scores must be numbers' });
  }

  const result = gameManager.debugSetScores(iovine, young, phase, winThreshold);

  res.json({
    success: result.success,
    scores: { iovine, young },
    phase: phase || 'unchanged',
    winThreshold: winThreshold || 'unchanged'
  });
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
