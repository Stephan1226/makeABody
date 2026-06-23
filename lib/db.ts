import Dexie, { type Table } from "dexie";

/** 하루 1건의 체중·메모 기록 */
export interface Entry {
  date: string; // 'YYYY-MM-DD' (primary key)
  weight: number; // kg
  memo: string; // 자유 메모(식단/컨디션)
}

/** 사용자 프로필 — 항상 1행(id=1). 첫 실행 온보딩에서 입력 */
export interface Profile {
  id: 1;
  startWeight: number;
  season1Target: number;
  /** 시즌 2 목표. null이면 단일 단계(시즌 1 도달 후 유지)로 사용. */
  season2Target: number | null;
  startDate: string; // 'YYYY-MM-DD'
  onboardedAt: number;
}

class MakeABodyDB extends Dexie {
  entries!: Table<Entry, string>;
  profile!: Table<Profile, number>;

  constructor() {
    super("makeABody");
    this.version(1).stores({
      entries: "date, weight, createdAt",
      profile: "id",
    });
    this.version(2).stores({
      entries: "date, weight",
      profile: "id",
    });
  }
}

export const db = new MakeABodyDB();

/* ---------- 날짜 유틸 ---------- */

/** 로컬 타임존 기준 'YYYY-MM-DD' */
export function toDateKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayKey(): string {
  return toDateKey(new Date());
}

/* ---------- entries 헬퍼 ---------- */

export async function upsertEntry(input: {
  date: string;
  weight: number;
  memo: string;
}): Promise<void> {
  await db.entries.put({
    date: input.date,
    weight: input.weight,
    memo: input.memo,
  });
}

export function getEntry(date: string): Promise<Entry | undefined> {
  return db.entries.get(date);
}

/** 날짜 오름차순 전체 기록 */
export function allEntries(): Promise<Entry[]> {
  return db.entries.orderBy("date").toArray();
}

export async function deleteEntry(date: string): Promise<void> {
  await db.entries.delete(date);
}

/* ---------- profile 헬퍼 ---------- */

export function getProfile(): Promise<Profile | undefined> {
  return db.profile.get(1);
}

export async function saveProfile(
  input: Omit<Profile, "id" | "onboardedAt"> & Partial<Pick<Profile, "onboardedAt">>,
): Promise<void> {
  const existing = await db.profile.get(1);
  await db.profile.put({
    id: 1,
    startWeight: input.startWeight,
    season1Target: input.season1Target,
    season2Target: input.season2Target,
    startDate: input.startDate,
    onboardedAt: input.onboardedAt ?? existing?.onboardedAt ?? Date.now(),
  });
}

/* ---------- 백업(내보내기/가져오기) ---------- */

export interface BackupData {
  app: "makeABody";
  version: 1;
  exportedAt: number;
  profile: Profile | null;
  entries: Entry[];
}

export async function exportAll(): Promise<BackupData> {
  const [profile, entries] = await Promise.all([getProfile(), allEntries()]);
  return {
    app: "makeABody",
    version: 1,
    exportedAt: Date.now(),
    profile: profile ?? null,
    entries,
  };
}

/** JSON 백업 복원. 기존 데이터 위에 덮어쓴다(같은 날짜는 갱신). */
export async function importAll(data: unknown): Promise<{ entries: number }> {
  if (
    typeof data !== "object" ||
    data === null ||
    (data as BackupData).app !== "makeABody"
  ) {
    throw new Error("makeABody 백업 파일이 아닙니다.");
  }
  const backup = data as BackupData;
  if (backup.version !== 1) {
    throw new Error(`지원하지 않는 백업 버전입니다. (받은 버전: ${backup.version})`);
  }
  await db.transaction("rw", db.entries, db.profile, async () => {
    if (Array.isArray(backup.entries) && backup.entries.length > 0) {
      const isValidEntry = (e: unknown): boolean =>
        typeof e === "object" &&
        e !== null &&
        typeof (e as Entry).date === "string" &&
        typeof (e as Entry).weight === "number" &&
        typeof (e as Entry).memo === "string";
      if (!backup.entries.every(isValidEntry)) {
        throw new Error("백업 파일에 잘못된 형식의 기록이 포함되어 있습니다.");
      }
      await db.entries.bulkPut(backup.entries);
    }
    if (backup.profile) {
      await db.profile.put({ ...backup.profile, id: 1 });
    }
  });
  return { entries: backup.entries?.length ?? 0 };
}
