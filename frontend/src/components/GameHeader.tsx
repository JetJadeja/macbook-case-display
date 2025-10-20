/**
 * GameHeader Component
 *
 * Displays the main game title and subtitle
 */
export function GameHeader() {
  return (
    <div className="text-center space-y-1">
      <h1 className="text-3xl md:text-4xl font-bold text-white">
        IOVINE VS YOUNG
      </h1>
      <p className="text-xs text-gray-500">CLICK BATTLE</p>
    </div>
  );
}
