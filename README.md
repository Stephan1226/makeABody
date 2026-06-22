# makeABody

`docs/target.txt`의 시즌제 다이어트 로드맵 전용 트래커. 100% 로컬(IndexedDB) · 서버/로그인 없음 · PWA로 폰 홈 화면에 설치.

## 스택
- Next.js 15 (App Router, 정적 `output: "export"`) + TypeScript
- Tailwind CSS — 디자인 토큰은 `lib/theme.ts` 단일 출처, `tailwind.config.ts`에 주입
- 폰트: **SUIT** (자체 호스팅, `public/fonts/`)
- Dexie.js (IndexedDB) + dexie-react-hooks
- Recharts (체중 추이)
- @serwist/next (오프라인 서비스워커)

## 개발
```bash
npm install
npm run dev        # http://localhost:3000
```
폰에서 같은 와이파이로 확인: `http://<맥 IP>:3000` (예: `ipconfig getifaddr en0`로 IP 확인)

## 빌드 & 로컬 미리보기
```bash
npm run build      # 정적 결과물 out/ 에 생성
npm run serve      # npx serve out — 빌드 결과를 로컬에서 확인
```

## 배포 (Vercel, 무료)
1. 이 폴더를 GitHub 저장소로 푸시
2. vercel.com → New Project → 저장소 선택 → 그대로 Deploy (Next.js 자동 인식)
3. 배포되면 HTTPS URL 발급 → 폰 브라우저로 접속

> PWA 설치는 HTTPS에서만 동작하므로 Vercel 배포본에서 해야 함. `localhost`는 예외적으로 됨.

### 폰에 설치
- iOS Safari: 공유 → "홈 화면에 추가"
- Android Chrome: 메뉴 → "앱 설치" / "홈 화면에 추가"

## 데이터 / 백업
- 모든 기록은 **이 기기 브라우저의 IndexedDB**에만 저장됨. 기기·브라우저가 바뀌면 공유되지 않음.
- 브라우저 데이터(사이트 데이터)를 지우면 기록이 사라질 수 있음.
- **설정 → 내보내기**로 JSON 백업, **가져오기**로 복원. 가끔 백업 권장.

## 구조
```
app/            온보딩 / 대시보드 / 기록 / 설정 + 레이아웃 + sw.ts
components/     TodayInput, SeasonCard, ProgressBar, WeightChart, EntryRow, BottomNav
lib/            theme(토큰) · db(Dexie) · roadmap(기본값) · season(시즌 로직) · useData(훅)
public/         manifest.json · 아이콘 · fonts/SUIT-Variable.woff2
```

## 라이선스 주석
- SUIT 폰트: SIL Open Font License 1.1 (sunn-us/SUIT). 자체 호스팅·재배포 허용.
