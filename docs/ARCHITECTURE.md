# gwana tea house - 아키텍처 노트

> 이 문서는 다음 세션에서 맥락 없이 읽어도 이어서 작업할 수 있도록 쓴 것이다.
> "무엇을 했는가"보다 **"왜 그렇게 했는가"** 와 **"어디서 깨지는가"** 를 남긴다.
> 마지막 갱신: 2026-08-04

---

## 0. 이 브랜치는 디자인 v2다

`feature/design-v2` 는 **레퍼런스를 갈아엎은 갈래**다.

| 갈래           | 레퍼런스                             | 언어                                                      |
| -------------- | ------------------------------------ | --------------------------------------------------------- |
| `master` 계열  | https://postevand.com                | 검정 괘선 격자, 600vh 핀 스크럽, 흰 바탕                  |
| **design-v2**  | **https://www.icebug.com/en-GB**     | 흰 바탕에 전면 사진, 모노 UI, 라운딩 0, 초록 푸터         |
| 운영 확정      | 두 갈래를 비교해 나중에 고른다       |                                                            |
| 유지된 것      | 라우트 구조, 페이지 전환, ScrollSmoother, (common)/(non-common) 분리      |

두 갈래는 **레이아웃 인프라를 공유한다**(§4, §5, §8). 바뀐 것은 팔레트·타입·섹션 구성이다.
v1 로 되돌아가려면 `src/constants/{colors,typography,home-content}.ts`,
`src/components/home/**`, `src/components/common/**`, 헤더/푸터를 되돌리면 되고
`layout.tsx` / `page-transition.tsx` / `smooth-scroll.tsx` 는 건드릴 필요가 없다.

---

## 1. 레퍼런스 분석 방법

스크린샷 눈대중은 금지. 이번 갈래는 아래 순서로 실측했다.

**색은 픽셀이 아니라 computed style 에서 읽는다.** 이유는 §10.5.

```bash
# 1. 헤드리스 크롬으로 레퍼런스를 띄운다
# 2. **모달과 전면 오버레이를 먼저 닫는다** (이걸 빼먹으면 색이 전부 틀어진다)
# 3. Runtime.evaluate 로 getComputedStyle 을 직접 읽는다
#    -> html / 섹션 / 제품 타일 / 푸터의 backgroundColor
# 4. 우리 화면도 같은 방식으로 읽어 숫자를 맞대 본다 (§11)
```

`scratchpad/refmeasure.mjs` 가 1~3 을 한다(재작성해도 무방).

### 실측 결과 (icebug.com, 1440 뷰포트, 오버레이 제거 후)

| 항목             | 값                                | 출처                          |
| ---------------- | --------------------------------- | ----------------------------- |
| 페이지 바탕      | `#ffffff` (rgb 255,255,255)       | computed, html + 모든 섹션    |
| 타일 면          | `#ececec` (rgb 236,236,236)       | computed, 제품 카드           |
| 본문 글자        | `#262626`                         | computed textPrimary          |
| 푸터/브랜드 면   | `#3c4c3d` (rgb 60,76,61)          | computed footer               |
| 링크 강조        | `#c1242f`                         | computed link                 |
| 라운딩           | `0px` (전 컴포넌트)               | computed                      |
| 기본 단위        | `4px`                             | computed                      |
| h1               | `88px` (= 6.11vw)                 | computed                      |
| 헤더 높이        | `52px`                            | 스크린샷 실측                 |
| UI 서체          | Suisse Intl Mono                  | computed font stack           |
| 디스플레이 서체  | Suisse Intl SemiBold              | computed font stack           |

**레퍼런스는 흰 바탕 사이트다.** 회색은 제품 타일 한 단(`#ececec`)뿐이고,
타일 사이 이음매로 드러나는 흰색이 격자선 역할을 한다.

우리 h1 은 실측 `87.84px`, 헤더 `52px` 로 재현됐다(§11).

---

## 2. 스택

| 항목         | 버전         | 비고                                                    |
| ------------ | ------------ | ------------------------------------------------------- |
| Next.js      | 16.2.12      | App Router, Turbopack                                   |
| React        | 19.2.4       |                                                         |
| Tailwind CSS | `~4.2.4`     | **핀 고정**. `^4`로 두면 4.3+로 올라간다                |
| shadcn/ui    | CLI 4.16.0   | style `radix-nova`, preset `nova`, base color neutral   |
| GSAP         | ^3.15.0      | ScrollTrigger / ScrollSmoother / SplitText / CustomEase |
| 아이콘       | lucide-react | shadcn이 끌고 온 것. 한 프로젝트 한 아이콘 패밀리 유지  |

### 애니메이션 라이브러리는 GSAP 하나만 쓴다

초기에 Motion(`motion/react`)으로 구현했다가 **전부 GSAP으로 교체하고 Motion은 제거**했다.
이유는 v1 레퍼런스가 GSAP이고, 특히 **ScrollSmoother**가 필요했기 때문이다(§5).
GSAP과 Motion을 같은 트리에서 섞으면 프레임을 두고 경합한다. 다시 섞지 말 것.

ScrollSmoother / SplitText / CustomEase는 **GSAP 3.13부터 퍼블릭 npm 패키지에
무료로 포함**된다. 별도 라이선스나 레지스트리 설정 불필요.

---

## 3. 디렉토리 구조

```
src/
├─ app/
│  ├─ layout.tsx              # 셸. 합성 순서가 핵심 (§4)
│  ├─ globals.css             # 토큰 + base/utilities 레이어
│  │
│  ├─ (common)/               # 공통 헤더 + 푸터 계열 (§9.E)
│  │  ├─ layout.tsx           #   <main pt-13> + SiteFooter
│  │  ├─ page.tsx             #   홈: 섹션 8개 (§6)
│  │  └─ about|shop|admin|login|bag|account|terms|privacy/page.tsx
│  │
│  └─ (non-common)/           # 단독 헤더 계열. 푸터 없음
│     ├─ layout.tsx           #   <main pt-13> 만
│     └─ payment/page.tsx     #   자리표시 스텁
│
├─ components/
│  ├─ layout/
│  │  ├─ header-shell.tsx     # ★ v2 신규. 헤더의 면색 상태만 담당 (클라이언트)
│  │  ├─ site-header.tsx      # 좌 메뉴 / 중앙 로고 / 우 유틸리티 (서버)
│  │  ├─ payment-header.tsx   # 단독 고정 헤더 (서버)
│  │  ├─ chrome-header.tsx    # 경로로 둘 중 하나를 고르는 스위치 (클라이언트)
│  │  ├─ site-footer.tsx      # 초록 푸터 (서버, §9.D)
│  │  ├─ header-nav-link.tsx  # 활성 상태 (클라이언트)
│  │  ├─ header-mobile-menu.tsx
│  │  ├─ smooth-scroll.tsx    # ScrollSmoother 래퍼 + 초기화
│  │  ├─ page-transition.tsx  # 페이지 전환 (§8)
│  │  └─ placeholder-page.tsx
│  │
│  ├─ common/                 # ★ v2 신규. 섹션들이 공유하는 조각
│  │  ├─ ghost-button.tsx     #   테두리 버튼 (light / onImage)
│  │  ├─ media-rail.tsx       #   가로 레일 + Prev/Next (클라이언트)
│  │  ├─ placeholder-media.tsx#   에셋 없는 이미지 자리
│  │  ├─ display-reveal.tsx   #   줄 마스크 리빌 (클라이언트)
│  │  └─ headline-lines.tsx   #   헤드라인 줄 → 블록
│  │
│  ├─ home/                   # 홈 섹션 8개 (§6)
│  └─ ui/shadcn-ui/           # shadcn 생성물. 손으로 고치지 않는다
│
└─ constants/
   ├─ colors.ts               # 팔레트 단일 출처 (§9.B)
   ├─ typography.ts           # 타입 스케일 단일 출처 (§9.C)
   ├─ home-content.ts         # 홈 카피 + 자리표시 목록
   ├─ nav-items.ts            # 메뉴 정의
   ├─ business.ts             # 사업자 정보 + 푸터 칼럼
   └─ route-chrome.ts         # 어떤 경로가 단독 헤더인가
```

---

## 4. 레이아웃 합성 순서 (가장 중요, v1/v2 공통)

`layout.tsx`의 중첩 순서는 **취향이 아니라 제약**이다. 바꾸면 조용히 깨진다.

```
<body>
  <ChromeHeader />            ← position:fixed. 반드시 스무더 바깥
  <SmoothScroll>              ← #smooth-wrapper > #smooth-content
    <SmoothScrollInit />      ← content의 "첫 번째 자식"이어야 함
    <PageTransition>          ← #view. 여기만 페이드된다
      {children}              ← 계열 layout이 여기 들어온다 (§9.E)
    </PageTransition>
  </SmoothScroll>
  <Toaster />                 ← fixed. 스무더 바깥
</body>

계열 layout이 채우는 부분:
  (common)      → <main className="pt-13">{page}</main> + <SiteFooter />
  (non-common)  → <main className="pt-13">{page}</main>
```

### 왜 fixed 요소가 스무더 바깥이어야 하는가

ScrollSmoother는 `#smooth-content`에 `transform: matrix3d(...)`를 걸어 스크롤을 흉내낸다.
**transform이 걸린 조상 안에서는 `position: fixed`가 뷰포트가 아니라 그 조상 기준**이 된다.
헤더를 안에 넣으면 스크롤과 함께 밀려 올라간다.

`HeaderShell` 도 같은 제약을 받는다. 클라이언트 컴포넌트지만 **root layout 에서만**
렌더돼야 한다.

### 왜 SmoothScrollInit이 첫 번째 자식이어야 하는가

React는 **자식의 layout effect를 부모보다 먼저** 실행한다.
`SmoothScroll`이 children을 감싸는 구조에서 초기화를 부모 컴포넌트 본체에 두면,
히어로 섹션의 effect가 **스무더가 존재하기 전에** 실행된다. 결과:

- `ScrollSmoother.get()`이 `undefined` → 패럴랙스가 안 붙는다
- 그 시점에 만들어진 ScrollTrigger는 **변형되지 않은 문서 좌표**를 기준으로 측정한다

형제 컴포넌트의 effect는 렌더 순서대로 실행되므로, 초기화 전용 컴포넌트를
`#smooth-content`의 첫 자식으로 렌더해 순서를 강제했다. 이 구조를 유지할 것.

### 헤더 높이는 세 곳이 함께 움직인다

`HEADER_HEIGHT`(= `h-13` = 52px, `header-shell.tsx` export) 를 바꾸면 아래도 같이 고친다.

| 파일                          | 값                          |
| ----------------------------- | --------------------------- |
| `header-shell.tsx`            | `h-13`                      |
| `(common)/layout.tsx`         | `pt-13`                     |
| `(non-common)/layout.tsx`     | `pt-13`                     |
| `(common)/page.tsx` (홈)      | `-mt-13`                    |
| `placeholder-page.tsx`        | `min-h-[calc(100svh-3.25rem)]` |

마지막 줄이 **푸터를 접힘선 아래로 밀어내는 장치**다. §10.6 참고.

---

## 5. 스크롤 아키텍처 (v1/v2 공통)

### ScrollSmoother

```ts
// smooth-scroll.tsx
ScrollTrigger.config({ ignoreMobileResize: true });
gsap.matchMedia().add("(min-width: 1024px)", () => {
  const smoother = ScrollSmoother.create({ smooth: 1, smoothTouch: 1, effects: true });
  return () => smoother.kill();
});
```

### CSS sticky를 쓰면 안 된다

핀 고정에 `position: sticky`를 쓰면 안 된다.
**transform이 걸린 조상 안에서 sticky는 동작하지 않기 때문**이다.
ScrollTrigger `pin:` 을 쓴다.

### 브레이크포인트 분기는 gsap.matchMedia()

```ts
mm.add({
    isDesktop: "(min-width: 1024px)",
    isMobile: "(max-width: 1023px)",   // 여집합을 반드시 적는다. 아래 함정 참고
    reduce: "(prefers-reduced-motion: reduce)",
  },
  (ctx) => {
    const { isDesktop, reduce } = ctx.conditions as { isDesktop: boolean; reduce: boolean };
    ...
    return cleanup;          // 조건이 바뀌면 자동 호출
  },
  scopeRef);                 // 세 번째 인자는 scope
```

**함정 1: 조건의 여집합을 빼먹으면 모바일 분기가 죽는다.**
`mm.add`는 조건 중 **하나라도 맞을 때만** 콜백을 부른다. `isDesktop`과 `reduce`만
적어두면, 모션 설정을 건드리지 않은 좁은 화면 사용자는 맞는 조건이 하나도 없어서
콜백이 아예 실행되지 않는다.

`display-reveal.tsx` 처럼 브레이크포인트 분기가 필요 없는 곳도
`motion: "(prefers-reduced-motion: no-preference)"` 를 여집합으로 적어 두었다.
빼면 **헤드라인이 마스크 안에 숨은 채로 남는다.**

**함정 2: revert가 인라인 스타일을 지우는 게 아니라 "시작값"을 되써 넣는다.**
모바일 분기 진입 시 해당 속성을 명시적으로 지울 것:

```ts
if (!isDesktop) gsap.set(el, { clearProps: "width,borderLeftColor" });
```

---

## 6. 홈 섹션 구성 (v2)

인접한 두 섹션이 **절대 같은 배치 계열을 쓰지 않는다.** 실측 높이는 1440×900 기준.

| # | 섹션            | 배치 계열                      | 높이  | 움직임                         |
| - | --------------- | ------------------------------ | ----- | ------------------------------ |
| 1 | Hero            | 전면 사진, 글 왼쪽 아래        | 900   | 드리프트 + 줄 리빌 + 디밍 + 패럴랙스 |
| 2 | Season rail     | 가로 레일 (제품 타일 4:5)      | 505   | 없음 (네이티브 스크롤)         |
| 3 | Manifesto       | 가운데 정렬 선언문, 사진 없음  | 530   | 줄 리빌                        |
| 4 | Category rail   | 가로 레일 (사진 안에 라벨 3:4) | 370   | 호버 스케일                    |
| 5 | Editorial band  | 전면 사진, 글 왼쪽 아래        | 702   | 줄 리빌                        |
| 6 | Finder          | 어긋난 2단 사진 + 오른쪽 문단  | 782   | 줄 리빌                        |
| 7 | Promise         | 왼쪽 글 + 오른쪽 사진 두 장    | 726   | 줄 리빌                        |
| 8 | Recirculation   | 왼쪽 문장 + 오른쪽 세로 영상 기둥 | -   | 영상 재생 + 패럴랙스 0.92      |

8은 이 페이지에서 유일하게 **움직이는 미디어**를 쓴다. 소스가 812×1444 세로
영상이라 가로 밴드에 전면으로 깔면 원본의 25% 만 남는다. 비율을 살린 기둥으로
세우고 왼쪽에 문장을 붙였다(§6.4).

### 6.1 히어로

| 동작              | 값                                                        |
| ----------------- | --------------------------------------------------------- |
| 진입: 사진        | `objectPosition 50% 44% → 50% 50%`, `scale 1.06 → 1`, 1.4s |
| 진입: 라벨/헤드라인/버튼 | 0 → 0.15s → 0.75s. 읽는 순서 그대로                 |
| 스크롤: 디밍      | `opacity 1 → 0.6`, `start "top+=30% top"`, scrub          |
| 스크롤: 패럴랙스  | `smoother.effects(el, { speed: 0.85 })`                   |
| 섹션 높이         | `h-svh lg:h-dvh`                                          |
| 사진              | `/home/main_2.webp` — **홈에서 유일한 실제 에셋**          |

`CustomEase.create("custom", "M0,0 C0.25,0.1 0.25,1 1,1")` (= CSS `ease`).

### 6.2 가로 레일 `media-rail.tsx`

**스크롤 하이재킹을 하지 않는다.** 레퍼런스도 네이티브 가로 스크롤이고,
그래야 트랙패드·터치·키보드가 그대로 동작한다. Prev/Next 는 한 타일씩
`scrollBy` 를 부르는 보조 수단이다.

타일(`#ececec`)은 뷰포트를 정확히 n 등분하고 `gap-px` 로 벌린다. 그 1px 틈으로
흰 바탕이 드러나 격자선처럼 읽힌다(레퍼런스가 테두리 없이 격자를 만드는 방법).
폭 계산은 `lg:w-[calc((100%-4px)/5)]` 처럼 gap 수를 빼고 나눈다.

### 6.3 제품 타일 이미지

`public/product/` 의 촬영본 5장을 쓴다. 타일 수는 물건 수와 같게 5칸이다.

**`object-contain` 을 쓴다.** 레퍼런스의 제품컷은 같은 비율로 누끼를 딴
신발이라 cover 로 채워도 잘리는 게 없지만, 우리 촬영본은 비율이 0.442 ~ 0.748
로 제각각이다. 4:5 틀에 cover 를 걸면 가장 긴 병이 위아래로 45% 잘린다.

남은 숙제는 **에셋 쪽**이다. 배경 톤(#e1d9c5 ~ #fbf5f4)과 비율이 사진마다
달라서 매트 위에 조금씩 다른 사각형으로 얹힌다. 한 벌로 보이려면 같은
배경·같은 비율로 다시 앉힌 이미지가 필요하다.

제품명은 **포장에서 읽어낸 것만** 적었다. `product_3` 만 "매화꽃차 /
Plum Blossom" 이 또렷하고 나머지는 브랜드명까지만 판독된다. 지어내지 않고
브랜드명 + 포장 설명으로 두었다(`home-content.ts` 에 확인 요청 메모).

### 6.4 영상 `ambient-video.tsx`

`AmbientVideo` 가 세 가지를 직접 처리한다.

| 처리                        | 이유                                                          |
| --------------------------- | ------------------------------------------------------------- |
| `muted` 를 ref 로 재설정    | React 가 속성으로만 렌더하면 자동재생이 막히는 경우가 있다     |
| 화면 밖이면 `pause()`       | 11MB 영상이 푸터 뒤에서 계속 디코딩되면 배터리만 깎는다        |
| `#t=0.1` 미디어 프래그먼트  | 포스터 이미지가 없어서, 첫 프레임을 그리게 하는 대용           |

`prefers-reduced-motion` 이면 재생하지 않고 첫 프레임만 둔다. 설정을 도중에
바꿔도 따라가도록 `change` 를 듣는다.

`ffmpeg` 이 없어 포스터를 못 뽑았다. 설치되면 1프레임을 webp 로 뽑아
`poster` 를 주는 편이 낫다(첫 페인트가 빨라진다).

### 6.5 자리표시 이미지

아직 에셋이 없는 자리(카테고리 레일, 에디토리얼 밴드, Finder, Promise). 나머지는 `PlaceholderMedia` 로 둔다.
**스톡 사진이나 picsum 링크로 채우지 않는다.** 채워 두면 "이미 끝난 화면"으로
읽혀 교체가 미뤄지기 때문이다. 대신 무엇이 들어갈 자리인지와 필요한 원본
규격을 면 위에 적어 둔다.

교체할 때는 `PlaceholderMedia` 를 `next/image` 로 바꾸고 부모의 `aspect-*` 는
그대로 두면 된다.

---

## 7. 레퍼런스와 의도적으로 다른 부분 (v2)

### 7.1 한글에는 모노를 쓰지 않는다 ★

레퍼런스는 UI 라벨 **전부**를 Suisse Intl Mono 로 쓴다. 우리 라벨은 대부분 한글인데,
대체 서체인 **Geist Mono 에는 한글 글리프가 없다.** 그러면 브라우저가 글자마다
폴백 한글 폰트를 끌어오면서 **모노의 고정 폭 칸에 비례폭 글리프를 넣는다.**
결과는 글자 사이가 들쭉날쭉한 줄이다(실제 렌더로 확인하고 고쳤다).

그래서 축을 **언어**로 나눴다.

- 라틴·숫자(ABOUT, CART 0, NEW, Prev, 전화번호, 연도) → 모노. 레퍼런스의 질감이 남는다.
- 한글(버튼 라벨, 섹션 라벨, 본문) → 산세.

### 7.2 서체 대체

Suisse Intl 두 벌 모두 상용이라 이미 실려 있는 **Geist / Geist Mono** 로 대체했다.
한글은 두 서체 모두 글리프가 없어 `--font-display` 스택 뒤쪽의 한글 face 가 받는다.

### 7.3 보조 회색을 어둡게 조정

레퍼런스의 보조 회색("SHOP ALL" 등)은 우리가 쓰는 값보다 밝아 타일 위에서
AA 하한을 못 넘긴다. `#666664` 로 내려 surface 5.8:1 / tile 4.9:1 을 맞췄다.
강조색 `#c1242f` 는 레퍼런스 값 그대로 쓴다(흰 바탕에서는 5.9:1 로 통과한다).

### 7.4 행간을 레퍼런스보다 열어 두었다

레퍼런스 h1 은 `leading` 이 1.0 아래다. 라틴은 그래도 되지만 한글은 글자가
em 상자를 꽉 채워서 어센더/디센더가 잘린다. 디스플레이 행간을 1.02~1.12 로 올렸다.

### 7.5 reduced motion

레퍼런스는 `prefers-reduced-motion`을 처리하지 않는다. 우리는 처리한다.
드리프트·줄 리빌·패럴랙스·호버 스케일이 전부 꺼지고, 헤드라인은 마스크 없이
그대로 보인다(§11 에서 검증).

### 7.6 라우트 이름은 `/bag` 그대로

메뉴 라벨은 레퍼런스를 따라 `CART` 지만 라우트는 `/bag` 이다. 슬러그를 바꾸면
북마크·유입 링크가 끊기고 `route-chrome.ts` 와 이 문서까지 함께 움직여야 한다.

---

## 8. 페이지 전환 `page-transition.tsx` (v1/v2 공통)

```
클릭 → preventDefault → <html>.page-transitioning 추가
     → hide()  : gsap.fromTo(view, {opacity:1}, {duration:.3, ease:"power1.out", opacity:0})
     → router.push
     → show()  : smoother.scrollTo(0) 후
                 gsap.fromTo(view, {opacity:0}, {duration:.3, ease:"power1.in", opacity:1})
     → 락 해제
```

### 8.1 클릭은 capture 단계에서 가로챈다

버블 단계에 리스너를 달면 `next/link`의 핸들러가 먼저 돌아 페이드아웃 전에 라우팅이 시작된다.
`document`에 **capture: true**로 달고 `preventDefault()` + `stopPropagation()`으로 막은 뒤,
페이드아웃 완료 콜백에서 `router.push`를 호출한다.

**부작용**: 링크의 `onClick` 은 아예 호출되지 않는다. 모바일 시트가 링크 탭에
`onPointerDown` 으로 닫기를 거는 이유가 이것이다.

### 8.2 뒤로가기는 popstate를 가로채 재생한다

```ts
event.stopImmediatePropagation(); // 라우터 핸들러 차단
hide(() => {
  bypassPopstate.current = true;
  window.dispatchEvent(new PopStateEvent("popstate", { state: history.state }));
});
```

Next가 리스너를 먼저 등록하도록 바뀌면 `stopImmediatePropagation`이 무력화되어
"즉시 교체 + 페이드인"으로 degrade한다. 깨지지는 않는다.

### 8.3 제외 규칙

`target` 있음 / `data-page-transition-disabled` / `href^="#"` / 외부 도메인 /
같은 경로 / 수식키 클릭은 가로채지 않는다.

전환 중에는 `html.page-transitioning #view { pointer-events: none }`로 중복 클릭을 막는다.
헤더는 `#view` 바깥이라 전환 중에도 고정된 채 남는다.

---

## 9. 컨벤션 (필수)

### 9.A className은 항상 `cn()`으로 쪼갠다

순서는 기본 → **큰 폭에서 작은 폭 순**(2xl → xl → lg → md → sm) → 색 → 상태 변형.

```tsx
className={cn(
  "relative flex h-full flex-col justify-end px-4 pb-8",  // 1. 기본
  "lg:px-6 lg:pb-10",                                     // 2. lg
  TEXT.white,                                             // 3. 색
  "motion-reduce:transition-none",                        // 4. 상태
  className,                                              // 5. 외부 주입
)}
```

Tailwind는 클래스 나열 순서가 CSS 우선순위에 영향을 주지 않으므로 이 정렬은
**순수하게 가독성용이며 렌더 결과를 바꾸지 않는다**. 단 `cn()`의 tailwind-merge는
같은 variant + 같은 속성끼리만 병합하므로, 한 줄 안의 순서는 임의로 바꾸지 말 것.
(같은 속성을 두 번 적으면 **앞의 것이 조용히 사라진다.** `cn(BG.transparent, BG.tile)`
같은 실수를 실제로 했다.)

### 9.B 색은 `src/constants/colors.ts`에서만 가져온다

```ts
COLOR;   // 16진수 원본값. GSAP 트윈 등 JS에서 색이 필요할 때
BG;      // bg-[#cccccc] / bg-[#bcbcbc] / bg-[#3c4c3d] ...
TEXT;    // text-[#262626] / text-[#525250] / text-[#e8e9e3] ...
BORDER;  // border-[#a8a8a6] / border-current
OUTLINE; // outline-[#262626] (밝은 면) / outline-[#e8e9e3] (짙은 면·사진 위)
SCRIM;   // 사진 위 글자용 가림막
```

**왜 클래스 문자열을 통째로 상수에 넣는가**: Tailwind 스캐너는 소스에서 완성된
클래스 문자열을 찾는다. `bg-[${COLOR.surface}]` 처럼 템플릿 리터럴로 만들면
클래스를 못 찾아 **CSS가 아예 생성되지 않는다.**

**예외**: `transparent`, `currentColor` 는 헥사값이 없는 키워드다.
`border-current` / `text-current` 는 헤더처럼 면색이 스크롤에 따라 뒤집히는
곳에서 안쪽 요소가 바깥 색을 따라가게 할 때 쓴다.

### 색 대비 (전부 계산해서 넣은 값이다)

| 조합                            | 비율   | 판정 |
| ------------------------------- | ------ | ---- |
| ink `#262626` / surface `#fff`  | 15.1:1 | AAA  |
| ink / tile `#ececec`            | 12.8:1 | AAA  |
| muted `#666664` / surface       | 5.8:1  | AA   |
| muted / tile                    | 4.9:1  | AA   |
| accent `#c1242f` / surface      | 5.9:1  | AA   |
| accent / tile                   | 5.0:1  | AA   |
| **accent / forest**             | 1.2:1  | **못 씀** |
| chalk `#e8e9e3` / forest        | 7.5:1  | AAA  |
| moss `#b8bcb4` / forest         | 4.8:1  | AA   |

`muted` 는 **타일이 하한을 정한다.** 더 밝게 가면 타일 위에서 AA 가 깨진다.
레퍼런스의 보조 회색은 이보다 밝지만 그대로 쓰면 미달이라 어둡게 잡았다.

**강조색은 밝은 면에서만 쓴다.** 짙은 초록 위에서는 1.2:1 까지 무너진다.

**투명도로 위계를 만들지 않는다.** 위계는 크기로 만든다.

### 9.C 타입 스케일은 `src/constants/typography.ts`에서만 가져온다

| 상수                | 서체   | 쓰는 곳                          |
| ------------------- | ------ | -------------------------------- |
| `LABEL`             | 모노   | 라틴·숫자 UI (ABOUT, NEW, Prev)  |
| `LABEL_KO`          | 산세   | 한글 UI 라벨, 버튼, 섹션 라벨    |
| `MONO_DATA`         | 모노   | 전화번호, 사업자번호, 가격, 연도 |
| `BODY`              | 산세   | 한글 본문                        |
| `DISPLAY_HERO`      | 산세   | 히어로 h1 (6.1vw = 88px @1440)   |
| `DISPLAY_SECTION`   | 산세   | 섹션 h2                          |
| `DISPLAY_MANIFESTO` | 산세   | 선언문                           |
| `TITLE_ITEM`        | 산세   | 제품명, 카테고리명               |

**폭을 `ch` 로 잡지 않는다.** `ch` 는 "0" 글리프 폭이라 한글 한 글자가 약 2ch 를
먹는다. `max-w-[20ch]` 로 둔 선언문이 한글 10자에서 꺾여 네 줄로 부서졌다.
한글 문단은 px 로 고정한다.

**헤드라인은 줄 단위 배열로 적는다**(`home-content.ts`). `\n` + `whitespace-pre-line`
으로 두면 SplitText 가 줄을 다시 나누면서 개행이 사라져 2줄 헤드라인이 1줄로 붙는다.
`HeadlineLines` 가 줄마다 블록 요소로 내보내면 SplitText 가 그 경계를 그대로 잡는다.

### 9.D 헤더와 푸터

**헤더** — 좌 메뉴 / 중앙 로고 / 우 유틸리티. 로고를 광학적 중앙에 두려고
`grid-cols-[1fr_auto_1fr]` 을 쓴다. 좌우 내용 폭이 달라도 로고가 흔들리지 않는다.

면색 상태는 `HeaderShell` 하나가 정한다.

| 상태          | 조건                        | 면        | 글자     | 로고     |
| ------------- | --------------------------- | --------- | -------- | -------- |
| 오버레이      | `/` 이면서 스크롤 < 88vh    | 투명      | 흰색     | `invert` |
| 솔리드        | 그 외 전부                  | `#ffffff` | `#262626`| 원본     |

상태 전환은 ScrollTrigger `onToggle` 이다. `onUpdate` 로 하면 **프레임마다
setState 가 돌아 리렌더가 폭주한다.** `onToggle` 은 경계를 넘을 때만 불린다.

활성 메뉴는 **밑줄**로 표시한다. 굵기를 바꾸면 글자 폭이 늘어 옆 항목이 밀린다
(v1 은 그래서 보이지 않는 볼드 고스트를 겹쳐 폭을 고정해야 했다. 그 장치가 사라졌다).

**푸터** — 이 페이지에서 **명도가 뒤집히는 유일한 자리**다. 흰 바탕이 계속되다
푸터에서만 짙은 초록이 깔려 스크롤이 끝났다는 신호가 된다. 섹션마다 뒤집으면
다른 사이트로 넘어온 것처럼 읽히므로 여기 하나만 유지할 것.

사업자 정보와 법적 고지, 링크 칼럼은 `src/constants/business.ts` 한 곳에서 온다.

**푸터를 `#view` 안, `<main>` 밖에 두는 이유**

- `#view` **안**: 밖에 두면 라우트가 바뀌는 순간 문서 높이가 먼저 바뀌어 푸터가 튄다.
- `<main>` **밖**: `main` 안의 `footer`는 섹션 푸터로 취급돼 `contentinfo` 랜드마크가 사라진다.

### 9.E 라우트 그룹: (common) / (non-common)

괄호 그룹이라 **URL에는 영향이 없다.**

| 계열           | 헤더            | 푸터   | 라우트                                        |
| -------------- | --------------- | ------ | --------------------------------------------- |
| `(common)`     | `SiteHeader`    | 있음   | `/`, about, shop, bag, account, login, admin, terms, privacy |
| `(non-common)` | `PaymentHeader` | 없음   | `/payment`                                    |

**무엇이 어디에 사는지가 제약으로 정해져 있다.**

- **헤더는 root layout에만 둘 수 있다** (§4의 transform 문제).
- **`<main>`과 푸터는 계열 layout이 갖는다.** 둘 다 `#view` 안에 있어야 하고
  계열마다 달라지는 것이 정확히 이 둘이다.
- **`SmoothScroll`과 `PageTransition`은 root에 못 박아 둔다.** 계열 layout으로
  내리면 계열을 넘나들 때 언마운트되어 ScrollSmoother가 kill/재생성되고,
  다시 마운트된 `PageTransition`은 `isFirstRender` 가드에 걸려 **페이드인을
  통째로 건너뛴다.**

**헤더 선택은 `constants/route-chrome.ts`의 접두사 목록이 한다.**
`(non-common)/` 아래 라우트를 추가하면 **접두사 목록에도 넣어야 한다.**

---

## 10. 함정 모음 (같은 실수 반복 금지)

### 10.0 Tailwind 임의값 경고는 꺼 두었다

`.vscode/settings.json` 의 `tailwindCSS.lint.suggestCanonicalClasses: "ignore"`.
레퍼런스 실측값을 px 로 유지하기 위해서다.

**부작용**: `h-[100dvh] → h-dvh` 같은 **진짜 개선 제안까지 사라진다.**
임의값을 새로 쓸 때는 전용 유틸리티가 있는지 직접 확인할 것.

### 10.1 next/image 캐시는 파일 내용을 안 본다

`.next/cache/images`의 키는 **URL + width + quality**다. 파일을 교체해도 캐시가 히트한다.

```bash
rm -rf .next/cache/images   # 후 브라우저 하드 리로드(⌘⇧R)
```

### 10.2 헤드리스 브라우저에서 GSAP 값이 전부 0으로 읽힌다

스크린샷을 강제하지 않으면 rAF가 돌지 않아 ScrollSmoother/ScrollTrigger가 멈춘 것처럼 보인다.
**코드 버그로 오인하기 쉽다.** 측정 루프에 `Page.captureScreenshot`을 끼워 프레임을 강제할 것.

### 10.3 SplitText 는 폰트 로드 뒤에 나눠야 한다

폰트가 바뀌면 줄바꿈 위치가 바뀐다. `document.fonts.ready` 앞에서 나누면
폴백 폰트 기준으로 잘린 줄이 그대로 굳는다.

### 10.4 마스크 안의 요소는 IntersectionObserver에 절대 안 걸린다

`translateY(100%)`로 내려간 요소는 자기 마스크의 클립 영역 밖이라 교차 비율이 영구히 0이다.
IO 기반 리빌을 쓸 거면 **트리거를 마스크 자체에 걸어야** 한다.
(현재는 GSAP ScrollTrigger 라 해당 없음.)

### 10.5 모달이 떠 있는 스크린샷에서 색을 재면 전부 0.8배로 나온다 ★

레퍼런스는 진입 직후 뉴스레터 모달과 지역 선택 모달을 띄우고, **페이지 전체에
20% 검정 막**을 깐다. 그 상태로 찍은 스크린샷의 픽셀을 재면 모든 면색이
0.8 배로 읽힌다. 처음에 이걸 놓쳐서 팔레트를 통째로 회색으로 깔았다.

| 재어 나온 값 | ÷ 0.8 | 진짜 값   |
| ------------ | ----- | --------- |
| `#cccccc`    | 255   | `#ffffff` |
| `#bcbcbc`    | 235   | `#ececec` |
| `#303c30`    | 60,75,60 | `#3c4c3d` |

**어긋남을 알아채는 방법**: 같은 값을 computed style 로도 읽어 비교한다.
푸터가 픽셀에서는 `#303c30`, computed 에서는 `#3c4c3d` 로 갈렸는데,
이 비율(0.8)이 다른 면에도 똑같이 적용된다는 게 단서였다.
firecrawl `branding` 도 `background: #FFFFFF` 를 정확히 돌려주고 있었다.

**규칙: 색은 픽셀에서 재지 않는다. computed style 에서 읽는다.**
픽셀 스캔은 "섹션마다 면색이 바뀌는가"를 볼 때만 쓴다(값이 아니라 경계를 본다).

### 10.6 짧은 페이지에서는 "스크롤이 안 됐다"로 오인된다 ★

라우트를 옮겼는데 첫 화면에 푸터가 보이면 사용자는 **스크롤이 맨 위로 가지
않았다고 읽는다.** 실제로 그렇게 보고됐다.

측정해 보니 스크롤은 정상이었다(전환 직후 `scrollY = 0`). 원인은 다른 데
있었다: 자리표시 페이지가 `min-h-[70svh]` 라서 900px 뷰포트에서 630px 밖에
안 됐고, 남은 270px 을 짙은 초록 푸터가 채웠다. **맨 위에 있는 화면과
푸터까지 스크롤된 화면이 사용자 눈에는 똑같아 보인다.**

→ 본문 최소 높이를 `calc(100svh - 3.25rem)`(뷰포트 − 헤더)로 잡아
푸터가 항상 접힘선 **아래**에서 시작하게 했다.

**교훈**: "스크롤이 안 된다"는 제보를 받으면 스크롤을 고치기 전에
`scrollY` 를 먼저 재 볼 것. 값이 0이면 문제는 페이지 높이 쪽이다.
푸터가 짙은 색이면 이 착시가 특히 강하다.

새 페이지를 만들 때는 본문이 최소 한 화면을 채우는지 확인한다
(`foldcheck.mjs` 가 라우트별로 `footerTop >= innerHeight` 를 검사한다).

### 10.7 shadcn 생성물은 손대지 않는다

`src/components/ui/**`는 `npx shadcn add`로 재생성되는 벤더 코드다.
carousel.tsx가 `react-hooks/set-state-in-effect`에 걸려서 `eslint.config.mjs`에
**해당 디렉토리 + 해당 룰만** 끄는 override를 두었다(인라인 주석은 재생성 시 사라진다).

`--radius: 0rem` 로 두었으므로 shadcn 컴포넌트도 각지게 나온다. 팔레트를 바꾸면
`globals.css` 의 `:root` 토큰과 `colors.ts` 를 **함께** 고칠 것.

---

## 11. 검증 방법

빌드가 통과한다고 애니메이션이 도는 것은 아니다. 실제 브라우저를 CDP로 몰아 확인한다.

```bash
# 1) 헤드리스 크롬을 디버깅 포트로 띄운다
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless --disable-gpu --hide-scrollbars \
  --remote-debugging-port=9333 --user-data-dir=<tmp> about:blank &

# 2) Node 22의 내장 WebSocket으로 CDP에 붙는다 (puppeteer 불필요)
#    Page.navigate → Emulation.setDeviceMetricsOverride → window.scrollTo
#    → captureScreenshot 루프(프레임 강제) → Runtime.evaluate로 계산값 읽기
```

### v2 검증 결과 (1440×900)

```
== 실측 대조 ==
  h1 font-size   87.84px   (레퍼런스 88px)
  헤더 높이       52px      (레퍼런스 52px)
  h1 줄 수        2         (의도대로)

== 헤더 상태 전환 ==
  y=0     solid=false  bg=rgba(0,0,0,0)      color=rgb(255,255,255)
  y=400   solid=false  bg=rgba(0,0,0,0)      color=rgb(255,255,255)
  y=800   solid=true   bg=rgb(255,255,255)   color=rgb(38,38,38)
  y=300   solid=false  bg=rgba(0,0,0,0)      color=rgb(255,255,255)   ← 되돌아온다

== 페이지 전환 (메뉴 클릭 -> /shop) ==
  /      | 1.00 | LOCK
  /      | 0.00 | LOCK        ← 페이드아웃 완료
  /shop  | 0.01 | LOCK        ← opacity 0 지점에서 교체
  /shop  | 0.47 | LOCK
  /shop  | 1.00 | -           ← 락 해제

== prefers-reduced-motion: reduce ==
  숨거나 변형이 남은 헤드라인 없음

== 모바일 390×844 ==
  document.scrollWidth 390 == innerWidth 390   ← 가로 넘침 없음

== 접힘선 검사 (자리표시 라우트 전부 × 1440/1280/390) ==
  OK  /about    footerTop=900  vh=900          ← 푸터가 첫 화면에 안 들어온다
  OK  /shop     footerTop=900  vh=900
  OK  /bag      footerTop=900  vh=900
  OK  /payment  footerTop=(none)               ← (non-common) 은 푸터 없음
```

---

## 12. 현재 상태와 다음 작업

### 완료 (design-v2)

- 팔레트/타입 토큰 교체 (`colors.ts`, `typography.ts`, `globals.css`)
- 헤더 재구성: 좌 메뉴 / 중앙 로고 / 우 유틸리티 + 스크롤 상태 전환
- 홈 8개 섹션 (§6)
- 초록 푸터 (링크 칼럼 + 사업자 정보 + 법적 고지)
- 자리표시 페이지 전면 재작성
- 페이지 전환 / ScrollSmoother / 계열 분리 **유지 확인** (§11)

### 미완 / 임시

| 항목                                      | 상태                                                                    |
| ----------------------------------------- | ----------------------------------------------------------------------- |
| **홈 이미지 에셋**                        | 히어로·제품 타일·영상은 실제 에셋. 카테고리/에디토리얼/Finder/Promise 는 **자리표시** |
| 제품명 3개                                | product_2 / product_4 / product_5 의 차 이름 미확인. 포장에서 안 읽혀 브랜드명으로 뒀다 |
| 제품 촬영본 규격                          | 배경 톤·비율이 제각각이라 그리드가 한 벌로 안 읽힌다(§6.3)              |
| 영상 포스터                               | `ffmpeg` 부재로 못 뽑음. 첫 프레임은 `#t=0.1` 로 대신하고 있다          |
| `/about` `/shop` `/admin` `/login` `/bag` | **자리표시 스텁**                                                       |
| `/terms` `/privacy`                       | **본문 없음**. 법적 효력이 있는 문서라 지어내지 않았다                  |
| `/payment`                                | **자리표시 스텁**. `(non-common)` 계열 배선만 확인해 둔 상태            |
| 제품 가격                                 | 전부 `"준비 중"`. 숫자를 지어내지 않았다 (`home-content.ts`)            |
| 통신판매업신고번호                        | 값을 못 받아 푸터에서 빠져 있다. 국내 커머스는 표기 의무가 있다         |
| `CART (0)` 개수                           | `cartCount` prop 하드코딩. 장바구니 상태 연동 필요                      |
| 소셜 링크                                 | 계정을 못 받아 푸터 칼럼에서 빠져 있다                                  |
| 다크모드                                  | `.dark` 토큰은 새 팔레트로 맞춰 뒀으나 토글 미설치. 레퍼런스에는 있다   |

### 이어서 할 때 참고

- 새 섹션을 추가할 때는 §4 합성 순서와 §5 sticky 금지 규칙을 먼저 확인할 것.
- 섹션을 추가하면 §6 표의 "배치 계열" 열을 보고 **앞뒤와 겹치지 않는 계열**을 고를 것.
- 이미지를 넣을 때는 `PlaceholderMedia` 를 `next/image` 로 바꾸고 부모의
  `aspect-*` 는 그대로 둔다.
- 패키지 매니저는 **npm**으로 통일한다(`package-lock.json` 존재). yarn 혼용 금지.
