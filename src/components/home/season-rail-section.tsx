import Image from "next/image";

import { MediaRail } from "@/components/common/media-rail";
import { BG, TEXT } from "@/constants/colors";
import { SEASON_RAIL, type ProductStub } from "@/constants/home-content";
import { PRODUCT_LINE, PRODUCT_PRICE } from "@/constants/typography";
import { cn } from "@/lib/utils";

/**
 * 제품 타일. 레퍼런스 실측(1440 뷰포트, 카드 287×375)을 그대로 옮겼다.
 *
 * ```
 * ┌─────────────────────────┐ ← 카드 287 × 375
 * │ New                     │ y+17   모노 12px w400 lh18, 잉크색(빨강 아님)
 * │        [사진]            │        287×287 정사각, object-contain, 여백 0
 * ├─────────────────────────┤ y+287  사진 아래끝
 * │ 이름                     │ y+286  15px w500 lh18   ← 위 여백 0
 * │ 구성                     │ y+304  15px w500 lh18   ← 이름과 같은 벌
 * │                         │        ↕ 16 (가격 위 여백)
 * │ 가격                     │ y+338  12px w400 lh16.8
 * └─────────────────────────┘        ↕ 20 (카드 아래 여백)
 *   ↑ 좌우 여백 24
 * ```
 *
 * 287 + 18 + 18 + 16 + 16.8 + 20 = 375.8 → 카드 높이 375 와 맞는다.
 *
 * 놓치기 쉬운 세 가지:
 *
 * 1. **사진 영역은 정사각이다.** 4:5 가 아니다.
 * 2. **이름과 구성명은 크기·굵기·색이 같다.** 위계는 순서가 만든다.
 * 3. **"New" 는 강조색이 아니다.** 잉크색 소문자다. 레퍼런스가 빨강을 쓰는
 *    곳은 할인가 하나뿐이다.
 *
 * ### 왜 `object-contain` 인가, 그리고 왜 아직 꽉 안 차는가
 *
 * 레퍼런스 제품컷은 **정사각 + 누끼**라 정사각 틀을 그대로 채운다(실측에서도
 * `object-fit: contain` + 여백 0 이다). 우리 촬영본은 **세로 사진 + 배경**이고
 * 비율이 0.442 ~ 0.748 로 제각각이라, 짧은 쪽에 맞춰 들어가면서 좌우에
 * 타일색 띠가 남는다.
 *
 * | 사진      | 비율  | 정사각 틀 채움율 | 좌우 띠 |
 * | --------- | ----- | ---------------- | ------- |
 * | product_1 | 0.748 | 74.8%            | 36px    |
 * | product_2 | 0.662 | 66.2%            | 49px    |
 * | product_3 | 0.442 | 44.2%            | 80px    |
 * | product_4 | 0.660 | 66.0%            | 49px    |
 * | product_5 | 0.645 | 64.5%            | 51px    |
 *
 * **`object-cover` 로 채우는 건 불가능하다.** 정사각 틀에 cover 를 걸면 세로가
 * 잘리는데, 지함은 위아래 17~25% 씩 날아가고 매화꽃차 병(0.442)은 56% 가
 * 사라진다.
 *
 * **해결은 에셋 쪽이다.** 원본이 1:1 이면 contain 이 틀을 100% 채우고 띠가
 * 사라진다. 단, 세로 사진을 단색으로 패딩해 정사각을 만드는 것으로는 안 된다
 * (촬영본 배경이 그라데이션이라 실측 모서리색이 #e1d9c5 ~ #fbf5f4 로 흩어져
 * 있어 이음매가 보인다). 정사각으로 다시 앉히거나 누끼를 따야 한다.
 *
 * 그때까지는 띠가 남더라도 **잘리지 않는 쪽**을 택한다. 카드 비율은
 * 레퍼런스(287×375)와 같게 유지된다.
 */
function ProductTile({ name, variant, price, image, isNew }: ProductStub) {
  return (
    <article
      className={cn(
        "flex h-full flex-col",
        BG.tile,
        "border-0.2 border-gray-200 border-solid",
      )}
    >
      <div className="relative aspect-square">
        {isNew ? (
          // 좌표는 아래 글 블록의 좌측 여백과 같은 24px 축에 맞춘다.
          <span
            className={cn(
              PRODUCT_PRICE,
              // 실측: x+24 / y+17, line-height 18px. 가격(16.8)과 다르다.
              "absolute top-[17px] left-6 z-10 leading-[18px]",
              TEXT.ink,
            )}
          >
            New
          </span>
        ) : null}
        <Image
          src={image}
          alt={`${name} ${variant}`}
          fill
          /* 타일은 데스크톱에서 화면의 1/5, 태블릿 38vw, 모바일 76vw 다. */
          sizes="(min-width: 1024px) 20vw, (min-width: 768px) 38vw, 76vw"
          className="object-contain"
        />
      </div>

      {/*
       * 위 여백 0. 레퍼런스는 글 블록이 사진 아래 경계에서 그대로 시작한다
       * (실측 이름 y+286, 사진 아래끝 y+287). 여기에 여유를 주면 카드가
       * 길어지면서 레일 전체의 비례가 어긋난다.
       */}
      <div className="px-6 py-5">
        <h3 className={cn(PRODUCT_LINE, TEXT.ink)}>{name}</h3>
        <p className={cn(PRODUCT_LINE, TEXT.ink)}>{variant}</p>
        <p className={cn(PRODUCT_PRICE, "mt-4", TEXT.ink)}>{price}</p>
      </div>
    </article>
  );
}

export function SeasonRailSection() {
  return (
    <MediaRail
      label={SEASON_RAIL.label}
      linkHref={SEASON_RAIL.linkHref}
      linkLabel={SEASON_RAIL.linkLabel}
      perView={5}
      leadIn
    >
      {SEASON_RAIL.items.map((item) => (
        <ProductTile key={item.image} {...item} />
      ))}
    </MediaRail>
  );
}
