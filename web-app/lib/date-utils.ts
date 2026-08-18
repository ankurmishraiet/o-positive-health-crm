/**
 * Utility functions for date and time operations
 */

/**
 * Extract month string from YYYY-MM format
 * @param monthYear - Month in YYYY-MM format (e.g., "2024-01")
 * @returns Month string (e.g., "01")
 */
export function extractMonthFromYYYYMM(monthYear: string): string {
  return monthYear.split("-")[1];
}

/**
 * Extract year from YYYY-MM format
 * @param monthYear - Month in YYYY-MM format (e.g., "2024-01")
 * @returns Year as number (e.g., 2024)
 */
export function extractYearFromYYYYMM(monthYear: string): number {
  return parseInt(monthYear.split("-")[0], 10);
}

/**
 * Get current month in YYYY-MM format
 * @returns Current month string (e.g., "2024-01")
 */
export function getCurrentMonthYYYYMM(): string {
  return new Date().toISOString().substring(0, 7);
}

export function formatMonthYear(monthYear: string): string {
  return (
    new Date().toLocaleString("default", { month: "long" }) +
    " " +
    new Date().getFullYear()
  );
}
