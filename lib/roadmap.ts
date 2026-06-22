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

/** 화면에 맥락으로 보여줄 로드맵 설명 */
export const SEASON_INFO = {
  1: {
    label: "시즌 1 · 체중 감량",
    period: "1–3개월",
    mission: "밥 두 숟가락 덜기 + 식후 15분 걷기",
    desc: "힘든 운동 없이 일상 습관 교정만으로 목표 체중에 안착하는 시기.",
  },
  2: {
    label: "시즌 2 · 유지 및 다듬기",
    period: "4–6개월",
    mission: "체중 유지 후 푸시업·스쿼트로 잔근육 채우기",
    desc: "목표 체중을 몸이 기억하게 만든 뒤(세트포인트 변경), 맨몸 근력으로 마무리.",
  },
} as const;
