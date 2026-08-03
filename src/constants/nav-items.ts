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

/**
 * Header type scale, matched to the reference bar: 12px uppercase, no tracking,
 * line-height collapsed to 1 so labels sit optically centred in a 40px bar.
 */
export const HEADER_LABEL = "text-[13px] leading-none whitespace-nowrap";
