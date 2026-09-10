import Image from "next/image";
import Link from "next/link";

import { OUTLINE } from "@/constants/colors";
import { cn } from "@/lib/utils";
import { HeaderMobileMenu } from "./header-mobile-menu";
import { HeaderNavLink } from "./header-nav-link";
import { HeaderShell } from "./header-shell";
import { BAR_LABEL, LOGIN_ITEM, NAV_ITEMS } from "../../constants/nav-items";

/**
 * 우측 액션. 이전 버전은 헤더를 격자(칸막이)가 아니라 **얹히는 바**로 보므로
 * 셀 박스도 세로 괘선도 없다. 링크는 글자 그대로 놓이고 hover는 색이 아니라
 * 투명도로 준다. 사진 위(흰 글자)와 흰 배경 위(먹 글자)에서 같은 규칙이
 * 통하는 것은 투명도뿐이라서다. 색은 `text-current`로 바에서 물려받는다.
 */
const BAR_ACTION = cn(
  BAR_LABEL,
  "px-2 py-2 text-current transition-opacity duration-150 hover:opacity-60",
  "focus-visible:outline-2 focus-visible:outline-offset-2",
  OUTLINE.ring,
);

export function SiteHeader({ bagCount = 0 }: { bagCount?: number }) {
  return (
    <HeaderShell>
      {/*
       * 좌 1fr / 로고 auto / 우 1fr. 가운데 칸이 내용 폭만 차지하므로 로고는
       * 좌우 항목 개수와 무관하게 **화면 정중앙**에 선다. flex + justify-between
       * 으로 짜면 로고가 좌우 묶음의 폭 차이만큼 밀린다.
       */}
      <div
        className={cn(
          "grid h-full grid-cols-[1fr_auto_1fr] items-center px-3",
          "lg:px-6",
        )}
      >
        <div className="flex items-center justify-start">
          <HeaderMobileMenu className="lg:hidden" />

          <nav
            aria-label="Main"
            className={cn("hidden items-center gap-10", "lg:flex")}
          >
            {NAV_ITEMS.map((item) => (
              <HeaderNavLink key={item.href} {...item} />
            ))}
          </nav>
        </div>

        <Link
          href="/"
          aria-label="gwana tea house, home"
          className={cn(
            "inline-flex justify-self-center",
            "focus-visible:outline-2 focus-visible:outline-offset-4",
            OUTLINE.ring,
          )}
        >
          <Image
            src="/gwana-logo.png"
            alt="gwana tea house"
            width={2048}
            height={676}
            priority
            /* 실제 렌더 폭. 로고 비율 2.553 × 높이(모바일 30px, 데스크톱 34px).
               이 값이 작으면 브라우저가 더 작은 후보를 받아 확대해 흐려진다. */
            sizes="(min-width: 1024px) 2048px, 676px"
            className={cn(
              // 데스크톱 로고는 양옆 라벨(13px)보다 확실히 커야 축으로 읽힌다.
              // 26 → 34px(1.3배). 52px 바 안에서 위아래 9px씩 남는다.
              "h-7.5 w-auto transition-[filter] duration-300",
              "lg:h-10",
              // 로고 PNG가 먹색이다. 사진 위(투명 바)에서는 반전시켜 흰 로고로 쓴다.
              "group-data-[solid=false]:invert",
            )}
          />
        </Link>

        <div className={cn("flex items-center justify-end gap-1", "lg:gap-4")}>
          <Link
            href={LOGIN_ITEM.href}
            className={cn(BAR_ACTION, "hidden", "lg:inline-flex")}
          >
            {LOGIN_ITEM.label}
          </Link>

          <Link
            href="/bag"
            aria-label={`Cart, ${bagCount} ${bagCount === 1 ? "item" : "items"}`}
            className={BAR_ACTION}
          >
            <span aria-hidden>CART {bagCount}</span>
          </Link>
        </div>
      </div>
    </HeaderShell>
  );
}
