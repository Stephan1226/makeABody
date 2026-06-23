"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getProfile, saveProfile, todayKey } from "@/lib/db";
import {
  DEFAULT_SEASON1_TARGET,
  DEFAULT_SEASON2_TARGET,
  DEFAULT_START_WEIGHT,
  validateProfileInput,
} from "@/lib/roadmap";

export default function OnboardingPage() {
  const router = useRouter();
  const [start, setStart] = useState(String(DEFAULT_START_WEIGHT));
  const [s1, setS1] = useState(String(DEFAULT_SEASON1_TARGET));
  const [s2, setS2] = useState(String(DEFAULT_SEASON2_TARGET));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 이미 온보딩 했으면 대시보드로
  useEffect(() => {
    getProfile().then((p) => {
      if (p) router.replace("/");
    });
  }, [router]);

  // 시작 vs 시즌1 의 대소로 방향을 미리 보여주기
  const startNum = parseFloat(start);
  const s1Num = parseFloat(s1);
  const directionHint =
    Number.isFinite(startNum) && Number.isFinite(s1Num) && startNum !== s1Num
      ? s1Num < startNum
        ? "감량 모드"
        : "증량 모드"
      : null;

  async function handleSave() {
    const s2Trim = s2.trim();
    const result = validateProfileInput({
      startWeight: parseFloat(start),
      season1Target: parseFloat(s1),
      season2Target: s2Trim === "" ? null : parseFloat(s2Trim),
    });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    const { startWeight, season1Target, season2Target } = result.value;

    setSaving(true);
    try {
      await saveProfile({
        startWeight,
        season1Target,
        season2Target,
        startDate: todayKey(),
      });
      router.replace("/");
    } catch {
      setError("저장에 실패했어요. 다시 시도해 주세요.");
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-7 pt-6">
      <header className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-primary">시작하기</span>
        <h1 className="text-2xl font-extrabold leading-tight">
          나만의 목표를
          <br />
          설정해 볼까요?
        </h1>
        <p className="text-sm text-text-sub">
          오늘 잰 체중과 목표를 입력하세요. 나중에 설정에서 바꿀 수 있어요.
        </p>
      </header>

      <div className="flex flex-col gap-4">
        <WeightField
          label="지금 체중"
          hint="오늘 잰 값"
          value={start}
          onChange={setStart}
          accent="text-text"
        />
        <WeightField
          label="시즌 1 목표"
          hint={
            directionHint
              ? `1차 목표 (${directionHint})`
              : "1차 목표 (감량/증량은 자동 판정)"
          }
          value={s1}
          onChange={setS1}
          accent="text-season1"
        />
        <WeightField
          label="시즌 2 목표"
          hint="선택 · 비워두면 시즌 1까지만"
          value={s2}
          onChange={setS2}
          accent="text-season2"
          optional
        />
      </div>

      {error && (
        <p className="rounded-md bg-danger-soft px-4 py-3 text-sm font-medium text-danger">
          {error}
        </p>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-2 w-full rounded-lg bg-primary py-4 text-base font-bold text-white shadow-card transition active:scale-[0.99] disabled:opacity-60"
      >
        {saving ? "저장 중…" : "시작하기"}
      </button>
    </div>
  );
}

function WeightField({
  label,
  hint,
  value,
  onChange,
  accent,
  optional = false,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
  accent: string;
  optional?: boolean;
}) {
  return (
    <label className="flex items-center justify-between rounded-lg bg-surface px-5 py-4 shadow-card">
      <span className="flex flex-col">
        <span className={`text-base font-bold ${accent}`}>{label}</span>
        <span className="text-xs text-text-faint">{hint}</span>
      </span>
      <span className="flex items-baseline gap-1">
        <input
          inputMode="decimal"
          value={value}
          placeholder={optional ? "선택" : ""}
          onChange={(e) => onChange(e.target.value.replace(/[^0-9.]/g, ""))}
          className="tabular w-20 bg-transparent text-right text-2xl font-extrabold text-text outline-none placeholder:text-text-faint/60"
        />
        <span className="text-sm font-semibold text-text-faint">kg</span>
      </span>
    </label>
  );
}
