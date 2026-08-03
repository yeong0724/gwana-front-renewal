import Image from "next/image";
import Link from "next/link";

import { BG, BORDER, OUTLINE, TEXT } from "@/constants/colors";
import { cn } from "@/lib/utils";
import { HeaderMobileMenu } from "./header-mobile-menu";
import { HeaderNavLink } from "./header-nav-link";
import { HEADER_LABEL, LOGIN_ITEM, NAV_ITEMS } from "../../constants/nav-items";

/**
 * Right-hand cells. The reference bar gives each one a fixed 140px box on
 * desktop and 56px on mobile, divided by a rule that runs the full height.
 */
const RIGHT_CELL = cn(
  HEADER_LABEL,
  "flex w-14 shrink-0 items-center justify-center border-l uppercase",
  "lg:w-35",
  BORDER.line,
  TEXT.ink,
  TEXT.inkHover,
  "transition-colors duration-150",
  "focus-visible:outline-2 focus-visible:-outline-offset-2",
  OUTLINE.ring,
);

export function SiteHeader({ bagCount = 0 }: { bagCount?: number }) {
  return (
    <header
      className={cn(
        // Mobile: floating bar inset 8px, ruled on all four sides.
        "fixed inset-x-2 top-2 z-50 h-10 border",
        // Desktop: edge to edge at 60px, only the bottom rule.
        "lg:inset-x-0 lg:top-0 lg:h-12 lg:border-0 lg:border-b",
        BG.page,
        BORDER.line,
      )}
    >
      <div className="flex h-full items-stretch">
        <HeaderMobileMenu className="lg:hidden" />

        {/* Brand column is exactly 4 of 12 on desktop, as in the reference grid. */}
        <div
          className={cn(
            "flex flex-1 items-center px-4",
            "lg:w-1/3 lg:flex-none lg:px-5",
          )}
        >
          <Link
            href="/"
            aria-label="gwana tea house, home"
            className={cn(
              "inline-flex",
              "focus-visible:outline-2 focus-visible:outline-offset-4",
              OUTLINE.ring,
            )}
          >
            <Image
              src="/gwana-logo.png"
              alt="gwana tea house"
              width={1726}
              height={676}
              priority
              /* 실제 렌더 폭. 로고 비율 2.553 × 높이(모바일 28px, 데스크톱 36px).
                 이 값이 작으면 브라우저가 더 작은 후보를 받아 확대해 흐려진다. */
              sizes="(min-width: 1024px) 92px, 72px"
              className={cn("h-7 w-auto", "lg:h-9")}
            />
          </Link>
        </div>

        <nav
          aria-label="Main"
          className={cn(
            "hidden flex-1 items-center border-l uppercase",
            "lg:flex",
            BORDER.line,
          )}
        >
          {NAV_ITEMS.map((item, index) => (
            <HeaderNavLink
              key={item.href}
              {...item}
              className={index === 0 ? "ml-7.5" : "ml-9"}
            />
          ))}
        </nav>

        <div className="ml-auto flex items-stretch">
          <Link
            href={LOGIN_ITEM.href}
            className={cn(RIGHT_CELL, "hidden", "lg:flex")}
          >
            {LOGIN_ITEM.label}
          </Link>

          <Link
            href="/bag"
            aria-label={`Bag, ${bagCount} ${bagCount === 1 ? "item" : "items"}`}
            className={RIGHT_CELL}
          >
            <span aria-hidden>
              BAG
              <span className={cn("hidden", "lg:inline")}>
                &nbsp;({bagCount})
              </span>
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
