export function formatPercentage(
  value,
  options = {}
) {
  const {
    decimalPlaces = 1,
    showSign = false,
    isExpense = false,
  } = options;

  if (typeof value !== "number" || isNaN(value)) return "0%";

  const absValue = Math.abs(value);
  // Intl.NumberFormat expects a fraction (e.g., 50 => 50%)
  const formatted = new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  }).format(absValue / 100);

  if (!showSign) return formatted;

  // For expense case, invert sign
  if (isExpense) {
    return value <= 0 ? `+${formatted}` : `-${formatted}`;
  }

  // Normal sign handling for income/balance
  return value >= 0 ? `+${formatted}` : `-${formatted}`;
}
