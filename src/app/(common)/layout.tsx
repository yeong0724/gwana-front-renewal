import { SiteFooter } from "@/components/layout/site-footer";
import { cn } from "@/lib/utils";

/**
 * 공통 헤더 + 푸터를 쓰는 계열.
 *
 * 이 layout은 `#view`(= PageTransition) **안쪽**에서 렌더된다. 그래서 푸터는
 * 여기 두어도 본문과 함께 페이드되고, `<main>` 밖이라 contentinfo 랜드마크도
 * 유지된다(§9.D). 반대로 헤더는 fixed라 여기 둘 수 없다. root layout이 갖는다.
 *
 * 상단 패딩은 헤더 높이의 사본이다. 헤더 치수를 바꾸면 §9 표와 이 값이 함께
 * 움직여야 한다.
 */
export default function CommonLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {/* Clears the fixed bar: 48px + 8px inset on mobile, 60px on desktop. */}
      <main className={cn("pt-14", "lg:pt-15")}>{children}</main>
      <SiteFooter />
    </>
  );
}
