export type NavItem = {
  label: string;
  href: string;
};

export const NAV_ITEMS: NavItem[] = [
  { label: "ABOUT", href: "/about" },
  { label: "SHOP", href: "/shop" },
  { label: "ADMIN", href: "/admin" },
];

export const LOGIN_ITEM: NavItem = { label: "LOG IN", href: "/login" };

/** 모바일 시트 하단에서 LOG IN과 짝을 이루는 계정 진입점. */
export const ACCOUNT_ITEM: NavItem = { label: "MY ACCOUNT", href: "/account" };

/**
 * Header type scale, matched to the reference bar: 12px uppercase, no tracking,
 * line-height collapsed to 1 so labels sit optically centred in a 40px bar.
 */
export const HEADER_LABEL = "text-[13px] leading-none whitespace-nowrap";
