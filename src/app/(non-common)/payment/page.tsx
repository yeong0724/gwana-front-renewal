import type { Metadata } from "next";

import { PlaceholderPage } from "@/components/layout/placeholder-page";

export const metadata: Metadata = {
  title: "결제 | gwana tea house",
};

export default function PaymentPage() {
  return (
    <PlaceholderPage
      title="PAYMENT"
      note="결제 페이지 자리입니다. 단독 헤더를 쓰고 푸터가 없는 (non-common) 계열입니다."
    />
  );
}
