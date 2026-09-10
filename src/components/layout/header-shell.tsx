"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { BG, BORDER, SCRIM, TEXT } from "@/constants/colors";
import { HEADER_HEIGHT } from "@/constants/nav-items";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

/**
 * 히어로 사진 위에 투명하게 얹히는 라우트. 나머지는 처음부터 솔리드다.
 * 사진으로 시작하지 않는 페이지에 투명 바를 깔면 흰 배경에 흰 글자가 된다.
 */
const TRANSPARENT_ROUTES = ["/"];

/**
 * 사진을 거의 다 지나온 지점에서 솔리드로 바뀐다. 뷰포트의 88%.
 * 히어로가 정확히 100vh이므로 바닥에 닿기 조금 전이고, 그래서 전환이
 * 섹션 경계와 겹치지 않는다.
 */
const SOLID_AT = 0.88;

/**
 * 바의 껍데기. 색과 가림막만 맡고 내용물은 받아서 그린다.
 *
 * 안쪽(`children`)이 서버 컴포넌트로 남을 수 있게 이 껍데기만 클라이언트다.
 * `SiteHeader`에서 이걸 감싸는 형태를 뒤집지 말 것. 여기서 바 내용을 직접
 * import 하면 전부 클라이언트 번들로 끌려 들어간다.
 *
 * 색 전환에 `data-solid`를 함께 내보내는 이유는 로고 때문이다. 로고 PNG가
 * 어두운 색이라 사진 위에서는 반전시켜야 하는데, 그 판단을 로고 쪽에서
 * `group-data-[solid=false]:invert`로 읽는다.
 */
export function HeaderShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const alwaysSolid = !TRANSPARENT_ROUTES.includes(pathname);
  const [solid, setSolid] = useState(alwaysSolid);

  useIsomorphicLayoutEffect(() => {
    if (alwaysSolid) {
      setSolid(true);
      return;
    }

    setSolid(false);

    /*
     * trigger 요소가 없는 ScrollTrigger다. 기준으로 삼을 섹션이 아니라
     * 스크롤 양 자체가 조건이라서, start를 스크롤 위치로 직접 적는다.
     * 창 높이가 바뀌면 임계값도 바뀌므로 함수값 + invalidateOnRefresh.
     */
    const trigger = ScrollTrigger.create({
      start: () => `top top-=${SOLID_AT * window.innerHeight}`,
      end: "max",
      invalidateOnRefresh: true,
      onToggle: (self) => setSolid(self.isActive),
    });

    return () => trigger.kill();
  }, [alwaysSolid]);

  return (
    <header
      data-solid={solid}
      className={cn(
        "group fixed inset-x-0 top-0 z-50 border-b",
        HEADER_HEIGHT,
        "transition-colors duration-300",
        solid
          ? cn(BG.page, BORDER.hairline, TEXT.ink)
          : cn(BG.transparent, "border-transparent", TEXT.white),
      )}
    >
      {/* 사진의 밝은 부분에서 흰 라벨이 사라지지 않게 위쪽만 눌러준다. */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-[180%] transition-opacity duration-300",
          SCRIM.heroTop,
          solid ? "opacity-0" : "opacity-100",
        )}
      />

      <div className="relative h-full">{children}</div>
    </header>
  );
}
