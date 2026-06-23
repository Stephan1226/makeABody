/**
 * docs/target.txt 로드맵의 "기본값"만 보관한다.
 * 실제 시즌 판정·진행률은 profile(사용자 온보딩 입력값)을 사용한다.
 * 여기 값들은 온보딩 입력칸을 미리 채우는 용도일 뿐 하드코딩이 아니다.
 */

export const DEFAULT_START_WEIGHT = 80.2;
export const DEFAULT_SEASON1_TARGET = 75;
export const DEFAULT_SEASON2_TARGET = 72;

/** 시즌2 진입 후 세트포인트 안착을 위한 유지 권장 기간(주) */
export const MAINTENANCE_WEEKS = { min: 2, max: 4 } as const;

export type GoalDirection = "lose" | "gain";

/** 프로필의 목표 방향. 시작 체중과 시즌1 목표의 대소로 판정. */
export function goalDirection(profile: {
  startWeight: number;
  season1Target: number;
}): GoalDirection {
  return profile.season1Target < profile.startWeight ? "lose" : "gain";
}

/** 화면에 맥락으로 보여줄 로드맵 설명. 방향별로 문구가 다르다. */
export const SEASON_INFO: Record<
  1 | 2,
  Record<GoalDirection, { label: string; period: string; mission: string; desc: string }>
> = {
  1: {
    lose: {
      label: "시즌 1 · 체중 감량",
      period: "1–3개월",
      mission: "밥 두 숟가락 덜기 + 식후 15분 걷기",
      desc: "힘든 운동 없이 일상 습관 교정만으로 목표 체중에 안착하는 시기.",
    },
    gain: {
      label: "시즌 1 · 체중 증량",
      period: "1–3개월",
      mission: "단백질 보강 + 식후 가벼운 근력 운동",
      desc: "무리한 폭식 없이 식사·운동 습관만으로 목표 체중까지 올라가는 시기.",
    },
  },
  2: {
    lose: {
      label: "시즌 2 · 유지 및 다듬기",
      period: "4–6개월",
      mission: "체중 유지 후 푸시업·스쿼트로 잔근육 채우기",
      desc: "목표 체중을 몸이 기억하게 만든 뒤(세트포인트 변경), 맨몸 근력으로 마무리.",
    },
    gain: {
      label: "시즌 2 · 안정화 및 다듬기",
      period: "4–6개월",
      mission: "체중 유지 후 점진적 강도 높은 근력 운동",
      desc: "목표 체중을 몸이 기억하게 만든 뒤(세트포인트 변경), 점진 과부하로 마무리.",
    },
  },
};

export interface ProfileInput {
  startWeight: number;
  season1Target: number;
  season2Target: number | null;
}

export type ValidationResult =
  | { ok: true; value: ProfileInput }
  | { ok: false; error: string };

export function validateProfileInput(input: {
  startWeight: number;
  season1Target: number;
  /** 빈 문자열·NaN·0 이하면 null 로 간주. */
  season2Target: number | null;
}): ValidationResult {
  const { startWeight, season1Target } = input;
  if (![startWeight, season1Target].every((n) => Number.isFinite(n) && n > 0)) {
    return { ok: false, error: "숫자를 올바르게 입력해 주세요." };
  }
  if (startWeight === season1Target) {
    return { ok: false, error: "시작 체중과 시즌 1 목표가 같으면 안 돼요." };
  }

  const direction: GoalDirection = season1Target < startWeight ? "lose" : "gain";
  const season2 = input.season2Target;

  if (season2 !== null) {
    if (!Number.isFinite(season2) || season2 <= 0) {
      return { ok: false, error: "시즌 2 목표를 비우거나 올바른 숫자를 입력해 주세요." };
    }
    if (direction === "lose" && !(startWeight > season1Target && season1Target > season2)) {
      return { ok: false, error: "감량은 시작 > 시즌1 > 시즌2 순서여야 해요." };
    }
    if (direction === "gain" && !(startWeight < season1Target && season1Target < season2)) {
      return { ok: false, error: "증량은 시작 < 시즌1 < 시즌2 순서여야 해요." };
    }
  }

  return {
    ok: true,
    value: { startWeight, season1Target, season2Target: season2 },
  };
}
