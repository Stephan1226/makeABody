"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ChangelogModal from "@/components/ChangelogModal";
import { exportAll, importAll, saveProfile, todayKey } from "@/lib/db";
import { useProfile } from "@/lib/useData";
import { validateProfileInput } from "@/lib/roadmap";
import { APP_VERSION } from "@/lib/version";

export default function SettingsPage() {
  const router = useRouter();
  const profile = useProfile();
  const fileRef = useRef<HTMLInputElement>(null);
  const [start, setStart] = useState("");
  const [s1, setS1] = useState("");
  const [s2, setS2] = useState("");
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [changelogOpen, setChangelogOpen] = useState(false);
  const hydrated = useRef(false);
  const msgTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (profile === null) router.replace("/onboarding");
  }, [profile, router]);

  useEffect(() => {
    if (profile && !hydrated.current) {
      setStart(String(profile.startWeight));
      setS1(String(profile.season1Target));
      setS2(profile.season2Target === null ? "" : String(profile.season2Target));
      hydrated.current = true;
    }
  }, [profile]);

  useEffect(() => {
    return () => {
      if (msgTimerRef.current) clearTimeout(msgTimerRef.current);
    };
  }, []);

  function flash(kind: "ok" | "err", text: string) {
    setMsg({ kind, text });
    if (msgTimerRef.current) clearTimeout(msgTimerRef.current);
    msgTimerRef.current = setTimeout(() => setMsg(null), 2600);
  }

  async function saveTargets() {
    if (!profile) return;
    const s2Trim = s2.trim();
    const result = validateProfileInput({
      startWeight: parseFloat(start),
      season1Target: parseFloat(s1),
      season2Target: s2Trim === "" ? null : parseFloat(s2Trim),
    });
    if (!result.ok) {
      flash("err", result.error);
      return;
    }
    const { startWeight, season1Target, season2Target } = result.value;
    await saveProfile({
      startWeight,
      season1Target,
      season2Target,
      startDate: profile.startDate,
    });
    flash("ok", "목표를 저장했어요.");
  }

  async function handleExport() {
    const data = await exportAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `makeABody-backup-${todayKey()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    flash("ok", "백업 파일을 내보냈어요.");
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const { entries } = await importAll(JSON.parse(text));
      hydrated.current = false;
      flash("ok", `${entries}일치 기록을 복원했어요.`);
    } catch (err) {
      flash("err", err instanceof Error ? err.message : "가져오기에 실패했어요.");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  if (!profile) return null;

  return (
    <div className="flex flex-col gap-6 pt-2">
      <h1 className="py-1 text-xl font-extrabold">설정</h1>

      {/* 목표 수정 */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-bold text-text-sub">목표 체중</h2>
        <div className="flex flex-col gap-2 rounded-lg bg-surface p-2 shadow-card">
          <TargetField label="시작 체중" value={start} onChange={setStart} />
          <TargetField label="시즌 1 목표" value={s1} onChange={setS1} accent="text-season1" />
          <TargetField
            label="시즌 2 목표"
            hint="(선택)"
            value={s2}
            onChange={setS2}
            accent="text-season2"
            optional
          />
        </div>
        <button
          onClick={saveTargets}
          className="rounded-lg bg-primary py-3.5 text-sm font-bold text-white active:scale-[0.99]"
        >
          목표 저장
        </button>
      </section>

      {/* 백업 */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-bold text-text-sub">데이터 백업</h2>
        <p className="text-xs text-text-faint">
          기록은 이 기기에만 저장돼요. 브라우저 데이터를 지우면 사라질 수 있으니 가끔
          내보내기로 백업해 두세요.
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="flex-1 rounded-lg border border-border bg-surface py-3.5 text-sm font-bold text-text active:bg-bg"
          >
            내보내기
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="flex-1 rounded-lg border border-border bg-surface py-3.5 text-sm font-bold text-text active:bg-bg"
          >
            가져오기
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          onChange={handleImport}
          className="hidden"
        />
      </section>

      {/* 업데이트 기록 */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-bold text-text-sub">업데이트 기록</h2>
        <div className="flex items-center justify-between rounded-lg bg-surface p-4 shadow-card">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-bold text-text">현재 버전</span>
            <span className="text-xs text-text-faint">v{APP_VERSION}</span>
          </div>
          <button
            onClick={() => setChangelogOpen(true)}
            className="rounded-md border border-border bg-bg px-4 py-2 text-xs font-bold text-text-sub active:bg-border"
          >
            기록 보기
          </button>
        </div>
      </section>

      {msg && (
        <p
          className={`rounded-md px-4 py-3 text-sm font-medium ${
            msg.kind === "ok"
              ? "bg-success-soft text-success"
              : "bg-danger-soft text-danger"
          }`}
        >
          {msg.text}
        </p>
      )}

      <p className="pt-4 text-center text-xs text-text-faint">
        시작일 {profile.startDate} · 로컬 전용 · 서버 없음
      </p>

      <ChangelogModal open={changelogOpen} onClose={() => setChangelogOpen(false)} />
    </div>
  );
}

function TargetField({
  label,
  hint,
  value,
  onChange,
  accent = "text-text",
  optional = false,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  accent?: string;
  optional?: boolean;
}) {
  return (
    <label className="flex items-center justify-between rounded-md px-3 py-2.5">
      <span className="flex items-baseline gap-1">
        <span className={`text-sm font-bold ${accent}`}>{label}</span>
        {hint && <span className="text-[10px] font-medium text-text-faint">{hint}</span>}
      </span>
      <span className="flex items-baseline gap-1">
        <input
          inputMode="decimal"
          value={value}
          placeholder={optional ? "선택" : ""}
          onChange={(e) => onChange(e.target.value.replace(/[^0-9.]/g, ""))}
          className="tabular w-16 bg-transparent text-right text-lg font-extrabold outline-none placeholder:text-text-faint/60"
        />
        <span className="text-xs font-semibold text-text-faint">kg</span>
      </span>
    </label>
  );
}
