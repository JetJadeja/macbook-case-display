import { TeamSelectButton } from "./TeamSelectButton";
import { ArcadeButton } from "./ArcadeButton";

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
  disabled?: boolean;
  message?: string;
  onNameChange: (name: string) => void;
  onTeamSelect: (team: "iovine" | "young") => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function JoinForm({
  name,
  selectedTeam,
  loading,
  disabled = false,
  message = "",
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
              <TeamSelectButton
                teamName="IOVINE"
                isSelected={selectedTeam === "iovine"}
                onClick={() => onTeamSelect("iovine")}
                colorScheme="cyan"
              />

              <TeamSelectButton
                teamName="YOUNG"
                isSelected={selectedTeam === "young"}
                onClick={() => onTeamSelect("young")}
                colorScheme="red"
              />
            </div>
          </div>

          {/* Message (error/warning) */}
          {message && (
            <div className="bg-yellow-900/50 border-2 border-yellow-600 rounded px-4 py-3 text-center">
              <div className="text-sm text-yellow-400 font-bold">⚠️ {message}</div>
            </div>
          )}

          {/* Start Button */}
          <ArcadeButton
            type="submit"
            disabled={disabled || !name.trim() || !selectedTeam}
            loading={loading}
            colorScheme="green"
          >
            ▶ START GAME ◀
          </ArcadeButton>
        </form>

        {/* Arcade Credits */}
        <div className="mt-3 text-center text-xs text-gray-600">
          <div>CREDITS: ∞</div>
        </div>
      </div>
    </div>
  );
}
