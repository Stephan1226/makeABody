import type { Entry, Profile } from "./db";
import { MAINTENANCE_WEEKS } from "./roadmap";

export interface SeasonState {
  hasData: boolean;
  latestWeight: number;
  /** 시작 대비 총 감량(+면 빠진 것) */
  totalLost: number;
  currentSeason: 1 | 2;
  /** 현재 시즌의 목표 체중 */
  currentTarget: number;
  /** 현재 목표까지 남은 kg (0 이상) */
  remainingToTarget: number;
  /** 최종 목표(시즌2)까지 전체 진행률 0~100 */
  overallProgress: number;
  /** 직전 기록 대비 변화(+면 증가). 기록 1개뿐이면 null */
  lastDelta: number | null;
  /** 시즌2(유지) 진입일부터 경과 일수. 시즌1이면 null */
  maintenanceDays: number | null;
  maintenanceWeeks: number | null;
  /** 권장 유지 기간을 채웠는지 */
  maintenanceMet: boolean;
}

/** 'YYYY-MM-DD' → 자정 기준 Date */
function parseDate(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function daysBetween(fromKey: string, toKey: string): number {
  const a = parseDate(fromKey).getTime();
  const b = parseDate(toKey).getTime();
  return Math.max(0, Math.round((b - a) / 86_400_000));
}

const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n));

/**
 * profile + 날짜 오름차순 entries 로 현재 상태를 도출하는 순수 함수.
 * @param todayKeyStr 오늘 날짜 키(테스트 가능하도록 주입)
 */
export function computeSeasonState(
  profile: Profile,
  entriesAsc: Entry[],
  todayKeyStr: string,
): SeasonState {
  const { startWeight, season1Target, season2Target } = profile;

  if (entriesAsc.length === 0) {
    return {
      hasData: false,
      latestWeight: startWeight,
      totalLost: 0,
      currentSeason: 1,
      currentTarget: season1Target,
      remainingToTarget: Math.max(0, round1(startWeight - season1Target)),
      overallProgress: 0,
      lastDelta: null,
      maintenanceDays: null,
      maintenanceWeeks: null,
      maintenanceMet: false,
    };
  }

  const latest = entriesAsc[entriesAsc.length - 1];
  const latestWeight = latest.weight;
  const prev = entriesAsc.length >= 2 ? entriesAsc[entriesAsc.length - 2] : null;
  const lastDelta = prev ? round1(latestWeight - prev.weight) : null;

  // 시즌1 목표(예: 75kg) 이하에 처음 도달한 기록 → 시즌2 진입 기준
  const firstReached = entriesAsc.find((e) => e.weight <= season1Target);
  const inSeason2 = Boolean(firstReached);

  const currentSeason: 1 | 2 = inSeason2 ? 2 : 1;
  const currentTarget = inSeason2 ? season2Target : season1Target;
  const remainingToTarget = Math.max(0, round1(latestWeight - currentTarget));

  const overallProgress =
    latestWeight <= season2Target
      ? 100
      : latestWeight >= startWeight
        ? 0
        : clamp(
            round1(((startWeight - latestWeight) / Math.abs(startWeight - season2Target)) * 100),
            0,
            100,
          );

  let maintenanceDays: number | null = null;
  let maintenanceWeeks: number | null = null;
  let maintenanceMet = false;
  if (firstReached) {
    maintenanceDays = daysBetween(firstReached.date, todayKeyStr);
    maintenanceWeeks = Math.floor(maintenanceDays / 7);
    maintenanceMet = maintenanceWeeks >= MAINTENANCE_WEEKS.min;
  }

  return {
    hasData: true,
    latestWeight,
    totalLost: round1(startWeight - latestWeight),
    currentSeason,
    currentTarget,
    remainingToTarget,
    overallProgress,
    lastDelta,
    maintenanceDays,
    maintenanceWeeks,
    maintenanceMet,
  };
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
