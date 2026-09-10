import { HEADER_OFFSET } from "@/constants/nav-items";
import { cn } from "@/lib/utils";

/**
 * 단독 헤더를 쓰는 계열. 푸터가 없다.
 *
 * 푸터를 붙이려면 여기에 `<SiteFooter />`를 한 줄 추가하면 된다. 어느 계열이
 * 푸터를 쓰는지가 파일 구조로 드러나게 하려고 root가 아니라 계열 layout이
 * 푸터를 갖는다(§9.E).
 *
 * 상단 패딩은 PaymentHeader가 SiteHeader와 같은 높이라서 값이 같다. 결제
 * 헤더 높이를 따로 가져갈 때 고칠 곳은 이 파일뿐이다.
 */
export default function NonCommonLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <main className={cn(HEADER_OFFSET)}>{children}</main>;
}
