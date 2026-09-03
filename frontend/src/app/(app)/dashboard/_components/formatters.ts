export function formatCo2e(kg: number): { value: string; unit: string } {
  if (kg >= 1000) {
    return { value: (kg / 1000).toFixed(1), unit: "t" };
  }
  return { value: Math.round(kg).toLocaleString(), unit: "kg" };
}

export interface TrendDelta {
  percent: number;
  direction: "up" | "down" | "flat";
}

export function computeDelta(current: number, previous: number): TrendDelta | null {
  if (previous === 0) return null;
  const percent = ((current - previous) / previous) * 100;
  if (percent === 0) return { percent: 0, direction: "flat" };
  return { percent: Math.abs(percent), direction: percent > 0 ? "up" : "down" };
}
