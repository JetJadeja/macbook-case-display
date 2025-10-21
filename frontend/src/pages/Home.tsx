import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArcadeBackground } from "../components/ArcadeBackground";
import { GameHeader } from "../components/GameHeader";
import { TeamCard } from "../components/TeamCard";
import { StatusPanel } from "../components/StatusPanel";
import { JoinForm } from "../components/JoinForm";
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
  phase: "waiting" | "warmup" | "active" | "ended";
  winner: string | null;
  warmupTimeRemaining?: number;
  winThreshold?: number;
  resetCountdown?: number;
}

function Home() {
  const navigate = useNavigate();
  const [name, setName] = useState<string>("");
  const [selectedTeam, setSelectedTeam] = useState<"iovine" | "young" | null>(
    null
  );
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch current game state on mount and poll every second
  useEffect(() => {
    fetchGameState();

    // Poll every second for live updates
    const interval = setInterval(() => {
      fetchGameState();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const fetchGameState = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/game");
      const data = await response.json();
      setGameState(data);
    } catch (error) {
      console.error("Failed to fetch game state:", error);
    }
  };

  const handleJoinGame = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !selectedTeam) return;

    setLoading(true);

    try {
      const response = await fetch("http://localhost:3001/api/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), team: selectedTeam }),
      });

      if (response.status === 403) {
        // Join blocked - game in progress
        setLoading(false);
        return;
      }

      const data = await response.json();

      // Navigate to game page with player info in state
      navigate("/game", {
        state: {
          playerId: data.playerId,
          playerName: name.trim(),
          playerTeam: selectedTeam,
        },
      });
    } catch (error) {
      console.error("Failed to join game:", error);
      setLoading(false);
    }
  };

  // Get join status message based on phase
  const getJoinMessage = () => {
    if (!gameState) return "";

    switch (gameState.phase) {
      case "warmup":
        return "WARMUP IN PROGRESS - Joining disabled";
      case "active":
        return "GAME IN PROGRESS - Joining locked";
      case "ended":
        return "Game ended - Resetting soon...";
      default:
        return "";
    }
  };

  const isJoinDisabled = gameState?.phase !== "waiting";

  return (
    <div className="h-screen bg-black relative overflow-hidden pixel-font">
      <ArcadeBackground />

      <div className="relative z-10 h-full flex flex-col items-center justify-center p-4 overflow-y-auto">
        <div className="w-full max-w-7xl space-y-4 py-4">
          <GameHeader />

          {/* Game Stats - Arcade Style */}
          {gameState && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <TeamCard
                teamName="IOVINE"
                score={gameState.scores.iovine}
                players={gameState.players.iovine}
                colorScheme="cyan"
              />

              <StatusPanel
                status={gameState.phase}
                resetCountdown={gameState.resetCountdown}
                iovineScore={gameState.scores.iovine}
                youngScore={gameState.scores.young}
              />

              <TeamCard
                teamName="YOUNG"
                score={gameState.scores.young}
                players={gameState.players.young}
                colorScheme="red"
              />
            </div>
          )}

          <JoinForm
            name={name}
            selectedTeam={selectedTeam}
            loading={loading}
            disabled={isJoinDisabled}
            message={getJoinMessage()}
            onNameChange={setName}
            onTeamSelect={setSelectedTeam}
            onSubmit={handleJoinGame}
          />

          <ArcadeFooter />
        </div>
      </div>
    </div>
  );
}

export default Home;
