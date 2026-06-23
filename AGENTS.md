# AGENTS.md

Quick context for OpenCode sessions working on `makeABody` (PWA diet-roadmap tracker, Korean UI, 100% client-side, no server).

## Stack & shape

- **Next.js 15** App Router + **React 19**, TypeScript, Tailwind 3.
- **Static export** (`output: "export"` in `next.config.mjs`). No server runtime, no API routes, no server actions, no `cookies()`/`headers()` in pages, no `revalidate`.
- **Dexie** (IndexedDB) for persistence. **Recharts** for the weight chart. **@serwist/next** for the service worker.
- Single repo, no monorepo/packages. `npm` only (see `package.json`).
- Path alias: `@/*` → repo root (`tsconfig.json`).

## Commands

- `npm run dev` — dev server on `http://localhost:3000`. To preview on a phone over the same Wi-Fi, get the Mac IP with `ipconfig getifaddr en0` and visit `http://<ip>:3000`.
- `npm run build` — produces static `out/`.
- `npm run serve` — `npx serve out` to preview the build locally.
- `npm run lint` — `next lint`. There is **no** `eslint.config.*`/`.eslintrc*` in the repo; it uses Next.js defaults.
- `npx tsc --noEmit` — typecheck. There is no `typecheck` script in `package.json`.
- No test runner is set up. No CI workflow files exist in `.github/`.

## Architecture notes

- **Persistence** is entirely in the browser's IndexedDB via Dexie (`lib/db.ts`).
  - `entries` table keyed by `date` (`YYYY-MM-DD`).
  - `profile` table is a **singleton** — always one row with `id: 1`. Absence means "not onboarded" and pages redirect to `/onboarding`.
- **Date keys** must be local-timezone `YYYY-MM-DD`. Use `toDateKey(new Date())` / `todayKey()` from `lib/db.ts`; do not call `toISOString().slice(0,10)` (UTC drift).
- **Season logic** is a pure function: `computeSeasonState(profile, entriesAsc, todayKeyStr)` in `lib/season.ts`. The `todayKeyStr` arg exists for determinism — preserve that signature if you refactor.
- **Roadmap defaults** (`lib/roadmap.ts`) are derived from `docs/target.txt` and used only to pre-fill onboarding inputs. Real targets come from the user's `profile`.
- **Routes**: `/` (dashboard), `/onboarding`, `/history`, `/settings`. `BottomNav` auto-hides on `/onboarding`.
- **Layout** (`app/layout.tsx`): mobile-first, content max-width `480px`, with iOS safe-area insets. New pages should respect that container.

## Design tokens

- Single source of truth is `lib/theme.ts` (colors, radius, shadow, fontFamily).
- `tailwind.config.ts` imports from it and exposes classes like `bg-surface`, `text-text-sub`, `text-season1`, etc.
- Do not hardcode hex colors in components. Use the existing Tailwind classes (or extend `lib/theme.ts` first).
- SUIT font is self-hosted at `public/fonts/SUIT-Variable.woff2`; do not add a webfont CDN.

## Service worker quirks

- `app/sw.ts` is the **only** file excluded from `tsconfig.json` (it runs in a worker context, not Next's TS pipeline). Don't move SW code into other files expecting full type-checking.
- `@serwist/next` compiles `app/sw.ts` → `public/sw.js` during `next build`. `public/sw.js`, `public/sw.js.map`, and `public/swe-worker-*.js` are **generated artifacts** (gitignored). Don't edit them by hand.

## PWA install prompt

- `components/InstallPrompt.tsx` handles Android (`beforeinstallprompt`) and iOS (manual instructions) separately.
- Dismiss state is stored in `localStorage` under `install-dismissed` for 14 days.
- PWA install requires HTTPS in production. `localhost` is the only HTTP exception. README covers Vercel deploy steps.

## Invariants to preserve

- Profile weight ordering: `startWeight` and `season1Target` must differ; same for `season2Target` when set. **감량** 모드면 `startWeight > season1Target > season2Target`, **증량** 모드면 `startWeight < season1Target < season2Target`. 방향은 `goalDirection(profile)` (`lib/roadmap.ts`) 가 자동 판정. 검증은 `validateProfileInput` (onboarding/settings 공용).
- `season2Target` 은 `number | null`. 단일 단계 사용자도 지원.
- Backup JSON shape (`BackupData` in `lib/db.ts`): must keep `app: "makeABody"` and `version: 1` — `importAll` rejects anything else.
- Dexie schema version is `2` (`lib/db.ts`). Bump the version and provide a migration if you change `stores(...)`.

## Conventions

- All user-facing copy is **Korean**. New strings should match that.
- Components that read IndexedDB use `useLiveQuery` from `dexie-react-hooks` (see `lib/useData.ts`). Treat `undefined` as "loading", `null` (for `useProfile`) as "not onboarded".
- No state management library. Local `useState` + Dexie's live queries are enough.

## Deploy

- No CI/CD in repo. Manual Vercel deploy from `main` works out of the box (see README "배포"). No environment variables are required.
