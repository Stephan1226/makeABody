import type { Entry, Profile } from "./db";
import { MAINTENANCE_WEEKS, goalDirection } from "./roadmap";
import { daysBetween } from "./date";
import { round1 } from "./format";

export interface SeasonState {
  hasData: boolean;
  latestWeight: number;
  /** 시작 대비 변화(+면 목표 방향, -면 반대). "총 변화량" 중 부호 있는 값. */
  totalDelta: number;
  /** 시작 대비 변화의 절댓값(항상 0 이상) */
  totalChange: number;
  /** "lose" | "gain" — 시작→시즌1 의 방향 */
  direction: "lose" | "gain";
  currentSeason: 1 | 2;
  /** 현재 시즌의 목표 체중 */
  currentTarget: number;
  /** 현재 목표까지 남은 kg (0 이상) */
  remainingToTarget: number;
  /** 최종 목표(시즌2)까지 전체 진행률 0~100. 시즌2 없으면 시즌1까지의 진행률. */
  overallProgress: number;
  /** 직전 기록 대비 변화(+면 증가). 기록 1개뿐이면 null */
  lastDelta: number | null;
  /** 시즌1 도달 후 경과 일수. 시즌1 진행 중이면 null */
  maintenanceDays: number | null;
  maintenanceWeeks: number | null;
  /** 권장 유지 기간을 채웠는지 */
  maintenanceMet: boolean;
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
  const direction = goalDirection(profile);
  // 진행 거리 비교에 쓰는 "끝점". 시즌2가 없으면 시즌1이 곧 끝점.
  const endTarget: number = season2Target ?? season1Target;
  // direction 부호: 감량=-1, 증량=+1
  const dirSign = direction === "lose" ? -1 : 1;

  // 가중치가 목표에 "도달"했는지
  const reached = (w: number, target: number) =>
    direction === "lose" ? w <= target : w >= target;
  // 가중치에서 목표까지 남은 거리(항상 >= 0)
  const remaining = (w: number, target: number) =>
    Math.max(0, round1(dirSign * (target - w)));

  if (entriesAsc.length === 0) {
    return {
      hasData: false,
      latestWeight: startWeight,
      totalDelta: 0,
      totalChange: 0,
      direction,
      currentSeason: 1,
      currentTarget: season1Target,
      remainingToTarget: remaining(startWeight, season1Target),
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

  // 시즌1 목표(예: 75kg) 방향으로 처음 도달한 기록 → 유지 단계 진입 기준
  const firstReached = entriesAsc.find((e) => reached(e.weight, season1Target));
  const inSeason2 = Boolean(firstReached);

  const currentSeason: 1 | 2 = inSeason2 ? 2 : 1;
  // 시즌2에 진입했지만 시즌2 목표가 없으면(=단일 단계) 시즌1이 그대로 최종 목표
  const currentTarget =
    inSeason2 && season2Target !== null ? season2Target : season1Target;
  const remainingToTarget = remaining(latestWeight, currentTarget);

  // 전체 진행률: 시작 → 끝점(season2 또는 season1)
  // startWeight 와 endTarget 이 같으면 분모 0. 검증 단계에서 막혔으므로 안전.
  const distToEnd = Math.abs(startWeight - endTarget);
  const progressed = dirSign * (startWeight - latestWeight); // 양수 = 목표 방향
  const overallProgress =
    distToEnd === 0
      ? 100
      : reached(latestWeight, endTarget)
        ? 100
        : latestWeight === startWeight
          ? 0
          : clamp(round1((progressed / distToEnd) * 100), 0, 100);

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
    totalDelta: round1(dirSign * (startWeight - latestWeight)),
    totalChange: round1(Math.abs(startWeight - latestWeight)),
    direction,
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
