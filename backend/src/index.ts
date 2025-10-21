import express, { Request, Response } from 'express';
import cors from 'cors';
import { gameManager } from './game';
import { Team } from './types';

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

  res.json({ scores: result.scores, coins: result.coins });
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
 * POST /api/reset
 * Reset the game (for testing)
 */
app.post('/api/reset', (req: Request, res: Response) => {
  gameManager.resetGame();
  res.json({ message: 'Game reset successfully' });
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
