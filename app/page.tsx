"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { todayKey } from "@/lib/db";
import { useEntries, useProfile } from "@/lib/useData";
import { computeSeasonState } from "@/lib/season";
import { daysSinceStart } from "@/lib/date";
import TodayInput from "@/components/TodayInput";
import SeasonCard from "@/components/SeasonCard";
import ProgressBar from "@/components/ProgressBar";
import WeightChart from "@/components/WeightChart";
import Spinner from "@/components/Spinner";

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
  if (profile === undefined || entries === undefined) return <Spinner />;
  if (!profile || !state) return <Spinner />;

  return (
    <div className="flex flex-col gap-4 pt-2">
      <header className="flex items-center justify-between py-1">
        <h1 className="text-xl font-extrabold">makeABody</h1>
        <span className="text-xs font-medium text-text-faint">
          D+{daysSinceStart(profile.startDate, todayKey())}
        </span>
      </header>

      <TodayInput />
      <SeasonCard state={state} profile={profile} />
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
