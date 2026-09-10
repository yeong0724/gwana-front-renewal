import Image from "next/image";
import Link from "next/link";

import { BG, BORDER, OUTLINE, TEXT } from "@/constants/colors";
import { HEADER_HEIGHT } from "@/constants/nav-items";
import { cn } from "@/lib/utils";

/**
 * 결제 계열의 단독 헤더. 바 치수와 괘선은 SiteHeader와 같고, 메뉴/CART/로그인
 * 만 없다. 결제 도중 이탈 경로를 줄이는 통상적인 체크아웃 헤더 형태다.
 *
 * 로고가 가운데가 아니라 왼쪽인 것도 의도다. 가운데 정렬은 좌우에 무언가
 * 있을 때 성립하는데 여기는 로고뿐이라 축이 없다.
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
        // 공통 바와 같은 치수. 이쪽은 사진 위에 얹힐 일이 없어 항상 솔리드다.
        "fixed inset-x-0 top-0 z-50 border-b",
        HEADER_HEIGHT,
        BG.page,
        BORDER.hairline,
        TEXT.ink,
      )}
    >
      <div className={cn("flex h-full items-center px-3", "lg:px-6")}>
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
            /* 로고 비율 2.553 × 높이(모바일 30px, 데스크톱 34px). SiteHeader와 동일. */
            sizes="(min-width: 1024px) 92px, 72px"
            className={cn("h-7.5 w-auto", "lg:h-8.5")}
          />
        </Link>
      </div>
    </header>
  );
}
