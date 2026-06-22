import type { Config } from "tailwindcss";
import { colors, radius, shadow, fontFamily } from "./lib/theme";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: colors.primary, hover: colors.primaryHover, soft: colors.primarySoft },
        bg: colors.bg,
        surface: colors.surface,
        border: colors.border,
        text: { DEFAULT: colors.text, sub: colors.textSub, faint: colors.textFaint },
        success: { DEFAULT: colors.success, soft: colors.successSoft },
        danger: { DEFAULT: colors.danger, soft: colors.dangerSoft },
        warning: { DEFAULT: colors.warning, soft: colors.warningSoft },
        info: colors.info,
        season1: { DEFAULT: colors.season1, soft: colors.season1Soft },
        season2: { DEFAULT: colors.season2, soft: colors.season2Soft },
      },
      borderRadius: {
        sm: radius.sm,
        md: radius.md,
        lg: radius.lg,
        full: radius.full,
      },
      boxShadow: {
        card: shadow.card,
        pop: shadow.pop,
      },
      fontFamily: {
        sans: [...fontFamily.sans],
      },
    },
  },
  plugins: [],
};

export default config;
