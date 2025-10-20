/**
 * JoinForm Component
 *
 * Handles player onboarding with:
 * - Name input field
 * - Team selection (Iovine vs Young)
 * - Start game button
 * - Arcade-style credits display
 */

interface JoinFormProps {
  name: string;
  selectedTeam: "iovine" | "young" | null;
  loading: boolean;
  onNameChange: (name: string) => void;
  onTeamSelect: (team: "iovine" | "young") => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function JoinForm({
  name,
  selectedTeam,
  loading,
  onNameChange,
  onTeamSelect,
  onSubmit,
}: JoinFormProps) {
  return (
    <div className="relative max-w-2xl mx-auto">
      <div className="bg-black border-2 border-gray-800 rounded-lg p-4">
        <div className="text-center mb-4">
          <h2 className="text-lg text-white mb-1">ENTER GAME</h2>
          <div className="text-xs text-gray-600">SELECT YOUR TEAM</div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Name Input */}
          <div>
            <label className="block text-xs text-gray-400 mb-2 tracking-wider">
              PLAYER NAME
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
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
                onClick={() => onTeamSelect("iovine")}
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
                onClick={() => onTeamSelect("young")}
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
                      selectedTeam === "young" ? "text-red-300" : "text-red-600"
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
  );
}
