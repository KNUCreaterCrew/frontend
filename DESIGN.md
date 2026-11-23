---
name: ZeroFrame
description: 공강에 휴대폰으로 실습실 빈자리를 확인하는 좌석도
colors:
  paper: '#eef1f8'
  surface: '#ffffff'
  ink: '#0e2036'
  ink-soft: '#4a5873'
  on-ink: '#ffffff'
  accent: '#0e2036'
  line: 'rgb(14 32 54 / 0.1)'
  line-strong: '#7b85a3'
  empty: '#0e9467'
  empty-ink: '#0b7a55'
  empty-tint: '#d6f1e5'
  away-top: '#b4bbcd'
  away: '#a3aac0'
  occupied-top: '#5f6987'
  occupied: '#4b5474'
  on-occupied: '#ffffff'
  live: '#b42318'
  on-live: '#ffffff'
  scrim: 'rgb(14 32 54 / 0.24)'
  wash-blue: '#d3dffb'
  wash-lilac: '#e2dbf8'
  wash-sky: '#d9eafa'
typography:
  poster:
    fontFamily: 'Pretendard Variable, Pretendard, -apple-system, BlinkMacSystemFont, Apple SD Gothic Neo, Malgun Gothic, sans-serif'
    fontSize: '6rem'
    fontWeight: 700
    lineHeight: 0.9
    letterSpacing: '-0.04em'
    fontFeature: 'tnum'
  count:
    fontFamily: 'Pretendard Variable, Pretendard, -apple-system, BlinkMacSystemFont, Apple SD Gothic Neo, Malgun Gothic, sans-serif'
    fontSize: '4.5rem'
    fontWeight: 700
    lineHeight: 0.9
    letterSpacing: '-0.04em'
    fontFeature: 'tnum'
  poster-word:
    fontFamily: 'Pretendard Variable, Pretendard, -apple-system, BlinkMacSystemFont, Apple SD Gothic Neo, Malgun Gothic, sans-serif'
    fontSize: '3rem'
    fontWeight: 700
    lineHeight: 1
    letterSpacing: '-0.02em'
  row-number:
    fontFamily: 'Pretendard Variable, Pretendard, -apple-system, BlinkMacSystemFont, Apple SD Gothic Neo, Malgun Gothic, sans-serif'
    fontSize: '2.75rem'
    fontWeight: 700
    lineHeight: 1
    letterSpacing: '-0.02em'
    fontFeature: 'tnum'
  count-word:
    fontFamily: 'Pretendard Variable, Pretendard, -apple-system, BlinkMacSystemFont, Apple SD Gothic Neo, Malgun Gothic, sans-serif'
    fontSize: '2.25rem'
    fontWeight: 700
    lineHeight: 1
    letterSpacing: '-0.02em'
  title:
    fontFamily: 'Pretendard Variable, Pretendard, -apple-system, BlinkMacSystemFont, Apple SD Gothic Neo, Malgun Gothic, sans-serif'
    fontSize: '1.625rem'
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: '-0.02em'
  sheet:
    fontFamily: 'Pretendard Variable, Pretendard, -apple-system, BlinkMacSystemFont, Apple SD Gothic Neo, Malgun Gothic, sans-serif'
    fontSize: '1.625rem'
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: '-0.02em'
  heading:
    fontFamily: 'Pretendard Variable, Pretendard, -apple-system, BlinkMacSystemFont, Apple SD Gothic Neo, Malgun Gothic, sans-serif'
    fontSize: '1.375rem'
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: '-0.02em'
  name:
    fontFamily: 'Pretendard Variable, Pretendard, -apple-system, BlinkMacSystemFont, Apple SD Gothic Neo, Malgun Gothic, sans-serif'
    fontSize: '1.1875rem'
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: '-0.02em'
  fact:
    fontFamily: 'Pretendard Variable, Pretendard, -apple-system, BlinkMacSystemFont, Apple SD Gothic Neo, Malgun Gothic, sans-serif'
    fontSize: '1.0625rem'
    fontWeight: 600
    lineHeight: 1.35
  alert:
    fontFamily: 'Pretendard Variable, Pretendard, -apple-system, BlinkMacSystemFont, Apple SD Gothic Neo, Malgun Gothic, sans-serif'
    fontSize: '1.0625rem'
    fontWeight: 700
    lineHeight: 1.35
  number:
    fontFamily: 'Pretendard Variable, Pretendard, -apple-system, BlinkMacSystemFont, Apple SD Gothic Neo, Malgun Gothic, sans-serif'
    fontSize: '1.0625rem'
    fontWeight: 600
    lineHeight: 1.3
    fontFeature: 'tnum'
  body:
    fontFamily: 'Pretendard Variable, Pretendard, -apple-system, BlinkMacSystemFont, Apple SD Gothic Neo, Malgun Gothic, sans-serif'
    fontSize: '0.9375rem'
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: 'Pretendard Variable, Pretendard, -apple-system, BlinkMacSystemFont, Apple SD Gothic Neo, Malgun Gothic, sans-serif'
    fontSize: '0.8125rem'
    fontWeight: 400
    lineHeight: 1.4
  caption:
    fontFamily: 'Pretendard Variable, Pretendard, -apple-system, BlinkMacSystemFont, Apple SD Gothic Neo, Malgun Gothic, sans-serif'
    fontSize: '0.75rem'
    fontWeight: 400
    lineHeight: 1.4
rounded:
  chip: '5px'
  seat-sm: '8px'
  seat: '12px'
  inner: '20px'
  glass: '28px'
  sheet: '34px'
  full: '9999px'
spacing:
  '0': '0px'
  'px': '1px'
  '1': '4px'
  '2': '8px'
  '3': '12px'
  '4': '16px'
  '5': '20px'
  '6': '24px'
  '8': '32px'
  '10': '40px'
  '12': '48px'
  '16': '64px'
  tap: '44px'
  band: '6px'
  side: '400px'
components:
  glass-panel:
    backgroundColor: 'rgb(255 255 255 / 0.58)'
    textColor: '{colors.ink}'
    rounded: '{rounded.glass}'
    padding: '20px'
  summary-strip:
    backgroundColor: 'rgb(255 255 255 / 0.58)'
    textColor: '{colors.ink}'
    rounded: '{rounded.glass}'
    padding: '16px 20px'
    width: '480px'
  side-panel:
    backgroundColor: 'rgb(255 255 255 / 0.58)'
    textColor: '{colors.ink}'
    rounded: '{rounded.glass}'
    padding: '20px'
    width: '{spacing.side}'
  room-sheet:
    backgroundColor: 'rgb(255 255 255 / 0.58)'
    textColor: '{colors.ink}'
    rounded: '{rounded.sheet}'
    padding: '0 20px'
    width: '480px'
  seat-sheet:
    backgroundColor: 'rgb(255 255 255 / 0.58)'
    textColor: '{colors.ink}'
    rounded: '{rounded.sheet}'
    padding: '0 20px'
    width: '480px'
  glass-pill:
    backgroundColor: 'rgb(255 255 255 / 0.58)'
    textColor: '{colors.ink}'
    rounded: '{rounded.full}'
    height: '44px'
    padding: '0 20px 0 16px'
  seat-empty:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.empty-ink}'
    rounded: '{rounded.seat}'
  seat-away:
    backgroundColor: '{colors.away}'
    textColor: '{colors.ink}'
    rounded: '{rounded.seat}'
  seat-occupied:
    backgroundColor: '{colors.occupied}'
    textColor: '{colors.on-occupied}'
    rounded: '{rounded.seat}'
  seat-unknown:
    backgroundColor: 'rgb(255 255 255 / 0.28)'
    textColor: '{colors.ink}'
    rounded: '{rounded.seat}'
  seat-zoom:
    rounded: '{rounded.seat-sm}'
  seat-just-changed-chip:
    backgroundColor: '{colors.live}'
    textColor: '{colors.on-live}'
    rounded: '{rounded.chip}'
    padding: '1px 4px'
  button-primary:
    backgroundColor: '{colors.ink}'
    textColor: '{colors.on-ink}'
    rounded: '{rounded.full}'
    height: '48px'
  button-primary-hover:
    backgroundColor: 'rgb(14 32 54 / 0.9)'
  button-plain:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.ink}'
    rounded: '{rounded.full}'
    height: '44px'
    padding: '0 20px'
  weekday-well:
    backgroundColor: 'rgb(14 32 54 / 0.05)'
    rounded: '{rounded.full}'
    padding: '4px'
  weekday-selected:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.ink}'
    rounded: '{rounded.full}'
    height: '44px'
  weekday-idle:
    textColor: '{colors.ink-soft}'
    rounded: '{rounded.full}'
    height: '44px'
  source-chip:
    textColor: '{colors.ink-soft}'
    rounded: '{rounded.chip}'
    padding: '0 4px'
  room-tile:
    backgroundColor: 'rgb(255 255 255 / 0.58)'
    textColor: '{colors.ink}'
    rounded: '{rounded.glass}'
    padding: '16px'
  stage-caption:
    backgroundColor: 'rgb(255 255 255 / 0.58)'
    textColor: '{colors.ink}'
    rounded: '{rounded.glass}'
    padding: '8px 16px 8px 20px'
    height: '44px'
  count-pip-empty:
    backgroundColor: '{colors.surface}'
    rounded: '{rounded.chip}'
    size: '8px'
  count-pip-taken:
    backgroundColor: '{colors.line-strong}'
    rounded: '{rounded.chip}'
    size: '8px'
  preview-band:
    backgroundColor: '{colors.ink}'
    textColor: '{colors.on-ink}'
    height: '44px'
---

# Design System: ZeroFrame

## Overview

**Creative North Star: "유리 아래의 평면도"**

좌석도가 화면 그 자체입니다. 옅은 블루 기운의 흰 바닥판(`paper`)이 화면 가득 깔리고, 그 위에 아주 옅은 빛 번짐 셋(블루, 라벤더, 하늘)이 붙어 있습니다. 점 격자는 두지 않습니다(아래 결정 이유). 좌석 칸은 이 바닥판 위에 바로 놓이고, 요약, 범례, 통계, 좌석 상세는 그 위에 떠 있는 옅은 유리 조작층으로 올라옵니다. 지도 앱의 "화면 가득한 지도, 떠 있는 유리, 끌어 올리는 시트" 구조입니다. 유리는 그 아래를 지나는 번짐과 좌석을 비춰서 유리로 읽힙니다.

학생은 걸으면서 화면을 봅니다. 그래서 위 유리 띠의 큰 에메랄드 숫자(빈자리 수)가 가장 먼저, 바로 옆 확인 불가 수가 그다음으로 읽히고, 바닥판에서는 가장 밝게 빛나는 칸이 빈자리입니다. 좌석 4상태는 밝기 순서가 곧 뜻입니다: 빈자리(가장 밝은 흰 칸, 에메랄드 테두리와 빛) > 짐 있음(중간 회청색) > 사용 중(진한 스모크). 확인 불가는 면을 칠하지 않고 점선 윤곽만 둡니다. "없음"이 아니라 "모름"이기 때문입니다.

색은 둘뿐입니다. 빈자리 에메랄드와 "방금 바뀜", "장치 끊김"의 빨강(`live`). 나머지는 네이비 글자(`ink`)와 회청색 계열입니다. 이 세계에는 파랑이 없어서 링크와 포커스 링(`accent`)도 `ink` 와 같은 값입니다. 밝은 화면 하나만 둡니다(`color-scheme: light`). 실외 햇빛 아래 휴대폰으로 보는 장면이 기본입니다.

이 세계는 이전의 "학부 네이비 안내판"을 대체합니다(이유는 "결정 이유와 버린 안").

**Key Characteristics:**

- 바닥판이 화면 전체이고, 조작층은 모두 그 위에 뜬 유리입니다. 휴대폰은 위 캡슐 둘, 요약 띠, 아래 시트. PC 는 왼쪽 400px 사이드 패널 하나와 오른쪽 위 갱신 캡슐.
- 빈자리 숫자는 에메랄드 글자(`empty-ink`)로 화면에서 가장 큽니다(휴대폰 72px, PC 96px).
- 좌석 4상태는 밝기, 테두리 형태(실선 에메랄드 / 없음 / 점선), 선 아이콘(가방, 물음표)으로 흑백에서도 갈립니다.
- 모서리는 한 둥근 계열입니다(칸 12px, 유리 판 28px, 시트 34px, 조작 요소는 캡슐). 비대칭 모서리는 없습니다.
- 유리는 흰색 58%에서 40% 세로 그라데이션, 흐림 24px, 채도 1.9, 135도 반사 테두리, 위쪽 광택, 넓은 옅은 그림자로 만듭니다. `backdrop-filter` 를 못 쓰면 흰색 94% 면입니다.
- 글꼴은 Pretendard Variable 하나, 숫자는 고정폭입니다.
- 시그니처 움직임은 값이 바뀐 칸과 숫자가 위에서 한 번 넘어오는 판(flip)이고, 동작 줄이기 설정이면 움직이지 않습니다.
- 첫 화면(방 목록)은 같은 바닥판 위에 실제 방 하나의 좌석을 칠한 불투명 블록으로 세운 입체 무대를 두고, 그 아래 방마다 유리 타일을 놓습니다. 원근이 있는 장면은 이 무대 하나뿐입니다.

## Colors

옅은 블루 흰색 위에 네이비 글자, 에메랄드 하나, 빨강 하나. 값은 `src/app/styles/tokens.css` 가 기준이고 이 문서의 frontmatter 는 그 값을 옮긴 것입니다. 대비는 WCAG 2.2 공식으로 직접 계산했습니다(본문 4.5:1, 큰 글자와 아이콘, 의미 있는 경계 3:1 이상). 반투명 값은 `paper` 위에 합성해서 쟀습니다.

### Primary

- **빈자리 에메랄드** (`empty`): 빈자리 칸의 2px 테두리와 바깥 빛, 오늘 빈자리 막대 윗선, 범례 견본, 서비스 이름 앞 8px 점, 미리보기 시나리오 목록의 "지금 보는 중" 막대. 흰 면 3.85:1, `paper` 3.41:1 이라 경계와 아이콘에는 되지만 글자에는 쓰지 않습니다.
- **빈자리 글자 에메랄드** (`empty-ink`): 빈자리 칸 글자, 큰 빈자리 숫자, 방 목록의 빈자리 숫자, 좌석 상세의 "빈자리". 흰 면 5.34:1, `paper` 4.73:1, 빈자리 칸 아래쪽 면(`#f3f8fb`) 5.00:1, 유리 면(흰색 40%를 `paper` 위에) 4.97:1.
- **빈자리 막대 면** (`empty-tint`): 통계 그래프의 오늘 빈자리 막대 면과 그 범례 견본에만. 흰 면과 1.2:1 이라 경계는 2px `empty` 윗선이 맡고, 글자를 올리지 않습니다.

### Secondary

- **방금 바뀜 빨강** (`live`): 방금 바뀐 좌석의 4px 윤곽과 "방금" 조각, 장치 끊김 아이콘과 제목에만. `paper` 5.81:1, 흰 면 6.57:1, 유리 면 6.11:1. `on-live`(흰색) 글자는 `live` 위 6.57:1. `empty` 와의 밝기 대비는 1.71:1 뿐이라 둘을 맞닿게 두지 않습니다.

### Neutral

- **바닥판** (`paper`): 바탕이자 바닥판. `ink` 14.53:1, `ink-soft` 6.33:1.
- **흰 면** (`surface`): 유리를 못 쓰는 경우의 면, 유리 안 선택 캡슐, 빈자리 견본, 그래프의 빗금 바탕. `ink` 16.42:1, `ink-soft` 7.16:1.
- **네이비 글자** (`ink`): 본문, 제목, 짐 있음 칸 글자, 주요 버튼 면, 선택한 좌석 윤곽, 그래프 지금 선. 짐 있음 면 위 7.09:1(위쪽 면 8.55:1), 확인 불가 칸 면(흰색 28%) 15.04:1.
- **보조 글자** (`ink-soft`): 표 이름, 범례, 갱신 시각, 그래프 눈금, 평소 점선, 확인 불가 칸 아이콘. 유리 면 6.65:1, 유리 대체 면(흰색 94%) 7.10:1.
- **ink 위 글자** (`on-ink`): 주요 버튼과 미리보기 띠의 글자. `ink` 위 16.42:1, hover 면(`ink` 90%) 위 12.24:1.
- **링크와 포커스** (`accent`): 링크 글자, 포커스 링, 글자 커서. 이 세계에 파랑이 없어 `ink` 와 같은 값입니다(`paper` 14.53:1).
- **장식 선** (`line`): 유리 안 구분선, 표의 줄, 그래프 위쪽 점선, 뼈대 막대. `paper` 와 1.22:1 이고 뜻을 싣지 않습니다.
- **의미 있는 경계** (`line-strong`): 확인 불가 점선 윤곽, 그래프 바닥선과 기록 없는 구간 테두리, 출처 표시 테두리, 끌기 손잡이(50%), 방 타일 개수 점의 "쓰는 중" 면(유리 면 3.42:1). `paper` 3.24:1, 흰 면 3.67:1, 확인 불가 칸 면 3.36:1.
- **짐 있음** (`away-top` → `away`): 짐 있음 칸 면의 세로 그라데이션, 범례 견본은 `away` 단색. `ink` 글자 7.09:1 이상.
- **사용 중** (`occupied-top` → `occupied`): 사용 중 칸 면의 세로 그라데이션, 범례 견본은 `occupied` 단색. `on-occupied`(흰색) 글자 7.45:1(위쪽 면 5.44:1). `away` 와의 밝기 대비 3.22:1(위쪽끼리 2.83:1).
- **막** (`scrim`): 좌석 상세 뒤를 덮는 `ink` 24% 막(흐림 2px). 글자를 올리지 않습니다.
- **빛 번짐** (`wash-blue`, `wash-lilac`, `wash-sky`): 바닥판의 큰 원형 번짐 셋(왼쪽 위 60vmax, 오른쪽 가운데 50vmax, 아래 45vmax). 유리가 비출 것을 만들어 줍니다. 글자를 올리지 않습니다.

### 토큰 밖의 고정 값

좌석과 유리의 재질은 `global.css` 와 `tokens.css` 의 `:root` 에만 있고 컴포넌트에는 쓰지 않습니다.

| 이름                | 값                                     | 쓰임                                             |
| ------------------- | -------------------------------------- | ------------------------------------------------ |
| `--glass-fill`      | 흰색 58% → 40% 세로 그라데이션         | 유리 면                                          |
| `--glass-fallback`  | 흰색 94%                               | `backdrop-filter` 를 못 쓸 때 유리 면            |
| `--glass-rim`       | 135도, 흰색 100% / 25% / 0 / 20% / 90% | 1.25px 반사 테두리(왼쪽 위와 오른쪽 아래만 밝음) |
| `--glass-sheen`     | 흰색 36% → 0 세로                      | 유리 위쪽 42%(최대 6rem) 광택                    |
| `--pattern-floor`   | `ink` 11% 1px 점, 18px 간격            | 지금은 쓰지 않음(점 격자 없는 바닥판 시험 중)    |
| `--pattern-unknown` | -45도, `ink-soft` 1px 선, 6px 간격     | 그래프의 확인하지 못한 시간에만                  |
| 빈자리 칸 면        | `#ffffff` → `#fbfdff` → `#f3f8fb` 세로 | 빈자리 칸                                        |
| 빈자리 빛           | `rgb(16 185 129)` 10%에서 55%          | 빈자리 칸과 견본의 바깥 빛과 그림자              |
| 확인 불가 칸 면     | 흰색 28%                               | 확인 불가 칸                                     |
| 캡슐 면             | 흰색 98% → 80% 세로                    | 유리 위 흰 캡슐                                  |
| 홈 면               | `ink` 5%                               | 요일 고르기 바탕                                 |

**The 밝기가 곧 뜻 Rule.** 좌석도에서 밝은 칸은 비어 있는 자리로 읽힙니다. 빈자리가 가장 밝고(흰 면), 짐 있음이 중간, 사용 중이 가장 진합니다. 사용 중이나 짐 있음을 빈자리보다 밝게 칠하지 않고, 빈자리 칸을 색 면으로 채우지 않습니다.

**The 두 신호 Rule.** 색을 가진 것은 에메랄드와 `live` 빨강뿐이고 서로의 자리를 빌리지 않습니다. 빈자리를 빨강으로, 경고를 초록으로 쓰지 않습니다. `live` 는 "방금 바뀜"과 "장치 끊김" 두 가지에만, 한 화면에 두 군데를 넘지 않게 씁니다. 방 목록에는 `live` 를 쓰지 않습니다.

**The 파랑 없음 Rule.** 링크, 포커스 링, 버튼에 파랑이나 인디고를 들이지 않습니다. `accent` 는 `ink` 입니다.

- 혼잡도(여유, 보통, 혼잡)는 색이 아니라 말로 보여줍니다.
- 확인 불가에는 회색 면을 쓰지 않습니다. 확인 불가 칸의 흰색 28% 면은 칠한 것이 아니라 바닥판이 비치는 빈 칸입니다.

## Typography

**Body Font:** Pretendard Variable(jsDelivr 동적 서브셋). 실패하면 `-apple-system`, Apple SD Gothic Neo, Malgun Gothic 같은 기기 한글 고딕으로 대신합니다.

**Character:** 한 가족으로 한글, 숫자, 서비스 이름을 모두 씁니다. 400(본문), 500(좌석 칸 안 상태 이름), 600(표 값, 방 목록 이름, 버튼, 통계 제목), 700(제목, 큰 숫자, 경고, 좌석 번호) 네 굵기만 씁니다.

숫자와 좌석 번호(A1, B12), 시각은 `num` 유틸리티로 씁니다. `font-family: var(--font-num)` 과 `tabular-nums` 를 함께 걸어 숫자가 바뀌어도 자리가 흔들리지 않게 합니다. 본문에는 Pretendard 의 `ss06` 스타일 세트를 켭니다.

### Hierarchy

| 역할        | 토큰               | 크기, 굵기, 줄 높이          | 쓰는 곳                                                                                                                        |
| ----------- | ------------------ | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| poster      | `text-poster`      | 96px, 700, 0.9, 자간 -0.04em | PC 사이드 패널의 빈자리 숫자 하나                                                                                              |
| count       | `text-count`       | 72px, 700, 0.9, 자간 -0.04em | 휴대폰 요약 띠의 빈자리 숫자 하나                                                                                              |
| poster-word | `text-poster-word` | 48px, 700, 1, 자간 -0.02em   | 모든 좌석이 확인 불가일 때 PC 숫자 자리의 "확인 / 불가"(두 줄)                                                                 |
| row-number  | `text-row-number`  | 44px, 700, 1, 고정폭         | 방 목록 타일의 빈자리 숫자                                                                                                     |
| count-word  | `text-count-word`  | 36px, 700, 1                 | 모든 좌석이 확인 불가일 때 휴대폰 숫자 자리의 "확인 / 불가"                                                                    |
| title       | `text-title`       | 26px, 700, 1.2, 자간 -0.02em | 오류와 404 판 제목(방 목록 오류 판 포함)                                                                                       |
| sheet       | `text-sheet`       | 26px, 700, 1.2               | 좌석 상세의 좌석 번호와 상태                                                                                                   |
| heading     | `text-heading`     | 22px, 700, 1.25              | PC 사이드 패널의 방 이름(패널 폭 전체), 방 목록 제목, 방 목록 타일의 "확인 불가"                                               |
| name        | `text-name`        | 19px, 700, 1.25              | 휴대폰 요약 띠의 방 이름                                                                                                       |
| fact        | `text-fact`        | 17px, 600, 1.35              | "오늘 빈자리 흐름" 제목, 방 목록 타일 이름, PC 표 첫 줄 "빈자리", 워드마크(700), 비교 문장(700)                                |
| alert       | `text-alert`       | 17px, 700, 1.35              | 장치 끊김 제목                                                                                                                 |
| number      | `text-number`      | 17px, 600, 1.3, 고정폭       | PC 요약 표의 값, full 좌석 칸의 번호(700)                                                                                      |
| body        | `text-body`        | 15px, 400, 1.55              | 본문, 휴대폰 한 줄 요약, 좌석 상세 표, 요일 칸(600)                                                                            |
| label       | `text-label`       | 13px, 400, 1.4               | 범례, 갱신 캡슐, 그래프 눈금, 출처 표시, 좌석 칸 안 상태(500), compact 칸 번호(700), 방 목록 타일의 사실 줄과 문장(700), 방 수 |
| caption     | `text-caption`     | 12px, 1.4                    | 토큰만 있고 지금 화면에서 쓰는 곳은 없음                                                                                       |

- 큰 글자는 자간을 줄입니다(`tracking-tight` -0.02em, 큰 숫자는 `tracking-poster` -0.04em).
- 한국어는 단어 단위로 줄을 바꿉니다(`keep-all`). 긴 ID 는 필요하면 어디서든 끊습니다(`overflow-wrap: anywhere`).
- 대문자 라벨, 자간을 넓힌 라벨, 제목 위의 작은 머리말을 쓰지 않습니다.

**The 한 가족 Rule.** 글꼴은 Pretendard 하나입니다. 숫자용 글꼴을 따로 들이지 않고 `num` 으로 고정폭만 켭니다.

**The 큰 숫자는 하나 Rule.** 72px 와 96px 는 빈자리 숫자 하나에만 씁니다. 글자 제목에 쓰지 않습니다.

## Layout

- 360px 에서 설계하고 390px, 768px(`md`), 1024px(`lg`)에서 확인합니다. 1024px 에서 방 화면이 휴대폰 구조에서 사이드 패널 구조로 바뀝니다.
- 간격은 4px 단위 토큰(`spacing-1` ~ `spacing-16`)만 씁니다. 전용 토큰은 셋입니다: 터치 목표 44px(`spacing-tap`), 미리보기 시나리오 목록의 "지금 보는 중" 막대 6px(`spacing-band`), PC 사이드 패널 폭 400px(`spacing-side`).
- 유리 판 안쪽은 20px(`p-5`), 휴대폰 요약 띠는 위아래 16px 좌우 20px, 오류와 404 판은 24px 입니다. 유리 안 묶음 사이는 1px `line` 선과 위아래 16px(PC 패널은 20px)입니다.

### 방 화면, 휴대폰(1024px 미만)

- 바닥판(`room-floor`)이 화면 전체입니다. 좌석은 위 요약 띠와 아래 접힌 시트 사이 가운데에 놓이고, 그 높이는 화면이 띠와 시트를 재서 정합니다(띠 아래 16px, 시트 위 16px). 좌우 여백은 4px 와 safe-area 중 큰 값이고, 좌석도 상자 안쪽이 12px 입니다.
- 위: 떠 있는 유리 캡슐 둘. 왼쪽 "방 목록"(왼쪽 갈매기 16px), 오른쪽 "12초 전 갱신". 미리보기 띠와 safe-area 를 지나 12px 아래(`top-float`)입니다.
- 그 아래 12px: 유리 요약 띠(`top-hud`, 좌우 12px 띄움, 최대 480px 가운데). 왼쪽에 빈자리 숫자(72px), 오른쪽에 방 이름과 "빈자리 1석 확인 불가 1석 전체 4석" 한 줄(넘치면 다음 줄). 혼잡도는 휴대폰 띠에 두지 않습니다.
- 아래: 유리 시트(좌우와 아래 8px 띄움, 최대 480px). 접힘에는 손잡이, 범례, "오늘 빈자리 흐름" 제목, 비교 문장, 출처 문장, "위로 끌어 올리면 시간대별 흐름이 보여요." 펼침에는 그래프와 요일별 평소. 펼친 시트는 요약 띠 아래 12px 에서 멈추고 화면 높이의 85% 를 넘지 않습니다.
- 좌석이 많아 문서가 길어지면 좌석이 떠 있는 유리 아래로 지나갑니다.

### 방 화면, PC(1024px 이상)

- 바닥판이 화면 전체이고, 왼쪽에 16px 띄운 400px 유리 사이드 패널 하나(위는 `top-float`, 아래 16px)가 있습니다. 오른쪽 위 24px 에 갱신 캡슐 하나만 둡니다.
- 패널 순서: 워드마크 "ZeroFrame"(8px `empty` 점)과 "방 목록" 캡슐 → (장치 끊김) → 방 이름(패널 폭 전체) → 빈자리 숫자(96px)와 표(빈자리, 확인 불가, 전체, 혼잡도) → 1px 선 → 범례 → 1px 선 → 오늘 빈자리 흐름 → 요일별 평소. 요약 아래는 패널 안에서만 세로로 스크롤하고 아래 끝 1.5rem 을 흐리게 합니다(`fade-bottom`).
- 좌석은 패널 오른쪽 바닥판 가운데입니다. 바닥판 안쪽 여백은 위 64px, 오른쪽과 아래 48px, 왼쪽 400 + 16 + 48px 입니다.
- 요약 격자(`room-hud`)는 휴대폰에서 "큰 숫자 | 이름 / 요약", PC 에서 "이름(전체 폭) / 큰 숫자 | 표"입니다. 큰 숫자 칸은 숫자 폭 그대로이고 사이는 휴대폰 16px, PC 20px 입니다.

### 글 화면

- 방 목록, 오류, 404 는 가장자리 16px 와 safe-area(`page-x`), 최대 72rem(1152px, `--container-page`), 아래 여백 40px 와 safe-area 중 큰 값(`page`)입니다.
- 방 목록은 위에 좌석 무대(화면 폭 전체, 휴대폰 `clamp(20rem, 48svh, 28rem)`, 1024px 이상 `clamp(24rem, 56svh, 40rem)`), 그 아래 24px 에서 제목 줄과 타일 격자입니다. 격자는 2열, 768px 이상 3열, 1024px 이상 4열이고 타일 사이 12px, 모든 줄이 같은 높이(`auto-rows-fr`)이고 타일이 칸을 다 채워, 내용이 적은 타일도 크기가 같습니다. 방이 하나뿐이면 768px 미만에서만 그 타일이 한 줄을 다 씁니다. 무대가 없으면 위 캡슐 줄 아래(`pt-below-float`: 캡슐 자리 44px + 12px + 32px)에서 시작합니다.
- 페이지에는 가로 스크롤이 없습니다.

### 아주 넓은 화면

모든 크기가 rem 이라 기준 글자 크기를 키우면 글자, 패널, 좌석 칸 상한이 같은 비율로 커집니다(rem 미디어 쿼리는 브라우저 기본 16px 기준).

| 화면 폭               | 기준 글자 크기 | remScale |
| --------------------- | -------------- | -------- |
| 1920px(120rem) 미만   | 16px           | 1        |
| 1920px 이상           | 18px(112.5%)   | 1.125    |
| 2560px(160rem) 이상   | 20px(125%)     | 1.25     |
| 3400px(212.5rem) 이상 | 24px(150%)     | 1.5      |

가장 작은 좌석 칸의 폭이 128px x remScale(`MAX_CELL_PX`)을 넘지 않도록 좌석도 무대 폭을 줄여 가운데 둡니다. 3840px 화면을 배율 100% 로 볼 때 칸 한 변은 최대 192px 입니다.

### 좌석이 많은 방

| 좌석 칸                                                           | 칸 안에 넣는 것                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| full: 칸 폭 / remScale 64px 이상이고 짧은 변 / remScale 56px 이상 | 좌석 번호(`text-number` 700), 상태 이름(`text-label` 500), 오른쪽 위 아이콘(콘센트, 가방, 물음표 16px), 모서리 12px                                                                                                                                                                                                                                                                                                                                                                                      |
| compact: 40px 이상이고 full 이 아님                               | 좌석 번호(`text-label` 700)와 오른쪽 아래 아이콘(12px). 상태 이름은 없고 면, 테두리, 아이콘으로 구분하며 이름은 좌석 상세에서 읽음                                                                                                                                                                                                                                                                                                                                                                       |
| zoom: 40px 미만(실제 화면 px)                                     | 칸 안 글자와 아이콘 없이 면과 윤곽만, 모서리 8px(`radius-seat-sm`). 좌석도 아래 가운데 유리 캡슐 하나가 "확대"와 "전체 보기"를 오감. 확대하면 캡슐 바로 위에 "옆으로 밀면 나머지 좌석이 보여요"(`text-label`, `ink-soft`), 좌석도 상자만 가로로 스크롤. 확대하면 가장 작은 칸의 짧은 변이 44px 이상이 되고(이때 칸은 compact), 오른쪽 끝에서 한 칸이 항상 일부(25%에서 75%) 잘려 보이게 배율을 조금 키움. 아이콘이 숨은 동안 범례의 콘센트 줄에 "확대하면 보여요"를 붙임. 처음에는 방 전체가 보이게 맞춤 |

누르기 쉬운지(zoom)는 실제 화면 px 로, 글자가 들어가는지(full)는 remScale 로 나눈 값으로 판단합니다.

칸 사이 간격은 서버 `layout` 좌표를 그대로 따릅니다. 배포 데이터처럼 좌석 폭 64에 간격 16이면 360px 화면의 내용 폭은 360 - 4 x 2 - 12 x 2 = 328px, 칸 = 64 / (80n - 16) x 328 입니다. 6석 45.2px(compact), 7석 38.6px(확대). 390px 에서는 내용 폭 358px 라 6석 49.4px, 7석 42.1px(compact)입니다.

## Elevation & Depth

세 층입니다. 바닥판(번짐, 화면에 고정) → 바닥판 위 좌석 칸 → 떠 있는 유리 조작층. 좌석 상세가 열리면 그 위에 막과 유리 시트가 한 층 더 올라옵니다. 깊이는 유리의 반사와 넓은 옅은 그림자, 좌석 칸의 짧은 그림자로 냅니다.

### Shadow Vocabulary

- **유리** (`--shadow-glass`: `inset 0 1px 1px rgb(255 255 255 / 0.95), inset 0 -1px 1px rgb(255 255 255 / 0.5), inset 0 -18px 28px -22px rgb(255 255 255 / 0.9), 0 0 0 0.5px rgb(14 32 54 / 0.08), 0 2px 6px rgb(30 45 90 / 0.06), 0 22px 44px -20px rgb(30 45 90 / 0.28)`): 위 안쪽 반사, 아래 안쪽 빛, 0.5px 네이비 8% 윤곽, 넓은 옅은 그림자. 모든 유리 면.
- **캡슐** (`--shadow-control`: `inset 0 1px 1px #ffffff, 0 0 0 0.5px rgb(14 32 54 / 0.08), 0 2px 4px rgb(30 45 90 / 0.08), 0 6px 14px -6px rgb(30 45 90 / 0.25)`): 유리 위에 놓인 흰 캡슐(PC 패널의 "방 목록", 선택한 요일, 보조 버튼).
- **홈** (`--shadow-well`: `inset 0 1px 2px rgb(14 32 54 / 0.08), inset 0 -1px 0 rgb(255 255 255 / 0.7)`): 요일 고르기의 오목한 바탕.
- **빈자리 칸** (`--shadow-seat-empty`: `inset 0 0 0 2px var(--color-empty), inset 0 0 16px rgb(16 185 129 / 0.12), inset 0 2px 1px #ffffff, 0 0 0 4px rgb(16 185 129 / 0.1), 0 10px 22px -10px rgb(16 185 129 / 0.55)`): 2px 에메랄드 테두리를 안쪽 그림자로 그리고, 바깥 4px 에메랄드 10% 빛과 아래로 번지는 에메랄드 그림자로 바닥판에서 가장 밝게 떠 있습니다. 테두리가 안쪽에 그려지므로 칸 안 글자 영역도 2px 안으로 들입니다.
- **짐 있음 칸** (`--shadow-seat-away`: `inset 0 1px 1px rgb(255 255 255 / 0.55), inset 0 -1px 1px rgb(0 0 0 / 0.06), 0 3px 6px -3px rgb(30 45 90 / 0.3)`).
- **사용 중 칸** (`--shadow-seat-occupied`: `inset 0 1px 1px rgb(255 255 255 / 0.3), inset 0 -1px 1px rgb(0 0 0 / 0.15), 0 4px 8px -4px rgb(30 45 90 / 0.45)`).
- **빈자리 견본** (`--shadow-swatch-empty`: `inset 0 0 0 1.75px var(--color-empty), 0 0 0 2px rgb(16 185 129 / 0.12)`): 범례와 좌석 상세 제목 옆 견본.

확인 불가 칸에는 그림자가 없습니다. 바닥판에 붙은 점선 윤곽이라 "떠 있는 무엇"으로 읽히지 않게 하려는 것입니다.

### 유리와 흐림

- 유리(`glass`): `--glass-fill` 면, `backdrop-filter: blur(24px) saturate(1.9) brightness(1.04)`(`--blur-glass`), `--shadow-glass`, 1.25px `--glass-rim` 반사 테두리(`::before`), 위쪽 `--glass-sheen` 광택(`::after`, 아래 모서리를 타원으로 둥글게). 모서리는 쓰는 곳에서 줍니다. 지원하지 않는 브라우저는 흰색 94% 면입니다.
- 쓰는 곳: 휴대폰 위 캡슐 둘, 요약 띠, 아래 시트, "확대" 캡슐, PC 사이드 패널(뒤판 하나), 갱신 캡슐, 좌석 상세 시트, 오류와 404 판, 좌석 없는 방 안내, 방 목록의 위 캡슐 둘(워드마크, 갱신 시각)과 무대 캡슐 링크와 방 타일, 방 목록 오류 판, 미리보기 시나리오 묶음.
- 좌석 상세 뒤 막: `scrim` 에 흐림 2px(`--blur-scrim`). 시트를 아래로 끄는 동안 막의 불투명도가 1에서 0.2 쪽으로 따라 내려갑니다(320px 기준).

**The 비칠 것 위에만 유리 Rule.** 유리는 바닥판(번짐, 좌석) 위에 떠 있는 조작층에만 씁니다. 유리 안에 유리를 겹치지 않습니다. 유리 안에서 한 단계 올릴 것은 흰 캡슐(`capsule`)로, 내릴 것은 홈(`well`)으로 냅니다. 빈 바탕 위에 유리 카드를 세로로 쌓지 않습니다.

**The 빈자리가 가장 밝게 뜬다 Rule.** 좌석도에서 색 빛을 가진 것은 빈자리 칸뿐입니다. 짐 있음과 사용 중은 짧은 회청색 그림자, 확인 불가는 그림자가 없습니다.

## Shapes

- **모서리:** 한 둥근 계열이고 비대칭 모서리는 두지 않습니다.
  - 5px(`radius-chip`): 범례 견본, "방금" 조각, 출처 표시, 뼈대 막대, 방 타일의 8px 개수 점.
  - 8px(`radius-seat-sm`): zoom 단계의 아주 작은 좌석 칸, 좌석 상세 제목 옆 32x24 견본.
  - 12px(`radius-seat`): 좌석 칸, 방금 바뀜 윤곽(zoom 칸은 8px), 바닥판 뼈대 칸.
  - 20px(`radius-inner`): 유리 안 묶음용으로 둔 값. 지금 화면에서 쓰는 곳은 없습니다.
  - 28px(`radius-glass`): 떠 있는 유리 판(요약 띠, 사이드 패널, 오류와 404 판, 방 목록 타일, 좌석 없는 방 안내), 두 줄로 접힌 768px 미만의 무대 캡슐 링크.
  - 34px(`radius-sheet`): 휴대폰 아래 시트, 좌석 상세 시트. 네 모서리 모두 둥급니다(화면 가장자리에서 8px 띄움).
  - 완전한 원(`radius-full`): 모든 조작 요소(캡슐 링크, 버튼, 요일 칸과 홈, 갱신 캡슐), 끌기 손잡이, 워드마크 점.
- **선:** 1px `line` 은 장식 구분선이고 뜻을 싣지 않습니다. 1.5px `line-strong` 점선은 확인 불가 칸과 견본, 1px `line-strong` 실선은 그래프 바닥선과 출처 표시 테두리입니다.
- **굵은 표시:** 4px `ink` 선택 윤곽(3px 띄움), 4px `live` 방금 바뀜 윤곽(2px 띄움), 3px `accent` 좌석 포커스 링(2px 띄움), 2px `accent` 그 밖의 포커스 링(2px 띄움), 빈자리 칸 2px 에메랄드 안쪽 테두리.
- **무늬:** 바닥판에는 무늬가 없습니다. 빗금(`--pattern-unknown`)은 그래프의 확인하지 못한 시간에만 쓰고 좌석 칸에는 쓰지 않습니다.
- **아이콘:** 한 굵기(1.8)로 직접 그린 선 아이콘만 씁니다: 콘센트, 가방(짐 있음), 물음표(확인 불가), 왼쪽/오른쪽 갈매기, 끊어진 고리. 장식이라 화면 읽기 도구에는 숨깁니다. 이모지와 글자 기호를 아이콘 대신 쓰지 않고, 사람 모양 아이콘은 쓰지 않습니다.

## Components

### 좌석 4상태

말은 공통 문서 `SEAT-STATES.md` 의 "학생에게 보이는 말"을 그대로 씁니다.

| 상태      | 면과 글자                                                             | 형태                                             | 흑백에서                  |
| --------- | --------------------------------------------------------------------- | ------------------------------------------------ | ------------------------- |
| 빈자리    | 흰 면(`#ffffff` → `#f3f8fb`), `empty-ink` 글자, `--shadow-seat-empty` | 2px 에메랄드 테두리, 바깥 에메랄드 빛            | 가장 밝은 칸, 굵은 테두리 |
| 짐 있음   | `away-top` → `away`, `ink` 글자                                       | 가방 선 아이콘. 콘센트가 있으면 콘센트 옆에 가방 | 중간 회색 + 가방          |
| 사용 중   | `occupied-top` → `occupied`, 흰 글자                                  | 꽉 찬 진한 면                                    | 가장 진한 칸              |
| 확인 불가 | 흰색 28% 면, `ink` 글자, 아이콘은 `ink-soft`                          | 1.5px `line-strong` 점선 윤곽, 물음표 선 아이콘  | 점선 + 물음표             |

- 확인 불가는 회색으로 칠하지 않습니다. "없음"이 아니라 "모름"입니다. 서버가 모르는 상태 값을 주어도 확인 불가와 같은 점선으로 그립니다.
- 칸은 모서리 12px(zoom 단계 8px)이고, 마우스를 올리면 1px 위로 뜹니다(동작 줄이기면 없음).
- 선택한 좌석: 좌석 상세가 열린 동안 4px `ink` 윤곽을 3px 띄워 둘러 줍니다.
- 방금 바뀐 좌석: 칸 바깥에 2px 틈(바닥판 색)을 두고 두른 4px `live` 윤곽(칸과 같은 모서리: 12px, zoom 칸은 8px)과, full 칸이면 상태 줄 자리에 바뀐 상태를 쓴 작은 `live` 조각(`on-live` 글자, `radius-chip`). 칸이 96px 이상이면 "방금 사용 중", 그보다 작은 full 칸은 "방금", compact 와 zoom 은 윤곽만 둡니다. 윤곽을 칸에 붙이지 않는 것은 에메랄드 테두리와 `live` 의 밝기 대비가 1.71:1 뿐이라 색을 구별하기 어려운 사람에게도 윤곽이 보이게 하려는 것입니다. 5초 동안 보이고 바로 사라집니다. 같은 좌석이 다시 바뀌면 다시 5초이고, 동시에 최대 2석까지만 강조해서 새 변경이 가장 오래된 강조를 밀어냅니다. 장치 연결이 바뀌면서 생긴 변경, 사유만 바뀐 변경, 다시 조회해서 알게 된 차이는 강조하지 않습니다. 처음 1.6초 동안 윤곽이 칸 쪽으로 한 번 조여 들고(틈 5px → 2px, 흐림 → 또렷, `--duration-live`), 같은 순간 칸은 위에서 한 번 넘어옵니다(`flip-in`). 동작 줄이기면 윤곽만 보입니다. 화면 읽기 도구에는 좌석 변화를 읽어 주지 않고 장치 끊김과 복구만 알립니다.
- 좌석은 버튼이고 상세 시트를 엽니다(`aria-haspopup="dialog"`). 화면 읽기 도구 이름은 "A1 빈자리, 콘센트 있음"처럼 번호, 상태, 콘센트 순서입니다. 읽는 순서는 화면의 줄 순서입니다.

### 범례

- 휴대폰은 아래 시트 맨 위, PC 는 사이드 패널의 요약 아래입니다. 한 줄로 흘려 놓고 넘치면 다음 줄로 넘깁니다(가로 16px, 세로 8px).
- 순서는 밝은 칸부터: 빈자리 → 짐 있음(가방 아이콘) → 사용 중 → 확인 불가(물음표 아이콘) → 콘센트. 글자는 `text-label`, `ink-soft`.
- 견본(`SeatSwatch`)은 20x12px, `radius-chip` 으로 좌석 칸을 작게 되풀이합니다: 빈자리는 흰 면과 `--shadow-swatch-empty`, 짐 있음은 `away`, 사용 중은 `occupied`, 확인 불가는 1.5px `line-strong` 점선. 아이콘은 16px.

### 방 요약

- 휴대폰은 요약 띠 안, PC 는 사이드 패널 안입니다(위 Layout).
- 큰 숫자는 빈자리 수, `empty-ink`, 휴대폰 72px, PC 96px, 고정폭입니다. 화면 읽기 도구에는 숨기고 표가 같은 값을 읽힙니다.
- 요약에는 항상 빈자리, 확인 불가, 전체를 이 순서로 둡니다. 확인 불가가 0이어도 지우지 않습니다. 첫 이름 "빈자리"만 600 `ink`, 나머지 이름은 `ink-soft`, 값은 모두 `num` 600 `ink` 입니다. PC 는 1px `line` 으로 나눈 표(이름 왼쪽, 값 오른쪽, 값 `text-number`)이고 마지막에 혼잡도를 더합니다.
- 모든 좌석이 확인 불가면 큰 숫자 자리에 0 대신 `ink` 색 "확인 / 불가" 두 줄(휴대폰 36px, PC 48px)을 두고, 요약의 빈자리 값도 "확인 불가"이며, 혼잡도 대신 "마지막 확인 12초 전 (14:02:48)"을 둡니다. 서버가 혼잡도를 `HIGH` 로 주어도 "혼잡"이라고 쓰지 않습니다. 장치가 연결되어 있으면 맨 아래에 "지금은 모든 자리를 확인할 수 없어요."(`ink-soft`)를 덧붙입니다.
- 좌석이 없는 방은 좌석도 자리에 유리 판(28px 모서리, 위아래 20px 좌우 24px) 하나에 "이 방에는 등록된 좌석이 없어요."이고 통계는 없습니다.

### 갱신 캡슐

- 유리 캡슐(`text-label`, `num`, 좌우 16px 위아래 8px). 평소에는 "12초 전 갱신"을 `ink-soft` 로, 1분 넘게 갱신되지 않으면 "1분 넘게 갱신되지 않았어요", 재조회가 실패하면 "갱신하지 못했어요, 40초 전 정보"를 같은 자리에 700 `ink` 로 씁니다.

### 장치 끊김

- 요약 유리 맨 위 한 줄입니다(아래 1px `line` 과 12px). 끊어진 고리 아이콘(20px, `live`), 제목 "장치 연결이 끊겼어요"(`text-alert`, 700, `live`), 설명 "지금은 이 방 자리를 확인할 수 없어요."(`ink`).
- 좌석도는 모두 확인 불가 점선으로 바뀌고, 요약은 위 "확인 불가" 규칙을 따릅니다.

### 아래 시트(휴대폰)

- 접힘과 펼침 두 단계입니다. 손잡이(높이 44px 버튼 안의 40x4px `line-strong` 50% 막대)를 누르거나 끌어서 오가고, 이름은 "빈자리 흐름 펼치기"/"접기"입니다. 놓을 때 속도가 500px/s 를 넘으면 그 방향으로, 아니면 가운데보다 높으면 펼칩니다. 240ms, `--ease-out` 이고 동작 줄이기면 바로 바뀝니다.
- 접힌 동안 접힘 경계 뒤의 요소에 키보드 포커스가 가면 펼칩니다. 펼치는 범위가 24px 보다 짧으면 손잡이를 두지 않습니다.
- 끌기 중의 높이는 state 가 아니라 MotionValue 입니다. 시트는 화면 아래에 붙은 채 높이만 바뀌어 둥근 아래 모서리와 그림자가 늘 보입니다.

### 좌석 상세

- 좌석을 누르면 아래에서 올라오는 유리 시트입니다(240ms, `--ease-out`, 동작 줄이기면 바로). 휴대폰은 아래 시트와 같은 자리(좌우와 아래 8px, 최대 480px), PC 는 사이드 패널 자리(왼쪽 16px, 아래 16px, 400px)입니다. 높이는 내용만큼, 최대 화면 높이의 85%(`--sheet-max-height`)이고 넘치면 내용만 스크롤합니다. 아래 여백은 safe-area 를 포함합니다.
- 맨 위 가운데 40x4px 끌기 손잡이(`line-strong` 50%, 장식). 제목은 32x24 견본(좌석 칸과 같은 표현), 좌석 번호(`num`, `ink`)와 상태(빈자리면 `empty-ink`, 나머지 `ink`), `text-sheet` 700 입니다.
- 확인 불가 이유는 제목 바로 아래 한 문장(`text-body`, `ink`)이고 표 줄이 아닙니다. 기술 용어(장치 이름, 모델, 타임아웃)를 쓰지 않습니다.
- 표: 위와 줄마다 1px `line`, 줄 위아래 12px. 이름은 `text-body` `ink-soft`, 값은 `text-body` 600 `ink`. 자리, 콘센트, 마지막 확인, 상태가 바뀐 때. 콘센트가 있으면 값 "있음" 앞에 콘센트 선 아이콘(16px)을 둡니다. 시각은 "12초 전 (14:02:48)"처럼 상대 시각과 한국 시각을 함께 씁니다. `last_observed_at` 이 없으면 "아직 확인하지 못함"입니다.
- 갱신이 멈췄으면 표 아래 한 줄을 700 `ink` 로 둡니다(막이 갱신 캡슐을 덮으므로). 시트 안에 `live` 색 표시는 두지 않습니다.
- 닫기는 주요 버튼 "닫기", 막 누르기, Esc, 아래로 끌기입니다. 끌기는 손잡이와 제목 줄에서만 시작해 내용 스크롤과 다투지 않고 아래로만 움직입니다. 이동이 시트 높이의 4분의 1 이상이거나 아래 속도가 500px/s 이상이면 닫히고, 아니면 240ms 로 제자리로 돌아갑니다. 닫히면 포커스는 누른 좌석으로 돌아갑니다. 열린 좌석이 사라지면 닫고 방 이름 제목으로 포커스를 옮깁니다.
- 쌓임: 떠 있는 조작층 `z-20`, 막 `z-30`, 시트 `z-40`. 방금 바뀜 윤곽 `z-10`, 포커스 좌석 `z-20`. 미리보기 띠는 `z-25`.

### 빈자리 흐름

- 휴대폰은 아래 시트 안 범례 아래, PC 는 사이드 패널 안 범례 아래입니다. 1px `line` 으로 범례와 나눕니다. 따로 판을 두지 않습니다(유리 안에 유리를 겹치지 않음).
- 머리는 h2 "오늘 빈자리 흐름"(`text-fact` 600)과 출처 표시, 그 아래 비교 문장(`text-fact` 700, `ink`), 평소 값의 출처 문장(`text-label`, `ink-soft`)입니다. 휴대폰 접힘은 여기까지입니다.
- 선과 면은 판 크기로 늘린 SVG(이어진 묶음은 path 하나), 글자와 점은 좌석도처럼 % 위치의 HTML 로 두고 화면 읽기 도구에는 숨깁니다. 대신 요약 문장(기록 범위, 가장 한산했던 때와 붐볐던 때, 확인하지 못한 시간, 출처, 지금 시 평소 평균)을 화면 읽기 도구용으로 둡니다.

| 요소           | 모양                                                                                                                              |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| 판             | 2:1 비율, 왼쪽 32px 눈금 자리, 아래 1px `line-strong` 바닥선, 위와 가운데 1px `line` 점선                                         |
| 오늘 빈자리    | `empty-tint` 면(아래로 갈수록 45% 까지 옅어짐)과 2px `empty` 윗선. 10분 묶음 계단, 이어진 묶음은 세로 이음으로 끊김 없이          |
| 확인 불가 평균 | 묶음 안의 확인 불가 비율만큼 빈자리 면 위에 빗금(`surface` 70% 바탕)을 쌓음. 빗금 무늬는 판 전체에 맞춰 묶음 사이에서 이어짐      |
| 기록 없는 시간 | 전체 높이 빗금과 좌우 1px `line-strong` 테두리. 이어진 묶음은 한 구간. 빈자리 0 인 묶음은 바닥에 에메랄드 윗선이 남아 이것과 갈림 |
| 앞으로 올 시간 | 비워 둠                                                                                                                           |
| 평소 같은 요일 | `ink-soft` 2px 점선 계단(5 4), 1시간 단위, SVG path 하나. 점선 길이는 폭과 상관없이 같고 빈 시간에서는 끊김                       |
| 지금           | 1px `ink` 세로선과 위쪽 "지금"(`text-label` 600). 오늘 그래프만 가장 최근 값에 12px `empty` 점(2px `surface` 테두리)              |
| 흐린 묶음      | 관측이 5분 미만인 묶음은 불투명도 40%                                                                                             |
| 축             | x 는 3시간 간격("9시")과 바닥선 아래 4px `line-strong` 눈금, y 는 "0석"과 "N석". `text-label`, `ink-soft`, `num`                  |

- 범례 줄은 좌석 범례와 같은 견본 크기입니다: 오늘 빈자리, 평소 {요일}(출처), 확인하지 못한 시간(있을 때만), 잠깐만 본 시간(있을 때만).
- 출처 표시: "예시 데이터", "예시 데이터 포함"을 제목 옆 작은 표시(`radius-chip`, 1px `line-strong`, `text-label`, `ink-soft`)로 붙입니다. 관측만으로 된 값에는 표시가 없습니다.

**The 석 차이 Rule.** 지금을 평소와 견주는 문장은 색이 아니라 석 수 차이로 정하고 말로 씁니다. 기준은 max(1석, 전체 좌석의 20%)이고 평소는 지금 요일, 지금 시의 평균입니다. 확인 불가 때문에 판정이 갈리면 문장을 두지 않고, 방 전체가 확인 불가이거나 장치가 끊겼으면 비교 문장만 숨깁니다.

| 상태                      | 보이는 것                                                                                     |
| ------------------------- | --------------------------------------------------------------------------------------------- |
| 불러오는 중               | 문장 한 줄과 그래프 자리의 `line` 색 뼈대(200ms 지연, 한 번 보이면 400ms)                     |
| 오류                      | "빈자리 흐름을 불러오지 못했어요."와 보조 버튼 "다시 불러오기". 다시 불러오면 제목으로 포커스 |
| 재조회 실패               | 마지막 그래프를 두고 아래에 700 `ink` 한 줄                                                   |
| 오늘 기록 없음, 평소 있음 | "오늘은 아직 기록이 없어요. 평소 {요일} 흐름만 보여요."와 점선만 있는 그래프                  |
| 둘 다 없음                | "아직 기록이 없어요." 한 줄                                                                   |

### 요일별 평소

- 같은 흐름 아래 1px `line` 으로 나누고 h3 "요일별 평소 빈자리"(`text-body` 600)와 출처 표시를 둡니다.
- 요일 고르기: 오목한 홈(`well`, 완전한 원, 안쪽 4px) 위에 월부터 일까지 7칸(`aria-pressed`, 읽는 이름 "토요일"). 칸은 높이 44px, 완전한 원, `text-body` 600. 고른 칸만 흰 캡슐(`capsule`, `ink`)로 떠오르고 나머지는 `ink-soft`(마우스를 올리면 `ink`)입니다. 처음 고른 요일은 오늘(KST)입니다.
- 그 아래 한 문장("화요일은 보통 16시쯤 가장 붐비고 8시쯤 가장 한산해요.")과 같은 계단 그래프. 평균에서 뺀 시간은 빗금이 아니라 비워 둡니다. 지금 선은 고른 요일이 오늘일 때만 보입니다.

### 버튼과 링크

- 주요 버튼: `ink` 면, `on-ink` 글자, 600, 높이 48px, 완전한 원, 너비 가득. 마우스를 올리면 `ink` 90% 면, 누르는 동안 98% 로 살짝 작아집니다.
- 보조 버튼: 흰 캡슐(`capsule`), `ink` 글자, 600, 높이 44px 이상, 좌우 20px. 비활성 상태를 만들지 않습니다.
- 유리 캡슐 링크와 버튼("방 목록", "확대"/"전체 보기"): 유리 면, 600 `ink`, 높이 44px 이상, 완전한 원, 누르는 동안 98%. PC 패널 안의 "방 목록"은 유리 위에 있으므로 흰 캡슐입니다.
- 본문 링크: 700, `accent` 글자, 밑줄(간격 4px), 누르는 높이 44px 이상.
- 키보드 포커스: 버튼, 링크, 방 타일, 요일 칸은 2px `accent` 윤곽선을 2px 띄워서, 좌석 칸은 3px 를 2px 띄워서 둡니다. 시트 손잡이는 안쪽 4px 에 그립니다.

### 불러오는 중, 오류, 404

- 불러오는 중: 준비된 화면과 같은 자리에 유리 요약 띠(PC 는 사이드 패널)와 상태 안내, `ink` 10% 막대 뼈대, 바닥판에 12px 모서리 칸 6개 뼈대. 200ms 뒤 나타나고 한 번 보이면 400ms 유지, `pulse` 로 천천히 깜빡입니다. 5초 넘으면 "깨우는 중", 60초 넘으면 "오래 걸림" 안내입니다.
- 오류와 404: 화면 가운데 유리 판 하나(최대 480px, 28px 모서리, 안쪽 24px)에 제목(`text-title`), 설명, 방 ID(`num`, `text-label`, `ink-soft`), 너비 가득 주요 버튼("다시 시도", "방 목록으로").

### 방 목록

첫 화면입니다. 위쪽에 실제 방 하나의 좌석이 블록으로 서 있고 확인된 빈자리만 빛나며, 같은 바닥판이 아래로 이어지는 위에 방마다 유리 타일이 놓입니다. 방 순서는 서버 순서 그대로입니다.

**위 캡슐 둘.** 화면에 고정된(`fixed`, `top-float`, `z-20`) 유리 캡슐 둘이 `page-x` 안 양 끝에 뜹니다. 왼쪽은 워드마크 "ZeroFrame"(`text-body` 700, 8px `empty` 점, 높이 44px 이상, 좌 16px 우 20px), 오른쪽은 갱신 캡슐(방 화면과 같은 문구와 규칙). 불러오는 중과 오류에는 워드마크만 둡니다. 캡슐 줄 자체는 누르기를 통과시키고 캡슐만 누를 수 있습니다.

**좌석 무대.** 화면 폭 전체, 높이는 위 Layout 의 `rooms-stage` 값입니다. 장식이라 캔버스와 정지 그림은 화면 읽기 도구에 숨기고, 무대 전체는 `section` "좌석 무대"입니다.

- 그릴 방: 목록에서 확인된 빈자리가 가장 많은 방, 같으면 서버 순서가 앞인 방. 빈자리 있는 방이 없으면 좌석이 있는 첫 방. 좌석 있는 방이 없으면 무대를 두지 않습니다.
- 배치는 그 방의 방 조회 응답 `layout` 그대로입니다. 조회는 방 화면의 실시간 캐시와 키를 나눈 `roomKeys.preview` 로 하고 30초마다 다시 합니다(WebSocket 없음). 조회 중이거나 404 가 아닌 실패면 블록 없는 빈 무대(바닥판만)이고 아래 목록과 캡슐은 그대로 보입니다. 조회가 404 면 무대를 통째로 지웁니다.
- 블록은 three.js 장면입니다. 좌석도 경계의 긴 변을 같은 길이로 맞추고, 블록 높이는 짧은 변의 0.46배, 모서리는 짧은 변의 18%입니다. 카메라는 시야 28도, 50도 내려다보고 -26도 돌려 옆면이 보이게 합니다.
- 재질은 좌석 4상태의 밝기 순서 그대로이고 색은 `tokens.css` 값을 실행 중에 읽습니다.

| 상태      | 블록                                                                                                           |
| --------- | -------------------------------------------------------------------------------------------------------------- |
| 빈자리    | 광택 있는 흰 블록(`surface`), 조명과 상관없이 흰 윗면, 윗면 둘레의 얇은 `empty` 선, 바닥에 `empty` 55% 둥근 빛 |
| 짐 있음   | `away` 와 `away-top` 의 중간 색, 광택 조금                                                                     |
| 사용 중   | `occupied` 에서 `occupied-top` 쪽으로 40% 옮긴 색, 광택 조금                                                   |
| 확인 불가 | 높이 없는 판(흰색 42%)과 `line-strong` 점선 윤곽. 그림자와 빛 없음. 모르는 상태 값도 같음                      |

- 확인 불가가 아닌 블록 아래에는 `ink` 26% 둥근 그림자를 깝니다. 색 빛은 빈자리 블록에만 있습니다(The 빈자리가 가장 밝게 뜬다 Rule).
- 맞춤 띠: 블록은 위 캡슐 줄(safe-area + 44px + 24px)과 아래 블록 설명과 무대 캡슐 자리(136px, 768px 이상 96px) 사이 띠에 여백 10% 를 두고 들어오고, 띠 가운데가 화면 가운데에 오도록 보는 창을 옮깁니다. 띠는 무대 높이의 40% 보다 좁아지지 않습니다. 이 두 값은 `--stage-inset-top`, `--stage-inset-bottom` 이고 장면이 px 로 읽도록 `@property` 로 길이 등록합니다.
- 움직임: 처음 그릴 때 블록이 바닥에서 한 번 솟습니다(760ms, 지수 감속, 앞줄부터 46ms 씩 늦게). 빛도 함께 퍼집니다. 30초 재조회로 상태가 바뀐 블록만 새 재질로 바뀌며 한 번 들썩입니다(520ms, 블록 높이의 0.7배까지 올랐다 내려옴). 마우스처럼 정밀한 포인터가 있으면 카메라가 포인터를 따라 좌우 5도, 위아래 3도 안에서 천천히 돕니다. 그 밖에는 그리지 않습니다: 움직일 것이 있을 때만 다음 프레임을 잡고 끝나면 멈추며, 계속 도는 루프가 없습니다.
- 정지 그림: 동작 줄이기 설정, WebGL 없음, 묶음을 못 불러옴, WebGL 문맥 잃음이면 같은 배치를 위에서 본 SVG 평면으로 그립니다(가장자리 `page-x`, 위아래는 three.js 무대와 같은 띠 `rooms-stage-still`). 빈자리는 흰 면에 2.5px `empty` 선과 옅은 에메랄드 그림자, 짐 있음 `away`, 사용 중 `occupied`, 확인 불가는 흰색 30% 면에 1.5px `line-strong` 점선(5 4). 모서리는 짧은 변의 18%입니다.

**블록 설명.** 무대 캡슐 바로 위 12px, 가장자리 `page-x` 에 블록이 무엇인지 알려 주는 줄을 둡니다. 블록을 처음 보는 사람이 돌계단이나 장식으로 읽지 않게 하려는 것입니다. 문장 "블록 하나가 좌석 하나예요"(`text-label` 600, `ink`) 다음에 범례(`SeatSwatch`, `text-label`, `ink-soft`, 사이 16px)를 둡니다. 범례는 이 방에 있는 상태만, 방 화면 범례와 같은 밝기 순서(빈자리, 짐 있음, 사용 중, 확인 불가)로 보입니다. 768px 미만은 문장과 범례가 두 줄, 이상은 한 줄입니다. 무대 그림과 함께 화면 읽기 도구에는 숨기고, 방 조회 전(블록 없음)에는 두지 않습니다.

**무대 캡슐 링크.** 무대 아래 끝, 가장자리 `page-x` 에 유리 캡슐 링크 하나(높이 44px 이상, 위아래 8px, 좌 20px 우 16px, 오른쪽 16px 갈매기 `ink-soft`). 768px 미만은 두 줄이고 모서리 28px(`radius-glass`), 768px 이상은 한 줄이고 완전한 원입니다. 첫 줄 "지금 빈자리가 가장 많은 방"(`text-label`, `ink-soft`), 둘째 줄 방 이름(`text-body` 700)과 `num` `empty-ink` "9석". 빈자리 있는 방이 없으면 첫 줄이 "확인된 빈자리가 있는 방이 없어요"이고 석 수를 두지 않습니다. 읽는 이름은 "지금 빈자리가 가장 많은 방, 제2실습실, 빈자리 9석" 또는 "확인된 빈자리가 있는 방이 없어요, 제1실습실 좌석 보기"입니다.

**제목 줄.** 무대 아래 24px 에 h1 "방을 골라 주세요"(`text-heading` 700)와 같은 줄 오른쪽 방 수 "6곳"(`num`, `text-label`, `ink-soft`)을 글자 바닥에 맞춥니다. 방이 없으면 방 수 대신 아래에 "아직 등록된 방이 없어요."(`text-body`, `ink-soft`)입니다.

**방 타일.** 타일 전체가 링크인 유리 판입니다(28px 모서리, 안쪽 16px, 768px 이상 20px). 마우스를 올리면 1px 뜨고 갈매기가 1px 오른쪽으로 갑니다(`motion-safe`).

- 이름 줄: 방 이름(`text-fact` 600, 단어 단위로 접고 긴 이름은 어디서든 끊음, 두 줄까지 보이고 넘치면 말줄임)과 오른쪽 위 16px 갈매기(`ink-soft`). 한 줄 이름도 두 줄 자리(`tile-name`, `2lh`)를 잡아 타일마다 숫자 줄 높이가 같습니다.
- 빈자리 줄(위 4px): "빈자리"(`text-label`, `ink-soft`), 숫자(`text-row-number` 44px 700, `num`, `empty-ink`), "석"(`text-body` 600, `ink-soft`)을 한 줄에 글자 바닥 맞춤. 모든 좌석이 확인 불가면 숫자 자리에 "확인 불가"(`text-heading` 700, `ink`).
- 개수 점(위 8px, 아래 참고).
- 사실 줄(위 8px, `text-label`): "확인 불가 N석"과 "전체 N석". 이름은 `ink-soft`, 값은 `num` 600 `ink`, 사이 12px, 좁으면 두 줄로 접힙니다. 확인 불가가 0이어도 지우지 않습니다.
- 문장(위 8px, `text-label` 700 `ink`): 빈자리 0석이고 확인 불가가 있으면 "확인하지 못한 자리가 N석 있어요", 장치가 끊겼으면 "장치 연결이 끊겼어요". 모두 확인 불가면 장치가 연결된 동안 "아직 자리를 확인하지 못했어요", 끊겼으면 "장치 연결이 끊겼어요".
- 좌석이 없는 방: 이름 줄과 "등록된 좌석이 없어요"(`text-label`, `ink-soft`)뿐이고 숫자와 점이 없습니다.
- 혼잡도는 타일에 두지 않습니다. 방 화면 요약에서 봅니다. 타일에 `live` 를 쓰지 않습니다.
- 읽는 이름: "제1실습실, 빈자리 3석, 확인 불가 0석, 전체 5석"처럼 이름, 빈자리, 확인 불가, 전체, 문장 순서. 모두 확인 불가면 "제3실습실, 빈자리 확인 불가, 확인 불가 4석, 전체 4석, 아직 자리를 확인하지 못했어요", 좌석이 없으면 "제5실습실, 등록된 좌석이 없어요"입니다.

**개수 점.** 좌석 배치가 아니라 개수입니다. 8px 점(`radius-chip`), 사이 4px, 넘치면 다음 줄입니다. 순서는 좌석 범례와 같은 밝기 순서로 빈자리, 쓰는 중, 확인 불가입니다.

| 점        | 모양                              | 대비(유리 면, 흰색 40% 를 `paper` 위에) |
| --------- | --------------------------------- | --------------------------------------- |
| 빈자리    | 흰 면에 1.5px `empty` 안쪽 테두리 | `empty` 테두리 3.59:1                   |
| 쓰는 중   | `line-strong` 면                  | 3.42:1                                  |
| 확인 불가 | 면 없이 1px `line-strong` 점선    | 3.42:1                                  |

- 목록 응답은 사용 중과 짐 있음을 나누지 않으므로 둘을 합친 "쓰는 중" 한 색입니다. `line-strong` 은 밝기가 `away`(1.58:1)와 `occupied`(2.03:1) 사이라 밝기 순서가 지켜지고, 흰 빈자리 점과는 3.67:1 로 갈립니다. 숫자가 같은 것을 말하므로 화면 읽기 도구에는 숨깁니다.
- 좌석이 48석을 넘으면 같은 순서의 비율 막대(높이 8px, 완전한 원, 조각 사이 1px)로 바꿉니다.
- 점에는 보이는 범례가 없습니다. 순서와 모양을 방 화면 범례와 같게 두어 그것을 배운 눈으로 읽힙니다.

**불러오는 중, 오류, 빈 목록.**

- 불러오는 중: 워드마크 캡슐, 블록 없는 무대 자리(바닥판만), 제목과 상태 안내("깨우는 중", "오래 걸림"), 200ms 뒤 유리 타일 뼈대 4개(같은 격자, `line` 막대 다섯, `motion-safe` `pulse`, 한 번 보이면 400ms).
- 오류: 워드마크 캡슐, 화면 가운데 유리 판(최대 480px, 28px, 안쪽 24px)에 "방 목록을 불러오지 못했어요."(`text-title`), 네트워크 오류면 "인터넷 연결을 확인해 주세요.", 아니면 "잠시 뒤 다시 시도해 주세요.", 너비 가득 주요 버튼 "다시 시도". 목록 404 도 같은 오류 판입니다.
- 빈 목록과 좌석 있는 방이 없는 목록: 무대 없이 `pt-below-float` 에서 제목과 목록(또는 빈 목록 문장)이 시작합니다.

### 미리보기 띠

- `ink` 면에 `on-ink` 글자, 높이 44px, 화면 맨 위(`z-25`). "모의 데이터"(700)와 시나리오 이름(`num`). 미리보기 빌드에만 있습니다.
- 링크 "바꾸기"와 "의견"은 누르는 영역 44x44, 밑줄, 포커스는 글자 칸에 2px `paper` 윤곽선. 좌석 상세가 열린 동안은 밑줄 없이 불투명도 50% 로 흐려집니다. 흐리게 보이는 조작 요소는 여기에만 둡니다.
- 시나리오 목록은 묶음마다 유리 판(28px 모서리) 안에 1px `line` 으로 나눈 줄이고, 지금 보는 줄 왼쪽에 6px(`spacing-band`) `empty` 둥근 막대와 "지금 보는 중"을 둡니다.

### 움직임

| 토큰                               | 값                                                                               | 쓰는 곳                                                                 |
| ---------------------------------- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `--ease-out`                       | `cubic-bezier(0.16, 1, 0.3, 1)`                                                  | 모든 전환과 애니메이션의 기본 곡선                                      |
| 기본 전환                          | 160ms                                                                            | hover 의 1px 뜸, 면 색 바뀜, 누름 98%                                   |
| `--duration-flip` / `flip-in`      | 520ms, `perspective(28rem) rotateX(-72deg)` → `rotateX(0deg)`, 불투명도 0.35 → 1 | 방금 바뀐 좌석 칸, 값이 바뀐 뒤의 빈자리 큰 숫자                        |
| `--duration-live` / `live-tighten` | 1600ms, 윤곽 틈 5px → 2px, 불투명도 0.6 → 1                                      | 방금 바뀐 좌석 윤곽                                                     |
| `--duration-sheet`                 | 240ms                                                                            | 아래 시트 펼치고 접기, 좌석 상세 열고 닫기, 막, 끌다 놓은 시트 제자리로 |
| `pulse`                            | 1.8s 반복, 중간에 불투명도 0.55                                                  | 불러오는 중 뼈대                                                        |
| 무대 솟음                          | 760ms, 지수 감속, 앞줄부터 46ms 씩 늦게                                          | 방 목록 무대 블록을 처음 그릴 때 한 번                                  |
| 무대 들썩임                        | 520ms, 블록 높이의 0.7배까지 올랐다 내려옴                                       | 재조회로 상태가 바뀐 블록만 한 번                                       |
| 무대 시차                          | 좌우 5도, 위아래 3도, 프레임마다 12%씩 따라감                                    | 정밀한 포인터(`pointer: fine`)일 때 방 목록 무대 카메라                 |

**The 바뀐 순간만 Rule.** 판 넘김은 값이 바뀐 순간에만 한 번 일어납니다. 화면을 처음 그릴 때 큰 숫자는 넘어오지 않고, 강조하지 않는 변경에서는 칸도 넘어오지 않습니다. 크기와 자리는 그대로이고 기울기만 바뀝니다.

**The 동작 줄이기 Rule.** 판 넘김, 윤곽 조임, 뼈대 깜빡임, hover 뜸은 모두 `motion-safe` 안에 둡니다. 시트는 동작 줄이기 설정이면 바로 나타나고 바로 사라집니다. 방 목록 무대는 동작 줄이기 설정이면 three.js 를 불러오지 않고 SVG 정지 그림을 둡니다.

## Do's and Don'ts

### Do:

- **Do** 빈자리 수를 화면에서 가장 크게 보여줍니다(`empty-ink`, 휴대폰 72px, PC 96px).
- **Do** 확인 불가 수를 빈자리 수 바로 옆 요약에 항상 둡니다. 0이어도 지우지 않습니다.
- **Do** 좌석 4상태를 밝기 순서(빈자리 > 짐 있음 > 사용 중)와 형태(에메랄드 테두리, 가방, 점선과 물음표)로 함께 구분합니다.
- **Do** 조작층은 바닥판 위에 뜬 유리로 두고, 유리 안에서 올릴 것은 흰 캡슐, 내릴 것은 홈으로 냅니다.
- **Do** 조작 요소는 캡슐(완전한 원)로, 판은 28px, 시트는 34px, 좌석 칸은 12px 로 둡니다.
- **Do** 표, 좌석 번호, 시각의 숫자는 `num`(고정폭)으로 씁니다.
- **Do** 움직임은 `motion-safe` 로 감싸고 값이 바뀐 순간에만 씁니다.
- **Do** 새 값이 필요하면 이 문서와 `src/app/styles/tokens.css` 를 먼저 고칩니다.

### Don't:

- **Don't** 확인 불가를 회색 면이나 흐린 글자로 나타내지 않습니다. 확인 불가는 면 없는 점선 윤곽과 물음표입니다.
- **Don't** 좌석 칸에 빗금을 쓰지 않습니다. 빗금은 그래프의 확인하지 못한 시간에만 씁니다.
- **Don't** 빈자리 칸을 민트나 에메랄드 면으로 채우지 않고, 짐 있음을 흰 면으로 두지 않습니다. 밝은 칸은 비어 있는 자리로 읽힙니다.
- **Don't** 에메랄드와 `live` 밖의 색(파랑, 인디고, 보라 면)을 들이지 않습니다. `live` 는 방금 바뀜과 장치 끊김에만 씁니다.
- **Don't** 비대칭 모서리를 쓰지 않습니다.
- **Don't** 유리 안에 유리를 겹치거나, 빈 바탕 위에 유리 카드를 세로로 쌓은 대시보드를 만들지 않습니다.
- **Don't** 방 화면의 바닥판(좌석도) 전체를 눕히거나 기울이지 않습니다. 그 화면의 입체감은 칸의 그림자와 판 넘김 수준에서만 냅니다. 원근이 있는 장면은 방 목록의 좌석 무대 하나뿐입니다: 누를 수 없는 장식 머리 영역이라 좌석 번호를 읽거나 칸을 누를 일이 없고, 첫 화면에서 "실제 좌석이 보인다"는 것을 보여 주는 것이 일이기 때문입니다. 무대도 칸 대신 블록을 세울 뿐 밝기 순서와 점선 확인 불가는 그대로입니다.
- **Don't** SVG 굴절(displacement)로 유리를 흉내 내지 않습니다. iPhone Safari 에서 동작하지 않습니다. 유리감은 반사 테두리와 광택으로만 냅니다.
- **Don't** 사람 모양 아이콘, 이모지, 느낌표, "실시간!" 같은 문구를 쓰지 않습니다.
- **Don't** 72px 와 96px 를 글자 제목에 쓰지 않습니다. 빈자리 숫자 하나에만 씁니다.
- **Don't** `wash-*`, `scrim`, `empty-tint` 위에 글자를 올리지 않습니다.
- **Don't** 컴포넌트에 hex 나 임의 값(`text-[#…]`, `p-[13px]`)을 쓰지 않습니다. 토큰은 `tokens.css` 에만, 재질은 `global.css` 유틸리티에만 있습니다.
- **Don't** 화면에 기술 용어(엣지, WebSocket, UNKNOWN)를 드러내지 않습니다. 미리보기 띠와 시나리오 목록의 영문 시나리오 이름만 예외입니다.

## 결정 이유와 버린 안

- **"학부 네이비 안내판"을 대체함.** 이전 세계는 네이비 요약 패널, 흰 바닥판 카드, 민트 면 빈자리, 흰 면 짐 있음, 빗금 확인 불가에 그라데이션 금지와 흐림 제한을 두었습니다. 3초 판단, 확인 불가는 "모름", 확인 불가 수 항상 표시, `live` 두 용도, 방금 바뀜 규칙(2px 틈, 5초, 최대 2석), 칸 단계와 확대, 넓은 화면 단계, 좌석 이름, 시트 끌어 닫기와 포커스 복귀, 시각 표기는 이어받고 시각 언어를 모두 바꿨습니다. 바꾼 이유는 다음과 같습니다.
  - 유리가 흰 카드로 읽혔습니다. 카드를 세로로 쌓은 화면에서는 유리 뒤에 비칠 것이 없어 흐림을 써도 그냥 흰 판이었습니다. 그래서 좌석도를 화면 가득 깔고 조작층을 그 위에 띄우는 지도 앱 구조로 바꿨습니다.
  - 민트 면 빈자리와 흰 면 짐 있음 때문에, 글자 없이 보면 짐 있음이 빈자리처럼 읽혔습니다. 그래서 빈자리를 가장 밝은 흰 칸(에메랄드 테두리와 빛)으로, 짐 있음을 중간 회청색으로 내려 밝기 순서를 뜻과 맞췄습니다.
  - 민트 면, 짐 있음 아래 굵은 띠, 진한 빗금은 좌석 4상태 시안을 비교한 뒤 버렸습니다. 확인 불가는 면 없는 점선 윤곽과 물음표로 바꿨습니다.
- **눕힌 바닥판을 버림.** 바닥판 전체를 3D 로 기울인 안은 사용자가 과하다고 보아 버렸습니다. 바닥판은 평평하게 두고 입체감은 칸 그림자와 판 넘김에서만 냅니다. 이것은 누르고 읽는 방 화면의 좌석도 이야기이고, 방 목록의 장식 무대는 따로입니다(아래).
- **KNU 비대칭 모서리와 진한 인디고, 보라 패널을 버림.** cse.knu.ac.kr 와의 통일감을 위해 비대칭 모서리와 채도 높은 인디고, 보라 패널을 시안으로 검토했고, 사용자가 옅은 유리 쪽을 골라 버렸습니다. 학부와의 연결은 네이비 글자(`#0e2036`)로 남기고 모서리는 한 둥근 계열로 맞췄습니다.
- **빈자리는 초록 계열.** "빈자리 = 초록"이라는 관습을 따라야 3초 판단이 지켜집니다. 이전의 어두운 틸 대신 흰 칸 위에서 빛으로 읽히는 에메랄드(`#0e9467`)를 테두리와 빛에, 글자 대비를 맞춘 `#0b7a55` 를 글자에 씁니다.
- **accent 를 ink 와 같게 둠.** 이 세계의 색은 에메랄드와 `live` 둘뿐이라 파랑을 두지 않았습니다. 포커스 링은 네이비로 바닥판 위 14.53:1 입니다.
- **Apple 식 굴절 대신 반사 테두리.** SVG displacement backdrop 은 iPhone Safari 에서 동작하지 않아 쓰지 않았습니다. 135도 반사 테두리, 위쪽 광택, 위 안쪽 반사로 유리감을 냅니다.
- **Pretendard 하나.** 600 굵기와 고정폭 숫자를 모두 가진 Pretendard Variable 하나로 한글, 숫자, 서비스 이름을 씁니다. 불러오는 글꼴이 하나라 첫 화면도 가볍습니다.
- **좌석 칸 상한과 기준 글자 단계.** 4K 모니터를 배율 100% 로 보면 좌석 한 칸이 1685x1264px 까지 커지고 범례가 화면 밖으로 밀려났습니다. 칸 한 변을 128px x remScale 로 묶고, 1920/2560/3400px 에서 기준 글자를 키워 글자와 패널이 함께 자라게 했습니다.
- **차트 라이브러리 대신 좌석도와 같은 HTML 배치.** 그래프도 `<div>` 를 % 로 놓아 토큰만 쓰고, 번들에 차트 의존성을 더하지 않습니다.
- **색 히트맵 대신 요일 고르기.** 혼잡도는 말로 쓴다는 규칙, 새 색 단계 토큰이 필요하다는 점, 360px 에서 요일 x 시간 칸이 44px 터치 목표에 못 미친다는 점 때문에 히트맵은 하지 않았습니다.
- **출발 안내판 판 넘김.** 실시간으로 바뀌는 값을 "바뀌었다"고 알리되 소란스럽지 않게 하려고, 판이 위에서 한 번 넘어오는 동작을 골랐습니다.
- **방 목록 무대는 three 하나로.** 런타임 의존성은 `three` 만 더했고 react-three-fiber 는 쓰지 않았습니다. 장면이 하나뿐이라 선언형 계층이 얻는 것이 없고 의존성만 늘기 때문입니다. 무대는 `lazy` 로 따로 늦게 불러오는 묶음이라(빌드 결과 약 137 KB gzip) 첫 화면의 숫자와 타일은 이것을 기다리지 않습니다.
- **굴절 유리 블록 대신 칠한 불투명 블록.** 캔버스는 투명 배경으로 DOM 바닥판 위에 겹쳐 있어 굴절시킬 뒤 화면이 장면 안에 없고, 유리 블록은 빈 상자로 보였습니다. 또 밝기 순서가 곧 뜻이라 면이 불투명해야 빈자리가 가장 밝게 읽힙니다. 유리는 그 위에 뜬 캡슐과 타일이 맡습니다.
- **바닥판 점 격자를 뺌(2026-11-23, 시험).** 점 격자 없는 판을 보고 싶다는 요청으로 뺐습니다. 토큰 `--pattern-floor` 은 되돌리기 쉽게 남겨 두었습니다.
- **원근 점 격자 셰이더를 버림.** 무대 바닥에 원근으로 눕힌 점 격자를 그리는 안은, 고정된 DOM 바닥판의 18px 점 격자와 겹쳐 격자가 두 겹으로 보여 버렸습니다. 블록은 DOM 바닥판 위에 그대로 섭니다.
- **혼잡도를 타일에서 뺌.** 타일은 방끼리 빈자리 숫자를 견주는 자리라 숫자, 확인 불가, 전체만 둡니다. 혼잡도는 방 화면 요약에서 봅니다.
- **무대 조회 키를 나눔(`roomKeys.preview`).** 방 화면은 WebSocket 이벤트를 `version` 기준으로 같은 캐시(`roomKeys.detail`)에 반영합니다. 목록 무대가 같은 키로 30초 재조회를 하면 그 기준과 버퍼 규칙을 흐트러뜨릴 수 있어, 무대는 따로 키를 두고 WebSocket 없이 30초마다 다시 조회합니다.
