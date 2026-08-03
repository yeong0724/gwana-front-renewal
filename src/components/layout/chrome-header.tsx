"use client";

import { usePathname } from "next/navigation";

import { isNonCommonRoute } from "@/constants/route-chrome";

/**
 * 경로에 따라 헤더를 고르는 스위치. 이 컴포넌트만 클라이언트다.
 *
 * 두 헤더는 **RSC로 렌더된 트리를 prop으로 받는 것**이라 서버 컴포넌트로
 * 남는다. 여기서 `<SiteHeader />`를 직접 import 하면 클라이언트 번들로
 * 끌려 들어가니 그렇게 바꾸지 말 것.
 */
export function ChromeHeader({
  common,
  nonCommon,
}: {
  common: React.ReactNode;
  nonCommon: React.ReactNode;
}) {
  return <>{isNonCommonRoute(usePathname()) ? nonCommon : common}</>;
}
