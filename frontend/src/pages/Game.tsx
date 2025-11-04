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
import { DebugModal } from "../components/DebugModal";
import { config } from "../config";

interface GameState {
  players: {
    iovine: Array<{
      name: string;
      clicks: number;
      coins: number;
      activeEffects: ActiveEffect[];
      passiveIncomeRate: number;
    }>;
    young: Array<{
      name: string;
      clicks: number;
      coins: number;
      activeEffects: ActiveEffect[];
      passiveIncomeRate: number;
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
  const [personalScore, setPersonalScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [passiveIncomeRate, setPassiveIncomeRate] = useState(0);
  const [activeEffects, setActiveEffects] = useState<ActiveEffect[]>([]);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [showPostWarmupModal, setShowPostWarmupModal] = useState(false);
  const [hasShownPostWarmup, setHasShownPostWarmup] = useState(false);
  const [isDebugModalOpen, setIsDebugModalOpen] = useState(false);
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
          setPassiveIncomeRate(myPlayer.passiveIncomeRate ?? 0);
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

  // Keyboard shortcut listener for debug modal (Cmd+J or Ctrl+J)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "j") {
        e.preventDefault();
        setIsDebugModalOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Local passive income ticker - increments coins every second
  useEffect(() => {
    // Only run during active phase and if passive income > 0
    if (gameState?.phase !== "active" || passiveIncomeRate <= 0) {
      return;
    }

    const interval = setInterval(() => {
      setCoins((prev) => prev + passiveIncomeRate);
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState?.phase, passiveIncomeRate]);

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

      // Calculate score contribution from this click
      const scoreContribution = data.stats
        ? 1.0 * data.stats.totalClickMultiplier
        : 1.0;

      // Log changes for debugging
      const oldCoins = coins;
      const newCoins = data.coins ?? 0;
      const coinGain = newCoins - oldCoins;

      console.log(`[CLICK] Score contribution: +${scoreContribution.toFixed(2)}`);
      console.log(`[CLICK] Coins: ${oldCoins.toFixed(2)} → ${newCoins.toFixed(2)} (+${coinGain.toFixed(2)})`);
      if (data.stats) {
        console.log(`[CLICK] Multipliers: Click=${data.stats.totalClickMultiplier.toFixed(2)}x, Coin=${data.stats.totalCoinMultiplier.toFixed(2)}x`);
      }

      setGameState((prev) =>
        prev
          ? {
              ...prev,
              scores: data.scores,
            }
          : null
      );
      setPersonalClicks((prev) => prev + 1);
      setPersonalScore((prev) => prev + scoreContribution);
      setCoins(newCoins);
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

  const handlePurchase = async (itemId: string) => {
    if (!playerId) return;

    try {
      const response = await fetch(`${config.backendUrl}/api/shop/purchase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, itemId }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Purchase failed:", error.error);
        alert(`Purchase failed: ${error.error}`);
        return;
      }

      const data = await response.json();

      // Update coins
      if (data.newCoins !== undefined) {
        setCoins(data.newCoins);
      }

      // Close shop and show success
      setIsShopOpen(false);
      console.log(`Successfully purchased ${itemId}`);

    } catch (error) {
      console.error("Failed to purchase item:", error);
      alert("Failed to purchase item. Please try again.");
    }
  };

  const handleDebugUpdate = async (newCoins: number, newClicks: number) => {
    if (!playerId) return;

    try {
      const response = await fetch(`${config.backendUrl}/api/debug/update-player`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId,
          coins: newCoins,
          clicks: newClicks,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Debug update failed:", error.error);
        alert(`Debug update failed: ${error.error}`);
        return;
      }

      // Update local state immediately for responsiveness
      setCoins(newCoins);
      setPersonalClicks(newClicks);
      setPersonalScore(newClicks); // Also update personal score to match
      console.log(`Debug: Updated coins to ${newCoins}, clicks/score to ${newClicks}`);
    } catch (error) {
      console.error("Failed to update debug values:", error);
      alert("Failed to update debug values. Please try again.");
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
            passiveIncomeRate={passiveIncomeRate}
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
                personalClicks={personalScore}
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
        playerId={playerId}
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

      {/* Debug Modal */}
      <DebugModal
        isOpen={isDebugModalOpen}
        onClose={() => setIsDebugModalOpen(false)}
        currentCoins={coins}
        currentClicks={personalClicks}
        onUpdate={handleDebugUpdate}
      />
    </div>
  );
}

export default Game;
