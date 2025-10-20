import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArcadeBackground } from "../components/ArcadeBackground";
import { PlayerBanner } from "../components/PlayerBanner";
import { TeamCard } from "../components/TeamCard";
import { ClickButton } from "../components/ClickButton";
import { TugOfWarBar } from "../components/TugOfWarBar";
import { GameControls } from "../components/GameControls";
import { ArcadeFooter } from "../components/ArcadeFooter";

interface GameState {
  players: {
    iovine: Array<{ name: string; clicks: number }>;
    young: Array<{ name: string; clicks: number }>;
  };
  scores: {
    iovine: number;
    young: number;
  };
  status: string;
  winner: string | null;
}

function Game() {
  const navigate = useNavigate();
  const location = useLocation();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [personalClicks, setPersonalClicks] = useState(0);
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
      const response = await fetch("http://localhost:3001/api/game");
      const data = await response.json();
      setGameState(data);
    } catch (error) {
      console.error("Failed to fetch game state:", error);
    }
  };

  const sendHeartbeat = async (id: string) => {
    try {
      const response = await fetch("http://localhost:3001/api/heartbeat", {
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
      const response = await fetch("http://localhost:3001/api/click", {
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
    } catch (error) {
      console.error("Failed to register click:", error);
    }
  };

  const handleLeaveGame = () => {
    navigate("/");
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

      <div className="relative z-10 h-full flex flex-col items-center justify-center p-4 overflow-y-auto">
        <div className="w-full max-w-7xl space-y-6 py-4">
          {/* Player Banner */}
          <PlayerBanner playerName={playerName} team={playerTeam} />

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
          />

          {/* Game Controls */}
          <GameControls onLeaveGame={handleLeaveGame} />

          {/* Footer */}
          <ArcadeFooter />
        </div>
      </div>
    </div>
  );
}

export default Game;
