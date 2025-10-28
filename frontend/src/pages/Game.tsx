import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArcadeBackground } from "../components/ArcadeBackground";
import { PlayerBanner } from "../components/PlayerBanner";
import { TeamCard } from "../components/TeamCard";
import { ClickButton } from "../components/ClickButton";
import { TugOfWarBar } from "../components/TugOfWarBar";
import { GameControls } from "../components/GameControls";
import { ArcadeFooter } from "../components/ArcadeFooter";
import { ShopModal } from "../components/ShopModal";
import { ActiveEffectsBar, ActiveEffect } from "../components/ActiveEffectsBar";
import { WarmupBanner } from "../components/WarmupBanner";
import { LeaveGameModal } from "../components/LeaveGameModal";
import { PostWarmupModal } from "../components/PostWarmupModal";
import { VictoryModal } from "../components/VictoryModal";
import { config } from "../config";

interface GameState {
  players: {
    iovine: Array<{
      name: string;
      clicks: number;
      coins: number;
      activeEffects: ActiveEffect[];
    }>;
    young: Array<{
      name: string;
      clicks: number;
      coins: number;
      activeEffects: ActiveEffect[];
    }>;
  };
  scores: {
    iovine: number;
    young: number;
  };
  phase: "waiting" | "warmup" | "active" | "ended";
  winner: string | null;
  warmupTimeRemaining?: number;
  winThreshold?: number;
}

function Game() {
  const navigate = useNavigate();
  const location = useLocation();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [personalClicks, setPersonalClicks] = useState(0);
  const [coins, setCoins] = useState(0);
  const [activeEffects, setActiveEffects] = useState<ActiveEffect[]>([]);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [showPostWarmupModal, setShowPostWarmupModal] = useState(false);
  const [hasShownPostWarmup, setHasShownPostWarmup] = useState(false);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState<string | null>(null);
  const [playerTeam, setPlayerTeam] = useState<"iovine" | "young" | null>(null);

  useEffect(() => {
    // Get player info from navigation state
    const state = location.state as {
      playerId?: string;
      playerName?: string;
      playerTeam?: "iovine" | "young";
    } | null;

    if (!state?.playerId || !state?.playerName || !state?.playerTeam) {
      // Redirect back to home if no player info
      navigate("/");
      return;
    }

    setPlayerId(state.playerId);
    setPlayerName(state.playerName);
    setPlayerTeam(state.playerTeam);

    // Fetch initial game state
    fetchGameState();

    // Poll for game state updates every second
    const gameStateInterval = setInterval(() => {
      fetchGameState();
    }, 1000);

    // Send heartbeat every 3 seconds to let server know we're still here
    const heartbeatInterval = setInterval(() => {
      if (state.playerId) {
        sendHeartbeat(state.playerId);
      }
    }, 3000);

    return () => {
      clearInterval(gameStateInterval);
      clearInterval(heartbeatInterval);
    };
  }, [navigate, location]);

  const fetchGameState = async () => {
    try {
      const response = await fetch(`${config.backendUrl}/api/game`);
      const data = await response.json();
      setGameState(data);

      // Update personal data from game state
      if (playerName && playerTeam) {
        const myTeamPlayers = data.players[playerTeam];
        const myPlayer = myTeamPlayers.find((p: any) => p.name === playerName);
        if (myPlayer) {
          setCoins(myPlayer.coins ?? 0);
          setActiveEffects(myPlayer.activeEffects ?? []);
        }
      }
    } catch (error) {
      console.error("Failed to fetch game state:", error);
    }
  };

  // Watch for phase changes to show post-warmup modal
  useEffect(() => {
    if (
      gameState?.phase === "active" &&
      gameState.winThreshold &&
      !hasShownPostWarmup
    ) {
      setShowPostWarmupModal(true);
      setHasShownPostWarmup(true);
    }
  }, [gameState?.phase, gameState?.winThreshold, hasShownPostWarmup]);

  const sendHeartbeat = async (id: string) => {
    try {
      const response = await fetch(`${config.backendUrl}/api/heartbeat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId: id }),
      });

      // If player not found (kicked/reset), redirect to home
      if (response.status === 404) {
        console.log("Player kicked from game, redirecting to home...");
        navigate("/");
      }
    } catch (error) {
      console.error("Failed to send heartbeat:", error);
    }
  };

  const handleClick = async () => {
    if (!playerId) return;

    try {
      const response = await fetch(`${config.backendUrl}/api/click`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId }),
      });

      // If player not found (kicked/reset), redirect to home
      if (response.status === 404) {
        console.log("Player kicked from game, redirecting to home...");
        navigate("/");
        return;
      }

      const data = await response.json();
      setGameState((prev) =>
        prev
          ? {
              ...prev,
              scores: data.scores,
            }
          : null
      );
      setPersonalClicks((prev) => prev + 1);
      // Ensure coins is always a valid number
      setCoins(data.coins ?? 0);
    } catch (error) {
      console.error("Failed to register click:", error);
    }
  };

  const handleLeaveGame = () => {
    // If waiting or ended phase, leave immediately
    if (
      !gameState ||
      gameState.phase === "waiting" ||
      gameState.phase === "ended"
    ) {
      navigate("/");
      return;
    }

    // If warmup or active, show confirmation modal
    setIsLeaveModalOpen(true);
  };

  const confirmLeaveGame = () => {
    setIsLeaveModalOpen(false);
    navigate("/");
  };

  const handleOpenShop = () => {
    setIsShopOpen(true);
  };

  const handleCloseShop = () => {
    setIsShopOpen(false);
  };

  const handlePurchase = async (itemId: string, cost: number) => {
    // Placeholder for shop purchase logic
    // TODO: Implement backend endpoint for purchasing items
    console.log(`Purchasing ${itemId} for ${cost} coins`);

    // For now, just deduct coins locally (will be replaced with API call)
    if (coins >= cost) {
      setCoins(coins - cost);
      setIsShopOpen(false);
      // TODO: Add item to activeEffects
    }
  };

  if (!playerName || !playerTeam || !gameState) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-white text-2xl animate-pulse">LOADING...</div>
      </div>
    );
  }

  const teamColor = playerTeam === "iovine" ? "cyan" : "red";

  return (
    <div className="h-screen bg-black relative overflow-hidden pixel-font">
      <ArcadeBackground />

      {/* Warmup Banner - Fixed at top */}
      {gameState?.phase === "warmup" && (
        <WarmupBanner timeRemaining={gameState.warmupTimeRemaining ?? 30} />
      )}

      <div className="relative z-10 h-full flex flex-col items-center justify-center p-4 overflow-y-auto">
        <div
          className={`w-full max-w-7xl space-y-6 py-4 ${
            gameState?.phase === "warmup" ? "pt-32" : ""
          }`}
        >
          {/* Player Banner */}
          <PlayerBanner
            playerName={playerName}
            team={playerTeam}
            coins={coins}
          />

          {/* Active Effects Bar */}
          {activeEffects.length > 0 && (
            <ActiveEffectsBar effects={activeEffects} />
          )}

          {/* Main Game Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Team Iovine */}
            <div className="flex flex-col justify-center">
              <TeamCard
                teamName="IOVINE"
                score={gameState.scores.iovine}
                players={gameState.players.iovine}
                colorScheme="cyan"
              />
            </div>

            {/* Center: Click Button */}
            <div className="flex flex-col justify-center">
              <ClickButton
                onClick={handleClick}
                teamColor={teamColor}
                personalClicks={personalClicks}
              />
            </div>

            {/* Team Young */}
            <div className="flex flex-col justify-center">
              <TeamCard
                teamName="YOUNG"
                score={gameState.scores.young}
                players={gameState.players.young}
                colorScheme="red"
              />
            </div>
          </div>

          {/* Tug of War Visual */}
          <TugOfWarBar
            iovineScore={gameState.scores.iovine}
            youngScore={gameState.scores.young}
            winThreshold={gameState.winThreshold}
          />

          {/* Game Controls */}
          <GameControls
            onLeaveGame={handleLeaveGame}
            onOpenShop={handleOpenShop}
          />

          {/* Footer */}
          <ArcadeFooter />
        </div>
      </div>

      {/* Shop Modal */}
      <ShopModal
        isOpen={isShopOpen}
        onClose={handleCloseShop}
        coins={coins}
        onPurchase={handlePurchase}
        phase={gameState?.phase}
        warmupTimeRemaining={gameState?.warmupTimeRemaining}
      />

      {/* Leave Confirmation Modal */}
      <LeaveGameModal
        isOpen={isLeaveModalOpen}
        phase={gameState?.phase || "waiting"}
        onCancel={() => setIsLeaveModalOpen(false)}
        onConfirm={confirmLeaveGame}
      />

      {/* Post-Warmup Modal */}
      {showPostWarmupModal && gameState?.winThreshold && (
        <PostWarmupModal
          winThreshold={gameState.winThreshold}
          onClose={() => setShowPostWarmupModal(false)}
        />
      )}

      {/* Victory Modal */}
      {gameState?.phase === "ended" && gameState.winner && playerTeam && (
        <VictoryModal
          winner={gameState.winner as "iovine" | "young"}
          playerTeam={playerTeam}
          onRedirect={() => navigate("/")}
        />
      )}
    </div>
  );
}

export default Game;
