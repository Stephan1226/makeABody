"use client";

import { useState } from "react";
import { deleteEntry, upsertEntry, type Entry } from "@/lib/db";
import { parseDateKey } from "@/lib/date";
import { formatDateShort } from "@/lib/format";

export default function EntryRow({
  entry,
  delta,
}: {
  entry: Entry;
  delta: number | null; // 직전(더 오래된) 기록 대비 변화
}) {
  const [open, setOpen] = useState(false);
  const [weight, setWeight] = useState(String(entry.weight));
  const [memo, setMemo] = useState(entry.memo ?? "");

  const dateLabel = formatDateShort(parseDateKey(entry.date));

  async function save() {
    const w = parseFloat(weight);
    if (Number.isFinite(w) && w > 0) {
      await upsertEntry({ date: entry.date, weight: w, memo: memo.trim() });
    }
    setOpen(false);
  }

  async function remove() {
    if (confirm(`${dateLabel} 기록을 삭제할까요?`)) {
      await deleteEntry(entry.date);
    }
  }

  return (
    <li className="rounded-lg bg-surface px-4 py-3.5 shadow-card">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex flex-1 items-center gap-3 text-left"
        >
          <span className="w-24 shrink-0 text-sm font-medium text-text-sub">
            {dateLabel}
          </span>
          <span className="tabular text-lg font-extrabold text-text">
            {entry.weight}
            <span className="ml-0.5 text-xs font-semibold text-text-faint">kg</span>
          </span>
          {delta !== null && delta !== 0 && (
            <span
              className={`tabular text-xs font-bold ${
                delta < 0 ? "text-success" : "text-danger"
              }`}
            >
              {delta < 0 ? "▼" : "▲"} {Math.abs(delta).toFixed(1)}
            </span>
          )}
        </button>
        <button
          onClick={remove}
          className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-text-faint active:bg-bg"
          aria-label="삭제"
        >
          삭제
        </button>
      </div>

      {entry.memo && !open && (
        <p className="mt-1.5 pl-[7.5rem] text-sm text-text-sub">{entry.memo}</p>
      )}

      {open && (
        <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
          <div className="flex items-center gap-2">
            <input
              inputMode="decimal"
              value={weight}
              onChange={(e) => setWeight(e.target.value.replace(/[^0-9.]/g, ""))}
              className="tabular w-24 rounded-md bg-bg px-3 py-2 text-base font-bold outline-none"
            />
            <span className="text-sm text-text-faint">kg</span>
            <button
              onClick={save}
              className="ml-auto rounded-md bg-primary px-4 py-2 text-sm font-bold text-white active:scale-95"
            >
              저장
            </button>
          </div>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            rows={2}
            placeholder="메모"
            className="w-full resize-none rounded-md bg-bg px-3 py-2 text-sm outline-none placeholder:text-text-faint"
          />
        </div>
      )}
    </li>
  );
}
