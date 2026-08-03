<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# 이 프로젝트

가와나 티하우스 커머스 프론트엔드. https://postevand.com 의 레이아웃과 스크롤 인터랙션을
수치까지 복제하는 것이 방침이다.

**코드를 쓰기 전에 [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)를 읽을 것.**
레이아웃 합성 순서, GSAP/ScrollSmoother 제약, 레퍼런스 실측값, 반복하기 쉬운 함정이 정리돼 있다.

특히 자주 걸리는 것 세 가지:

- `position: fixed` 요소는 `#smooth-content` **바깥**에 두어야 한다 (transform 조상 문제)
- 핀 고정에 CSS `sticky`를 쓰면 안 된다. ScrollTrigger `pin:`을 쓴다
- 애니메이션 라이브러리는 **GSAP 하나만** 쓴다 (Motion 혼용 금지)

## 코드 작성 규칙 (예외 없음)

### className은 `cn()`으로 줄을 나눈다

기본 → 큰 브레이크포인트에서 작은 순(2xl → xl → lg → md → sm) → 색 → 상태 변형.
자세한 예시는 ARCHITECTURE.md §9.A.

```tsx
className={cn(
  "relative border-t px-4 py-10 text-center",   // 기본
  "lg:absolute lg:top-[16%] lg:border-0",       // lg
  "md:h-130",                                   // md
  BORDER.line,                                  // 색
  "motion-reduce:lg:h-auto",                    // 상태
)}
```

### 색은 `src/constants/colors.ts`에서만 import 한다

`bg-black`, `text-foreground`, `border-header-line` 을 컴포넌트에 직접 쓰지 않는다.
`BG` / `TEXT` / `BORDER` / `OUTLINE` 맵을 쓰고, JS에서 색 값이 필요하면 `COLOR`.
`transparent` 와 `currentColor` 만 예외다(헥사값이 없는 키워드).

팔레트를 바꾸면 `src/app/globals.css` 의 `:root` 토큰도 같은 값으로 맞출 것.

### 손대지 않는 곳

`src/components/ui/**` 는 shadcn 생성물이다. `npx shadcn add` 로 재생성되므로
위 규칙을 적용하지 않고 직접 수정하지도 않는다.
