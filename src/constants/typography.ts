/**
 * 타입 스케일의 단일 출처.
 *
 * 레퍼런스(icebug.com)는 두 벌만 쓴다.
 *
 * - **Suisse Intl Mono** — 내비게이션, 라벨, 가격, 버튼, 푸터 링크 등 UI 전부
 * - **Suisse Intl SemiBold** — 디스플레이 헤드라인 전용
 *
 * 두 서체 모두 상용이라 프로젝트에 이미 실려 있는 **Geist / Geist Mono** 로
 * 대체했다. Geist 는 같은 계열의 뉴트럴 그로테스크이고 Geist Mono 는 폭·획
 * 대비가 Suisse Intl Mono 와 가깝다.
 *
 * 실측값: h1 88px @1440 (= 6.11vw), 라운딩 0, 기본 단위 4px.
 *
 * ---
 *
 * ## 레퍼런스와 다른 점: 한글에는 모노를 쓰지 않는다
 *
 * 레퍼런스는 UI 라벨 **전부**를 모노로 쓴다. 우리 라벨은 대부분 한글인데,
 * Geist Mono 에는 한글 글리프가 없다. 그러면 브라우저가 글자마다 폴백
 * 한글 폰트를 끌어오면서 **모노의 고정 폭 칸에 비례폭 글리프를 넣는다.**
 * 결과는 글자 사이가 들쭉날쭉한 줄이다(실제 렌더로 확인).
 *
 * 그래서 축을 **언어**로 나눴다.
 *
 * - 라틴·숫자(ABOUT, CART 0, NEW, Prev, 전화번호, 연도) → 모노. 레퍼런스의
 *   기계적인 질감이 그대로 남는다.
 * - 한글(버튼 라벨, 섹션 라벨, 본문) → 산세. 자간만 살짝 벌려 모노 옆에
 *   놓였을 때 같은 급으로 읽히게 한다.
 *
 * 한글은 Geist 에도 글리프가 없어 `--font-display` 스택 뒤쪽의 한글 face 가
 * 받는다(globals.css). 비례폭이라 폴백이 자연스럽다.
 */

/** 라틴·숫자 UI 라벨. 헤더 메뉴, NEW, Prev/Next. */
export const LABEL = "font-mono text-[11px] leading-none uppercase";

/*
 * 모바일 시트 전용 스케일.
 *
 * 헤더의 11px 라벨을 시트에도 그대로 쓰면 **목적지가 크롬처럼 읽힌다.**
 * 고정 바의 라벨은 화면 구석에서 작게 있어야 맞지만, 시트를 열었을 때
 * 메뉴 항목은 그 화면의 본문이다. 한 단 키우고 굵기를 준다.
 */

/** 시트 메뉴 항목. */
export const MENU_ITEM =
  "font-mono text-[15px] leading-none font-medium uppercase tracking-[0.02em]";

/** 시트 제목. 항목보다 크고 굵어 시트를 연 화면의 머리글로 읽힌다. */
export const MENU_TITLE =
  "font-mono text-[18px] leading-none font-semibold uppercase tracking-[0.14em]";

/** 시트 하단 액션 버튼. */
export const ACTION_LABEL =
  "font-mono text-[12px] leading-none font-medium uppercase tracking-[0.08em]";

/** 한글 UI 라벨. 버튼, 섹션 라벨, 짧은 캡션. */
export const LABEL_KO = "text-[12px] leading-none tracking-[0.01em]";

/** 숫자·라틴 데이터. 전화번호, 사업자등록번호, 연도. */
export const MONO_DATA = "font-mono text-[12px] leading-[1.7]";

/** 한글 본문. */
export const BODY = "text-[13px] leading-[1.75]";

/** 히어로 헤드라인. 실측 88px @1440 을 vw 로 옮긴 값. */
export const DISPLAY_HERO =
  "font-display text-[11vw] leading-[1.02] font-semibold tracking-[-0.03em]";

/** 섹션 헤드라인. 히어로와 같은 벌, 한 단 작다. */
export const DISPLAY_SECTION =
  "font-display text-[8.5vw] leading-[1.05] font-semibold tracking-[-0.03em]";

/** 선언문. 가운데 정렬이라 줄 사이를 조금 연다. */
export const DISPLAY_MANIFESTO =
  "font-display text-[7.5vw] leading-[1.12] font-semibold tracking-[-0.025em]";

/** 카테고리 타일의 이름. 사진 위에 얹히므로 제품 타일보다 한 단 작다. */
export const TITLE_ITEM =
  "font-display text-[14px] leading-[1.35] font-medium tracking-[-0.01em]";

/**
 * 제품 타일의 이름과 색상·구성명.
 *
 * 레퍼런스 실측: 15px / weight 500 / line-height 18px, 그리고 **둘이 완전히
 * 같은 벌이다.** 크기나 색으로 가르지 않고 순서로만 읽힌다(이름이 위, 구성이
 * 아래). 여기서 굵기나 색을 바꾸면 카드가 레퍼런스와 달라 보인다.
 */
export const PRODUCT_LINE =
  "font-display text-[15px] leading-[18px] font-medium";

/**
 * 제품 타일의 가격. 레퍼런스 실측 12px / weight 400 / line-height 16.8px.
 *
 * `MONO_DATA`(lh 1.7)를 쓰면 안 된다. 그건 문단용이라 줄 상자가 20.4px 로
 * 커지고, 카드 높이가 레퍼런스보다 4px 늘어난다.
 */
export const PRODUCT_PRICE = "font-mono text-[12px] leading-[1.4]";
