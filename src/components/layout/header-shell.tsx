"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { BG, BORDER, SCRIM, TEXT } from "@/constants/colors";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

/** 히어로 사진을 세로로 가득 채우는 라우트. 여기서만 헤더가 사진 위에 얹힌다. */
const OVERLAY_ROUTES = ["/"];

/** 바 높이. `(common)`/`(non-common)` layout 의 상단 패딩과 함께 움직인다. */
export const HEADER_HEIGHT = "h-13";

/**
 * 헤더의 면색만 담당하는 껍데기. 안쪽 내용은 서버 컴포넌트로 남는다.
 *
 * 레퍼런스는 홈 최상단에서 헤더를 사진 위에 투명하게 얹고 흰 글자로 쓰다가,
 * 히어로를 지나면 바탕색 바로 바뀐다. 두 상태 사이에서 글자·테두리·로고가
 * 전부 뒤집혀야 하므로, 색을 여기 한 곳에서 정하고 안쪽은 `currentColor` 로
 * 따라오게 했다(`text-current` / `border-current`). 로고는 이미지라
 * `group-data-*` 로 반전 필터를 건다.
 *
 * **`position: fixed` 라 반드시 `#smooth-content` 바깥에서 렌더돼야 한다**
 * (ARCHITECTURE §4). 지금은 root layout 이 그 자리다.
 */
export function HeaderShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isOverlayRoute = OVERLAY_ROUTES.includes(pathname);
  const [solid, setSolid] = useState(!isOverlayRoute);

  useIsomorphicLayoutEffect(() => {
    if (!isOverlayRoute) {
      setSolid(true);
      return;
    }

    setSolid(false);

    /*
     * 스크롤 위치를 매 프레임 상태로 옮기면 리렌더가 프레임마다 돈다.
     * ScrollTrigger 의 `onToggle` 은 경계를 넘는 순간에만 불리므로
     * 상태 변화가 정확히 두 번(진입/복귀)이다.
     *
     * 기준선은 뷰포트 높이의 88%. 히어로 하단 문구 블록이 바 아래로
     * 사라진 직후라, 흰 글자가 밝은 바탕 위에 남는 구간이 생기지 않는다.
     */
    const trigger = ScrollTrigger.create({
      start: () => `top top-=${window.innerHeight * 0.88}`,
      end: "max",
      invalidateOnRefresh: true,
      onToggle: (self) => setSolid(self.isActive),
    });

    return () => trigger.kill();
  }, [isOverlayRoute]);

  return (
    <header
      data-solid={solid}
      className={cn(
        "group fixed inset-x-0 top-0 z-50 border-b",
        HEADER_HEIGHT,
        "transition-colors duration-300",
        solid
          ? cn(BG.surface, BORDER.hairline, TEXT.ink)
          : cn(BG.transparent, "border-transparent", TEXT.white),
      )}
    >
      {/*
       * 사진의 밝은 부분 위에서는 흰 라벨 대비가 2:1 아래로 떨어진다.
       * 투명 상태일 때만 상단을 살짝 눌러 준다.
       */}
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
