"use client";

import ChangelogModal from "@/components/ChangelogModal";
import { useChangelogGate } from "@/lib/useChangelog";

export default function ChangelogGate() {
  const { open, dismiss } = useChangelogGate();
  return <ChangelogModal open={open} onClose={dismiss} />;
}
