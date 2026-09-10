# gwana tea house - 아키텍처 노트

> 이 문서는 다음 세션에서 맥락 없이 읽어도 이어서 작업할 수 있도록 쓴 것이다.
> "무엇을 했는가"보다 **"왜 그렇게 했는가"** 와 **"어디서 깨지는가"** 를 남긴다.
> 마지막 갱신: 2026-09-10

---

## 1. 이 프로젝트가 무엇인가

가와나 티하우스(한국 차 브랜드)의 커머스 프론트엔드.
디자인/인터랙션 레퍼런스는 **https://postevand.com** (덴마크 생수 브랜드, Shopify Liquid + GSAP 3.11.3).
방문 안내 섹션(§6.3)만 예외로 **https://www.limon.no** 를 참고했다. 그 한 섹션의
스티커 인터랙션만 가져온 것이고, 레이아웃·팔레트·타입은 여전히 postevand 계열이다.

레퍼런스를 "느낌만 참고"하는 것이 아니라 **수치까지 복제**하는 것이 이 프로젝트의 방침이다.
그래서 아래 규칙이 적용된다.

- 값이 애매하면 추측하지 말고 **레퍼런스의 실제 CSS/JS를 파싱해서** 확인한다.
- 레퍼런스와 다르게 갈 때는 **왜 다른지 근거를 남긴다** (§6).

### 레퍼런스 분석 방법

스크린샷 눈대중은 금지. 아래 순서로 실측한다.

```bash
# 1. HTML + 테마 번들 내려받기
curl -sL -A "Mozilla/5.0 ..." https://postevand.com/ -o pv.html
grep -oE '/cdn/shop/t/5/assets/[a-zA-Z0-9._-]+\.(css|js)[^"]*' pv.html | sort -u
curl -sL "https://postevand.com/cdn/shop/t/5/assets/app.css?v=..." -o app.css
curl -sL "https://postevand.com/cdn/shop/t/5/assets/app.js?v=..."  -o app.js

# 2. app.css는 정규식으로 규칙 추출, app.js는 minify 해제 후 클래스 단위로 읽기
```

`app.js`는 169KB 난독화 번들이지만 클래스 메서드명(`initScrollTriggersDesktop`, `animateHero`,
`navigateTo`, `hide`, `show`)은 살아 있어서 검색으로 찾을 수 있다.

**중요**: 레퍼런스는 `html { font-size: 62.5% }` 이므로 **1rem = 10px** 이다.
우리 프로젝트는 기본 16px이므로 레퍼런스의 rem 값을 그대로 옮기면 안 된다.
그래서 레퍼런스에서 가져온 치수는 전부 **px 또는 vw/vh 리터럴**로 적어두었다.

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
이유는 레퍼런스가 GSAP이고, 특히 **ScrollSmoother**가 필요했기 때문이다(§5).
GSAP과 Motion을 같은 트리에서 섞으면 프레임을 두고 경합한다. 다시 섞지 말 것.

ScrollSmoother / SplitText / CustomEase는 예전엔 Club GreenSock 유료 플러그인이었지만
**GSAP 3.13부터 퍼블릭 npm 패키지에 무료로 포함**된다. 별도 라이선스나 레지스트리 설정 불필요.

---

## 3. 디렉토리 구조

```
src/
├─ app/
│  ├─ layout.tsx              # 셸. 합성 순서가 핵심 (§4)
│  ├─ globals.css             # 토큰 + base 레이어
│  │
│  ├─ (common)/               # 공통 헤더 + 푸터 계열 (§9.E)
│  │  ├─ layout.tsx           #   <main> + SiteFooter
│  │  ├─ page.tsx             #   홈: Hero + ProductScroll
│  │  └─ about|shop|admin|login|bag|account|terms|privacy/page.tsx
│  │
│  └─ (non-common)/           # 단독 헤더 계열. 푸터 없음
│     ├─ layout.tsx           #   <main> 만
│     └─ payment/page.tsx     #   자리표시 스텁
│
├─ components/
│  ├─ layout/
│  │  ├─ site-header.tsx      # 공통 고정 헤더 (서버 컴포넌트)
│  │  ├─ payment-header.tsx   # 단독 고정 헤더 (서버 컴포넌트)
│  │  ├─ chrome-header.tsx    # 경로로 둘 중 하나를 고르는 스위치 (클라이언트)
│  │  ├─ site-footer.tsx      # 공통 푸터 (서버 컴포넌트, §9.D)
│  │  ├─ header-nav-link.tsx  # 활성 상태 (클라이언트)
│  │  ├─ header-mobile-menu.tsx
│  │  ├─ nav-items.ts         # 메뉴 정의 + HEADER_LABEL 타입 스케일
│  │  ├─ smooth-scroll.tsx    # ScrollSmoother 래퍼 + 초기화
│  │  ├─ page-transition.tsx  # 페이지 전환 (§8)
│  │  └─ placeholder-page.tsx
│  │
│  ├─ home/
│  │  ├─ hero-section.tsx           # 히어로 (§6.1)
│  │  └─ product-scroll-section.tsx # 핀 고정 스크럽 섹션 (§6.2)
│  │
│  └─ ui/                     # shadcn 생성물. 손으로 고치지 않는다
│
└─ lib/
   ├─ utils.ts                # cn()
   └─ useIsomorphicLayoutEffect.ts
```

---

## 4. 레이아웃 합성 순서 (가장 중요)

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
  (common)      → <main className="pt-14 lg:pt-15">{page}</main> + <SiteFooter />
  (non-common)  → <main className="pt-14 lg:pt-15">{page}</main>
```

### 왜 fixed 요소가 스무더 바깥이어야 하는가

ScrollSmoother는 `#smooth-content`에 `transform: matrix3d(...)`를 걸어 스크롤을 흉내낸다.
**transform이 걸린 조상 안에서는 `position: fixed`가 뷰포트가 아니라 그 조상 기준**이 된다.
헤더를 안에 넣으면 스크롤과 함께 밀려 올라간다. 레퍼런스도 `<header id="banner">`를
`#smooth-wrapper` **앞**에 둔다.

### 왜 SmoothScrollInit이 첫 번째 자식이어야 하는가

React는 **자식의 layout effect를 부모보다 먼저** 실행한다.
`SmoothScroll`이 children을 감싸는 구조에서 초기화를 부모 컴포넌트 본체에 두면,
히어로/제품 섹션의 effect가 **스무더가 존재하기 전에** 실행된다. 결과:

- `ScrollSmoother.get()`이 `undefined` → 패럴랙스가 안 붙는다
- 그 시점에 만들어진 ScrollTrigger는 **변형되지 않은 문서 좌표**를 기준으로 측정한다

형제 컴포넌트의 effect는 렌더 순서대로 실행되므로, 초기화 전용 컴포넌트를
`#smooth-content`의 첫 자식으로 렌더해 순서를 강제했다. 이 구조를 유지할 것.

---

## 5. 스크롤 아키텍처

### ScrollSmoother

```ts
// smooth-scroll.tsx, 레퍼런스 설정 그대로
ScrollTrigger.config({ ignoreMobileResize: true });
gsap.matchMedia().add("(min-width: 1024px)", () => {
  const smoother = ScrollSmoother.create({
    smooth: 1,
    smoothTouch: 1,
    effects: true,
  });
  return () => smoother.kill();
});
```

`1024px 이상에서만` 생성하는 것도 레퍼런스와 동일하다.

### CSS sticky를 쓰면 안 된다

핀 고정에 `position: sticky`를 쓰면 안 된다.
**transform이 걸린 조상 안에서 sticky는 동작하지 않기 때문**이다.
레퍼런스가 sticky 대신 ScrollTrigger `pin:`을 쓰는 이유가 이것이다.
초기 Motion 구현에서 sticky를 썼다가 GSAP 전환 시 전부 `pin:`으로 교체했다.

### 브레이크포인트 분기는 gsap.matchMedia()

`useState` + `matchMedia` 커스텀 훅으로 분기하던 것을 `gsap.matchMedia()`로 통일했다.
데스크톱 / 모바일 / `prefers-reduced-motion`을 한 콜백에서 받고, `mm.revert()` 한 번으로
트윈·ScrollTrigger·`gsap.set`으로 바꾼 인라인 스타일까지 전부 되돌린다.

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
콜백이 아예 실행되지 않는다. `if (!isDesktop) { ... }` 안의 코드는 조용히 죽는다.

**함정 2: revert가 인라인 스타일을 지우는 게 아니라 "시작값"을 되써 넣는다.**
`.to(el, { width: "100%" })` 같은 트윈을 되돌리면 gsap은 데스크톱에서 읽은 시작값
(`width: 50%`)을 인라인으로 다시 적는다. lg에서만 맞는 값이라 좁은 화면에서는
패널이 반쪽으로 남는다. 창을 데스크톱 → 모바일로 줄일 때만 재현된다(새로고침하면
멀쩡해서 놓치기 쉽다). 모바일 분기 진입 시 해당 속성을 명시적으로 지울 것:

```ts
if (!isDesktop) gsap.set(el, { clearProps: "width,borderLeftColor" });
```

---

## 6. 섹션별 사양 (레퍼런스 실측값)

### 6.1 히어로 `hero-section.tsx`

| 동작                | 값                                                                   | 출처                        |
| ------------------- | -------------------------------------------------------------------- | --------------------------- |
| 진입: 사진 드리프트 | `objectPosition 50% 32% → 50% 40%`, 1.5s, ease `custom`              | `animateHero`               |
| 진입: 워드마크      | 마스크 밖에서 `yPercent 110 → 0`, 글자당 50ms 스태거, 1.2s           | `animateHero`               |
| 진입: 눈썹          | 마스크 밖에서 `yPercent 110 → 0`, 0.9s, delay 0                      | **레퍼런스와 다름**         |
| 진입: 버튼          | `y 18 → 0` + `opacity 0 → 1`, 0.7s, stagger 0.08, delay `CTA_DELAY`  | **레퍼런스와 다름**         |
| 스크롤: 사진 고정   | `pin`, `start "top top"`, `end "bottom top"`, `pinSpacing: false`, 전 브레이크포인트 | **레퍼런스와 다름**         |
| 스크롤: 디밍        | `opacity 1 → 0.45`, `start "top top"`, `end "bottom top"`, scrub      | **레퍼런스와 다름**         |
| 섹션 높이           | `h-[100svh] lg:h-[calc(100vh+1px)]`, 배경 검정                       | `.home-scroll__hero`        |

#### 문구는 3단이다 (2026-09-10 개편)

원래는 이름 아래에 업종("TEA HOUSE")을 자간 벌려 깔아 **받침선**으로 썼다.
지금은 눈썹 → 이름 → 진입점 순이다.

```
화개골 수제차          ← 눈썹. 이름을 소개하는 줄이라 이름 위에 있다
관아수제차             ← 이름
[차 보러가기] [브랜드 이야기]   ← 진입점
```

업종이 버튼에 자리를 내주고 이름 **위**로 올라갔다. 받침이 둘(업종 + 버튼)이면
이름이 가운데 끼어 무게가 흩어진다.

- **순서가 곧 타이밍이다.** 눈썹이 0s에 출발해 0.9s에 먼저 도착한다. 이름을
  소개하는 줄이 이름보다 늦게 뜨면 순서가 거꾸로 읽힌다. 버튼은
  `CTA_DELAY = WORDMARK_SETTLED - 0.5`로 마지막 글자보다 반 박자 먼저 출발해
  워드마크가 자리를 잡는 순간 함께 도착한다. 다 끝난 뒤 시작하면 인트로가
  두 토막으로 끊긴다.
- **버튼만 마스크가 아니다.** 테두리 있는 박스를 마스크로 자르면 쉬는 상태에서도
  1px 테두리가 반올림에 따라 잘려 보인다. 그래서 `y + opacity`로 넣는다.
- **버튼 색은 `border-current` / `text-current`다.** 사진 위라 면색 없이 테두리만
  쓰고, 흰색은 문구 묶음 래퍼에서 한 번만 정해 눈썹·이름·버튼이 모두 물려받는다.
  hover도 색이 아니라 투명도(`hover:opacity-70`)다. 사진 위에서 통하는 규칙이
  그것뿐이라 새 헤더와 같게 맞췄다. 팔레트 맵을 안 거치는 예외가 `transparent`와
  `currentColor` 둘뿐이라는 규칙(§9.B)에 걸리지 않는다.
- 진입점은 `/shop`(주 동선)과 `/about`(보조) 두 개다. 좁은 화면에서 두 칸이
  안 들어가면 `flex-wrap`으로 줄을 바꾼다(390px에서는 한 줄에 들어간다).

#### 인트로가 떨리던 원인 (2026-09-10 수정)

문구가 다 올라온 **직후에 잔떨림**이 보였다. 원인이 두 개였고 둘 다
`gsap.fromTo`에 걸어둔 옵션이었다.

**1. 트윈마다 `clearProps`를 걸어서 원복이 순차로 일어났다.**

원복은 공짜가 아니다. transform이 걸린 글자와 안 걸린 글자는 브라우저가 다르게
그린다(합성 레이어 위 텍스트는 서브픽셀 안티에일리어싱을 못 쓴다). 그래서
transform을 지우는 프레임마다 글자가 한 번 다시 그려지며 굵기가 미세하게 바뀐다.

문제는 그게 **스태거 간격대로 여덟 번** 일어났다는 것이다. 워드마크 5글자가
50ms 간격, 버튼 2개가 80ms 간격. 약 0.5초에 걸쳐 여덟 번 튀니 떨림으로 읽힌다.

→ 트윈 세 개를 **하나의 타임라인**으로 묶고, `clearProps`를 타임라인
`onComplete`에서 **한 번에** 실행한다. 여덟 번이 한 번이 된다.

**2. `force3D: false`라 매 프레임 CPU가 다시 래스터화했다.**

합성 레이어를 안 만드는 대신 글자를 프레임마다 CPU로 다시 그린다. 이징
`cubic-bezier(.25,.1,.25,1)`은 꼬리가 길어서 마지막 구간이 프레임당 1px도 못
움직이는데, 소수점 좌표 렌더링 차이가 가장 잘 보이는 구간이 정확히 거기다.
올라오는 내내 지글거리던 쪽이 이것이고, 1px 테두리가 있는 버튼에서 특히 심했다.

→ `force3D: true` + 움직이는 동안만 `will-change`. 끝나면 위 `onComplete`에서
`transform,opacity,willChange`를 같이 지운다.

**3. 여기서부터가 진짜 문제였다. 이징의 꼬리.**

`cubic-bezier(.25,.1,.25,1)`은 CSS `ease`다. 실제로 풀어 보면

| 시간 경과 | 이동 완료 |
| --------- | --------- |
| 31%       | 54%       |
| 63%       | 91%       |
| 80%       | 97.5%     |

즉 **마지막 20%의 시간(1.2s 중 0.24초)에 2.5%(약 2.3px)만 움직인다.** 프레임당
0.15px다. 이 구간을 어떻게 그리느냐가 전부이고, 세 가지를 다 해봤다.

| 방식 | 결과 |
| ---- | ---- |
| `force3D: true` | 합성기가 텍스처를 소수점 위치로 **리샘플링**. 기는 내내 반 픽셀 흐리다가 끝에서 격자에 붙으며 초점이 맞는다 → "포커스가 다르다" |
| `force3D: true` + `snap: {y:1}` | 정수 픽셀만 쓰니 선명하지만 한 칸을 여러 프레임 유지 → 계단처럼 툭툭 끊긴다 → "떨림" |
| **`force3D: false` (현재)** | 레이어에 안 올리므로 매 프레임 텍스트 래스터라이저가 **다시 그린다**. 소수점 위치도 힌팅·AA를 거치므로 리샘플링 흐림이 없고 계단도 없다. 대가는 프레임당 CPU 비용 |

안티에일리어싱 문제가 **아니다.** root에 `antialiased`(= `-webkit-font-smoothing`)가
걸려 있어 그쪽은 처음부터 끝까지 동일하다.

`force3D: false`면 다 올라왔을 때 transform이 `translate(0,0)`이라 `clearProps`가
지워도 화면이 바뀌지 않는다. 위 1·2번에 있던 "끝에서 한 번 튀는" 지점 자체가 없다.

> **개발 환경 주의**: 확인한 화면은 `devicePixelRatio: 1`이었다. 1배 화면은
> 소수점 이동도 계단도 둘 다 최대로 드러난다. 2배 화면에서는 셋 다 거의 구분이
> 안 되므로, 이 종류의 판단은 **1배 화면에서** 해야 한다.

**남은 손잡이는 이징과 지속시간뿐이다.** 꼬리가 짧은 이징(`power2.out` 계열)이나
더 짧은 duration으로 바꾸면 기는 구간 자체가 줄어든다. 다만 `custom`은 레퍼런스
실측값이라(§6.1) 바꾸려면 근거를 남길 것.

**검증**: 인트로 종료 후 `.hero-char` × 5, `.hero-eyebrow`, `.hero-cta` × 2의
인라인 style이 **전부 동시에 빈 문자열**이 되는 것을 확인했다. 진행 중에는
`transform: translate(0%, 37.994%)`처럼 **2D translate에 소수점**이 붙는다.
여기에 `translate3d(`가 보이면 레이어에 올라간 것이고(1번 증상), 값이 전부
정수면 스냅이 남아 있는 것이다(2번 증상).

> 원래 주석은 "합성 레이어에 머물면 안 되니 force3D를 끈다"였다. 방향은 맞지만
> 대가가 더 컸다. 레이어에 **머무는** 것과 움직이는 **동안만** 올리는 것은 다르다.

`CustomEase.create("custom", "M0,0 C0.25,0.1 0.25,1 1,1")` - 레퍼런스가 등록하는 이름과 경로 그대로.
(= `cubic-bezier(.25,.1,.25,1)`, CSS의 `ease`와 동일)

#### 사진 고정은 레퍼런스와 다르게 갔다 (2026-09-10)

레퍼런스는 사진을 `speed 0.85` 패럴랙스로 흘려보내고 30% 지점부터 `opacity 0.6`까지
눌렀다. 요청은 **사진을 완전히 고정하고 워드마크와 제품 섹션만 그 위로 올리는 것**이라
아래 세 가지를 바꿨다.

- **패럴랙스 제거.** 핀과 패럴랙스는 같은 요소의 transform을 두고 싸운다.
  고정된 사진에 시차라는 개념도 없다. `smoother.effects` 호출을 통째로 뺐다.
- **디밍을 0.45까지, 처음부터.** 사진이 고정되면 30% 전까지 화면에 아무 변화가 없다.
  디밍이 유일한 스크롤 피드백이라 `start`를 `"top top"`으로 당기고 더 깊게 내렸다.
  `opacity`로 어두워지는 것은 레퍼런스 그대로다. 보이는 사진 영역은 항상
  "뷰포트 − 흰 제품 섹션" = 히어로의 남은 부분과 정확히 겹치므로, 고정된 뒤에도
  사진 뒤에 깔린 것은 섹션의 검은 배경이다.
- **핀 해제 지점은 `"bottom top"` 고정.** 여기서 사진은 100vh를 되돌아 제자리로
  점프하는데, 그 순간 흰 제품 섹션이 화면을 꽉 채우고 있어 보이지 않는다.
  `end`를 이보다 늦추면 그 점프가 그대로 드러난다.

**함정: `position: absolute`로 크기가 정해지는 요소는 핀을 걸면 0x0으로 무너진다.**

사진 래퍼는 원래 `absolute inset-0`이었다. ScrollTrigger는 핀을 걸 때 요소를
`.pin-spacer` 안으로 옮겨 넣고 **거기서** 크기를 잰다. 부모 박스에 기대어 크기가
정해지는 요소는 그 순간 참조할 박스를 잃고, 측정값 0이 인라인
`width: 0; height: 0`으로 그대로 박혀 사진이 통째로 사라진다. `ScrollTrigger.refresh()`
로도 복구되지 않는다(이미 0x0 안에서 다시 잰다).

그래서 사진 레이어를 **흐름 안의 블록**으로 바꾸고 높이를 뷰포트 단위로 직접 적었다
(폭은 흐름에서 받는다. `w-screen`은 스크롤바 폭만큼 넘쳐서 안 된다).
제품 섹션이 미는 래퍼(`lg:h-screen` 블록)가 멀쩡한 이유도 같다.
자리를 맞바꾼 워드마크는 `absolute inset-0`이 됐다.

**함정: 섹션의 `overflow-hidden`을 풀면 안 된다.**

고정된 사진은 스크롤한 만큼 섹션 박스 아래로 밀려난다. 처음엔 잘림을 피하려고
`lg:overflow-visible`을 줬는데, 제품 섹션의 왼쪽 절반은 배경이 없어서
(흰색은 `<body>`가 낸다) 사진이 그대로 비쳤다. 잘리는 경계가 곧 제품 섹션이
시작하는 선(섹션 아래끝 = 제품 섹션 위끝)이므로, `overflow-hidden`이 핀의 짝이다.

#### 모바일도 같은 방식으로 덮는다 (2026-09-10 추가)

핀을 데스크톱 전용에서 **전 브레이크포인트**로 넓혔다. 디밍(`opacity 1 → 0.45`)도
핀과 한 몸이라 같이 넓혔다. 코드상으로는 `if (!isDesktop) return;` 한 줄을 지운
것이지만, **ScrollTrigger가 고르는 핀 방식이 브레이크포인트마다 다르다**는 것을
알고 있어야 한다.

| | 데스크톱(≥1024) | 모바일(<1024) |
| --- | --- | --- |
| ScrollSmoother | 있음 | 없음 |
| `pinType` | `"transform"` (흐름에 둔 채 translate) | `"fixed"` (흐름에서 빼고 position:fixed) |
| 히어로 `overflow-hidden`이 자르는가 | **예** | **아니오** |

마지막 줄이 함정이다. `position: fixed` 요소는 조상의 `overflow-hidden`에
**잘리지 않는다**(조상에 transform/filter가 없는 한). 그래서 데스크톱에서
사진을 잘라주던 장치가 모바일에서는 아무 일도 하지 않고, 사진이 제품 섹션을
그대로 뚫고 비쳤다.

→ **제품 섹션에 `BG.page`를 명시했다.** 덮는 쪽이 불투명하면 자르든 안 자르든
결과가 같다. 흰색을 `<body>`에 기대고 있던 것이 문제였다. 히어로 아래로 오는
섹션은 전부 자기 배경을 가져야 한다(`VisitSection`·푸터는 이미 그렇다).

**실측**(390×844 아이프레임, `devicePixelRatio` 무관):

| scrollY | 사진 top | position | 디밍 | 제품 섹션 top |
| ------- | -------- | -------- | ---- | ------------- |
| 0       | -96      | fixed    | 1     | 844  |
| 420     | -96      | fixed    | 0.726 | 424  |
| 900     | -96      | fixed    | -     | -56  |

사진 top이 `-96`으로 붙어 있는 것은 래퍼의 `-mt-24`가 핀에 그대로 보존되기
때문이다(모바일 인트로가 사진을 6rem 끌어올리는 그 여유분). 디밍 0.726은
`1 - (420/844) × 0.55`와 정확히 일치한다. 900에서는 제품 섹션이 화면을 덮어
사진이 보이지 않는다.

**실측 검증 결과** (1920x878, 휠 스크롤):

| scrollY | 사진 top | 사진 opacity | 워드마크 top | 제품 섹션 top |
| ------- | -------- | ------------ | ------------ | ------------- |
| 0       | 0        | 1            | 679          | 879           |
| 200     | 0        | 0.875        | 479          | 679           |
| 440     | 0        | 0.725        | 239          | 439           |
| 878     | 0        | 0.451        | -199         | 1             |
| 1000    | -121     | 0.45         | -321         | -121          |

사진 top이 878까지 0으로 고정되고, 핀이 풀리는 1000에서는 제품 섹션이 이미
화면을 덮고 있음을 확인(= 점프가 보이지 않는다).

> 실측 시 주의: 확장 프로그램으로 페이지를 볼 때 스크린샷을 강제하지 않으면
> rAF가 돌지 않아 트윈이 멈춘 프레임에 갇힌다(§11). `window.scrollTo`로 스크롤을
> 옮기면 ScrollSmoother의 내부 위치와 어긋나므로, 검증은 **실제 휠 이벤트**로 한다.

### 6.2 제품 섹션 `product-scroll-section.tsx`

레퍼런스는 **600vh 구간을 핀 고정하고 8개 트윈을 순차 스크럽**한다. 그대로 옮겼다.

```ts
gsap
  .timeline({
    scrollTrigger: {
      trigger: section,
      start: "top top",
      end: "bottom bottom",
      pin: wrapper,
      scrub: true,
      invalidateOnRefresh: true,
    },
  })
  .to(details, { duration: 1 }) // 대기
  .to(details, { duration: 1, width: "100%" }) // 패널 확장
  .to(product, { duration: 1, scale: 1, ease: "power2.out" }, "<") // ★ 우리 추가분
  .to(details, { duration: 0, borderLeftColor: "transparent" })
  .to(bodySplit.lines, { duration: 1, yPercent: 0, stagger: 0.2 })
  .to(statOneSplit.lines, { duration: 1, stagger: 0.4, yPercent: 0 })
  .to(statTwoSplit.lines, { duration: 1, stagger: 0.4, yPercent: 0 })
  .to(reference, { duration: 1, opacity: 1 })
  .to(details, { duration: 1 }); // 대기
```

줄 단위 마스크는 레퍼런스가 SplitText를 **두 번** 호출해 inner/outer 래퍼를 만든다.
GSAP 3.13+의 `mask: "lines"` 옵션이 같은 일을 하므로 그걸 썼다.

```ts
SplitText.create(el, { type: "lines", mask: "lines" });
```

모바일(<1024px)은 레퍼런스와 동일하게 핀 없이 세로 스택 + 진입 리빌만 한다.

### 6.3 방문 안내 `visit-section.tsx` (2026-09-10 추가)

레퍼런스가 **postevand.com이 아니다.** 이 섹션만 <https://www.limon.no/>(Mono
빌더로 만든 노르웨이 식당 사이트)의 "스크롤을 따라오다 아래 경계에서 사라지는
스티커"를 옮긴 것이다. 나머지 규칙(팔레트·괘선·타입 스케일)은 우리 것을 따랐다.

**원본의 정체: GSAP이 아니라 CSS 한 줄이다.**

`firecrawl_scrape`로 받은 인라인 스타일에서 확인했다. 연속된 두 행에 같은 PNG를
깔고 끝이다.

```css
/* limon.no, #r4902(영업시간 행) 와 #r1480(팔로우 행) 에 동일하게 */
background-image: url("/uploads/.../157686534_....png");
background-repeat: no-repeat;
background-position: 100% 100%;
background-attachment: fixed;      /* ← 전부 이 한 줄이 한다 */
```

`background-attachment: fixed`인 배경은 **뷰포트를 기준으로 자리를 잡되 그 요소의
박스 안에서만 그려진다.** 그래서 스크롤해도 화면 우측 하단에 붙어 있고, 행의 위
경계에서 나타나 아래 경계에서 잘려 사라진다. 두 행이 같은 배경을 공유하므로 행
경계를 지날 때 배경색만 바뀌고 스티커는 이어져 보인다. 1199px 이하에서는
`background-image: none`으로 끈다.

**그대로 못 쓰는 이유와 대체 구현.**

`#smooth-content`에 transform이 걸려 있으면 `background-attachment: fixed`도
`position: fixed`와 똑같이 뷰포트가 아니라 그 조상을 기준으로 잡는다(§4). 스무더가
있는 데스크톱에서 효과가 죽으므로 GSAP으로 옮겼다. 잘라내는 쪽은 원본과 같은
`overflow-hidden`이다.

블록의 문서상 위치를 top, 높이를 H, 스크롤을 s, 뷰포트 높이를 vh라 하면
스티커의 아래끝을 화면 아래끝에 붙이는 값은

```
y = (s + vh) - (top + H)
```

이고, ScrollTrigger 구간을 `top bottom` → `bottom top`으로 잡으면 s가
`top - vh`에서 `top + H`까지 움직이므로 **y는 -H에서 +vh까지 정확히 선형**이다.
즉 아래 한 줄이 위 식과 같다. 이징을 주면 그 등식이 깨져 배경이 미끄러진다.

```ts
gsap.fromTo(sticker,
  { y: () => -block.offsetHeight },
  { y: () => window.innerHeight, ease: "none",
    scrollTrigger: { trigger: block, start: "top bottom", end: "bottom top",
                     scrub: true, invalidateOnRefresh: true } });
```

블록 두 개에 각각 물리는데도 화면에서 하나로 이어져 보인다. 두 식이 같은 절대
좌표(화면 아래끝)를 가리키기 때문이다.

**함정 세 가지.**

- **회전은 안쪽 요소에 준다.** GSAP은 transform을 만질 때 개별 속성
  (`translate` / `rotate` / `scale`)을 `none`으로 덮어쓴다. Tailwind v4의
  `rotate-*`는 `transform`이 아니라 `rotate:` 속성이라, y를 받는 래퍼에 주면
  조용히 지워진다. 그래서 래퍼(y) / 안쪽(rotate)으로 나눴다.
- **오른쪽 아래 모서리는 본문이 비운다.** 처음엔 연락처 버튼이 스티커에 깔려
  검정 위 검정이 됐다. 원본은 본문을 `.container-fixed`로 묶어 이 모서리를 열어
  둔다. 같은 뜻으로 블록 패딩을 `lg:pr-[24vw]`로 잡았다(= 스티커 우측 여백 6vw +
  폭 13vw + 여유). 가로 패딩을 `px`가 아니라 좌/우로 나눠 적은 것은, 같은 lg
  레이어에서 `px`와 `pr`의 승부가 생성 순서에 달려 있어서다.
- **모바일·reduced motion은 CSS로 끈다**(`hidden lg:block motion-reduce:lg:hidden`).
  JS 분기를 두지 않는다. 숨겨진 뒤엔 잴 것도 없으므로 트리거도 만들지 않는다.

내용은 실제 값(주소·연락처)을 쓰되 **영업시간은 자리표시**다.
`business.ts`의 `OPENING_HOURS`에 TODO로 표시해 두었다. 원본의 SNS 아이콘 자리는
없는 계정을 만들지 않고 실제 연락 수단(전화/휴대전화/이메일)으로 바꿨다.

**실측 검증** (1368x871, 실제 휠 스크롤): 스티커가 화면 하단 40px 위
(`bottom-10`)에 고정된 채 본문만 올라가고, 두 번째 블록의 아래 경계를 지나며
아래에서부터 잘려 사라지는 것을 확인했다. 푸터에는 넘어가지 않는다.

---

## 7. 레퍼런스와 의도적으로 다른 부분

기록해두지 않으면 나중에 "왜 안 맞지?" 하게 되는 지점들.

### 7.1 제품 이미지 맞춤 방식

레퍼런스 소스는 **1920x1080 가로 이미지에 세로로 긴 카톤이 여백을 두고** 들어 있다.
그래서 `object-fit: cover`를 걸어도 제품이 작게 보인다.
우리 차통 사진은 **1024x1024 정사각형에 제품이 꽉 찬 컷**이라 cover를 쓰면 화면을 뒤덮는다.

→ `object-contain` + 흰 배경 + 높이 제한(`lg:max-h-[48vh]`)으로 변경.

### 7.2 제품 확대 트윈 (레퍼런스에 없음)

레퍼런스를 실측한 결과 **확대 애니메이션은 존재하지 않는다**.

| 핀 진행 | 패널 폭 | cover 배율 | 렌더 크기 | img transform |
| ------- | ------- | ---------- | --------- | ------------- |
| 0       | 720     | 0.8333     | 1600x900  | none          |
| 0.3     | 1440    | 0.8333     | 1600x900  | none          |
| 0.9     | 1440    | 0.8333     | 1600x900  | none          |

카톤은 분할 시점과 중앙 시점 모두 160x535px로 동일하고 가로 위치만 이동한다.
"커지는 것처럼" 보이는 이유는 카톤이 뷰포트 높이의 **59%** 를 차지한 채 빈 흰 화면
정중앙으로 들어오기 때문이다.

사용자 요청으로 **`scale 0.78 → 1` 트윈을 추가**했다(`PRODUCT_SCALE_FROM`).
패널 확장 트윈과 `"<"`로 동시 시작한다. 레퍼런스로 되돌리려면 이 트윈과 상수를 지우면 된다.

### 7.3 좌우 문구 박스

레퍼런스는 `width: 34.7222vw`, `font-size: 5.5556vw`. 이건 "97% plant-based materials" 같은
**긴 영문**을 담기 위한 치수다. 훨씬 짧은 한글에는 과해서, 정사각형 제품이 들어갈 통로가 없었다.

→ `lg:w-[28vw]`, `lg:text-[4.6vw]`, 좌우 여백 `6.25vw → 5vw`로 조정.
제목(h2)은 왼쪽 절반을 독점하므로 레퍼런스 `5.5556vw` 유지.

### 7.4 헤더 로고

레퍼런스 워드마크는 가로세로비 6.34라서 14px 높이로도 읽힌다.
우리 로고는 2단 락업(비율 2.55)이라 같은 높이면 판독 불가.
→ 데스크톱 24px로 키움. 히어로의 대형 마크도 `max-w-[560px]`로 제한
(전체 폭으로 깔면 세로가 과해진다).

2026-09-10 헤더 교체 후 바 안의 로고는 `h-7.5 lg:h-8.5`(30px / 34px)다.

데스크톱 값은 같은 날 한 번 더 조정했다. 라벨을 11 → 13px로 올리면서 로고도
26 → 34px(**1.3배**)로 키웠다. 라벨보다 더 크게 벌린 것이 핵심이다. 셋이 비슷한
크기면 가운데 로고가 좌우 라벨과 같은 층위로 읽혀 축이 사라진다. 52px 바 안에서
위아래로 9px씩 남으므로 여기서 더 키우려면 `HEADER_HEIGHT`부터 올려야 한다.

모바일은 원본값 그대로 두었다(라벨 11px, 로고 30px). 모바일 바에는 라벨이 CART
하나뿐이라 키울 이유가 없고, 키우면 가운데 로고의 자리를 좁힌다.

### 7.5 reduced motion

레퍼런스는 `prefers-reduced-motion`을 전혀 처리하지 않는다. 우리는 처리한다.
핀·마스크·패럴랙스를 모두 끄고, 600vh 활주로가 빈 채 남지 않도록
`motion-reduce:lg:h-auto`로 섹션을 접는다.

---

## 8. 페이지 전환 `page-transition.tsx`

레퍼런스는 Shopify Liquid라 클라이언트 라우터가 없어 **AJAX로 직접** 구현한다.

```
클릭 → preventDefault → <html>.page-transitioning 추가 → pushState
     → Promise.all([fetch(URL), hide()])     // 페치와 페이드아웃 병렬
     → #view innerHTML 교체 + title/body class 갱신
     → show() → 락 해제
```

`Fade` 전환의 실제 내용:

```js
hide: gsap.fromTo(view, {opacity:1}, {duration:.3, ease:"power1.out", opacity:0})
show: smoother.scrollTo(0) 후
      gsap.fromTo(view, {opacity:0}, {duration:.3, ease:"power1.in",  opacity:1})
```

우리는 fetch/innerHTML 교체 대신 `router.push`를 쓰되, **duration·ease·순서·락 클래스명은
그대로** 가져왔다. 두 가지 트릭이 필요했다.

### 8.1 클릭은 capture 단계에서 가로챈다

버블 단계에 리스너를 달면 `next/link`의 핸들러가 먼저 돌아 페이드아웃 전에 라우팅이 시작된다.
`document`에 **capture: true**로 달고 `preventDefault()` + `stopPropagation()`으로 막은 뒤,
페이드아웃 완료 콜백에서 `router.push`를 호출한다.

### 8.2 뒤로가기는 popstate를 가로채 재생한다

Next 라우터는 `popstate`를 즉시 처리해서, 그냥 두면 콘텐츠가 페이드 없이 교체된다.
**우리 리스너가 라우터보다 먼저 등록된다**는 점(자식 effect가 먼저 실행)을 이용한다.

```ts
event.stopImmediatePropagation(); // 라우터 핸들러 차단
hide(() => {
  bypassPopstate.current = true;
  window.dispatchEvent(new PopStateEvent("popstate", { state: history.state }));
}); // 페이드 후 라우터에 넘김
```

URL은 브라우저가 이미 바꿨지만 화면은 이전 페이지가 페이드아웃되는 동안 유지된다.
Next가 리스너를 먼저 등록하도록 바뀌면 `stopImmediatePropagation`이 무력화되어
"즉시 교체 + 페이드인"으로 degrade한다. 깨지지는 않는다.

### 8.3 제외 규칙

레퍼런스 셀렉터와 동일: `target` 있음 / `data-page-transition-disabled` / `href^="#"` /
외부 도메인 / 같은 경로 / 수식키 클릭은 가로채지 않는다.

전환 중에는 `html.page-transitioning #view { pointer-events: none }`로 중복 클릭을 막는다.
헤더는 `#view` 바깥이라 전환 중에도 고정된 채 남는다(레퍼런스와 동일).

### 8.4 페이지 이동 후 스크롤이 남는 문제 (2026-09-10 수정)

**실제로 재현된 원인은 전환 중 스크롤 입력 누수다.** `pointer-events: none`은
휠·트랙패드·터치 스크롤을 막지 않는다. 경로 변경 때 `scrollTo(0)`을 한 번 실행해도,
페이드인 중 들어온 입력으로 새 페이지가 다시 내려간다. Chrome 1440×900에서 홈의
1800px/6429px 지점에서 이동하면서 전환 중 휠 입력을 보내면 `/shop`, `/terms`,
`/privacy` 모두 최종 `scrollY = 30`, 콘텐츠 transform의 y도 `-30`으로 남았다.
입력을 멈춘 뒤 이동할 때는 기존 코드에서도 0이었다. 따라서 GSAP 재측정이 위치를
덮어썼다는 가설과 실제 확인한 원인을 혼동하지 말 것.

- `page-transitioning` 동안만 wheel/touchmove 기본 동작과 스크롤 키를 막는다.
  휠·터치 리스너는 `passive: false`가 필요하다. 전환 종료/실패 타임아웃으로
  클래스가 사라지면 입력이 다시 허용된다.
- 일반 경로 이동은 `router.push(..., { scroll: false })`로 전환 컴포넌트가 스크롤을
  담당한다. 해시가 있으면 Next의 앵커 이동을 유지하고 최상단 초기화를 건너뛴다.
- 경로 커밋 다음 animation frame에 `ScrollTrigger.refresh()` → 즉시 최상단 이동 →
  0.3초 페이드인 순으로 실행한다. 기존의 초기화 **뒤** 1ms 타이머로 refresh하던
  순서는 제거했다. 페이지별 핀 정리/생성 후 높이를 측정하려는 목적이다.
- 최초 진입은 pathname ref로 구분한다. Strict Mode의 effect 재실행 때문에
  최초 진입까지 페이지 전환으로 처리하지 않는다.

회귀 검증은 헤드리스 Chrome에서 `Page.captureScreenshot`으로 프레임을 진행시키며
실제 CDP `Input.dispatchMouseEvent(type: mouseWheel)` 입력을 보냈다. 전환 종료와
입력 도착이 경합하지 않도록 새 페이지 페이드인의 opacity가 0.5 미만일 때까지
입력하고, 이후 위치를 관찰한다. 수정 후 1440×900 및 390×900에서 세 경로 모두
`scrollY = 0`, wrapper scrollTop 0, 콘텐츠 y 0을 확인했다. 모바일에서는
ScrollSmoother가 없으므로 transform은 `none`이다.

---

## 9. className / 색 컨벤션 (필수)

### 9.A className은 항상 `cn()`으로 쪼갠다

문자열 하나에 몰아넣지 않는다. **줄 단위로 브레이크포인트를 분리**한다.
순서는 기본 → **큰 폭에서 작은 폭 순**(2xl → xl → lg → md → sm) → 색 → 상태 변형.

```tsx
className={cn(
  "relative border-t px-4 py-10 text-center text-[20px] leading-[1.2]",  // 1. 기본
  "lg:absolute lg:top-[16%] lg:left-1/2 lg:w-75 lg:border-0 lg:p-0",     // 2. lg
  "md:h-130",                                                            // 3. md
  BORDER.line,                                                           // 4. 색
  TEXT.ink,
  "motion-reduce:lg:h-auto",                                             // 5. 상태
  className,                                                             // 6. 외부 주입
)}
```

Tailwind는 클래스 나열 순서가 CSS 우선순위에 영향을 주지 않으므로 이 정렬은
**순수하게 가독성용이며 렌더 결과를 바꾸지 않는다**. 단 `cn()`의 tailwind-merge는
같은 variant + 같은 속성끼리만 병합하므로, 한 줄 안의 순서는 임의로 바꾸지 말 것.

### 9.B 색은 `src/constants/colors.ts`에서만 가져온다

`bg-black`, `text-foreground`, `border-header-line` 같은 색 클래스를 컴포넌트에
직접 쓰지 않는다. 전부 상수 맵 경유.

```ts
COLOR; // 16진수 원본값. GSAP 트윈 등 JS에서 색이 필요할 때
BG; // bg-[#ffffff] / bg-[#0a0a0a] / bg-[#000000]
TEXT; // text-[#0a0a0a] / hover:text-[#0a0a0a]/55 / text-[#737373]
BORDER; // border-[#000000] (헤더 괘선) / border-[#e5e5e5] (내부 얇은 선)
OUTLINE; // outline-[#a1a1a1] (포커스 링)
```

**왜 클래스 문자열을 통째로 상수에 넣는가**: Tailwind 스캐너는 소스에서 완성된
클래스 문자열을 찾는다. `bg-[${COLOR.white}]` 처럼 템플릿 리터럴로 만들면
클래스를 못 찾아 **CSS가 아예 생성되지 않는다.** 그래서 헥사값이 `COLOR`와
클래스 맵 두 곳에 적혀 있다. 색을 바꿀 때는 둘 다 고칠 것.

**예외**: `transparent`, `currentColor` 는 헥사값이 없는 키워드라 팔레트 대상이
아니다. `lg:bg-transparent` 처럼 그대로 쓴다.

### 9.C globals.css 토큰은 팔레트의 사본이다

shadcn `ui/` 컴포넌트는 `--background`, `--border` 같은 CSS 변수를 쓴다.
이 값들을 `COLOR`와 **같은 16진수**로 맞춰 두었다(원래 oklch였고, Tailwind
neutral 스케일과 동일한 값이라 렌더 결과는 그대로다). 팔레트를 바꾸면
`globals.css`의 `:root` 블록도 함께 고쳐야 두 체계가 어긋나지 않는다.

`.dark` 블록도 16진수로 바꿔뒀지만 현재 라이트 모드 고정이라 활성화되지 않는다.

**주의**: shadcn init이 `--font-sans: var(--font-sans)` 라는 자기참조를 넣어둬서
Geist가 적용되지 않고 있었다. `--font-sans: var(--font-geist-sans)`로 고쳐둠. 되돌리지 말 것.

`--header-line`은 `@theme inline`으로 `border-header-line` 유틸리티를 만들지만,
컴포넌트에서는 `BORDER.line`을 쓴다. 변수는 `ui/` 쪽 호환용으로 남겨둔 것.

### 헤더 치수 (2026-09-10 교체)

**바는 postevand 계열이 아니다.** 이 프로젝트의 **이전 버전**
(<https://gwana-front-renewal.vercel.app/>)의 헤더가 더 낫다는 판단으로 그쪽을
가져왔다. `firecrawl_scrape`로 마크업을 뜨고, 색 전환 로직은 클라이언트 청크에서
디미니파이해 복원했다. 색만 우리 팔레트로 갈아끼웠다(이전 버전은 먹 `#262626`,
괘선 `#d4d4d4`).

| 항목        | 값                                                              |
| ----------- | --------------------------------------------------------------- |
| 높이        | `HEADER_HEIGHT` = `h-13` (52px), 모바일/데스크톱 공통, 풀블리드  |
| 격자        | `grid-cols-[1fr_auto_1fr]`, 패딩 `px-3 lg:px-6`                  |
| 좌          | 모바일 햄버거(`lg:hidden`) / 데스크톱 nav (`gap-6`)              |
| 가운데      | 로고. `h-7.5 lg:h-8.5` (30px / 34px)                             |
| 우          | LOG IN(`hidden lg:inline-flex`) + CART n, `gap-1 lg:gap-4`       |
| 라벨        | `BAR_LABEL` = 모노 대문자, `text-[11px] lg:text-[13px]`          |
| 활성 메뉴   | `underline decoration-1 underline-offset-[5px]`                  |
| hover       | 색이 아니라 `hover:opacity-60`                                   |

**왜 로고가 flex가 아니라 3칸 격자 가운데인가.** 가운데 칸이 내용 폭만 차지하므로
로고가 좌우 항목 개수와 무관하게 화면 정중앙에 선다. `justify-between`으로 짜면
좌우 묶음의 폭 차이만큼 로고가 밀린다.

**왜 색이 아니라 투명도로 상태를 주는가.** 바가 사진 위에서는 흰 글자, 스크롤 뒤에는
먹 글자다. 두 배경에서 같이 통하는 규칙은 `text-current` + 투명도뿐이다. 같은 이유로
활성 표시도 볼드가 아니라 밑줄이다. 볼드는 글자 폭을 넓혀 nav를 흔들기 때문에 예전
구현은 `invisible font-bold` 고스트로 폭을 고정해야 했는데, 밑줄은 그 장치가 통째로
필요 없다.

### 투명 → 솔리드 전환 `header-shell.tsx`

홈(`/`)에서만 바가 투명하게 사진 위에 얹히고, 뷰포트의 **88%** 를 지나면 흰 바로
바뀐다. 나머지 라우트는 처음부터 솔리드다(사진 없는 흰 배경에 투명 바를 깔면 흰
글자가 사라진다).

```ts
const trigger = ScrollTrigger.create({
  start: () => `top top-=${0.88 * window.innerHeight}`,
  end: "max",
  invalidateOnRefresh: true,
  onToggle: (self) => setSolid(self.isActive),
});
```

- **trigger 요소가 없는 ScrollTrigger다.** 기준으로 삼을 섹션이 아니라 스크롤 양
  자체가 조건이라서 start를 스크롤 위치로 직접 적는다. 창 높이가 바뀌면 임계값도
  바뀌므로 함수값 + `invalidateOnRefresh`.
- **로고 반전은 `data-solid`로 넘긴다.** 로고 PNG가 먹색이라 사진 위에서는 반전이
  필요한데, 그 판단을 로고 쪽에서 `group-data-[solid=false]:invert`로 읽는다.
  헤더에 `group`이 붙어 있는 이유가 이것뿐이다.
- **껍데기만 클라이언트다.** `HeaderShell`이 `children`을 받아 감싸는 형태라
  바 내용은 서버 컴포넌트로 남는다. 여기서 내용을 직접 import 하면 전부 클라이언트
  번들로 끌려간다(§4의 `ChromeHeader`와 같은 이유).
- 이 ScrollTrigger는 ScrollSmoother가 만들어지기 **전에** 생성된다(헤더가 트리에서
  스무더보다 앞이라 §4의 순서 규칙 밖이다). 스무더 생성 시 `ScrollTrigger.refresh()`가
  돌면서 함수값 start가 다시 계산되므로 결과는 맞는다. 1920x934에서 scrollY 822를
  지나는 순간 `data-solid`가 `true`로 뒤집히는 것을 확인했다.

### 바 높이는 세 값이 함께 움직인다

`constants/nav-items.ts`가 셋을 한 곳에 들고 있다. 하나만 고치면 조용히 어긋난다.

| 상수            | 값       | 쓰는 곳                                     |
| --------------- | -------- | ------------------------------------------- |
| `HEADER_HEIGHT` | `h-13`   | `header-shell.tsx`, `payment-header.tsx`    |
| `HEADER_OFFSET` | `pt-13`  | 두 계열 layout의 `<main>`                   |
| `HEADER_PULL`   | `-mt-13` | 홈 `page.tsx` (사진을 화면 맨 위까지 올린다) |

### 모바일 시트는 건드리지 않았다

바만 갈아탔고 `header-mobile-menu.tsx`의 시트 내용(제목·항목·하단 버튼·닫기 규칙)은
그대로다. 갈아탄 것은 **트리거 버튼 하나**뿐이다(칸막이 셀 → 얹히는 아이콘 버튼).
그래서 `HEADER_LABEL`(13px)도 지우지 않고 남겼다. 시트·푸터·방문 섹션이 함께 쓰고
있어서, 바를 바꾸겠다고 그 정의를 고치면 세 곳이 같이 끌려간다. 바는 `BAR_LABEL`을
따로 쓴다.

### 9.D 푸터는 헤더의 격자를 되쓴다 (⚠ 2026-09-10 현재 깨져 있다)

> **헤더를 이전 버전 디자인으로 교체하면서 이 절의 전제가 사라졌다.**
> 새 바는 칸막이 격자가 아니라 3칸 가운데 정렬이고, 140px 우측 셀도 4/12 브랜드
> 칼럼도 없다. 푸터는 아직 옛 헤더의 격자를 그대로 들고 있다. 둘을 다시 맞추려면
> 푸터를 새 바에 맞춰 고쳐야 하는데, 그건 헤더 교체 요청의 범위 밖이라 손대지
> 않았다. 아래 표는 **옛 헤더 기준의 기록**이다.

`site-footer.tsx`는 새 레이아웃을 만들지 않고 **헤더의 치수를 그대로 뒤집는다.**
그래서 위아래 바가 한 격자에서 나온 것으로 읽힌다. 실측으로 검증한 값:

| 항목             | 헤더                    | 푸터                      |
| ---------------- | ----------------------- | ------------------------- |
| 브랜드 칼럼 경계 | `nav` 좌변 x=479.98     | 사업자정보 칼럼 좌변 동일 |
| 우측 셀          | LOG IN / BAG, 각 140px  | 이용약관 / 개인정보처리방침, 각 140px (x=1160, 1300) |
| 바 높이          | 48px (`lg:h-12`)        | 하단 바 48px + 상단 괘선 1px |
| 라벨             | `HEADER_LABEL` (13px)   | 동일 상수 재사용          |

헤더 폭을 바꾸면 푸터도 같이 움직여야 한다. 두 파일 모두 `lg:w-1/3`, `lg:w-35`,
`HEADER_LABEL`을 쓰므로 상수만 맞추면 된다.

**푸터를 `#view` 안, `<main>` 밖에 두는 이유**

- `#view` **안**: 밖에 두면 라우트가 바뀌는 순간 문서 높이가 먼저 바뀌어 푸터가 튄다.
  안에 두면 본문과 함께 0.3초 페이드된다.
- `<main>` **밖**: `main` 안의 `footer`는 페이지 푸터가 아니라 섹션 푸터로 취급돼
  `contentinfo` 랜드마크가 사라진다. 그래서 §4에서 `main`을 `#view` 안으로 옮겼다.

사업자 정보와 법적 고지 링크는 `src/constants/business.ts` 한 곳에서 온다.
푸터와 약관/처리방침 페이지가 같은 값을 읽으므로 여기만 고치면 된다.

### 9.E 라우트 그룹: (common) / (non-common)

페이지를 chrome 기준으로 두 계열로 나눈다. 괄호 그룹이라 **URL에는 영향이 없다.**

| 계열           | 헤더            | 푸터   | 라우트                                        |
| -------------- | --------------- | ------ | --------------------------------------------- |
| `(common)`     | `SiteHeader`    | 있음   | `/`, about, shop, bag, account, login, admin, terms, privacy |
| `(non-common)` | `PaymentHeader` | 없음   | `/payment`                                    |

**무엇이 어디에 사는지가 제약으로 정해져 있다.**

- **헤더는 root layout에만 둘 수 있다.** `position: fixed`가 `#smooth-content`
  안에서는 뷰포트 기준이 아니게 되는데(§4), 계열 layout은 항상 `#view` 안,
  즉 스무더 안쪽에서 렌더된다. 그래서 계열 layout에 헤더를 넣으면 스크롤과
  함께 밀려 올라간다.
- **`<main>`과 푸터는 계열 layout이 갖는다.** 둘 다 `#view` 안에 있어야 하고
  (§9.D), 계열마다 달라지는 것이 정확히 이 둘이다. 상단 패딩도 계열별로
  헤더 높이를 따라갈 수 있게 여기 둔다.
- **`SmoothScroll`과 `PageTransition`은 root에 못 박아 둔다.** 계열 layout으로
  내리면 계열을 넘나들 때 언마운트되어 ScrollSmoother가 kill/재생성되고,
  다시 마운트된 `PageTransition`은 `isFirstRender` 가드에 걸려 **페이드인을
  통째로 건너뛴다.**

**헤더 선택은 `constants/route-chrome.ts`의 접두사 목록이 한다.** root layout은
서버 컴포넌트라 pathname을 모르므로, `ChromeHeader`(유일한 클라이언트 조각)가
`usePathname()`으로 고른다. 두 헤더는 prop으로 받은 RSC 트리라 서버 컴포넌트로
남는다. `(non-common)/` 아래 라우트를 추가하면 **접두사 목록에도 넣어야 한다.**

parallel routes(`@header` 슬롯)를 쓰면 이 동기화가 사라지지만, 슬롯은 소프트
내비게이션에서 매칭에 실패하면 **직전 슬롯을 그대로 붙들고 있는다**(`default.tsx`는
하드 내비게이션 폴백일 뿐이다. Next 공식 문서 Parallel Routes > Behavior).
계열마다 catch-all 페이지를 깔아야 해서 헤더가 둘뿐인 지금은 비용이 더 크다.
계열이 늘면 그때 옮기는 것이 맞다.

**실측 검증** (`/bag` ↔ `/payment` 소프트 내비게이션, 60ms 간격 샘플링):

```
== (common) -> (non-common) ==
  /bag      | 0.42 | LOCK | SiteHeader    | footer    | smoother-kept
  /bag      | 0.09 | LOCK | SiteHeader    | footer    | smoother-kept
  /payment  | 0.00 | LOCK | PaymentHeader | no-footer | smoother-kept   ← 교체는 opacity 0에서
  /payment  | 0.73 | LOCK | PaymentHeader | no-footer | smoother-kept
  /payment  | 1.00 | -    | PaymentHeader | no-footer | smoother-kept
```

헤더 교체가 `opacity 0` 지점에서 일어나므로 사용자는 헤더가 바뀌는 순간을 보지
않는다. 스무더는 양방향 모두 유지된다.

---

## 10. 함정 모음 (같은 실수 반복 금지)

### 10.0 Tailwind 임의값 경고는 꺼 두었다

`max-w-[425px]`, `h-[378px]` 같은 px 임의값은 **레퍼런스에서 실측한 값**이라 의도적으로 유지한다.
`max-w-106.25`로 바꾸면 숫자의 출처 추적이 끊긴다(§1의 rem 주의사항 참고).

Tailwind IntelliSense가 이걸 계속 제안하므로 `.vscode/settings.json`에서 규칙을 껐다.

```json
{ "tailwindCSS.lint.suggestCanonicalClasses": "ignore" }
```

**부작용**: 이 규칙은 세분화 옵션이 없어서, `h-[100svh] → h-svh` 처럼
**진짜 개선인 제안까지 함께 사라진다**. 끄기 전에 그런 케이스는 이미 정리했다
(`h-svh`, `translate-y-[-40%]`). 앞으로 임의값을 새로 쓸 때는
전용 유틸리티가 있는지(`svh`/`dvh`/`lvh`, `prose` 등) 직접 확인할 것.

### 10.1 next/image 캐시는 파일 내용을 안 본다

`.next/cache/images`의 키는 **URL + width + quality**다. 파일을 교체해도 캐시가 히트한다.

```bash
rm -rf .next/cache/images   # 후 브라우저 하드 리로드(⌘⇧R)
```

운영까지 확실히 하려면 파일명에 버전을 붙여 URL을 바꾼다.

### 10.2 헤드리스 브라우저에서 GSAP 값이 전부 0으로 읽힌다

스크린샷을 강제하지 않으면 rAF가 돌지 않아 ScrollSmoother/ScrollTrigger가 멈춘 것처럼 보인다.
**코드 버그로 오인하기 쉽다.** 측정 루프에 `Page.captureScreenshot`을 끼워 프레임을 강제할 것.

### 10.3 마스크 안의 요소는 IntersectionObserver에 절대 안 걸린다

`translateY(100%)`로 내려간 요소는 자기 마스크의 클립 영역 밖이라
교차 비율이 영구히 0이다. `whileInView`/IO 기반 리빌을 쓸 거면
**트리거를 마스크 자체에 걸고** 자식은 variant 전파로 움직여야 한다.
(현재는 GSAP 스크럽이라 해당 없음. IO 리빌을 추가할 때 재발 주의.)

### 10.4 shadcn `form`은 현재 스타일에 존재하지 않는다

`radix-nova` 레지스트리의 `form.json`은 **빈 스텁**이다(`field` 컴포넌트로 대체되는 중).
`npx shadcn add form`이 조용히 아무것도 설치하지 않는다.
동일 구성(Radix + Tailwind v4)인 `new-york-v4`에서 직접 받았다.

```bash
npx shadcn@latest add https://ui.shadcn.com/r/styles/new-york-v4/form.json
```

`label`은 `radix-nova`에서 먼저 설치해 덮어쓰기를 피했다.

### 10.5 shadcn 생성물 린트 예외

`src/components/ui/**`는 `npx shadcn add`로 재생성되는 벤더 코드라 손대지 않는다.
carousel.tsx가 `react-hooks/set-state-in-effect`에 걸려서
`eslint.config.mjs`에 **해당 디렉토리 + 해당 룰만** 끄는 override를 두었다.
인라인 주석은 재생성 시 사라지므로 config로 처리한 것.

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

세션 스크래치패드에 만들어 둔 스크립트들(재작성해도 무방):

| 스크립트         | 용도                                           |
| ---------------- | ---------------------------------------------- |
| `shoot.mjs`      | 스크롤 위치별 스크린샷                         |
| `measure.mjs`    | 프레임 강제 + 스크린샷 + 계산 스타일 동시 수집 |
| `probe.mjs`      | 임의 JS 평가 (`awaitPromise: true` 필요)       |
| `refpin.mjs`     | 레퍼런스 사이트의 핀 구간 실측                 |
| `transition.mjs` | 전환 중 `#view` opacity 시계열 샘플링          |

전환 검증 예시 출력:

```
== 메뉴 클릭 -> /shop ==
  /      | 0.62 | LOCK      ← 이전 페이지 페이드아웃
  /      | 0.01 | LOCK
  /shop  | 0.20 | LOCK      ← 콘텐츠 교체
  /shop  | 1.00 | -         ← 락 해제
```

---

## 12. 현재 상태와 다음 작업

### 완료

- 공통 헤더 (데스크톱/모바일, 활성 상태, 시트 메뉴)
- 홈 히어로 섹션 (진입 애니메이션 + 스크롤 디밍 + 패럴랙스)
- 홈 제품 설명 섹션 (600vh 핀 스크럽, 8비트 타임라인)
- ScrollSmoother 관성 스크롤
- 페이지 전환 (링크 클릭 + 뒤로가기)
- 공통 푸터 (사업자 정보 + 약관/처리방침 진입, §9.D)
- 라우트 그룹 분리 `(common)` / `(non-common)` + 경로별 헤더 전환 (§9.E)

### 미완 / 임시

| 항목                                      | 상태                                                                                           |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `/about` `/shop` `/admin` `/login` `/bag` | **자리표시 스텁**. 제목 한 줄뿐                                                                |
| `/terms` `/privacy`                       | **본문 없음**. 법적 효력이 있는 문서라 지어내지 않았다. 확정본을 받아 넣어야 한다               |
| `/payment`                                | **자리표시 스텁**. `(non-common)` 계열 배선만 확인해 둔 상태                                    |
| `PaymentHeader`                           | 로고만 있는 최소 형태. 로고는 홈 링크로 남겨 뒀다. 이탈을 막으려면 Link를 span으로 바꾼다      |
| 통신판매업신고번호                        | 값을 못 받아 푸터에서 빠져 있다. 국내 커머스는 표기 의무가 있으므로 확인 필요                  |
| 제품 섹션 카피                            | **전부 예시 문구**. "해발 500m", "곡우 전" 등 수치는 지어낸 값이다. 각주에 그 사실을 명시해 둠 |
| `BAG (0)` 개수                            | `bagCount` prop 하드코딩. 장바구니 상태 연동 필요                                              |
| 다크모드                                  | 토큰은 정의돼 있으나 실제 검증 안 함. `next-themes` 설치만 된 상태 (ThemeProvider 미설치)      |

### 이어서 할 때 참고

- 레퍼런스의 나머지 섹션(3, 5)은 **스크롤로 스크럽되는 mp4**다.
  `section-3-desktop-...mp4`(6초, 154프레임, pauseFrame 72),
  `section-5-desktop-...mp4`(14초, 490프레임). `currentTime`을 scrub으로 트윈한다.
  같은 방식을 쓰려면 영상 에셋이 먼저 필요하다.
- 새 섹션을 추가할 때는 §4 합성 순서와 §5 sticky 금지 규칙을 먼저 확인할 것.
- 패키지 매니저는 **npm**으로 통일한다(`package-lock.json` 존재). yarn 혼용 금지.
