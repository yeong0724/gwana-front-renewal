import Image from "next/image";
import Link from "next/link";

import { BG, BORDER, OUTLINE } from "@/constants/colors";
import { cn } from "@/lib/utils";

/**
 * 결제 계열의 단독 헤더. 바 치수와 괘선은 SiteHeader와 같고, 메뉴/BAG/로그인
 * 셀만 없다. 결제 도중 이탈 경로를 줄이는 통상적인 체크아웃 헤더 형태다.
 *
 * 로고는 홈 링크로 남겨 두었다(로고 클릭 = 홈이라는 기대를 깨지 않기 위해).
 * 이탈을 완전히 막아야 하면 Link를 span으로 바꾸면 된다.
 *
 * 높이를 바꾸면 `(non-common)/layout.tsx`의 상단 패딩도 함께 고칠 것.
 */
export function PaymentHeader() {
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
      <div className={cn("flex h-full items-center px-4", "lg:px-5")}>
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
            /* 로고 비율 2.553 × 높이(모바일 28px, 데스크톱 36px). SiteHeader와 동일. */
            sizes="(min-width: 1024px) 92px, 72px"
            className={cn("h-7 w-auto", "lg:h-9")}
          />
        </Link>
      </div>
    </header>
  );
}
