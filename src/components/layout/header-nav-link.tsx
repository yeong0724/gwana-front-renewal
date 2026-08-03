"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { OUTLINE, TEXT } from "@/constants/colors";
import { cn } from "@/lib/utils";
import { HEADER_LABEL, type NavItem } from "../../constants/nav-items";

export function useIsActive(href: string) {
  const pathname = usePathname();
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function HeaderNavLink({
  href,
  label,
  className,
}: NavItem & { className?: string }) {
  const isActive = useIsActive(href);

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        HEADER_LABEL,
        // Reference nav items are full-height hit areas with 10px side padding.
        "grid h-full items-center px-2.5",
        TEXT.ink,
        TEXT.inkHover,
        "transition-colors duration-150",
        "focus-visible:outline-2 focus-visible:-outline-offset-2",
        OUTLINE.ring,
        className,
      )}
    >
      {/* Bold ghost reserves the widest state so switching pages never shifts the nav. */}
      <span aria-hidden className="invisible col-start-1 row-start-1 font-bold">
        {label}
      </span>
      <span
        className={cn(
          "col-start-1 row-start-1",
          isActive ? "font-bold" : "font-normal",
        )}
      >
        {label}
      </span>
    </Link>
  );
}
