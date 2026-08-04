<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# 이 프로젝트

가와나 티하우스 커머스 프론트엔드.

**이 브랜치(`feature/design-v2`)의 레퍼런스는 https://www.icebug.com/en-GB 다.**
`master` 계열은 https://postevand.com 을 복제한 v1 이고, 두 갈래를 비교해
나중에 운영 디자인을 고른다. 두 갈래는 **레이아웃 인프라를 공유하고**
팔레트·타입·섹션 구성만 다르다(ARCHITECTURE §0).

레퍼런스를 "느낌만 참고"하는 것이 아니라 **수치까지 복제**하는 것이 방침이다.
값이 애매하면 추측하지 말고 실제 CSS / computed style 을 읽어서 확인한다.

**코드를 쓰기 전에 [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)를 읽을 것.**
레이아웃 합성 순서, GSAP/ScrollSmoother 제약, 레퍼런스 실측값, 반복하기 쉬운 함정이 정리돼 있다.

특히 자주 걸리는 것 다섯 가지:

- `position: fixed` 요소는 `#smooth-content` **바깥**에 두어야 한다 (transform 조상 문제)
- 핀 고정에 CSS `sticky`를 쓰면 안 된다. ScrollTrigger `pin:`을 쓴다
- 애니메이션 라이브러리는 **GSAP 하나만** 쓴다 (Motion 혼용 금지)
- **한글에 `font-mono`를 쓰지 않는다.** Geist Mono 에 한글 글리프가 없어 자간이 깨진다 (§7.1)
- **한글 문단 폭을 `ch`로 잡지 않는다.** 한 글자가 약 2ch 라 줄이 예상보다 일찍 꺾인다 (§9.C)

## 코드 작성 규칙 (예외 없음)

### className은 `cn()`으로 줄을 나눈다

기본 → 큰 브레이크포인트에서 작은 순(2xl → xl → lg → md → sm) → 색 → 상태 변형.
자세한 예시는 ARCHITECTURE.md §9.A.

```tsx
className={cn(
  "relative flex h-full flex-col justify-end px-4 pb-8",  // 기본
  "lg:px-6 lg:pb-10",                                     // lg
  TEXT.white,                                             // 색
  "motion-reduce:transition-none",                        // 상태
)}
```

같은 속성을 두 줄에 적으면 tailwind-merge 가 **앞의 것을 조용히 지운다.**

### 색은 `src/constants/colors.ts`에서만 import 한다

`bg-black`, `text-foreground` 를 컴포넌트에 직접 쓰지 않는다.
`BG` / `TEXT` / `BORDER` / `OUTLINE` / `SCRIM` 맵을 쓰고, JS에서 색 값이 필요하면 `COLOR`.
`transparent` 와 `currentColor` 만 예외다(헥사값이 없는 키워드).

팔레트를 바꾸면 `src/app/globals.css` 의 `:root` 토큰도 같은 값으로 맞출 것.

**타일(`#bcbcbc`) 위에는 `TEXT.muted` 를 올리지 않는다**(4.1:1, AA 미달).
**투명도로 위계를 만들지 않는다.** 위계는 크기로 만든다. 대비표는 ARCHITECTURE §9.B.

### 타입 스케일은 `src/constants/typography.ts`에서만 import 한다

`text-[14px]` 같은 값을 컴포넌트에 직접 쓰지 않는다.
라틴·숫자는 `LABEL` / `MONO_DATA`(모노), 한글은 `LABEL_KO` / `BODY`(산세)다.

### 이미지 자리와 미확정 수치는 지어내지 않는다

에셋이 없으면 `PlaceholderMedia` 로 두고 필요한 규격을 적는다.
스톡 사진이나 picsum 링크로 채우면 "이미 끝난 화면"으로 읽혀 교체가 미뤄진다.
가격·수확일 같은 미확정 수치도 같은 이유로 `"준비 중"` 으로 남긴다.

### 손대지 않는 곳

`src/components/ui/**` 는 shadcn 생성물이다. `npx shadcn add` 로 재생성되므로
위 규칙을 적용하지 않고 직접 수정하지도 않는다.
