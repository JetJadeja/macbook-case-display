import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";

interface Scores {
  iovine: number;
  young: number;
}

function Game() {
  const navigate = useNavigate();
  const location = useLocation();
  const [scores, setScores] = useState<Scores>({ iovine: 0, young: 0 });
  const [clicks, setClicks] = useState(0);
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

    // Send heartbeat every 3 seconds to let server know we're still here
    const heartbeatInterval = setInterval(() => {
      if (state.playerId) {
        sendHeartbeat(state.playerId);
      }
    }, 3000);

    return () => clearInterval(heartbeatInterval);
  }, [navigate, location]);

  const fetchGameState = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/game");
      const data = await response.json();
      setScores(data.scores);
    } catch (error) {
      console.error("Failed to fetch game state:", error);
    }
  };

  const sendHeartbeat = async (id: string) => {
    try {
      await fetch("http://localhost:3001/api/heartbeat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId: id }),
      });
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

      const data = await response.json();
      setScores(data.scores);
      setClicks((prev) => prev + 1);
    } catch (error) {
      console.error("Failed to register click:", error);
    }
  };

  const teamColor = playerTeam === "iovine" ? "blue" : "red";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <div className="w-full max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-bold text-white">Iovine vs. Young</h1>
          <p className="text-xl text-gray-300">
            Welcome, <span className="font-bold">{playerName}</span>!
          </p>
          <p
            className={`text-lg ${
              teamColor === "blue" ? "text-blue-400" : "text-red-400"
            }`}
          >
            Team {playerTeam?.charAt(0).toUpperCase()}
            {playerTeam?.slice(1)}
          </p>
        </div>

        {/* Score Display */}
        <div className="grid grid-cols-2 gap-6">
          <Card
            className={`${
              playerTeam === "iovine"
                ? "bg-blue-950 border-blue-800 ring-4 ring-blue-500"
                : "bg-blue-950 border-blue-800"
            }`}
          >
            <CardHeader>
              <CardTitle className="text-3xl text-blue-300">
                Iovine {playerTeam === "iovine" && "(You)"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-6xl font-bold text-blue-400">
                {scores.iovine}
              </div>
              <div className="text-sm text-blue-200 mt-2">clicks</div>
            </CardContent>
          </Card>

          <Card
            className={`${
              playerTeam === "young"
                ? "bg-red-950 border-red-800 ring-4 ring-red-500"
                : "bg-red-950 border-red-800"
            }`}
          >
            <CardHeader>
              <CardTitle className="text-3xl text-red-300">
                Young {playerTeam === "young" && "(You)"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-6xl font-bold text-red-400">
                {scores.young}
              </div>
              <div className="text-sm text-red-200 mt-2">clicks</div>
            </CardContent>
          </Card>
        </div>

        {/* Click Button */}
        <Card className="bg-gray-950 border-gray-700">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white">
              Click to Help Your Team!
            </CardTitle>
            <CardDescription className="text-base text-gray-300">
              You've clicked {clicks} times
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleClick}
              className={`w-full h-32 text-3xl font-bold ${
                teamColor === "blue"
                  ? "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
                  : "bg-red-600 hover:bg-red-700 active:bg-red-800"
              } transform active:scale-95 transition-transform`}
            >
              CLICK!
            </Button>
          </CardContent>
        </Card>

        {/* Leave Game */}
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="text-gray-400 hover:text-white"
          >
            Leave Game
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Game;
