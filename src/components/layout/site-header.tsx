import Image from "next/image";
import Link from "next/link";

import { OUTLINE } from "@/constants/colors";
import { CART_ITEM, LOGIN_ITEM, NAV_ITEMS } from "@/constants/nav-items";
import { LABEL } from "@/constants/typography";
import { cn } from "@/lib/utils";
import { HeaderMobileMenu } from "./header-mobile-menu";
import { HeaderNavLink } from "./header-nav-link";
import { HeaderShell } from "./header-shell";

//
/**
 * 오른쪽 유틸리티 셀. 왼쪽 메뉴와 같은 라벨 벌을 쓰되 활성 표시는 하지 않는다
 * (레퍼런스도 LOGIN/CART 에는 현재 위치 표시를 붙이지 않는다).
 */
const UTILITY_CELL = cn(
  LABEL,
  "px-2 py-2 text-current transition-opacity duration-150 hover:opacity-60",
  "focus-visible:outline-2 focus-visible:outline-offset-2",
);

/**
 * 공통 헤더.
 *
 * 레퍼런스 구조를 그대로 옮겼다: **왼쪽 메뉴 / 가운데 로고 / 오른쪽 유틸리티**.
 * 로고를 광학적 중앙에 두려면 좌우 칼럼이 같은 폭이어야 하므로
 * `grid-cols-[1fr_auto_1fr]` 로 잡고 오른쪽 칼럼을 `justify-end` 한다.
 * 좌우 내용의 폭이 달라도 로고는 흔들리지 않는다.
 *
 * 색은 전부 `HeaderShell` 이 정한다. 여기서는 `text-current` 만 쓴다.
 */
export function SiteHeader({ cartCount = 0 }: { cartCount?: number }) {
  return (
    <HeaderShell>
      <div
        className={cn(
          "grid h-full grid-cols-[1fr_auto_1fr] items-center px-3",
          "lg:px-6",
        )}
      >
        {/* 왼쪽: 데스크톱은 메뉴, 모바일은 햄버거 하나. */}
        <div className="flex items-center justify-start">
          <HeaderMobileMenu className="lg:hidden" />
          <nav
            aria-label="Main"
            className={cn("hidden items-center gap-6", "lg:flex")}
          >
            {NAV_ITEMS.map((item) => (
              <HeaderNavLink key={item.href} {...item} />
            ))}
          </nav>
        </div>

        {/* 가운데: 로고. */}
        <Link
          href="/"
          aria-label="gwana tea house, 홈"
          className={cn(
            "inline-flex justify-self-center",
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
            /* 실제 렌더 폭. 로고 비율 2.553 × 높이(모바일 22px, 데스크톱 26px).
               이 값이 작으면 브라우저가 더 작은 후보를 받아 확대해 흐려진다. */
            sizes="(min-width: 1024px) 67px, 57px"
            /*
             * 로고 원본은 투명 배경 위 검정 획이다. 사진 위 투명 상태에서는
             * 그대로 두면 읽히지 않으므로 반전시켜 흰 획으로 만든다.
             * (알파는 그대로라 배경은 여전히 비어 있다.)
             */
            className={cn(
              "h-7.5 w-auto transition-[filter] duration-300",
              "lg:h-6.5",
              "group-data-[solid=false]:invert",
            )}
          />
        </Link>

        {/* 오른쪽: 유틸리티. 모바일에서는 CART 만 남긴다. */}
        <div className="flex items-center justify-end gap-1 lg:gap-4">
          <Link
            href={LOGIN_ITEM.href}
            className={cn(UTILITY_CELL, "hidden lg:inline-flex")}
          >
            {LOGIN_ITEM.label}
          </Link>

          <Link
            href={CART_ITEM.href}
            aria-label={`장바구니, 상품 ${cartCount}개`}
            className={UTILITY_CELL}
          >
            <span aria-hidden>
              {CART_ITEM.label} {cartCount}
            </span>
          </Link>
        </div>
      </div>
    </HeaderShell>
  );
}
