/**
 * 사업자 정보와 법적 고지 링크의 단일 출처.
 *
 * 푸터와 약관/개인정보처리방침 페이지가 같은 값을 읽는다. 수치를 지어내지 않는다.
 * 값이 바뀌면 이 파일만 고친다.
 */

export type BusinessField = {
  term: string;
  detail: string;
  /** tel:/mailto: 같은 외부 스킴. PageTransition은 origin이 달라 가로채지 않는다. */
  href?: string;
};

/** 매장 주소. 푸터의 사업자 정보와 홈의 방문 안내가 같은 문자열을 읽는다. */
export const STORE_ADDRESS = "경남 하동군 화개면 목압길 24-2 (1층 관아수제차)";

/** 상호 / 대표 / 등록번호 / 소재지. */
export const BUSINESS_FIELDS: BusinessField[] = [
  { term: "상호명", detail: "관아수제차" },
  { term: "대표자", detail: "김정옥" },
  { term: "사업자등록번호", detail: "613-19-89889" },
  { term: "주소", detail: STORE_ADDRESS },
];

/**
 * TODO: 실제 영업시간으로 교체할 것. 아래는 자리표시 값이다.
 * 이 파일의 나머지(사업자 정보·연락처)는 실제 값이므로 섞이지 않게 주의한다.
 */
export const OPENING_HOURS: BusinessField[] = [
  { term: "월 - 금", detail: "09:00 - 18:00" },
  { term: "토요일", detail: "10:00 - 17:00" },
  { term: "일요일", detail: "휴무" },
];

/** 연락 수단. 전부 클릭 가능한 스킴을 붙인다. */
export const CONTACT_FIELDS: BusinessField[] = [
  { term: "전화", detail: "0507-1462-8041", href: "tel:0507-1462-8041" },
  { term: "휴대전화", detail: "010-5334-7785", href: "tel:010-5334-7785" },
  {
    term: "이메일",
    detail: "rud0243@naver.com",
    href: "mailto:rud0243@naver.com",
  },
];

/** 푸터 우측 셀. 헤더의 LOG IN / BAG 셀과 같은 폭·괘선을 쓴다. */
export const LEGAL_ITEMS = [
  { label: "이용약관", href: "/terms" },
  { label: "개인정보처리방침", href: "/privacy" },
] as const;

/** 로고 아래 한 줄. layout.tsx의 metadata.description과 같은 문장. */
export const BRAND_LINE = "지리산 화개골에서 손으로 딴 잎으로 만드는 차.";

/** 저작권 표기의 법인 표기명. */
export const LEGAL_ENTITY = "GWANA TEA HOUSE";
