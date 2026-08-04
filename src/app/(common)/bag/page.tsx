import { PlaceholderPage } from "@/components/layout/placeholder-page";

/** 라벨은 CART, 라우트는 `/bag` 그대로다(§ constants/nav-items.ts). */
export default function BagPage() {
  return (
    <PlaceholderPage
      title="CART"
      note="담은 상품과 주문 요약이 들어갈 자리입니다. 장바구니 상태 연동 전이라 비어 있습니다."
    />
  );
}
