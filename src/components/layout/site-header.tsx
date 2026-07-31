import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { HeaderMobileMenu } from "./header-mobile-menu";
import { HeaderNavLink } from "./header-nav-link";
import { HEADER_LABEL, LOGIN_ITEM, NAV_ITEMS } from "./nav-items";

/**
 * Right-hand cells. The reference bar gives each one a fixed 140px box on
 * desktop and 56px on mobile, divided by a rule that runs the full height.
 */
const RIGHT_CELL = cn(
  HEADER_LABEL,
  "flex w-14 shrink-0 items-center justify-center border-l border-header-line lg:w-35",
  "uppercase text-foreground transition-colors duration-150 hover:text-foreground/55",
  "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
);

export function SiteHeader({ bagCount = 0 }: { bagCount?: number }) {
  return (
    <header
      className={cn(
        "fixed z-50 bg-background",
        // Mobile: floating bar inset 8px, ruled on all four sides.
        "inset-x-2 top-2 h-12 border border-header-line",
        // Desktop: edge to edge at 40px, only the bottom rule.
        "lg:inset-x-0 lg:top-0 lg:h-15 lg:border-0 lg:border-b lg:border-header-line",
      )}
    >
      <div className="flex h-full items-stretch">
        <HeaderMobileMenu className="lg:hidden" />

        {/* Brand column is exactly 4 of 12 on desktop, as in the reference grid. */}
        <div className="flex flex-1 items-center px-4 lg:w-1/3 lg:flex-none lg:px-5">
          <Link
            href="/"
            aria-label="gwana tea house, home"
            className="inline-flex focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            <Image
              src="/gwana-logo.png"
              alt="gwana tea house"
              width={1726}
              height={676}
              priority
              sizes="(min-width: 1024px) 61px, 72px"
              className="h-7 w-auto lg:h-9"
            />
          </Link>
        </div>

        <nav
          aria-label="Main"
          className="hidden flex-1 items-center border-l border-header-line uppercase lg:flex"
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
            className={cn(RIGHT_CELL, "hidden lg:flex")}
          >
            {LOGIN_ITEM.label}
          </Link>

          <Link
            href="/bag"
            aria-label={`Bag, ${bagCount} ${bagCount === 1 ? "item" : "items"}`}
            className={RIGHT_CELL}
          >
            <span aria-hidden>
              BAG<span className="hidden lg:inline">&nbsp;({bagCount})</span>
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
