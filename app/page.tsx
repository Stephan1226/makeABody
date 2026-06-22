"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { todayKey } from "@/lib/db";
import { useEntries, useProfile } from "@/lib/useData";
import { computeSeasonState } from "@/lib/season";
import TodayInput from "@/components/TodayInput";
import SeasonCard from "@/components/SeasonCard";
import ProgressBar from "@/components/ProgressBar";
import WeightChart from "@/components/WeightChart";

export default function DashboardPage() {
  const router = useRouter();
  const profile = useProfile();
  const entries = useEntries();

  // 온보딩 전이면 온보딩으로
  useEffect(() => {
    if (profile === null) router.replace("/onboarding");
  }, [profile, router]);

  const state = useMemo(() => {
    if (!profile || !entries) return null;
    return computeSeasonState(profile, entries, todayKey());
  }, [profile, entries]);

  // 로딩 / 리다이렉트 대기
  if (profile === undefined || entries === undefined) return <Loading />;
  if (!profile || !state) return <Loading />;

  return (
    <div className="flex flex-col gap-4 pt-2">
      <header className="flex items-center justify-between py-1">
        <h1 className="text-xl font-extrabold">makeABody</h1>
        <span className="text-xs font-medium text-text-faint">
          D+{daysSince(profile.startDate)}
        </span>
      </header>

      <TodayInput />
      <SeasonCard state={state} />
      <ProgressBar profile={profile} state={state} />
      <WeightChart
        entries={entries}
        season1Target={profile.season1Target}
        season2Target={profile.season2Target}
        startWeight={profile.startWeight}
        recent={14}
        height={210}
      />
    </div>
  );
}

function daysSince(startDate: string): number {
  const [y, m, d] = startDate.split("-").map(Number);
  const start = new Date(y, m - 1, d).getTime();
  const diff = Math.floor((Date.now() - start) / 86_400_000);
  return Math.max(0, diff);
}

function Loading() {
  return (
    <div className="flex h-[60dvh] items-center justify-center">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-primary" />
    </div>
  );
}
