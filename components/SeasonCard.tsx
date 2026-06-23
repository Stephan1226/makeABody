"use client";

import type { SeasonState } from "@/lib/season";
import { MAINTENANCE_WEEKS, SEASON_INFO, goalDirection } from "@/lib/roadmap";
import type { Profile } from "@/lib/db";

export default function SeasonCard({
  state,
  profile,
}: {
  state: SeasonState;
  profile: Profile;
}) {
  const direction = goalDirection(profile);
  const info = SEASON_INFO[state.currentSeason][direction];
  const isS2 = state.currentSeason === 2;

  // 시즌별 액센트 (프라이머리 돌려쓰기 대신 상황별 색)
  const accent = isS2
    ? { text: "text-season2", bg: "bg-season2-soft", chip: "bg-season2 text-white" }
    : { text: "text-season1", bg: "bg-season1-soft", chip: "bg-season1 text-white" };

  return (
    <section className={`rounded-lg ${accent.bg} p-5`}>
      <div className="flex items-center justify-between">
        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${accent.chip}`}>
          {info.period}
        </span>
        <span className={`text-xs font-semibold ${accent.text}`}>
          목표 {state.currentTarget}kg
        </span>
      </div>

      <h2 className={`mt-3 text-lg font-extrabold ${accent.text}`}>{info.label}</h2>
      <p className="mt-1 text-sm text-text-sub">{info.mission}</p>

      <div className="mt-4 flex items-end justify-between border-t border-white/60 pt-4">
        {state.remainingToTarget > 0 ? (
          <p className="text-sm text-text-sub">
            목표까지
            <span className={`tabular mx-1 text-xl font-extrabold ${accent.text}`}>
              {state.remainingToTarget}
            </span>
            kg 남았어요
          </p>
        ) : (
          <p className="text-sm font-bold text-success">목표 체중 달성! 🎉</p>
        )}
      </div>

      {isS2 && state.maintenanceDays !== null && (
        <div className="mt-3 rounded-md bg-surface/70 px-3.5 py-3">
          <p className="text-xs text-text-sub">
            유지 단계
            <span className="tabular mx-1 font-bold text-season2">
              {state.maintenanceDays}일차
            </span>
            <span className="text-text-faint">
              / 권장 {MAINTENANCE_WEEKS.min}–{MAINTENANCE_WEEKS.max}주
            </span>
          </p>
          {state.maintenanceMet ? (
            <p className="mt-1 text-xs font-semibold text-success">
              {direction === "lose"
                ? "세트포인트 안착 — 이제 잔근육 채우기 좋아요 💪"
                : "세트포인트 안착 — 이제 점진 과부하 좋아요 💪"}
            </p>
          ) : (
            <p className="mt-1 text-xs text-text-faint">
              이 무게를 몸이 기억하도록 조금만 더 유지해요.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
