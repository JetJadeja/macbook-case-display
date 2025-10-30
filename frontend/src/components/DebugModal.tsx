import { useState } from "react";

interface DebugModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCoins: number;
  currentClicks: number;
  onUpdate: (coins: number, clicks: number) => void;
}

export function DebugModal({
  isOpen,
  onClose,
  currentCoins,
  currentClicks,
  onUpdate,
}: DebugModalProps) {
  const [coins, setCoins] = useState(currentCoins);
  const [clicks, setClicks] = useState(currentClicks);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(coins, clicks);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 border-2 border-white p-6 rounded-lg min-w-[400px]"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <h2 className="text-white text-2xl font-bold mb-4">Debug Controls</h2>
        <p className="text-gray-400 text-sm mb-4">
          Modify your coins and clicks (local values only)
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="coins" className="text-white block mb-2">
              Coins
            </label>
            <input
              type="number"
              id="coins"
              value={coins}
              onChange={(e) => setCoins(Number(e.target.value))}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 text-white rounded"
              min="0"
            />
          </div>

          <div>
            <label htmlFor="clicks" className="text-white block mb-2">
              Clicks
            </label>
            <input
              type="number"
              id="clicks"
              value={clicks}
              onChange={(e) => setClicks(Number(e.target.value))}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 text-white rounded"
              min="0"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-bold transition-colors"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded font-bold transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>

        <p className="text-gray-500 text-xs mt-4 text-center">
          Press ESC to close
        </p>
      </div>
    </div>
  );
}
