import Link from "next/link";

import { MediaRail } from "@/components/common/media-rail";
import { PlaceholderMedia } from "@/components/common/placeholder-media";
import { OUTLINE, SCRIM, TEXT } from "@/constants/colors";
import { CATEGORY_RAIL } from "@/constants/home-content";
import { TITLE_ITEM } from "@/constants/typography";
import { cn } from "@/lib/utils";

/**
 * 카테고리 타일.
 *
 * 제품 타일과 뼈대는 같지만 **글자가 사진 안에** 들어간다는 점이 다르다.
 * 그래서 세로로 더 길고(3:4), 라벨 뒤에 아래에서 올라오는 가림막을 깐다.
 * 두 레일이 같은 모양으로 반복되지 않게 하는 것도 이 차이가 하는 일이다.
 */
function CategoryTile({ name, href }: { name: string; href: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "group/tile relative block aspect-3/4 overflow-hidden",
        "focus-visible:outline-2 focus-visible:-outline-offset-2",
        OUTLINE.ring,
      )}
    >
      <PlaceholderMedia
        label={`${name} 분위기컷`}
        note="1080 × 1440"
        className="transition-transform duration-500 group-hover/tile:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover/tile:scale-100"
      />

      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 h-1/2",
          SCRIM.heroBottom,
        )}
      />

      <h3
        className={cn(
          "absolute right-3 bottom-3 left-3",
          TITLE_ITEM,
          TEXT.white,
        )}
      >
        {name}
      </h3>
    </Link>
  );
}

export function CategoryRailSection() {
  return (
    <MediaRail
      label={CATEGORY_RAIL.label}
      linkHref={CATEGORY_RAIL.linkHref}
      linkLabel={CATEGORY_RAIL.linkLabel}
      perView={6}
    >
      {CATEGORY_RAIL.items.map((item) => (
        <CategoryTile key={item.name} {...item} />
      ))}
    </MediaRail>
  );
}
