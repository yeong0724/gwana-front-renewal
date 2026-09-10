export type NavItem = {
  label: string;
  href: string;
};

export const NAV_ITEMS: NavItem[] = [
  { label: "ABOUT", href: "/about" },
  { label: "SHOP", href: "/shop" },
  { label: "ADMIN", href: "/admin" },
];

export const LOGIN_ITEM: NavItem = { label: "Log In", href: "/login" };

/** 모바일 시트 하단에서 LOG IN과 짝을 이루는 계정 진입점. */
export const ACCOUNT_ITEM: NavItem = {
  label: "Go to Smart Store",
  href: "/account",
};

/**
 * Header type scale, matched to the reference bar: 12px uppercase, no tracking,
 * line-height collapsed to 1 so labels sit optically centred in a 40px bar.
 *
 * 고정 바는 더 이상 이 값을 쓰지 않는다(아래 `BAR_LABEL`). 모바일 시트, 푸터,
 * 방문 섹션이 함께 쓰고 있어서 남겨 둔 것이다. 바만 바꾸려고 이 정의를 고치면
 * 세 곳이 같이 끌려간다.
 */
export const HEADER_LABEL = "text-[13px] leading-none whitespace-nowrap";

/**
 * 고정 바의 타입 스케일. 이전 버전(gwana-front-renewal)의 `LABEL`에서 출발했고,
 * 데스크톱만 11 → 13px로 올렸다(2026-09-10). 모바일은 원본값 그대로다.
 * 모바일 바에는 라벨이 CART 하나뿐이라 키울 이유가 없고, 키우면 가운데 로고의
 * 자리를 좁힌다.
 */
export const BAR_LABEL =
  "font-mono text-[11px] leading-none uppercase lg:text-[13px]";

/**
 * 고정 바 높이(52px)와, 그 아래로 본문을 밀어내는 짝값들.
 *
 * **세 값은 항상 같이 움직인다.** 바 높이만 고치면 모든 라우트의 본문이
 * 바 밑으로 파고들고, 홈은 히어로가 바만큼 어긋난다.
 * - `HEADER_HEIGHT` : 바 자신 (`header-shell.tsx`, `payment-header.tsx`)
 * - `HEADER_OFFSET` : 계열 layout의 `<main>` 상단 패딩
 * - `HEADER_PULL`   : 사진을 화면 맨 위까지 올리는 홈만 되끌어 올리는 값
 */
export const HEADER_HEIGHT = "h-14";
export const HEADER_OFFSET = "pt-13";
export const HEADER_PULL = "-mt-13";
