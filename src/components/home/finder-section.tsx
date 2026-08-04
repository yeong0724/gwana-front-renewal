import { DisplayReveal } from "@/components/common/display-reveal";
import { GhostButton } from "@/components/common/ghost-button";
import { HeadlineLines } from "@/components/common/headline-lines";
import { PlaceholderMedia } from "@/components/common/placeholder-media";
import { BG, TEXT } from "@/constants/colors";
import { FINDER } from "@/constants/home-content";
import { BODY, DISPLAY_SECTION } from "@/constants/typography";
import { cn } from "@/lib/utils";

/**
 * 안내 섹션.
 *
 * 레퍼런스의 "Shoe finder" 자리. 사진 두 장이 **서로 다른 높이에서 어긋나게**
 * 놓이고 오른쪽에 문단이 붙는다. 이 어긋남이 이 페이지에서 유일한 비대칭
 * 배치라, 앞의 레일들과 뒤의 약속 섹션 사이에서 리듬을 바꾼다.
 *
 * 모바일에서는 어긋남을 버리고 사진 두 장을 나란히, 글은 아래로 내린다
 * (좁은 폭에서 세로 오프셋은 그냥 빈 자리로만 읽힌다).
 */
export function FinderSection() {
  return (
    <section
      className={cn(
        "px-4 py-20",
        "lg:grid lg:grid-cols-12 lg:items-start lg:gap-6 lg:px-6 lg:py-32",
        BG.surface,
      )}
    >
      <div className={cn("grid grid-cols-2 gap-3", "lg:contents")}>
        {/*
         * 두 사진의 **비율이 서로 다르다**(세로 4:5 / 가로 4:3). 같은 비율에
         * 폭만 다르게 두면 좁은 쪽이 훨씬 짧아져 아래가 통째로 빈다(실제
         * 렌더에서 확인). 비율을 어긋나게 잡아야 두 높이가 비슷해진다.
         */}
        <div className={cn("aspect-4/5", "lg:col-span-3")}>
          <PlaceholderMedia label="찻잔 클로즈업" note="1080 × 1350" />
        </div>

        {/* 두 번째 사진만 아래로 내려 어긋남을 만든다. */}
        <div className={cn("aspect-4/5", "lg:col-span-5 lg:mt-[18%] lg:aspect-4/3")}>
          <PlaceholderMedia label="차 우리는 장면" note="1600 × 1200" />
        </div>
      </div>

      <div className={cn("mt-10", "lg:col-span-4 lg:mt-0 lg:flex lg:flex-col")}>
        <DisplayReveal>
          <h2 className={cn("lg:text-[3.2vw]", DISPLAY_SECTION, TEXT.ink)}>
            <HeadlineLines lines={FINDER.headline} />
          </h2>
        </DisplayReveal>

        <p className={cn("mt-5 max-w-[42ch]", BODY, TEXT.ink)}>
          {FINDER.body}
        </p>

        <GhostButton href={FINDER.cta.href} className="mt-7 self-start">
          {FINDER.cta.label}
        </GhostButton>
      </div>
    </section>
  );
}
