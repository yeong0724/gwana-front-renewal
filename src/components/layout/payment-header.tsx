import Image from "next/image";
import Link from "next/link";

import { BG, BORDER, OUTLINE, TEXT } from "@/constants/colors";
import { cn } from "@/lib/utils";
import { HEADER_HEIGHT } from "./header-shell";

/**
 * 결제 계열의 단독 헤더. 바 높이와 괘선은 SiteHeader와 같고, 메뉴/유틸리티
 * 셀만 없다. 결제 도중 이탈 경로를 줄이는 통상적인 체크아웃 헤더 형태다.
 *
 * 사진 위에 얹힐 일이 없으므로 상태 전환도 없다. 항상 바탕색 바다.
 * 그래서 `HeaderShell` 없이 직접 그리되 높이 상수만 공유한다.
 *
 * 로고는 홈 링크로 남겨 두었다(로고 클릭 = 홈이라는 기대를 깨지 않기 위해).
 * 이탈을 완전히 막아야 하면 Link를 span으로 바꾸면 된다.
 */
export function PaymentHeader() {
  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b",
        HEADER_HEIGHT,
        BG.surface,
        BORDER.hairline,
        TEXT.ink,
      )}
    >
      <div className={cn("flex h-full items-center px-3", "lg:px-6")}>
        <Link
          href="/"
          aria-label="gwana tea house, 홈"
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
            /* 로고 비율 2.553 × 높이(모바일 22px, 데스크톱 26px). SiteHeader와 동일. */
            sizes="(min-width: 1024px) 67px, 57px"
            className={cn("h-5.5 w-auto", "lg:h-6.5")}
          />
        </Link>
      </div>
    </header>
  );
}
