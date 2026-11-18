# ZeroFrame Frontend

빈 강의실 좌석 현황을 보여 주는 웹 앱입니다. Vite + React + TypeScript SPA 이고, 백엔드의 REST 와 WebSocket 을 같은 출처의 `/api`, `/ws` 로 부릅니다. 작업 규칙과 코드 규칙은 [AGENTS.md](AGENTS.md) 에 있습니다.

## 요구 사항

- Node 24 (`.nvmrc`)
- pnpm 10.32.1 (`corepack enable` 하면 `packageManager` 값대로 맞춰집니다)

## 설치

```sh
corepack enable
pnpm install --frozen-lockfile
```

## 백엔드와 함께 실행

터미널 1, 백엔드 저장소에서:

```sh
uv sync --locked
# Git Bash, macOS, Linux
EDGE_API_KEY=local-dev-key uv run uvicorn app.main:app
# PowerShell
$env:EDGE_API_KEY='local-dev-key'; uv run uvicorn app.main:app
```

터미널 2, 이 저장소에서:

```sh
pnpm dev
```

`http://localhost:5173` 을 엽니다. 개발 서버가 `/api` 와 `/ws` 를 `http://127.0.0.1:8000` 으로 넘깁니다(`config/proxy.ts`).

### 배포된 백엔드에 붙이기

시드 데이터가 있는 배포 서버를 쓰려면 `BACKEND_ORIGIN` 을 바꿉니다. 가장 간단한 방법은 `.env.local`(git 에 올라가지 않음)에 한 줄 적는 것입니다. `VITE_` 접두사가 없어서 브라우저 코드에는 들어가지 않습니다.

```sh
# .env.local
BACKEND_ORIGIN=https://example.com
```

한 번만 쓸 때는 셸에서 지정합니다.

```sh
# Git Bash, macOS, Linux
BACKEND_ORIGIN=https://example.com pnpm dev
# PowerShell
$env:BACKEND_ORIGIN='https://example.com'; pnpm dev
```

`https` 면 WebSocket 은 `wss` 로 연결됩니다.

### 모의 데이터로 실행

백엔드 없이 화면만 볼 때는 MSW 로 응답을 흉내 냅니다. 개발 서버에서만 켜집니다.

- 주소에 `?scenario=<이름>` 을 붙입니다. 지금 있는 시나리오는 `default` 하나입니다: `http://localhost:5173/?scenario=default`. 모르는 이름이면 알려진 이름을 담은 오류가 납니다.
- 또는 `.env.local` 에 `VITE_API_MOCKING=enabled` 를 적고 `pnpm dev` 를 실행합니다. 한 번만 쓸 때는 셸에서 지정합니다.

```sh
# Git Bash, macOS, Linux
VITE_API_MOCKING=enabled pnpm dev
# PowerShell
$env:VITE_API_MOCKING='enabled'; pnpm dev
```

운영 빌드에는 MSW 가 들어가지 않습니다.

## 스크립트

| 명령                | 하는 일                                                    |
| ------------------- | ---------------------------------------------------------- |
| `pnpm dev`          | 개발 서버 (포트 5173)                                      |
| `pnpm build`        | 운영 빌드 (`dist/`)                                        |
| `pnpm preview`      | 빌드 결과 미리 보기                                        |
| `pnpm typecheck`    | `tsc -b`                                                   |
| `pnpm lint`         | ESLint, 경고도 실패                                        |
| `pnpm format`       | Prettier 로 고침                                           |
| `pnpm format:check` | Prettier 검사만                                            |
| `pnpm test`         | Vitest 한 번 실행                                          |
| `pnpm test:watch`   | Vitest 감시 모드                                           |
| `pnpm test:e2e`     | Playwright (360px, 390px 폭, 모의 데이터로 자체 서버 띄움) |

## E2E 브라우저 설치

처음 한 번, 그리고 `@playwright/test` 버전이 바뀔 때:

```sh
pnpm exec playwright install chromium
```

Linux 에서 시스템 라이브러리까지 필요하면 `--with-deps` 를 붙입니다.

## 폴더 구조

```
src/
  app/        진입, 라우터, Provider, 전역 스타일
  pages/      화면 (rooms, not-found)
  shared/     공용 코드 (test: renderApp 등)
mocks/        MSW 핸들러와 시나리오 (개발 서버, Vitest 공용)
e2e/          Playwright
config/       개발 서버 프록시
```

`features/`, `entities/`, `shared/api` 는 필요해질 때 만듭니다. 층 규칙은 AGENTS.md 를 봅니다.

## CI

PR 과 `main` push 마다 GitHub Actions 가 `checks`(typecheck, lint, format:check, test, build)와 `e2e` 를 돌립니다.
