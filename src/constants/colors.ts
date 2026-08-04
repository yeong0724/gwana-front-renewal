/**
 * 이 앱에서 쓰는 모든 색의 단일 출처.
 *
 * 규칙: 컴포넌트에 `bg-black`, `text-foreground` 같은 색 클래스를 직접 쓰지 않는다.
 * 아래 맵을 import 해서 `cn(BG.surface, TEXT.ink)` 형태로 조합한다.
 *
 * 값의 출처는 레퍼런스(icebug.com)를 **모달을 닫고** 실제 브라우저에서 읽은
 * computed style 이다. 레퍼런스는 흰 바탕 사이트이고, 제품 타일만 한 단 회색이다.
 *
 * ```
 * html / 모든 섹션   rgb(255,255,255)   #ffffff
 * 제품 타일          rgb(236,236,236)   #ececec
 * 푸터               rgb(60,76,61)      #3c4c3d
 * ```
 *
 * **스크린샷 픽셀을 그대로 믿지 말 것** — 뉴스레터 모달이 떠 있으면 페이지
 * 전체에 20% 어둡기 막이 깔려 모든 값이 0.8배로 읽힌다(ARCHITECTURE §10.6).
 *
 * `src/app/globals.css` 의 `:root` 토큰도 같은 값을 쓰므로, 색을 바꿀 때는
 * **두 파일을 함께** 고쳐야 한다.
 */
export const COLOR = {
  /** 페이지 바탕. 레퍼런스는 흰 바탕이다. */
  surface: "#ffffff",
  /** 제품·카테고리 타일 면. 바탕에서 한 단만 내려온다. */
  tile: "#ececec",
  /** 본문 글자. surface 위 15.1:1, tile 위 12.8:1. */
  ink: "#262626",
  /** 보조 글자. tile 위 4.9:1 (더 밝게 가면 타일 위에서 AA 가 깨진다). */
  muted: "#666664",
  /** 타일 이음매와 얇은 구분선. 글자가 아니므로 대비 하한 대상이 아니다. */
  hairline: "#d4d4d4",
  /** 푸터와 브랜드 면. */
  forest: "#3c4c3d",
  /** 짙은 면 위의 본문 글자. forest 위 7.5:1. */
  chalk: "#e8e9e3",
  /** 짙은 면 위의 보조 글자. forest 위 4.8:1. */
  moss: "#b8bcb4",
  /** 사진 위 글자. */
  white: "#ffffff",
  /**
   * 강조. 레퍼런스의 링크색 그대로다.
   * surface 위 5.9:1, tile 위 5.0:1 로 밝은 면에서는 AA 를 넘긴다.
   * 짙은 초록 위에서는 1.2:1 까지 무너지므로 **밝은 면에서만** 쓴다.
   */
  accent: "#c1242f",
  /** 키보드 포커스 링. */
  ring: "#262626",
} as const;

export type ColorName = keyof typeof COLOR;

/*
 * 아래 맵의 헥사 값은 COLOR와 반드시 같아야 한다. 템플릿 리터럴로
 * (`bg-[${COLOR.surface}]`) 만들면 Tailwind 스캐너가 클래스를 못 찾아
 * CSS가 생성되지 않으므로, 완전한 문자열 리터럴로 적는다.
 */

/** 배경색. */
export const BG = {
  surface: "bg-[#ffffff]",
  tile: "bg-[#ececec]",
  forest: "bg-[#3c4c3d]",
  ink: "bg-[#262626]",
  white: "bg-[#ffffff]",
  /** 흰 면 위 호버. 타일 한 단만큼 눌린다. */
  surfaceHover: "hover:bg-[#ececec]",
  /** 짙은 면 위 호버. */
  forestHover: "hover:bg-[#3c4c3d]/70",
  transparent: "bg-transparent",
} as const;

/** 글자색. */
export const TEXT = {
  ink: "text-[#262626]",
  muted: "text-[#666664]",
  chalk: "text-[#e8e9e3]",
  moss: "text-[#b8bcb4]",
  white: "text-[#ffffff]",
  accent: "text-[#c1242f]",
  /** 밝은 면 위 링크 호버. */
  inkHover: "hover:text-[#666664]",
  /** 짙은 면 위 링크 호버. */
  chalkHover: "hover:text-[#b8bcb4]",
} as const;

/**
 * 테두리색. 방향은 호출부에서 border-t / border-l 등으로 지정한다.
 *
 * `current` 는 헥사값이 없는 키워드라 팔레트 대상이 아니다. 헤더처럼
 * 면색이 스크롤에 따라 뒤집히는 곳에서 글자색을 그대로 따라가게 할 때 쓴다.
 */
export const BORDER = {
  hairline: "border-[#d4d4d4]",
  ink: "border-[#262626]",
  /** 짙은 면 위의 구분선. */
  moss: "border-[#b8bcb4]/35",
  current: "border-current",
} as const;

/** 포커스 아웃라인. */
export const OUTLINE = {
  ring: "outline-[#262626]",
  /** 짙은 면·사진 위에서는 링도 밝아야 보인다. */
  chalk: "outline-[#e8e9e3]",
} as const;

/**
 * 사진 위에 흰 글자를 올릴 때 쓰는 가림막.
 * 히어로 사진의 밝은 부분은 흰 글자와 대비가 1.01:1까지 떨어져 글자가 사라진다.
 */
export const SCRIM = {
  /*
   * 실측: 히어로 사진의 밝은 잎사귀 부분에서 12px 흰 라벨의 대비가 2:1 아래로
   * 떨어진다. 아래쪽 78%까지 눌러야 라벨·본문 모두 AA 를 넘긴다.
   */
  heroBottom:
    "bg-gradient-to-t from-[#000000]/78 via-[#000000]/42 to-transparent",
  /** 상단 오버레이 헤더가 밝은 하늘 위에 놓일 때. */
  heroTop: "bg-gradient-to-b from-[#000000]/45 to-transparent",
} as const;
