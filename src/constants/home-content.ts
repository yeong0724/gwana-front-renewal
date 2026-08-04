/**
 * 홈 화면의 카피와 자리표시 목록.
 *
 * **수치를 지어내지 않는다.** 아직 확정되지 않은 값(가격, 수확일, 함량)은
 * 그럴듯한 숫자로 채우는 대신 "준비 중" 으로 남긴다. 한번 채워 두면 진짜
 * 값으로 교체되지 않은 채 배포되기 때문이다.
 *
 * 차 등급명(우전·세작·중작 등)은 지어낸 이름이 아니라 국내에서 실제로 쓰는
 * 채엽 시기 구분이다.
 */

export type ProductStub = {
  name: string;
  variant: string;
  /** 값이 확정되기 전까지의 표시. 확정되면 이 필드를 가격 문자열로 바꾼다. */
  price: string;
  /** `public/product/` 의 실제 촬영본. */
  image: string;
  isNew?: boolean;
};

/** 가격이 정해지기 전 자리. */
const PRICE_TBD = "준비 중";

/**
 * 헤드라인은 **줄 단위 배열**로 적는다.
 *
 * `\n` + `whitespace-pre-line` 로 두면 SplitText 가 줄을 다시 나누면서
 * 개행이 사라진다(실제 렌더에서 2줄 헤드라인이 1줄로 붙는 것을 확인).
 * 줄마다 블록 요소로 내보내면 SplitText 가 그 경계를 그대로 한 줄로 잡는다.
 */
export const HERO = {
  eyebrow: "화개골 수제차",
  headline: ["관아수제차"],
  primary: { label: "차 보러가기", href: "/shop" },
  secondary: { label: "브랜드 이야기", href: "/about" },
} as const;

/**
 * 실제 촬영본 5장에 맞춰 5칸이다. 칸 수는 항상 물건 수와 같아야 한다.
 *
 * **이름은 포장에서 읽어낸 것만 적었다.**
 * `product_3` 만 "매화꽃차 / Plum Blossom" 이 또렷하게 인쇄돼 있고, 나머지
 * 넷은 한자 로고(觀雅)와 브랜드명까지만 판독된다. 그래서 개별 차 이름을
 * 지어내지 않고 브랜드명 + 포장 설명으로 두었다.
 *
 * **확인이 필요한 것**: product_2 / product_4 / product_5 의 차 이름.
 * 받으면 `name` 만 바꾸면 된다.
 */
export const SEASON_RAIL = {
  label: "이번 절기의 차",
  linkLabel: "전체 보기",
  linkHref: "/shop",
  items: [
    {
      name: "관아수제차 선물세트",
      variant: "지함 + 차통 구성",
      price: PRICE_TBD,
      image: "/product/product_1.webp",
      isNew: true,
    },
    {
      name: "매화꽃차",
      variant: "Plum Blossom",
      price: PRICE_TBD,
      image: "/product/product_3.webp",
      isNew: true,
    },
    {
      name: "관아수제차",
      variant: "녹색 지함",
      price: PRICE_TBD,
      image: "/product/product_2.webp",
    },
    {
      name: "관아수제차",
      variant: "청색 지함",
      price: PRICE_TBD,
      image: "/product/product_4.webp",
    },
    {
      name: "관아수제차",
      variant: "연녹색 지함",
      price: PRICE_TBD,
      image: "/product/product_5.webp",
    },
  ] satisfies ProductStub[],
} as const;

export const MANIFESTO = {
  statement: "손으로 딴 잎. 한 솥씩 덖는 법. 계절이 정하는 맛.",
  cta: { label: "브랜드 이야기", href: "/about" },
} as const;

export const CATEGORY_RAIL = {
  label: "분류별로 보기",
  linkLabel: "전체 보기",
  linkHref: "/shop",
  items: [
    { name: "녹차", href: "/shop" },
    { name: "발효차", href: "/shop" },
    { name: "말차", href: "/shop" },
    { name: "다구", href: "/shop" },
    { name: "선물세트", href: "/shop" },
    { name: "묵은 차", href: "/shop" },
  ],
} as const;

export const EDITORIAL = {
  eyebrow: "우전",
  headline: ["곡우 전에 딴", "첫 잎"],
  primary: { label: "구매하기", href: "/shop" },
  secondary: { label: "읽어보기", href: "/about" },
} as const;

export const FINDER = {
  headline: ["어떤 차부터", "시작할지 모르겠다면"],
  body: "우려내는 온도와 마시는 시간만 정하면 됩니다. 취향에 맞는 잎을 골라 드립니다.",
  cta: { label: "차 고르기", href: "/shop" },
} as const;

export const PROMISE = {
  eyebrow: "우리의 약속",
  headline: ["좋은 잎.", "정직한 값.", "투명한 과정."],
  cta: { label: "약속 읽기", href: "/about" },
  caption:
    "잎을 딴 날과 덖은 날을 봉투에 적습니다. 좋은 해와 그렇지 않은 해를 같은 값으로 팔지 않습니다.",
} as const;

export const RECIRC = {
  headline: ["차는 오래 마시는 것입니다.", "우리도 그렇게 하려고 합니다."],
  cta: { label: "만드는 사람들", href: "/about" },
  /** 스크린리더용. 영상이 무엇을 보여주는지 한 줄로. */
  videoLabel: "차를 덖고 우려 내는 과정을 담은 영상",
} as const;
