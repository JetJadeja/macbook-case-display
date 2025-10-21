import { useEffect } from "react";
import { ArcadeButton } from "./ArcadeButton";

/**
 * LeaveGameModal Component
 *
 * Confirmation modal shown when player tries to leave during warmup/active phase
 * Different messages based on game phase
 */

interface LeaveGameModalProps {
  isOpen: boolean;
  phase: "waiting" | "warmup" | "active" | "ended";
  onCancel: () => void;
  onConfirm: () => void;
}

export function LeaveGameModal({
  isOpen,
  phase,
  onCancel,
  onConfirm,
}: LeaveGameModalProps) {
  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onCancel();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  // Customize message based on phase
  const getMessage = () => {
    switch (phase) {
      case "warmup":
        return {
          title: "⚠️ WARMUP IN PROGRESS",
          body: "Leaving now means you lose your spot! The game is about to start.",
        };
      case "active":
        return {
          title: "⚠️ GAME IN PROGRESS",
          body: "Don't abandon your teammates! Your team needs you to win.",
        };
      default:
        return {
          title: "⚠️ LEAVE GAME?",
          body: "Are you sure you want to leave?",
        };
    }
  };

  const { title, body } = getMessage();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-lg"
        onClick={onCancel}
      ></div>

      {/* Modal */}
      <div className="relative w-full max-w-md bg-gradient-to-br from-red-950 to-orange-950 rounded-2xl border-8 border-red-500 shadow-2xl shadow-red-500/50 overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -inset-4 bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl blur-xl opacity-30 animate-pulse"></div>

        {/* Content */}
        <div className="relative pixel-font">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-900 to-orange-900 border-b-4 border-red-500 px-8 py-6">
            <h2 className="text-2xl font-bold text-white text-center glitch-text">
              {title}
            </h2>
          </div>

          {/* Body */}
          <div className="p-8 text-center">
            <p className="text-lg text-red-100 leading-relaxed mb-6">
              {body}
            </p>
            <p className="text-sm text-red-300">
              Are you sure you want to leave?
            </p>
          </div>

          {/* Footer - Buttons */}
          <div className="bg-gradient-to-r from-red-900 to-orange-900 border-t-4 border-red-500 px-8 py-6">
            <div className="grid grid-cols-2 gap-4">
              <ArcadeButton onClick={onCancel} colorScheme="green">
                STAY IN GAME
              </ArcadeButton>
              <ArcadeButton onClick={onConfirm} colorScheme="red">
                LEAVE ANYWAY
              </ArcadeButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
