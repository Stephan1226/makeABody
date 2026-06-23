"use client";

import { useEffect, useRef } from "react";
import { APP_VERSION, RELEASES } from "@/lib/version";

export default function ChangelogModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const previousOverflowRef = useRef<string>("");
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;

    previousFocusRef.current = document.activeElement as HTMLElement | null;
    previousOverflowRef.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };
    window.addEventListener("keydown", onKey);

    const raf = requestAnimationFrame(() => {
      panelRef.current?.focus();
    });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflowRef.current;
      previousFocusRef.current?.focus({ preventScroll: true });
    };
  }, [open]);

  if (!open) return null;

  const latest = RELEASES[0];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="changelog-title"
        tabIndex={-1}
        className="relative mx-auto flex w-full max-w-[480px] flex-col rounded-t-2xl bg-surface shadow-pop max-h-[85dvh] outline-none"
      >
        <div className="px-6 pt-5">
          <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />
          <h2 id="changelog-title" className="text-lg font-extrabold">업데이트 기록</h2>
          <p className="mt-1 text-sm text-text-faint">
            현재 버전 v{APP_VERSION} · 최근 변경 사항을 확인해 보세요.
          </p>
        </div>

        <div className="mt-5 flex-1 overflow-y-auto px-6 pb-2">
          <div className="flex flex-col gap-5">
            {RELEASES.map((r, i) => (
              <section
                key={r.version}
                className="rounded-lg border border-border bg-bg/50 p-4"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-base font-extrabold">v{r.version}</h3>
                    {i === 0 && (
                      <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-bold text-primary">
                        최신
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-medium text-text-faint">{r.date}</span>
                </div>
                <ul className="mt-3 flex flex-col gap-1.5">
                  {r.notes.map((note, j) => (
                    <li
                      key={j}
                      className="relative pl-3 text-sm text-text-sub leading-relaxed"
                    >
                      <span className="absolute left-0 top-2 inline-block h-1 w-1 rounded-full bg-text-faint" />
                      {note}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>

        <div className="border-t border-border px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button
            onClick={onClose}
            className="w-full rounded-lg bg-bg py-3.5 text-sm font-bold text-text-sub active:bg-border"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
