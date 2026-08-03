import type { Metadata } from "next";

import { PlaceholderPage } from "@/components/layout/placeholder-page";

export const metadata: Metadata = {
  title: "개인정보처리방침 | gwana tea house",
};

export default function PrivacyPage() {
  return (
    <PlaceholderPage
      title="개인정보처리방침"
      note="처리방침 본문이 들어갈 자리입니다. 실제 수집 항목과 보유 기간을 모르는 상태로 쓰면 사실과 어긋나므로 비워 두었습니다. 확정본을 주시면 이 페이지에 옮깁니다."
    />
  );
}
