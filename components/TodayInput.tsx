"use client";

import { useEffect, useRef, useState } from "react";
import { todayKey, upsertEntry } from "@/lib/db";
import { useTodayEntry } from "@/lib/useData";
import { formatDateLong } from "@/lib/format";

export default function TodayInput() {
  const today = useTodayEntry(); // undefined=로딩, null/undefined 없음
  const [weight, setWeight] = useState("");
  const [memo, setMemo] = useState("");
  const [saved, setSaved] = useState(false);
  const hydrated = useRef(false);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    };
  }, []);

  // 오늘 기록이 로드되면 1회 채워넣기
  useEffect(() => {
    if (today && !hydrated.current) {
      setWeight(today.weight ? String(today.weight) : "");
      setMemo(today.memo ?? "");
      hydrated.current = true;
    }
  }, [today]);

  const exists = Boolean(today);

  async function handleSave() {
    const w = parseFloat(weight);
    if (!Number.isFinite(w) || w <= 0) return;
    await upsertEntry({ date: todayKey(), weight: w, memo: memo.trim() });
    setSaved(true);
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    savedTimerRef.current = setTimeout(() => setSaved(false), 1600);
  }

  const dateLabel = formatDateLong(new Date());

  return (
    <section className="rounded-lg bg-surface p-5 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold">오늘 기록</h2>
        <span className="text-xs font-medium text-text-faint">{dateLabel}</span>
      </div>

      <div className="flex items-end gap-3">
        <div className="flex flex-1 items-baseline gap-1.5">
          <input
            inputMode="decimal"
            placeholder="0.0"
            value={weight}
            onChange={(e) => setWeight(e.target.value.replace(/[^0-9.]/g, ""))}
            className="tabular w-full min-w-0 bg-transparent text-4xl font-extrabold text-text outline-none placeholder:text-border"
          />
          <span className="text-lg font-bold text-text-faint">kg</span>
        </div>
        <button
          onClick={handleSave}
          className="shrink-0 rounded-md bg-primary px-5 py-3 text-sm font-bold text-white transition active:scale-95 disabled:opacity-50"
          disabled={!weight}
        >
          {exists ? "수정" : "저장"}
        </button>
      </div>

      <textarea
        placeholder="메모 — 식단·컨디션 (예: 밥 두 숟갈 덜 먹음, 식후 15분 걸음)"
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
        rows={2}
        className="mt-3 w-full resize-none rounded-md bg-bg px-3.5 py-3 text-sm text-text outline-none placeholder:text-text-faint"
      />

      <div className="mt-2 h-4 text-center">
        {saved && (
          <span className="text-xs font-semibold text-success">저장됐어요 ✓</span>
        )}
      </div>
    </section>
  );
}
