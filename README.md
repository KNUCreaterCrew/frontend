# ZeroFrame Frontend

실습실과 과방의 빈자리를 보여 주는 웹 앱입니다. Vite + React + TypeScript SPA 이고, 백엔드의 REST 와 WebSocket 을 부릅니다. 개발 서버에서는 같은 출처의 `/api`, `/ws` 를 프록시로 넘기고, 운영 빌드는 `.env.production` 의 `VITE_API_ORIGIN` 으로 백엔드에 직접 연결합니다. 작업 규칙과 코드 규칙은 [AGENTS.md](AGENTS.md) 에 있습니다.

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

백엔드는 Render 무료 플랜에 배포돼 있습니다. 주소와 주의점은 공통 명세의 [연결할 서버](https://github.com/KNUCreaterCrew/docs/blob/main/INTERFACES.md#연결할-서버) 절이 기준입니다. 배포 서버를 쓰려면 `BACKEND_ORIGIN` 을 바꿉니다. 가장 간단한 방법은 `.env.local`(git 에 올라가지 않음)에 한 줄 적는 것입니다. `VITE_` 접두사가 없어서 브라우저 코드에는 들어가지 않습니다.

```sh
# .env.local
BACKEND_ORIGIN=https://zeroframe-backend-p1wa.onrender.com
```

한 번만 쓸 때는 셸에서 지정합니다.

```sh
# Git Bash, macOS, Linux
BACKEND_ORIGIN=https://zeroframe-backend-p1wa.onrender.com pnpm dev
# PowerShell
$env:BACKEND_ORIGIN='https://zeroframe-backend-p1wa.onrender.com'; pnpm dev
```

`https` 면 WebSocket 은 `wss` 로 연결됩니다. 브라우저는 개발 서버(같은 출처)에만 요청하므로 개발 중에는 백엔드 CORS 설정이 필요 없습니다.

배포 서버에서 알아 둘 것:

- 15분 동안 요청이 없으면 서버가 잠들고, 첫 응답까지 약 1분 걸릴 수 있습니다. 첫 조회가 오래 걸리면 기다렸다가 다시 열어 봅니다.
- 서버가 다시 시작되면 모든 좌석이 확인 불가로 시작하고, 장치의 다음 보고가 상태를 채웁니다. 장치가 꺼져 있으면 `IT4-101` 은 전 좌석 확인 불가로 보입니다.
- 없는 방의 WebSocket 은 서버가 연결 전에 HTTP 404 로 거절합니다. 브라우저에는 이유 없는 연결 실패(종료 코드 `1006`)로만 보이므로, 방이 없다는 판단은 방 조회의 404 로 합니다([backend#32](https://github.com/KNUCreaterCrew/backend/issues/32)).

### 모의 데이터로 실행

백엔드 없이 화면만 볼 때는 MSW 로 응답을 흉내 냅니다. 개발 서버에서만 켜집니다.

- 주소에 `?scenario=<이름>` 을 붙입니다. 시나리오: `default`(= `mixed`), `mixed`, `all-unknown`, `offline`, `loading`, `error`, `not-found`, `slow-wake`, `many-seats`, `no-seats`. 방 화면 예: `http://localhost:5173/rooms/IT4-101?scenario=offline`. 모르는 이름이면 알려진 이름을 담은 오류가 납니다.
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
| `pnpm preview`      | 빌드 결과 미리 보기 (실제 백엔드에 연결, CORS 등록 필요)   |
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
config/       개발 서버 프록시, 빌드 값 검증
```

`features/`, `entities/`, `shared/api` 는 필요해질 때 만듭니다. 층 규칙은 AGENTS.md 를 봅니다.

## 배포

Render static site 로 올립니다. 설정은 [`render.yaml`](render.yaml)(Blueprint)에 있고, 서비스 이름은 `zeroframe-web` 입니다. 아래 내용 중 Render 쪽 동작(corepack, Node 버전, rewrite 와 실제 파일의 우선순위)은 서비스를 만들 때 확인해야 하는 `미확인` 항목입니다.

1. Render 대시보드에서 **New → Blueprint** 를 누르고 `KNUCreaterCrew/frontend` 저장소를 고릅니다.
2. `render.yaml` 의 `zeroframe-web` 서비스를 확인하고 **Apply** 를 누릅니다.
3. 빌드 로그에서 pnpm 이 맞춰지고 Node 가 24 인지 확인합니다. 안 맞으면 Environment 에 `NODE_VERSION=24` 를 넣습니다.
4. 배포된 웹 출처(예: `https://zeroframe-web.onrender.com`, Render 가 뒤에 접미사를 붙일 수 있으니 실제 주소는 대시보드에서 확인합니다)를 백엔드의 `CORS_ALLOW_ORIGINS` 에 넣습니다. 방법은 백엔드 README 의 [다른 주소의 웹에서 부르기 (CORS)](https://github.com/KNUCreaterCrew/backend#다른-주소의-웹에서-부르기-cors) 를 봅니다.
5. 아래 두 명령 모두 응답 헤더에 `access-control-allow-origin` 이 붙는지 확인합니다. 두 번째는 404 응답이라도 붙어야 합니다.

```sh
curl -i -H "Origin: <웹 출처>" https://zeroframe-backend-p1wa.onrender.com/api/v1/rooms
curl -i -H "Origin: <웹 출처>" https://zeroframe-backend-p1wa.onrender.com/api/v1/rooms/NOPE
```

- WebSocket 은 CORS 와 무관합니다.
- `pnpm preview`(`http://localhost:4173`)도 실제 백엔드를 부르므로, 그 출처를 `CORS_ALLOW_ORIGINS` 에 잠시 넣어야 합니다.
- 백엔드 주소를 바꾸려면 `.env.production` 의 한 줄을 고칩니다.
- 시연 점검과 기록은 [DEMO.md](DEMO.md) 를 봅니다.

## CI

PR 과 `main` push 마다 GitHub Actions 가 `checks`(typecheck, lint, format:check, test, build)와 `e2e` 를 돌립니다.
