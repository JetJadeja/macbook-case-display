/**
 * Format a score with NO decimals and thousands separator
 * Example: 1234.567 -> "1,235" (rounded)
 */
export function formatNumber(num: number): string {
  return Math.round(num).toLocaleString();
}

/**
 * Format coins with 4-digit padding and 1 decimal place
 * Example: 12.5 -> "0012.5"
 */
export function formatCoins(coins: number): string {
  const formatted = coins.toFixed(1);
  const [whole, decimal] = formatted.split('.');
  return whole.padStart(4, '0') + '.' + decimal;
}

/**
 * Format personal clicks with 1 decimal place and thousands separator
 * Example: 1234.567 -> "1,234.6"
 */
export function formatClicks(clicks: number): string {
  return clicks.toFixed(1).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
