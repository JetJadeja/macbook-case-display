/**
 * ArcadeBackground Component
 *
 * Provides the retro arcade aesthetic with:
 * - CRT scanlines effect
 * - Gradient background overlays
 * - Animated grid pattern
 */
export function ArcadeBackground() {
  return (
    <>
      {/* CRT Scanlines Effect */}
      <div className="fixed inset-0 pointer-events-none z-50 scanlines opacity-10"></div>

      {/* Animated Background Grid */}
      <div className="fixed inset-0 bg-gradient-to-b from-purple-900/20 via-black to-blue-900/20"></div>
      <div className="fixed inset-0 bg-grid opacity-20"></div>
    </>
  );
}
