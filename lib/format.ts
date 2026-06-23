export function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export const KO_DATE_SHORT = new Intl.DateTimeFormat("ko-KR", {
  month: "short",
  day: "numeric",
  weekday: "short",
});

export const KO_DATE_LONG = new Intl.DateTimeFormat("ko-KR", {
  month: "long",
  day: "numeric",
  weekday: "short",
});

export function formatDateShort(date: Date): string {
  return KO_DATE_SHORT.format(date);
}

export function formatDateLong(date: Date): string {
  return KO_DATE_LONG.format(date);
}
