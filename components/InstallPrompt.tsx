"use client";

import { useEffect, useRef, useState } from "react";

type Mode = "android" | "ios" | null;

const DISMISSED_KEY = "install-dismissed";
const DISMISS_DAYS = 14;

export default function InstallPrompt() {
  const [mode, setMode] = useState<Mode>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<Event & { prompt(): Promise<{ outcome: "accepted" | "dismissed" }> } | null>(null);
  const [iosOpen, setIosOpen] = useState(false);
  const iosPanelRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const previousOverflowRef = useRef<string>("");

  useEffect(() => {
    // 이미 설치됐거나(standalone) 이전에 닫은 경우 표시 안 함
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in navigator && (navigator as { standalone?: boolean }).standalone === true);
    if (isStandalone) return;

    const dismissed = localStorage.getItem(DISMISSED_KEY);
    if (dismissed && Date.now() - Number(dismissed) < DISMISS_DAYS * 86_400_000) return;

    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

    if (isIOS) {
      // iOS Safari: beforeinstallprompt 없음 → 직접 안내
      setMode("ios");
    } else {
      // Android/Chrome: beforeinstallprompt 이벤트 대기
      const handler = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e as Event & { prompt(): Promise<{ outcome: "accepted" | "dismissed" }> });
        setMode("android");
      };
      const installedHandler = () => {
        localStorage.removeItem(DISMISSED_KEY);
        setDeferredPrompt(null);
        setMode(null);
      };
      window.addEventListener("beforeinstallprompt", handler);
      window.addEventListener("appinstalled", installedHandler);
      return () => {
        window.removeEventListener("beforeinstallprompt", handler);
        window.removeEventListener("appinstalled", installedHandler);
      };
    }
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    setMode(null);
    setIosOpen(false);
  }

  useEffect(() => {
    if (!iosOpen) return;

    previousFocusRef.current = document.activeElement as HTMLElement | null;
    previousOverflowRef.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIosOpen(false);
    };
    window.addEventListener("keydown", onKey);

    const raf = requestAnimationFrame(() => {
      iosPanelRef.current?.focus();
    });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflowRef.current;
      previousFocusRef.current?.focus({ preventScroll: true });
    };
  }, [iosOpen]);

  async function install() {
    if (!deferredPrompt) return;
    const { outcome } = await deferredPrompt.prompt();
    setDeferredPrompt(null);
    if (outcome === "dismissed") {
      dismiss();
    }
  }

  if (!mode) return null;

  return (
    <>
      {/* 배너 */}
      <div className="mx-auto mb-3 flex max-w-[480px] items-center gap-3 rounded-lg bg-surface px-4 py-3.5 shadow-pop">
        {/* 아이콘 */}
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
            <polyline points="3,8 8.5,13.5 11,11 18,4" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="3" cy="8" r="2" fill="#fff" />
            <circle cx="18" cy="4" r="2" fill="#fff" />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-text leading-tight">makeABody 설치하기</p>
          <p className="text-xs text-text-faint mt-0.5">홈 화면에 추가해 앱처럼 사용해요</p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {mode === "android" ? (
            <button
              onClick={install}
              className="rounded-md bg-primary px-3.5 py-2 text-xs font-bold text-white active:scale-95"
            >
              설치
            </button>
          ) : (
            <button
              onClick={() => setIosOpen(true)}
              className="rounded-md bg-primary px-3.5 py-2 text-xs font-bold text-white active:scale-95"
            >
              방법 보기
            </button>
          )}
          <button
            onClick={dismiss}
            aria-label="닫기"
            className="flex h-7 w-7 items-center justify-center rounded-full text-text-faint active:bg-bg"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* iOS 안내 모달 (하단 시트) */}
      {iosOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* 배경 딤 */}
          <div className="absolute inset-0 bg-black/40" onClick={() => setIosOpen(false)} />

          <div
            ref={iosPanelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="install-instructions-title"
            tabIndex={-1}
            className="relative mx-auto w-full max-w-[480px] rounded-t-2xl bg-surface px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-5 shadow-pop outline-none"
          >
            {/* 핸들 */}
            <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-border" />

            <h2 id="install-instructions-title" className="text-lg font-extrabold">홈 화면에 추가하기</h2>
            <p className="mt-1 text-sm text-text-faint">Safari 브라우저에서 3단계로 설치해요.</p>

            <ol className="mt-5 flex flex-col gap-4">
              <Step num={1}>
                하단 가운데 <ShareIcon className="mx-1 inline-block align-middle" /> 공유 버튼을 탭해요
              </Step>
              <Step num={2}>
                스크롤해서 <strong className="font-bold text-text">홈 화면에 추가</strong>를 탭해요
              </Step>
              <Step num={3}>
                오른쪽 위 <strong className="font-bold text-text">추가</strong>를 탭하면 끝!
              </Step>
            </ol>

            <button
              onClick={() => setIosOpen(false)}
              className="mt-6 w-full rounded-lg bg-bg py-3.5 text-sm font-bold text-text-sub active:bg-border"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function Step({ num, children }: { num: number; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-bold text-primary">
        {num}
      </span>
      <span className="pt-0.5 text-sm text-text-sub leading-relaxed">{children}</span>
    </li>
  );
}

function ShareIcon({ className }: { className?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className={className} aria-hidden>
      <rect x="3" y="7" width="12" height="9" rx="2" stroke="#3182F6" strokeWidth="1.5" />
      <path d="M9 2v8M6 5l3-3 3 3" stroke="#3182F6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
