import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <div className="w-full max-w-6xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-6xl font-bold text-white">Iovine vs. Young</h1>
          <p className="text-xl text-gray-300">
            Choose your team and click faster than the opposition!
          </p>
        </div>

        {/* Current Game State */}
        {gameState && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Team Iovine */}
            <Card className="bg-blue-950 border-blue-800">
              <CardHeader>
                <CardTitle className="text-2xl text-blue-300">
                  Iovine
                </CardTitle>
                <CardDescription className="text-blue-200 text-lg font-semibold">
                  {gameState.players.iovine.length} players
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-bold text-blue-400">
                  {gameState.scores.iovine}
                </div>
                <div className="text-sm text-blue-200 mt-2 mb-4">clicks</div>

                {/* Player List */}
                {gameState.players.iovine.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-blue-800">
                    <div className="text-xs text-blue-300 font-semibold mb-2">PLAYERS:</div>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {gameState.players.iovine.map((player, idx) => (
                        <div
                          key={idx}
                          className="text-sm text-blue-200 flex justify-between"
                        >
                          <span>{player.name}</span>
                          <span className="text-blue-400">{player.clicks}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Status */}
            <Card className="bg-gray-950 border-gray-700">
              <CardHeader>
                <CardTitle className="text-center text-2xl text-white">
                  Game Status
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-xl text-gray-300 capitalize">
                  {gameState.status}
                </div>
              </CardContent>
            </Card>

            {/* Team Young */}
            <Card className="bg-red-950 border-red-800">
              <CardHeader>
                <CardTitle className="text-2xl text-red-300">
                  Young
                </CardTitle>
                <CardDescription className="text-red-200 text-lg font-semibold">
                  {gameState.players.young.length} players
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-bold text-red-400">
                  {gameState.scores.young}
                </div>
                <div className="text-sm text-red-200 mt-2 mb-4">clicks</div>

                {/* Player List */}
                {gameState.players.young.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-red-800">
                    <div className="text-xs text-red-300 font-semibold mb-2">PLAYERS:</div>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {gameState.players.young.map((player, idx) => (
                        <div
                          key={idx}
                          className="text-sm text-red-200 flex justify-between"
                        >
                          <span>{player.name}</span>
                          <span className="text-red-400">{player.clicks}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Join Form */}
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Join the Battle</CardTitle>
            <CardDescription className="text-base mt-2">
              Enter your name and pick your team
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleJoinGame} className="space-y-6">
              {/* Name Input */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-lg">
                  Your Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  required
                  autoFocus
                  className="text-base h-12"
                />
              </div>

              {/* Team Selection */}
              <div className="space-y-3">
                <Label className="text-lg">Choose Your Team</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    type="button"
                    onClick={() => setSelectedTeam("iovine")}
                    variant={selectedTeam === "iovine" ? "default" : "outline"}
                    className={`h-24 text-xl font-bold ${
                      selectedTeam === "iovine"
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "hover:bg-blue-950 hover:text-blue-300 hover:border-blue-600"
                    }`}
                  >
                    Iovine
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setSelectedTeam("young")}
                    variant={selectedTeam === "young" ? "default" : "outline"}
                    className={`h-24 text-xl font-bold ${
                      selectedTeam === "young"
                        ? "bg-red-600 hover:bg-red-700"
                        : "hover:bg-red-950 hover:text-red-300 hover:border-red-600"
                    }`}
                  >
                    Young
                  </Button>
                </div>
              </div>

              {/* Join Button */}
              <Button
                type="submit"
                disabled={!name.trim() || !selectedTeam || loading}
                className="w-full text-xl h-14 bg-green-600 hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? "Joining..." : "Join Game"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Home;
