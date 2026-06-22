/**
 * 디자인 토큰 — 단일 진실 공급원(single source of truth).
 * 모든 컴포넌트는 색을 인라인 하드코딩하지 말고 여기 토큰(또는 Tailwind 클래스)을 참조한다.
 * tailwind.config.ts 가 이 객체를 import 해서 클래스로도 노출한다.
 *
 * 방향: 한국 모바일 앱(토스/삼성헬스 류) 라이트 기반.
 * 프라이머리 1색 돌려쓰기 금지 → 상황별 시맨틱 컬러.
 * 그라디언트·네온·글래스·과한 라디우스 지양.
 */

export const colors = {
  // 액션/브랜드 — 차분한 블루
  primary: "#3182F6",
  primaryHover: "#1B64DA",
  primarySoft: "#EAF2FE", // 프라이머리 옅은 배경(뱃지/칩)

  // 중립 스케일
  bg: "#F2F4F6", // 페이지 배경(옅은 회색)
  surface: "#FFFFFF", // 카드
  border: "#E5E8EB",
  text: "#191F28", // 본문(거의 검정)
  textSub: "#4E5968", // 보조 텍스트
  textFaint: "#8B95A1", // 흐린 텍스트/플레이스홀더

  // 시맨틱 — 상황별 의미
  success: "#00C471", // 감량(목표 방향, 좋음)
  successSoft: "#E7F9F0",
  danger: "#F04452", // 체중 증가(경고)
  dangerSoft: "#FDECEE",
  warning: "#FF9500", // 정체/주의
  warningSoft: "#FFF3E0",
  info: "#3182F6",

  // 시즌 구분 액센트
  season1: "#3182F6", // 시즌1 — 블루(커팅)
  season1Soft: "#EAF2FE",
  season2: "#7C5CFC", // 시즌2 — 바이올렛(유지·다듬기)
  season2Soft: "#F0EBFE",
} as const;

export const radius = {
  sm: "6px",
  md: "10px",
  lg: "12px",
  full: "9999px", // 캡슐은 칩/토글 등 제한적으로만
} as const;

export const shadow = {
  // 카드 분리용 은은한 1단계만
  card: "0 1px 3px rgba(0, 27, 55, 0.06), 0 1px 2px rgba(0, 27, 55, 0.04)",
  pop: "0 4px 16px rgba(0, 27, 55, 0.10)", // 모달/시트
} as const;

export const fontFamily = {
  sans: ['"SUIT Variable"', "SUIT", "system-ui", "sans-serif"],
} as const;

export const theme = { colors, radius, shadow, fontFamily } as const;
export default theme;
