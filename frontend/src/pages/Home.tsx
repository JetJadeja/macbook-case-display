import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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
    <div className="h-screen bg-black relative overflow-hidden pixel-font">
      {/* CRT Scanlines Effect */}
      <div className="fixed inset-0 pointer-events-none z-50 scanlines opacity-10"></div>

      {/* Animated Background Grid */}
      <div className="fixed inset-0 bg-gradient-to-b from-purple-900/20 via-black to-blue-900/20"></div>
      <div className="fixed inset-0 bg-grid opacity-20"></div>

      <div className="relative z-10 h-full flex flex-col items-center justify-center p-4 overflow-y-auto">
        <div className="w-full max-w-7xl space-y-4 py-4">
          {/* Header */}
          <div className="text-center space-y-1">
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              IOVINE VS YOUNG
            </h1>
            <p className="text-xs text-gray-500">CLICK BATTLE</p>
          </div>

          {/* Game Stats - Arcade Style */}
          {gameState && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Team Iovine - Blue Side */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg blur opacity-60 group-hover:opacity-100 transition"></div>
                <div className="relative bg-black border-4 border-cyan-500 rounded-lg p-4 arcade-box-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-sm text-cyan-400 tracking-wider">
                      TEAM
                    </h2>
                    <div className="h-2 w-2 bg-cyan-400 rounded-full animate-pulse"></div>
                  </div>
                  <div className="text-2xl font-bold text-white mb-2 glitch-text">
                    IOVINE
                  </div>

                  {/* Score Display */}
                  <div className="bg-cyan-950/50 border-2 border-cyan-700 p-3 mb-3 rounded">
                    <div className="text-xs text-cyan-400 mb-1">SCORE</div>
                    <div className="text-3xl font-bold text-cyan-300 tabular-nums">
                      {gameState.scores.iovine.toString().padStart(6, "0")}
                    </div>
                  </div>

                  {/* Players */}
                  <div className="bg-black/50 border-2 border-cyan-800 p-2 rounded max-h-24 overflow-y-auto custom-scrollbar">
                    <div className="text-xs text-cyan-400 mb-2 flex items-center gap-2">
                      <span className="inline-block w-2 h-2 bg-cyan-400 animate-pulse"></span>
                      PLAYERS: {gameState.players.iovine.length}
                    </div>
                    {gameState.players.iovine.length > 0 ? (
                      <div className="space-y-1">
                        {gameState.players.iovine.map((player, idx) => (
                          <div
                            key={idx}
                            className="text-xs text-cyan-200 flex justify-between items-center bg-cyan-950/30 px-2 py-1 rounded"
                          >
                            <span className="truncate">{player.name}</span>
                            <span className="text-cyan-400 ml-2 tabular-nums">
                              {player.clicks}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-cyan-700 italic">
                        WAITING...
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Status - Center */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg blur opacity-60 group-hover:opacity-100 transition"></div>
                <div className="relative bg-black border-4 border-purple-500 rounded-lg p-4 arcade-box-shadow h-full flex flex-col items-center justify-center">
                  <div className="text-sm text-purple-400 mb-4 tracking-widest">
                    SYSTEM STATUS
                  </div>

                  {gameState.status === "ending" && gameState.resetCountdown ? (
                    <div className="text-center">
                      <div className="text-xl text-red-400 mb-4 animate-pulse">
                        !!! RESET !!!
                      </div>
                      <div className="text-6xl font-bold text-red-500 mb-2 animate-bounce">
                        {gameState.resetCountdown}
                      </div>
                      <div className="text-xs text-gray-500">SECONDS</div>
                    </div>
                  ) : gameState.status === "waiting" ? (
                    <div className="text-center">
                      <div className="text-2xl text-gray-500 mb-4">READY</div>
                      <div className="text-xs text-gray-600 animate-pulse">
                        INSERT COIN
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="text-3xl text-green-400 mb-2 animate-pulse">
                        ACTIVE
                      </div>
                      <div className="flex gap-1 justify-center">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-ping delay-100"></div>
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-ping delay-200"></div>
                      </div>
                    </div>
                  )}

                  {/* Score Difference Bar */}
                  <div className="w-full mt-4">
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden relative">
                      <div
                        className="absolute h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-300"
                        style={{
                          width: `${Math.abs(
                            (gameState.scores.iovine /
                              (gameState.scores.iovine +
                                gameState.scores.young +
                                1)) *
                              100
                          )}%`,
                          left:
                            gameState.scores.iovine > gameState.scores.young
                              ? "50%"
                              : "auto",
                          right:
                            gameState.scores.young > gameState.scores.iovine
                              ? "50%"
                              : "auto",
                        }}
                      ></div>
                      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Team Young - Red Side */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg blur opacity-60 group-hover:opacity-100 transition"></div>
                <div className="relative bg-black border-4 border-red-500 rounded-lg p-4 arcade-box-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-sm text-red-400 tracking-wider">
                      TEAM
                    </h2>
                    <div className="h-2 w-2 bg-red-400 rounded-full animate-pulse"></div>
                  </div>
                  <div className="text-2xl font-bold text-white mb-2 glitch-text">
                    YOUNG
                  </div>

                  {/* Score Display */}
                  <div className="bg-red-950/50 border-2 border-red-700 p-3 mb-3 rounded">
                    <div className="text-xs text-red-400 mb-1">SCORE</div>
                    <div className="text-3xl font-bold text-red-300 tabular-nums">
                      {gameState.scores.young.toString().padStart(6, "0")}
                    </div>
                  </div>

                  {/* Players */}
                  <div className="bg-black/50 border-2 border-red-800 p-2 rounded max-h-24 overflow-y-auto custom-scrollbar">
                    <div className="text-xs text-red-400 mb-2 flex items-center gap-2">
                      <span className="inline-block w-2 h-2 bg-red-400 animate-pulse"></span>
                      PLAYERS: {gameState.players.young.length}
                    </div>
                    {gameState.players.young.length > 0 ? (
                      <div className="space-y-1">
                        {gameState.players.young.map((player, idx) => (
                          <div
                            key={idx}
                            className="text-xs text-red-200 flex justify-between items-center bg-red-950/30 px-2 py-1 rounded"
                          >
                            <span className="truncate">{player.name}</span>
                            <span className="text-red-400 ml-2 tabular-nums">
                              {player.clicks}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-red-700 italic">
                        WAITING...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Join Form */}
          <div className="relative max-w-2xl mx-auto">
            <div className="bg-black border-2 border-gray-800 rounded-lg p-4">
              <div className="text-center mb-4">
                <h2 className="text-lg text-white mb-1">ENTER GAME</h2>
                <div className="text-xs text-gray-600">SELECT YOUR TEAM</div>
              </div>

              <form onSubmit={handleJoinGame} className="space-y-4">
                {/* Name Input */}
                <div>
                  <label className="block text-xs text-gray-400 mb-2 tracking-wider">
                    PLAYER NAME
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ENTER NAME"
                    required
                    autoFocus
                    className="w-full bg-black border-2 border-gray-700 rounded px-4 py-3 text-white text-sm focus:border-white focus:outline-none transition placeholder-gray-600 uppercase"
                  />
                </div>

                {/* Team Selection */}
                <div>
                  <label className="block text-xs text-gray-400 mb-3 tracking-wider">
                    SELECT TEAM
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Iovine Button */}
                    <button
                      type="button"
                      onClick={() => setSelectedTeam("iovine")}
                      className={`relative group h-24 rounded-lg border-4 transition-all ${
                        selectedTeam === "iovine"
                          ? "border-cyan-400 bg-cyan-950/50 scale-105"
                          : "border-cyan-800 bg-black hover:border-cyan-600"
                      }`}
                    >
                      <div
                        className={`absolute inset-0 rounded-lg blur transition ${
                          selectedTeam === "iovine"
                            ? "bg-cyan-500/30"
                            : "bg-cyan-500/10 group-hover:bg-cyan-500/20"
                        }`}
                      ></div>
                      <div className="relative h-full flex flex-col items-center justify-center">
                        <div
                          className={`text-2xl font-bold mb-2 ${
                            selectedTeam === "iovine"
                              ? "text-cyan-300"
                              : "text-cyan-600"
                          }`}
                        >
                          IOVINE
                        </div>
                        {selectedTeam === "iovine" && (
                          <div className="text-xs text-cyan-400 animate-pulse">
                            &gt;&gt; SELECTED &lt;&lt;
                          </div>
                        )}
                      </div>
                    </button>

                    {/* Young Button */}
                    <button
                      type="button"
                      onClick={() => setSelectedTeam("young")}
                      className={`relative group h-24 rounded-lg border-4 transition-all ${
                        selectedTeam === "young"
                          ? "border-red-400 bg-red-950/50 scale-105"
                          : "border-red-800 bg-black hover:border-red-600"
                      }`}
                    >
                      <div
                        className={`absolute inset-0 rounded-lg blur transition ${
                          selectedTeam === "young"
                            ? "bg-red-500/30"
                            : "bg-red-500/10 group-hover:bg-red-500/20"
                        }`}
                      ></div>
                      <div className="relative h-full flex flex-col items-center justify-center">
                        <div
                          className={`text-2xl font-bold mb-2 ${
                            selectedTeam === "young"
                              ? "text-red-300"
                              : "text-red-600"
                          }`}
                        >
                          YOUNG
                        </div>
                        {selectedTeam === "young" && (
                          <div className="text-xs text-red-400 animate-pulse">
                            &gt;&gt; SELECTED &lt;&lt;
                          </div>
                        )}
                      </div>
                    </button>
                  </div>
                </div>

                {/* Start Button */}
                <button
                  type="submit"
                  disabled={!name.trim() || !selectedTeam || loading}
                  className="w-full relative group h-12 rounded-lg overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 group-hover:from-green-500 group-hover:to-emerald-500 transition"></div>
                  <div className="absolute inset-0 bg-green-400/20 group-hover:bg-green-400/30 blur"></div>
                  <div className="relative h-full flex items-center justify-center border-4 border-green-400 rounded-lg">
                    <span className="text-base text-white font-bold tracking-widest">
                      {loading ? "LOADING..." : "▶ START GAME ◀"}
                    </span>
                  </div>
                </button>
              </form>

              {/* Arcade Credits */}
              <div className="mt-3 text-center text-xs text-gray-600">
                <div>CREDITS: ∞</div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-gray-700 mt-2">
            <div className="animate-pulse">▲ ▼ ◄ ► [A] [B] START SELECT</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
