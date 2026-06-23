/** 'YYYY-MM-DD' → 자정 기준 Date */
export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function daysBetween(fromKey: string, toKey: string): number {
  const a = parseDateKey(fromKey).getTime();
  const b = parseDateKey(toKey).getTime();
  return Math.max(0, Math.round((b - a) / 86_400_000));
}

export function daysSinceStart(startDate: string, todayKeyStr: string): number {
  return daysBetween(startDate, todayKeyStr);
}
