/**
 * 이 앱에서 쓰는 모든 색의 단일 출처.
 *
 * 규칙: 컴포넌트에 `bg-black`, `text-foreground` 같은 색 클래스를 직접 쓰지 않는다.
 * 아래 맵을 import 해서 `cn(BG.page, TEXT.ink)` 형태로 조합한다.
 *
 * 값은 Tailwind neutral 스케일과 동일하다. `src/app/globals.css`의 토큰도
 * 같은 값을 쓰므로, 색을 바꿀 때는 **두 파일을 함께** 고쳐야 한다.
 */
export const COLOR = {
  /** 페이지 바탕. */
  white: "#ffffff",
  /** 헤더 괘선과 모바일 구분선. 레퍼런스가 순검정을 쓴다. */
  black: "#000000",
  /** 본문 글자. neutral-950. */
  ink: "#0a0a0a",
  /** 보조 글자. neutral-500. */
  muted: "#737373",
  /** 패널 안쪽 얇은 구분선. neutral-200. */
  hairline: "#e5e5e5",
  /** 키보드 포커스 링. neutral-400. */
  ring: "#a1a1a1",
  /** 이전 버전 푸터의 녹색 바탕과 그 위의 텍스트·구분선. */
  footer: "#3c4d3d",
  footerText: "#d8dcd8",
  footerMuted: "#b1b9b1",
  footerLine: "#677367",
  instagramGold: "#ffcf55",
  instagramPink: "#ee2a7b",
  instagramPurple: "#6228d7",
  naver: "#03c75a",
} as const;

export type ColorName = keyof typeof COLOR;

/*
 * 아래 맵의 헥사 값은 COLOR와 반드시 같아야 한다. 템플릿 리터럴로
 * (`bg-[${COLOR.white}]`) 만들면 Tailwind 스캐너가 클래스를 못 찾아
 * CSS가 생성되지 않으므로, 완전한 문자열 리터럴로 적는다.
 */

/** 배경색. */
export const BG = {
  instagram: "bg-linear-to-tr from-[#ffcf55] via-[#ee2a7b] to-[#6228d7]",
  naver: "bg-[#03c75a]",
  footer: "bg-[#3c4d3d]",
  page: "bg-[#ffffff]",
  ink: "bg-[#0a0a0a]",
  /** 잉크 면의 호버 상태. */
  inkHover: "hover:bg-[#0a0a0a]/85",
  /** 흰 면 위 옅은 호버. */
  hairlineHover: "hover:bg-[#e5e5e5]/60",
  black: "bg-[#000000]",
  transparent: "bg-transparent",
} as const;

/** 글자색. */
export const TEXT = {
  footer: "text-[#d8dcd8]",
  footerMuted: "text-[#b1b9b1]",
  ink: "text-[#0a0a0a]",
  /** 호버 시 옅어지는 상태. */
  inkHover: "hover:text-[#0a0a0a]/55",
  muted: "text-[#737373]",
  white: "text-[#ffffff]",
} as const;

/** 테두리색. 방향은 호출부에서 border-t / border-l 등으로 지정한다. */
export const BORDER = {
  footer: "border-[#677367]",
  /** 헤더 괘선. 레퍼런스의 1px 순검정 선. */
  line: "border-[#000000]",
  /** 패널 내부의 옅은 구분선. */
  hairline: "border-[#e5e5e5]",
} as const;

/** 포커스 아웃라인. */
export const OUTLINE = {
  ring: "outline-[#a1a1a1]",
} as const;

/**
 * 사진 위에 흰 글자를 올릴 때 쓰는 가림막.
 * 히어로 사진의 밝은 부분은 흰 글자와 대비가 1.01:1까지 떨어져 글자가 사라진다.
 */
export const SCRIM = {
  heroBottom:
    "bg-gradient-to-t from-[#000000]/70 via-[#000000]/32 to-transparent",
  /**
   * 투명 헤더가 사진 위에 얹혀 있을 때 흰 글자를 살리는 상단 가림막.
   * 바 높이의 180%까지 흘려서 경계가 선으로 보이지 않게 한다.
   */
  heroTop: "bg-gradient-to-b from-[#000000]/45 to-transparent",
} as const;
