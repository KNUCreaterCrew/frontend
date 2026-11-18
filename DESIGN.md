---
name: ZeroFrame
description: 공강에 휴대폰으로 실습실 빈자리를 확인하는 좌석도
colors:
  paper: '#f2f0ea'
  surface: '#ffffff'
  ink: '#121212'
  ink-soft: '#3d3b37'
  empty: '#007a45'
  on-empty: '#ffffff'
  live: '#c4301a'
  on-live: '#ffffff'
  scrim: 'rgb(18 18 18 / 0.28)'
typography:
  poster:
    fontFamily: 'Archivo, Gothic A1, sans-serif'
    fontSize: '9rem'
    fontWeight: 800
    lineHeight: 0.82
    letterSpacing: '-0.04em'
    fontFeature: 'tnum'
  poster-word:
    fontFamily: 'Gothic A1, sans-serif'
    fontSize: '4.5rem'
    fontWeight: 900
    lineHeight: 0.95
    letterSpacing: '-0.04em'
  sheet:
    fontFamily: 'Gothic A1, sans-serif'
    fontSize: '2.125rem'
    fontWeight: 900
    lineHeight: 1.1
    letterSpacing: '-0.03em'
  title:
    fontFamily: 'Gothic A1, sans-serif'
    fontSize: '1.875rem'
    fontWeight: 900
    lineHeight: 1.1
    letterSpacing: '-0.03em'
  alert:
    fontFamily: 'Gothic A1, sans-serif'
    fontSize: '1.5rem'
    fontWeight: 900
    lineHeight: 1.25
  fact:
    fontFamily: 'Gothic A1, sans-serif'
    fontSize: '1.375rem'
    fontWeight: 900
    lineHeight: 1.2
  number:
    fontFamily: 'Archivo, Gothic A1, sans-serif'
    fontSize: '1.25rem'
    fontWeight: 700
    lineHeight: 1.2
    fontFeature: 'tnum'
  body:
    fontFamily: 'Gothic A1, sans-serif'
    fontSize: '0.9375rem'
    fontWeight: 500
    lineHeight: 1.5
  label:
    fontFamily: 'Gothic A1, sans-serif'
    fontSize: '0.8125rem'
    fontWeight: 700
    lineHeight: 1.4
  caption:
    fontFamily: 'Gothic A1, sans-serif'
    fontSize: '0.75rem'
    fontWeight: 700
    lineHeight: 1.4
rounded:
  none: '0px'
spacing:
  '1': '4px'
  '2': '8px'
  '3': '12px'
  '4': '16px'
  '6': '24px'
  '8': '32px'
  tap: '44px'
components:
  seat-empty:
    backgroundColor: '{colors.empty}'
    textColor: '{colors.on-empty}'
    rounded: '{rounded.none}'
  seat-occupied:
    backgroundColor: '{colors.ink}'
    textColor: '{colors.paper}'
    rounded: '{rounded.none}'
  seat-away:
    backgroundColor: '{colors.paper}'
    textColor: '{colors.ink}'
    rounded: '{rounded.none}'
  seat-unknown:
    backgroundColor: '{colors.paper}'
    textColor: '{colors.ink}'
    rounded: '{rounded.none}'
  button-primary:
    backgroundColor: '{colors.ink}'
    textColor: '{colors.paper}'
    rounded: '{rounded.none}'
    height: '48px'
  alert-offline:
    backgroundColor: '{colors.live}'
    textColor: '{colors.on-live}'
    rounded: '{rounded.none}'
    padding: '16px'
---

# Design System: ZeroFrame

## Overview

**방향: "게시판 포스터"**

학과 게시판에 붙은 국제주의 타이포그래피 포스터처럼, 아주 큰 숫자 하나와 굵은 고딕, 평평한 면 색, 굵은 가로 선으로 정보를 정리합니다. 학생은 걸으면서 화면을 봅니다. 그래서 "빈자리 몇 석"이 가장 먼저, 가장 크게 읽혀야 하고, 그다음이 확인 불가 수와 좌석 위치입니다.

장식은 없습니다. 색은 뜻이 있을 때만 씁니다. 초록은 빈자리, 검정은 사용 중과 글자, 빨강은 "방금 바뀜"과 "장치 끊김" 두 가지에만 씁니다. 회색 면은 쓰지 않습니다. 회색은 비활성처럼 읽혀서 "확인 불가"와 섞이기 때문입니다.

밝은 화면 하나만 둡니다. 실외 햇빛 아래 휴대폰으로 보는 장면이 기본이라 어두운 테마는 만들지 않습니다.

**핵심 특징:**

- 방 요약의 빈자리 숫자는 화면에서 가장 큰 글자(144px)입니다.
- 좌석은 각진 면입니다. 4상태는 색과 함께 면, 띠, 빗금으로 구분되어 흑백으로도 읽힙니다.
- 정보 묶음은 카드가 아니라 굵은 가로 선(2px, 6px)으로 나눕니다.
- 모서리 반경과 그림자가 없습니다.

## Colors

| 토큰       | 값                     | 쓰임                                            | 대비                       |
| ---------- | ---------------------- | ----------------------------------------------- | -------------------------- |
| `paper`    | `#f2f0ea`              | 바탕                                            |                            |
| `surface`  | `#ffffff`              | 바텀시트처럼 바탕 위에 올라오는 면              |                            |
| `ink`      | `#121212`              | 본문, 선, 사용 중 좌석 면, 주요 버튼            | paper 16.4:1               |
| `ink-soft` | `#3d3b37`              | 보조 글자(표의 왼쪽 이름, 갱신 시각)            | paper 9.8:1                |
| `empty`    | `#007a45`              | 빈자리 면, 빈자리 숫자                          | paper 4.8:1, 흰 글자 5.4:1 |
| `on-empty` | `#ffffff`              | 빈자리 면 위 글자                               | 5.4:1                      |
| `live`     | `#c4301a`              | 방금 바뀐 좌석 테두리와 표시, 장치 끊김 안내 띠 | paper 4.9:1, 흰 글자 5.6:1 |
| `on-live`  | `#ffffff`              | live 면 위 글자                                 | 5.6:1                      |
| `scrim`    | `rgb(18 18 18 / 0.28)` | 바텀시트 뒤 막. 글자를 올리지 않음              |                            |

- `empty` 와 `live` 는 서로의 자리를 빌리지 않습니다. 빈자리를 빨강으로, 경고를 초록으로 쓰지 않습니다.
- `live` 는 한 화면에 두 군데를 넘지 않게 씁니다. 많아지면 아무것도 눈에 띄지 않습니다.
- 혼잡도(여유, 보통, 혼잡)는 색이 아니라 `ink` 면 위의 말로 보여줍니다.

## Typography

글꼴은 두 가지입니다.

- **Gothic A1**: 한글 전부. 제목과 요약은 900(black), 본문은 500, 라벨은 700.
- **Archivo**: 숫자와 좌석 번호(A1, B12). 항상 고정폭 숫자(`tabular-nums`)로 씁니다. 숫자가 바뀌어도 자리가 흔들리지 않게 하기 위해서입니다.

| 역할        | 토큰               | 크기               | 쓰는 곳                       |
| ----------- | ------------------ | ------------------ | ----------------------------- |
| poster      | `text-poster`      | 144px, Archivo 800 | 방 요약의 빈자리 숫자 하나    |
| poster-word | `text-poster-word` | 72px, 900          | 숫자를 낼 수 없을 때의 "모름" |
| sheet       | `text-sheet`       | 34px, 900          | 바텀시트의 좌석 번호와 상태   |
| title       | `text-title`       | 30px, 900          | 방 이름, 페이지 제목          |
| alert       | `text-alert`       | 24px, 900          | 장치 끊김 같은 안내 제목      |
| fact        | `text-fact`        | 22px, 900          | 요약 표 첫 줄(빈자리)         |
| number      | `text-number`      | 20px, Archivo 700  | 요약 표의 숫자                |
| body        | `text-body`        | 15px, 500          | 본문, 표                      |
| label       | `text-label`       | 13px, 700          | 좌석 칸 안 상태, 범례         |
| caption     | `text-caption`     | 12px, 700          | 좌석도의 벽, 통로, 창가 표시  |

- 큰 글자는 자간을 줄입니다(`tracking-tight` -0.03em, 포스터 숫자는 `tracking-poster` -0.04em).
- 한국어는 단어 단위로 줄을 바꿉니다(keep-all). 긴 ID 는 필요하면 어디서든 끊습니다.
- 대문자 라벨, 자간을 넓힌 라벨, 제목 위의 작은 머리말을 쓰지 않습니다.
- 글꼴은 웹폰트로 불러옵니다. 실패하면 기기의 한글 고딕으로 대신합니다.

## Layout

- 360px 에서 설계하고 390px, 768px 에서 확인합니다. 화면 가장자리 여백은 16px(`spacing-4`)이고 safe-area 를 함께 봅니다.
- 간격은 4px 단위 토큰(`spacing-1` ~ `spacing-16`)만 씁니다. 묶음 안은 촘촘하게, 묶음 사이는 넓게 둡니다.
- 방 화면의 순서는 고정입니다: 상단 줄(방 목록, 갱신 시각) → 방 이름 → 요약(큰 숫자 + 표) → 좌석도 → 범례.
- 요약은 2열입니다. 왼쪽은 큰 숫자, 오른쪽은 가는 선으로 나눈 표(빈자리, 확인 불가, 전체, 혼잡도 또는 마지막 확인). 큰 숫자 칸은 숫자 폭 그대로 두고 표가 나머지를 쓰며, 둘 사이에 간격을 둡니다.
- 좌석도는 서버가 주는 `layout` 좌표로 그리고 너비에 맞게 줄입니다. 위쪽 굵은 선(6px)을 둡니다. 방의 방향(창가, 앞) 정보가 데이터에 없어 글자로 표시하지 않습니다. 좌석별 창가 여부는 바텀시트에서 보입니다.
- 페이지에는 가로 스크롤이 없습니다.

### 좌석이 많은 방

| 좌석 칸 너비        | 칸 안에 넣는 것                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 64px 이상           | 좌석 번호, 상태 이름, 콘센트 표시                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| 40px 이상 64px 미만 | 좌석 번호와 콘센트 표시. 상태는 면과 무늬로만 구분하고 이름은 바텀시트에서 읽음                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 40px 미만           | 좌석도 안에서만 확대와 이동(버튼 하나가 "확대"와 "전체 보기"를 오가고, 확대하면 좌석도 바로 아래에 "옆으로 밀면 나머지 좌석이 보여요" 한 줄, 상자 안 스크롤). 확대하면 가장 작은 칸의 짧은 변이 44px 이상이 되고, 오른쪽 끝에서 한 칸이 항상 일부(25%에서 75%) 잘려 보여 더 있다는 것이 드러나게 배율을 조금 키움. 칸이 작아 콘센트 아이콘이 숨은 동안 범례의 콘센트 줄에 "확대하면 보여요"를 붙임. 처음에는 방 전체가 보이게 맞춤. 두 손가락으로 좌석도만 확대하는 기능은 아직 없고, 브라우저의 페이지 확대는 막지 않음 |

칸 사이 간격은 서버 `layout` 좌표를 그대로 따릅니다. 간격이 실제 통로나 책상 배치일 수 있어 메우지 않습니다. 배포 데이터처럼 좌석 폭 64에 간격 16이면 360px 에서 한 줄 6석까지 확대 없이 누를 수 있습니다. 계산: 좌석도 상자 안쪽 여백 8px 를 빼면 내용 폭 312px, 한 줄 n석의 viewBox 폭 80n - 16, 칸 = 64 / (80n - 16) x 312. 6석 43.0px(40px 이상, 확대 없음), 7석 36.7px(확대).

## Elevation & Depth

평평합니다. 그림자 토큰이 없습니다. 위에 올라오는 것은 면과 선으로 구분합니다.

- 바텀시트: `surface` 면, 위쪽 6px 띠(그 좌석 상태의 색, 빈자리면 `empty`), 뒤에 `scrim`.
- 장치 끊김 안내: 화면 폭 전체의 `live` 띠.

## Shapes

- 모서리는 모두 각집니다. 반경 토큰이 없습니다.
- 선 굵기: 1px(표 안 구분), 2px(구역 구분, 확인 불가 테두리), 3px(짐 있음 테두리), 4px(선택, 방금 바뀜), 6px(벽, 바텀시트 위 띠).
- 아이콘은 한 가지 굵기의 직접 그린 선 아이콘만 씁니다(콘센트 등). 이모지와 글자 기호를 아이콘 대신 쓰지 않습니다.

## Components

### 좌석 4상태

말은 공통 문서 `SEAT-STATES.md` 의 "학생에게 보이는 말"을 그대로 씁니다.

| 상태      | 면                                     | 형태                                           | 흑백에서 구분되는 점 |
| --------- | -------------------------------------- | ---------------------------------------------- | -------------------- |
| 빈자리    | `empty` 면, `on-empty` 글자            | 꽉 찬 면                                       | 진한 단색 면         |
| 사용 중   | `ink` 면, `paper` 글자                 | 꽉 찬 면                                       | 가장 어두운 단색 면  |
| 짐 있음   | `paper` 면, `ink` 글자                 | 3px `ink` 테두리 + 아래쪽 띠(칸 높이의 약 25%) | 밝은 면 아래 검은 띠 |
| 확인 불가 | `paper` 면 위 `--pattern-unknown` 빗금 | 2px `ink` 테두리, 글자는 `paper` 바탕 조각 위  | 빗금                 |

- 확인 불가는 회색으로 칠하지 않습니다. "없음"이 아니라 "모름"입니다.
- 선택한 좌석: 4px `ink` 테두리를 3px 띄워 둘러 줍니다.
- 방금 바뀐 좌석: 4px `live` 테두리와 "방금 사용 중"처럼 바뀐 상태를 쓴 작은 `live` 표시. 1.6초 동안 테두리가 한 번 조여 들고(`--duration-live`) 몇 초 뒤 사라집니다. 동작 줄이기 설정이면 움직이지 않고 테두리만 보입니다.
- 좌석은 버튼입니다. 화면 읽기 도구 이름은 "A1 빈자리, 콘센트 있음"처럼 번호, 상태, 콘센트 순서입니다.
- 범례는 좌석도 바로 아래에 2열로 둡니다.

### 방 요약

- 큰 숫자는 빈자리 수, `empty` 색입니다.
- 표에는 항상 빈자리, 확인 불가, 전체를 이 순서로 둡니다. 확인 불가가 0이어도 지우지 않습니다.
- 모든 좌석이 확인 불가면 큰 숫자 자리에 0 대신 `ink` 색 "모름"(`text-poster-word`)을 두고, 혼잡도 대신 마지막으로 확인한 시각을 둡니다. 서버가 혼잡도를 `HIGH` 로 주어도 "혼잡"이라고 쓰지 않습니다.
- 갱신 시각은 상단 줄 오른쪽에 "12초 전 갱신"처럼 씁니다. 1분 넘게 갱신되지 않으면 그 사실을 같은 자리에 씁니다.

### 장치 끊김

- 상단 줄 바로 아래, 방 이름보다 먼저 화면 폭 전체의 `live` 띠를 둡니다. 제목 "장치 연결이 끊겼어요"(`text-alert`)와 한두 줄 설명("지금은 이 방 자리를 확인할 수 없어요. 만석이라는 뜻은 아니에요.").
- 좌석도는 모두 확인 불가 무늬로 바뀌고, 요약은 위 "모름" 규칙을 따릅니다.

### 바텀시트

- 좌석을 누르면 아래에서 올라옵니다(`--duration-sheet` 240ms, `ease-out`). 동작 줄이기 설정이면 바로 나타납니다.
- 내용 순서: 좌석 번호와 상태(`text-sheet`, 상태는 그 상태 색) → 표(자리, 콘센트, 마지막 확인, 상태가 바뀐 때) → 닫기 버튼.
- 표는 위 2px, 줄마다 1px `ink` 선입니다. 마지막 확인은 "12초 전 (14:02:48)"처럼 상대 시각과 한국 시각을 함께 씁니다.
- 아래로 끌거나 닫기를 누르면 닫히고, 포커스는 누른 좌석으로 돌아갑니다.

### 버튼과 링크

- 주요 버튼: `ink` 면, `paper` 글자, 높이 48px, 각진 모서리, 너비 가득.
- 보조 버튼: 배경 없이 `paper` 바탕 위에 놓고, 2px `ink` 테두리, `ink` 글자, 너비 가득, 높이 `spacing-tap`(44px) 이상. 좌석도 조작("확대", "전체 보기")에 씁니다. 비활성 상태를 만들지 않고 회색을 쓰지 않습니다.
- 링크: `ink` 글자, 밑줄(간격 4px). 누를 수 있는 높이는 `spacing-tap`(44px) 이상.
- 키보드 포커스: 3px `ink` 윤곽선을 2px 띄워서, 바로 나타나게.

## Do's and Don'ts

**Do**

- 빈자리 수를 화면에서 가장 크게 보여줍니다.
- 확인 불가 수를 빈자리 수 바로 옆에 둡니다.
- 색을 쓰면 무늬나 형태, 말을 함께 둡니다.
- 숫자는 고정폭 숫자로 씁니다.
- 새 값이 필요하면 이 문서와 `src/app/styles/tokens.css` 를 먼저 고칩니다.

**Don't**

- 회색 면이나 흐린 글자로 "확인 불가"를 나타내지 않습니다.
- 둥근 카드, 그림자, 카드 안의 카드, 그라데이션, 흐림 효과를 쓰지 않습니다.
- 이모지, 느낌표, "실시간!" 같은 문구를 쓰지 않습니다.
- 모든 것을 가운데 정렬하지 않습니다. 왼쪽 정렬이 기본입니다.
- 포스터 크기(144px)를 글자 제목에 쓰지 않습니다. 숫자 하나에만 씁니다.
- 컴포넌트에 hex 나 임의 값(`text-[#…]`, `p-[13px]`)을 쓰지 않습니다.
- 화면에 기술 용어(엣지, WebSocket, UNKNOWN)를 드러내지 않습니다.
