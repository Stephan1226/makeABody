"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { allEntries, getEntry, getProfile, todayKey } from "./db";

/** 날짜 오름차순 전체 기록 (실시간 갱신). 로딩 중엔 undefined */
export function useEntries() {
  return useLiveQuery(() => allEntries(), []);
}

/**
 * 프로필 (실시간).
 * - undefined: 아직 로딩 중
 * - null: 로딩 끝났고 프로필 없음(= 온보딩 필요)
 * - Profile: 온보딩 완료
 * getProfile()이 "없음"도 undefined를 주므로 null로 좁혀 로딩과 구분한다.
 */
export function useProfile() {
  return useLiveQuery(async () => (await getProfile()) ?? null, []);
}

/** 오늘 기록 (실시간) */
export function useTodayEntry() {
  return useLiveQuery(() => getEntry(todayKey()), []);
}
