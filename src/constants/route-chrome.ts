/**
 * 어떤 경로가 단독 헤더를 쓰는지 판정하는 단일 출처.
 *
 * 헤더는 `position: fixed`라 `#smooth-content` 바깥, 즉 root layout에서만
 * 렌더할 수 있다(§4). root layout은 서버 컴포넌트라 pathname을 모르므로,
 * 계열 판정을 파일 구조 대신 이 접두사 목록으로 한다.
 *
 * **`src/app/(non-common)/` 아래 라우트를 추가하면 여기에도 접두사를 넣어야
 * 한다.** 둘이 어긋나면 결제 페이지에 공통 헤더가 붙는다.
 *
 * parallel routes(`@header` 슬롯)로 옮기면 이 동기화가 필요 없어지지만,
 * 슬롯은 소프트 내비게이션에서 매칭에 실패하면 직전 슬롯을 그대로 붙들고
 * 있어서(`default.tsx`는 하드 내비게이션 폴백일 뿐) 계열마다 catch-all
 * 페이지를 깔아야 한다. 헤더가 둘뿐인 지금은 비용이 더 크다고 판단했다.
 */
export const NON_COMMON_PREFIXES = ["/payment"] as const;

/** 접두사 자신과 그 하위 경로를 모두 단독 계열로 본다. */
export function isNonCommonRoute(pathname: string): boolean {
  return NON_COMMON_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
