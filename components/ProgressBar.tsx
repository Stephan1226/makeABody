"use client";

import type { Profile } from "@/lib/db";
import type { SeasonState } from "@/lib/season";

export default function ProgressBar({
  profile,
  state,
}: {
  profile: Profile;
  state: SeasonState;
}) {
  const { startWeight, season1Target, season2Target } = profile;
  const endTarget = season2Target ?? season1Target;
  const dirSign = state.direction === "lose" ? -1 : 1;

  // 진행률 0~100. season2 없으면 season1이 끝점.
  const pos = (w: number) => {
    const distToEnd = Math.abs(startWeight - endTarget);
    if (distToEnd === 0) return 100;
    const reachedEnd =
      state.direction === "lose" ? w <= endTarget : w >= endTarget;
    if (reachedEnd) return 100;
    if (w === startWeight) return 0;
    const progressed = dirSign * (startWeight - w);
    return Math.min(100, Math.max(0, (progressed / distToEnd) * 100));
  };

  const s1Pos = pos(season1Target);
  const fill = state.overallProgress;

  const sign = state.totalDelta > 0 ? "+" : state.totalDelta < 0 ? "−" : "";

  return (
    <section className="rounded-lg bg-surface p-5 shadow-card">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-base font-bold">전체 진행률</h2>
        <span className="text-sm text-text-sub">
          지금
          <span className="tabular mx-1 text-lg font-extrabold text-text">
            {state.latestWeight}
          </span>
          kg
          {state.totalDelta !== 0 && (
            <span
              className={`tabular ml-2 font-semibold ${
                state.totalDelta > 0 ? "text-success" : "text-text-faint"
              }`}
            >
              {sign}
              {state.totalChange}kg
            </span>
          )}
        </span>
      </div>

      {/* 트랙: 시작 → [시즌1] → [시즌2] */}
      <div className="relative h-3 rounded-full bg-bg">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-primary transition-all"
          style={{ width: `${fill}%` }}
        />
        {/* 시즌1 목표 지점 눈금 */}
        <div
          className="absolute top-1/2 h-4 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-season1"
          style={{ left: `${s1Pos}%` }}
        />
        {/* 현재 위치 점 */}
        <div
          className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-primary bg-surface shadow-card transition-all"
          style={{ left: `${fill}%` }}
        />
      </div>

      <div className="tabular mt-3 flex justify-between text-xs">
        <span className="font-semibold text-text-sub">{startWeight}kg</span>
        <span className="font-semibold text-season1">시즌1 {season1Target}kg</span>
        {season2Target !== null ? (
          <span className="font-semibold text-season2">시즌2 {season2Target}kg</span>
        ) : (
          <span className="font-semibold text-text-faint">시즌2 없음</span>
        )}
      </div>
    </section>
  );
}
