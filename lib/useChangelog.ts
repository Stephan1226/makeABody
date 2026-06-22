"use client";

import { useEffect, useState } from "react";
import { APP_VERSION, getSeenVersion, markSeen } from "@/lib/version";

/**
 * 버전 업데이트 알림 게이팅 훅.
 * - 첫 설치(getSeenVersion() === null): 조용히 markSeen 하고 모달을 열지 않음
 * - 이후 진입 시 lastSeen !== APP_VERSION: 모달 오픈 + dismiss 시 markSeen
 */
export function useChangelogGate(): { open: boolean; dismiss: () => void } {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const seen = getSeenVersion();
    if (seen === null) {
      markSeen(APP_VERSION);
      return;
    }
    if (seen !== APP_VERSION) {
      setOpen(true);
    }
  }, []);

  return {
    open,
    dismiss: () => {
      markSeen(APP_VERSION);
      setOpen(false);
    },
  };
}
