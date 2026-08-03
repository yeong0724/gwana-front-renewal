import type { Metadata } from "next";

import { PlaceholderPage } from "@/components/layout/placeholder-page";

export const metadata: Metadata = {
  title: "이용약관 | gwana tea house",
};

export default function TermsPage() {
  return (
    <PlaceholderPage
      title="이용약관"
      note="약관 본문이 들어갈 자리입니다. 법적 효력이 있는 문서라 지어내지 않았습니다. 확정된 조문을 주시면 이 페이지에 옮깁니다."
    />
  );
}
