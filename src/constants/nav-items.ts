export type NavItem = {
  label: string;
  href: string;
};

/**
 * 헤더 왼쪽 메뉴. 레퍼런스는 로고를 가운데 두고 왼쪽에 카테고리, 오른쪽에
 * 유틸리티를 놓는다.
 */
export const NAV_ITEMS: NavItem[] = [
  { label: "ABOUT", href: "/about" },
  { label: "SHOP", href: "/shop" },
  { label: "ADMIN", href: "/admin" },
];

export const LOGIN_ITEM: NavItem = { label: "LOGIN", href: "/login" };

/**
 * 라우트 이름은 `/bag` 그대로 둔다. 라벨만 레퍼런스의 "Cart" 를 따른다.
 * 슬러그를 바꾸면 북마크·유입 링크가 끊기고 (non-common) 접두사 목록,
 * ARCHITECTURE 문서까지 함께 움직여야 한다.
 */
export const CART_ITEM: NavItem = { label: "CART", href: "/bag" };

/** 모바일 시트 하단에서 LOGIN과 짝을 이루는 계정 진입점. */
export const ACCOUNT_ITEM: NavItem = {
  label: "MY ACCOUNT",
  href: "/account",
};
