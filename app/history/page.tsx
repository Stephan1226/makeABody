"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useEntries, useProfile } from "@/lib/useData";
import { round1 } from "@/lib/format";
import WeightChart from "@/components/WeightChart";
import EntryRow from "@/components/EntryRow";
import Spinner from "@/components/Spinner";

export default function HistoryPage() {
  const router = useRouter();
  const profile = useProfile();
  const entries = useEntries();

  useEffect(() => {
    if (profile === null) router.replace("/onboarding");
  }, [profile, router]);

  if (profile === undefined || entries === undefined) return <Spinner />;
  if (!profile) return <Spinner />;

  // 최신순 표시 + 직전(더 오래된) 대비 delta 계산
  const desc = [...entries].reverse();

  return (
    <div className="flex flex-col gap-4 pt-2">
      <header className="flex items-baseline justify-between py-1">
        <h1 className="text-xl font-extrabold">기록</h1>
        <span className="text-sm text-text-faint">{entries.length}일</span>
      </header>

      <WeightChart
        entries={entries}
        season1Target={profile.season1Target}
        season2Target={profile.season2Target}
        startWeight={profile.startWeight}
        height={240}
      />

      {desc.length === 0 ? (
        <p className="mt-8 text-center text-sm text-text-faint">
          아직 기록이 없어요.
          <br />홈에서 오늘 체중을 남겨보세요.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {desc.map((e, i) => {
            const older = desc[i + 1]; // 더 오래된 기록
            const delta = older ? round1(e.weight - older.weight) : null;
            return <EntryRow key={e.date} entry={e} delta={delta} />;
          })}
        </ul>
      )}
    </div>
  );
}
