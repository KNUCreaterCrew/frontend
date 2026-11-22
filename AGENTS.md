# 프론트엔드 작업 규칙

코드를 고치기 전에 읽는다. 공통 기준 문서는 `docs` 저장소의 `PROJECT.md`(완료 기준), `SEAT-STATES.md`(상태 의미와 학생에게 보이는 말), `INTERFACES.md`(REST와 WebSocket 계약), `ARCHITECTURE.md` 이다. 화면의 사용자와 맥락은 `PRODUCT.md`, 시각 규칙(색, 글꼴, 좌석 4상태 표현)은 `DESIGN.md` 와 `src/app/styles/tokens.css` 가 기준이다.

## 왜 이 스택인가

앱의 성격: 화면 2~3개(방 선택, 좌석도, 선택 기능 `/admin`), 로그인과 SEO 없음, 데이터는 전부 실시간이라 서버 렌더링으로 미리 그릴 것이 없음, WebSocket 은 브라우저가 백엔드에 직접 연결, 좌석 배치는 백엔드가 주는 `layout` 좌표로 그림, 시연은 휴대폰 QR 접속.

| 결정       | 고른 것                                                                                               | 버린 것과 이유                                                                                                                                                                      |
| ---------- | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 프레임워크 | Vite + React SPA                                                                                      | Next.js: SSR/RSC 이득 없음(실시간 데이터, SEO 없음), 하이드레이션과 서버 런타임 배포만 늘어남. SPA 는 정적 파일이라 어디든 올리고, 백엔드와 같은 출처로 서빙해 CORS 를 없앨 수 있음 |
| 좌석도     | `layout` → `viewBox` 비율로 위치 계산, 좌석은 HTML `<button>` 을 % 절대 위치로 배치, SVG 는 바탕 선만 | 전부 SVG: 좌석이 많아 줄이면 글자도 작아지고 포커스와 화면 읽기를 직접 만들어야 함. Canvas: 접근성과 토큰 적용이 어려움                                                             |
| 스타일     | Tailwind CSS v4 + 토큰만 있는 테마                                                                    | CSS Modules: 토큰 강제가 약함                                                                                                                                                       |
| 서버 상태  | TanStack Query + 순수 함수 이벤트 반영                                                                | 상태 라이브러리 단독: 재조회, 재시도, 캐시를 직접 만들어야 함                                                                                                                       |
| 응답 검증  | zod 4                                                                                                 | 타입만: 계약과 다른 값이 조용히 틀림                                                                                                                                                |
| 라우터     | React Router 8 (선언형 `<Routes>`)                                                                    | 데이터 라우터: 서버 상태는 TanStack Query 가 맡으므로 loader 가 필요 없음                                                                                                           |
| 모션       | motion                                                                                                | CSS 전환만: 시트 드래그와 변경 강조 완성도 부족                                                                                                                                     |
| 바텀시트   | Radix Dialog + motion 드래그                                                                          | vaul: 관리 중단                                                                                                                                                                     |
| 테스트     | Vitest + Testing Library + MSW 3(`ws` 포함) + Playwright                                              | Storybook: 같은 상태를 세 곳에서 그림. `?scenario=` URL 로 대체                                                                                                                     |

TypeScript `strict` + `noUncheckedIndexedAccess`. ESLint flat(type-checked, react-hooks, jsx-a11y) + Prettier(`semi:false`, `singleQuote`, `printWidth:100`). pnpm, Node 24(`.nvmrc`). **이 목록 밖의 런타임 의존성은 사람 확인 후 추가한다.**

테마는 `src/app/styles/tokens.css` 에서 Tailwind 기본 테마를 모두 지우고(`--*: initial`) 선언한 토큰만 둔다. 그래서 `text-2xl`, `bg-white`, `rounded-lg`, `shadow-md` 같은 기본 유틸리티는 동작하지 않는다. 새 값이 필요하면 `DESIGN.md` 와 `tokens.css` 에 먼저 더한 뒤 쓴다. 반경과 그림자 토큰은 일부러 두지 않았다.

### 설치된 버전 (2026-11-18)

| 구분   | 패키지와 버전                                                                                                                                                                                                 |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 런타임 | react, react-dom 19.3.1 / @tanstack/react-query 5.108.0 / zod 4.6.7 / react-router 8.5.1 / @radix-ui/react-dialog 1.3.1 / motion 14.14.0                                                                      |
| 빌드   | vite 8.3.8 / @vitejs/plugin-react 6.3.0 / tailwindcss, @tailwindcss/vite 4.3.5                                                                                                                                |
| 언어   | typescript 6.0.3                                                                                                                                                                                              |
| lint   | eslint 9.39.5, @eslint/js 9.39.5, typescript-eslint 8.73.0, eslint-plugin-react-hooks 7.1.1, eslint-plugin-jsx-a11y 6.10.2, eslint-plugin-react-refresh 0.5.8, eslint-config-prettier 10.1.8, globals 17.14.0 |
| 포맷   | prettier 3.10.1, prettier-plugin-tailwindcss 0.8.1                                                                                                                                                            |
| 테스트 | msw 3.0.7, vitest 5.1.0, jsdom 31.0.1, @testing-library/react 16.3.3, @testing-library/dom 10.4.2, @testing-library/user-event 14.6.12, @testing-library/jest-dom 7.0.1, @playwright/test 1.65.1              |

최신 메이저보다 낮춘 것과 이유:

- **TypeScript 6**: typescript-eslint 8.73.0 의 peer 범위가 `<6.1.0` 이라 7 은 쓸 수 없다.
- **ESLint 9**: eslint-plugin-jsx-a11y 의 peer 범위가 `eslint ^9` 라 10 은 쓸 수 없다.
- **React Router 8, MSW 3**: 설치한 최신 메이저이고 스모크 테스트(선언형 `<Routes>`, `msw/node` 가로채기)가 통과한다. MSW 3 에서 옵션 이름이 `onUnhandledRequest` 에서 `onUnhandledFrame` 으로 바뀌었다. 테스트는 `onUnhandledFrame: 'error'`, 개발 워커는 `'bypass'` 를 쓴다.

버전을 올릴 때는 이 표와 이유도 함께 고친다.

## 폴더

```
src/
  app/        진입, 라우터, Provider, 전역 스타일(styles/), 에러 경계, 미리보기(preview/, mock 빌드 전용)
  pages/      rooms(방 선택), room(좌석도), not-found
  features/   room-live(실시간 동기화 훅), seat-detail(바텀시트)
  entities/   room, seat: zod 스키마, DTO→도메인 변환, queryOptions, 표시용 라벨
  shared/     api(client, endpoints, ApiError), ui(Button 등), lib(time 등), test(renderApp 등)
mocks/        MSW 핸들러와 시나리오(scenarios.ts): 개발 서버, Vitest, E2E 공용
e2e/          Playwright
config/       개발 서버 프록시, 빌드 값 검증
```

`features/`, `entities/`, `shared/api` 는 처음 쓰는 기능에서 만든다.

### 층 규칙

아래 층만 import 한다(app → pages → features → entities → shared). slice 는 `index.ts` 로만 공개한다. DTO 타입은 `entities` 와 `mocks` 밖에서 쓰지 않는다.

- **다른 층과 다른 slice 는 `@/` 경로로만 import 한다.** ESLint `no-restricted-imports` 가 `@/` 별칭 패턴만 검사하므로 `../` 상대 경로로 층을 넘으면 lint 가 잡지 못한다. 같은 slice 안에서만 상대 경로를 쓴다.
- lint 가 막는 것: 아래 층이 위 층을 `@/app/*`, `@/pages/*`, `@/features/*`, `@/entities/*` 로 가져오기, slice 내부(`@/pages/*/*`, `@/features/*/*`, `@/entities/*/*`) 직접 가져오기, 컴포넌트에서 `fetch` 직접 호출(`src/shared/api/**` 만 예외).
- **`src/shared/test/**` 는 층 규칙에서 빠진다.** `renderApp` 이 앱의 라우트(`app`)를 가져와야 하기 때문이다. slice 내부 import 금지는 여기에도 적용된다.

## 규칙

1. API 는 `shared/api` 의 `endpoints`(as const)와 `http`(fetch 래퍼, 실패는 `ApiError` 하나로)로 부르고 응답은 zod 로 파싱한다. 컴포넌트에서 fetch 를 직접 부르지 않는다.
2. 서버 상태는 TanStack Query 만. queryKey 는 `roomKeys` 팩토리로만 만든다.
3. 실시간 동기화는 순수 함수 `applyRoomEvent(snapshot, event)` 와 `version` 버퍼 로직으로 분리해 단위 테스트한다(INTERFACES.md 예시 흐름 10:15:30 → 10:15:40 → 10:16:11 → 10:17:05 를 그대로 입력과 기대값으로). 훅은 연결, 재연결, 30초 재조회, 끊김 처리(방 조회 404 → 재연결 안 함, 그 밖의 끊김 → 재연결 + 재조회)만 맡는다. 반영은 `queryClient.setQueryData`.
   - 순서는 바꾸지 않는다: **WebSocket 연결 → 방 조회 → 조회 응답의 `version` 이하 이벤트 버리기 → 30초마다 방 다시 조회**. 조회 응답 전에 온 이벤트는 모아 두었다가 이 규칙으로 거른다.
   - WebSocket 첫 시도가 10초 안에 끝나지 않으면 방 조회를 먼저 하고, 연결되면 다시 조회한다.
   - WebSocket 주소는 `shared/api/baseUrl` 의 `wsUrl` 로 만든다.
   - 비교 기준은 방 조회 응답의 `version` 이다. 이벤트를 반영해도 기준을 올리지 않는다(같은 `version` 의 `EDGE_STATUS_CHANGED` 와 `SEAT_UPDATED` 가 함께 올 수 있다). 기준은 방을 다시 조회할 때만 새 응답의 값으로 바꾼다.
   - 없는 방은 서버가 WebSocket 연결 전에 HTTP 404 로 거절한다. 브라우저에는 이유 없는 실패(`1006`)로만 보이므로 종료 코드로 판단하지 않는다. 방 조회가 404 이면 다시 연결하지 않고 방이 없다고 표시한다. 조회 결과가 오기 전에 연결 실패가 먼저 올 수 있으니, 재연결은 방 조회 결과를 확인한 뒤에 한다(KNUCreaterCrew/backend#32).
   - `1013` 도 중간 프록시를 거치면 `1006` 으로 보일 수 있다. 종료 코드로 갈라 처리하지 않고, 404 가 아닌 끊김은 모두 재연결 + 재조회로 다룬다.
   - 근거: [INTERFACES.md 3. 웹이 이후 변경을 받습니다](https://github.com/KNUCreaterCrew/docs/blob/main/INTERFACES.md#3-웹이-이후-변경을-받습니다)
4. 모르는 상태와 사유 코드는 기본값으로 덮지 않고 "알 수 없는 상태"로 보인다.
5. 시각은 `shared/lib/time` 한 곳에서. 목록은 "12초 전", 상세는 KST 절대 시각. `last_observed_at: null` 은 "아직 확인하지 못함".
6. 화면 상태는 `loading | error | notFound | ready | refreshFailed`. `notFound` 는 방 조회 404 이고 재시도하지 않는다. 스켈레톤은 200ms 지연 후 표시, 한 번 보이면 최소 400ms. 서버가 잠들었을 때: 5초 넘으면 "깨우는 중" 안내, 60초 넘으면 "오래 걸림" 안내, 90초에 포기하고 오류 화면. 재시도는 network 오류와 http 502/503/504 만, 최대 8번, 대기 `min(1000 * 2 ** attempt, 10000)`ms.
7. 공용 컴포넌트는 네이티브 요소 속성을 확장(`type="button"` 기본, `...rest`), `focus-visible` 링, 아이콘 `aria-hidden`.
8. 60fps 값(드래그, 시트 위치)은 state 가 아니라 MotionValue 와 ref.
9. 테스트는 `renderApp(path)` 로 앱을 띄우고 role 과 name 으로 단언. MSW `onUnhandledFrame: 'error'`. WebSocket 은 MSW `ws` 로 흉내 낸다.
10. 검증하지 않은 것은 했다고 보고하지 않는다. 테스트 0개나 skip 은 실패로 본다.

## 모의 데이터(MSW)

개발 서버에서 `shouldEnableMocking({ dev, flag, search })` 가 참일 때만 켠다. 조건은 DEV 이고 (`VITE_API_MOCKING === 'enabled'` 또는 URL 에 `?scenario=<이름>`) 이다. 그 밖에는 꺼지고 프록시로 실제 백엔드에 간다.

- 시나리오 이름은 부팅 때 한 번 읽어 고정한다. 모르는 이름이면 알려진 이름 목록을 담은 오류가 난다. 있는 이름: `default`(= `mixed`), `mixed`, `all-unknown`, `offline`, `loading`, `error`, `not-found`, `slow-wake`, `many-seats`, `no-seats`, `live-flow`, `ws-reject`, `ws-slow-close`, `ws-down`, `live-demo`, `seat-details`, `rooms-many`, `rooms-empty`, `rooms-refresh-fail`, `stats-seed`, `stats-mixed`, `stats-empty`, `stats-error`, `stats-loading`. 방 ID 는 `IT4-101`.
- 운영 빌드는 `import.meta.env.DEV` 또는 `MODE === 'mock'` 분기 안의 동적 import 로 MSW 와 미리보기 UI 를 뺀다. 이 분기를 깨지 않는다. CI 가 `config/checkDist.ts` 로 확인한다(`dist` 에는 흔적이 없어야 하고 `dist-mock --expect` 에는 있어야 한다).
- 미리보기 빌드: `pnpm build:mock`(`vite build --mode mock`)이 MSW 를 담은 정적 사이트를 만든다. 코드는 `src/app/preview/`(공개 `PreviewRoot`), 설명 데이터는 `mocks/scenarioGuide.ts`. 시나리오는 URL `?scenario` → sessionStorage `zf-preview-scenario` → `default` 순으로 정하고 저장한다. 모르는 이름이면 기본으로 열고 `/__preview` 에 안내한다(개발 서버는 그대로 오류). 미리보기 띠는 mock 빌드에서만 보인다. mock 빌드에 `VITE_API_ORIGIN` 이 있으면 `config/apiOrigin.ts` 가 빌드를 실패시킨다.
- 서비스 워커 파일은 `msw/vite` 플러그인(`worker-only`)이 개발 서버에서 서빙하고 serve 와 mock 빌드 결과물에만 낸다. `public/mockServiceWorker.js` 는 두지 않는다.
- `default` 핸들러는 `IT4-101` 에 혼합 방(mixed)을 준다. `/api/v1/rooms`(목록)와 `/api/v1/rooms/:roomId` 와 그 아래 `stats/daily`, `stats/weekly` 가 기본으로 처리된다. 처리되지 않은 요청이 필요한 테스트는 그 밖의 경로를 써야 한다.
- 새 시나리오는 `mocks/scenarios.ts` 에 더하고, 개발 서버, Vitest, E2E 가 같은 것을 쓴다.

## 프록시

개발 서버는 `config/proxy.ts` 의 `createProxy(backendOrigin?)` 로 `/api` 를 백엔드 출처로, `/ws` 를 같은 곳의 `ws://`(백엔드가 https 면 `wss://`)로 넘긴다. 둘 다 `changeOrigin: true`. 기본 출처는 `http://127.0.0.1:8000` 이고, `BACKEND_ORIGIN` 으로 바꾼다(`.env.local` 또는 셸). `VITE_` 접두사가 아니라서 클라이언트 코드에 노출되지 않는다.

주소는 `shared/api/baseUrl` 의 `httpUrl`, `wsUrl` 로만 만든다. 개발 서버, Vitest, E2E 는 `VITE_API_ORIGIN` 이 없어 `location` 출처를 쓰고, 운영 빌드는 `.env.production` 의 `VITE_API_ORIGIN` 을 쓴다. 백엔드 주소는 `.env.production` 한 곳에만 적는다. 셸이나 Render 대시보드의 같은 이름 환경 변수는 파일 값을 덮으므로 두지 않는다. 운영 빌드에 값이 없으면 `config/apiOrigin.ts` 가 빌드를 실패시킨다. `http` 는 CORS 단순 요청을 지키기 위해 `Accept` 외의 헤더를 붙이지 않는다(백엔드는 GET 만, 헤더 허용 없음).

## 스크립트 이름 (고정)

`typecheck`, `lint`, `format`, `format:check`, `test`(vitest run), `test:watch`, `test:e2e`, `build`, `dev`. 이름을 바꾸지 않는다. 고정 목록 밖에 `build:mock`(미리보기 빌드)이 더 있다.

## 문장부호

팀 저장소에 남는 코드, 문서, 커밋, PR 글에 가운뎃점(U+00B7)과 em dash(U+2014)를 쓰지 않는다. 쉼표, "와"/"과", 슬래시, 괄호, 콜론으로 쓴다. `→` 화살표는 써도 된다.

## Git

이슈 → `origin/main` 에서 `feat|fix|chore|docs/<번호>-<slug>` → PR(`Closes #N`) → main. 커밋 제목 `type(scope): 한국어 요약`. 공동 작성자 표기와 자동 생성 문구 금지. PR 은 `checks`, `e2e` 가 통과해야 머지한다.
