import changelog from "@/docs/version/changelog.json";

export interface Release {
  version: string;
  date: string;
  notes: string[];
}

export const APP_VERSION: string = changelog.version;
export const RELEASES: readonly Release[] = changelog.releases;

const SEEN_KEY = "app-last-seen-version";

export function getSeenVersion(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(SEEN_KEY);
}

export function markSeen(version: string = APP_VERSION): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SEEN_KEY, version);
}
