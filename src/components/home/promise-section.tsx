import { DisplayReveal } from "@/components/common/display-reveal";
import { GhostButton } from "@/components/common/ghost-button";
import { HeadlineLines } from "@/components/common/headline-lines";
import { PlaceholderMedia } from "@/components/common/placeholder-media";
import { BG, TEXT } from "@/constants/colors";
import { PROMISE } from "@/constants/home-content";
import { BODY, DISPLAY_SECTION, LABEL_KO } from "@/constants/typography";
import { cn } from "@/lib/utils";

/**
 * 약속 섹션.
 *
 * 레퍼런스의 "Our promise to you". 글이 **왼쪽 끝**에 서고 사진 두 장이
 * 오른쪽으로 흐른다. 앞의 안내 섹션과 좌우가 뒤집힌 배치라 두 섹션이
 * 같은 형태로 반복되지 않는다.
 *
 * 두 번째 사진 아래에만 캡션이 붙는다. 사진 위에 라벨을 얹지 않는 것은
 * 레퍼런스와 같다.
 */
export function PromiseSection() {
  return (
    <section
      className={cn(
        "px-4 py-20",
        "lg:grid lg:grid-cols-12 lg:items-start lg:gap-6 lg:px-6 lg:py-32",
        BG.surface,
      )}
    >
      <div className={cn("lg:col-span-4 lg:pt-[6%]")}>
        <p className={cn(LABEL_KO, TEXT.muted)}>{PROMISE.eyebrow}</p>

        <DisplayReveal className="mt-3">
          <h2 className={cn("lg:text-[3.2vw]", DISPLAY_SECTION, TEXT.ink)}>
            <HeadlineLines lines={PROMISE.headline} />
          </h2>
        </DisplayReveal>

        <GhostButton href={PROMISE.cta.href} className="mt-7">
          {PROMISE.cta.label}
        </GhostButton>
      </div>

      <div className={cn("mt-10 aspect-16/10", "lg:col-span-5 lg:mt-0")}>
        <PlaceholderMedia label="덖는 작업 장면" note="1600 × 1000" />
      </div>

      <div className={cn("mt-4", "lg:col-span-3 lg:mt-0")}>
        <div className="aspect-4/5">
          <PlaceholderMedia label="봉투에 적는 날짜" note="1080 × 1350" />
        </div>
        <p className={cn("mt-3 max-w-[38ch]", BODY, TEXT.ink)}>
          {PROMISE.caption}
        </p>
      </div>
    </section>
  );
}
