import { DisplayReveal } from "@/components/common/display-reveal";
import { HeadlineLines } from "@/components/common/headline-lines";
import { GhostButton } from "@/components/common/ghost-button";
import { PlaceholderMedia } from "@/components/common/placeholder-media";
import { SCRIM, TEXT } from "@/constants/colors";
import { EDITORIAL } from "@/constants/home-content";
import { DISPLAY_SECTION, LABEL_KO } from "@/constants/typography";
import { cn } from "@/lib/utils";

/**
 * 전면 사진 밴드.
 *
 * 히어로와 같은 구성(라벨 → 큰 문장 → 버튼, 왼쪽 아래)을 페이지 중간에서
 * 한 번 되풀이한다. 레퍼런스가 제품 레일 사이사이에 이 밴드를 끼워 리듬을
 * 끊는 방식이다. 다만 높이는 뷰포트보다 낮게(72vh) 잡아 히어로와 같은
 * 무게로 읽히지는 않게 했다.
 *
 * 사진은 아직 자리표시다. 에셋이 들어오면 `PlaceholderMedia` 를
 * `next/image` 로 바꾸고 `sizes="100vw"` 를 준다.
 */
export function EditorialBandSection() {
  return (
    <section className="relative h-[72svh] overflow-hidden lg:h-[78vh]">
      <div className="absolute inset-0">
        <PlaceholderMedia label="차밭 전경 · 가로컷" note="1920 × 1080" />
      </div>

      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 h-3/5",
          SCRIM.heroBottom,
        )}
      />

      <div
        className={cn(
          "relative flex h-full flex-col justify-end px-4 pb-8",
          "lg:px-6 lg:pb-10",
          TEXT.white,
        )}
      >
        <p className={cn(LABEL_KO)}>{EDITORIAL.eyebrow}</p>

        <DisplayReveal className="mt-2 lg:mt-3">
          <h2 className={cn("lg:text-[5.2vw]", DISPLAY_SECTION)}>
            <HeadlineLines lines={EDITORIAL.headline} />
          </h2>
        </DisplayReveal>

        <div className={cn("mt-6 flex flex-wrap gap-2", "lg:mt-8")}>
          <GhostButton href={EDITORIAL.primary.href} variant="onImage">
            {EDITORIAL.primary.label}
          </GhostButton>
          <GhostButton href={EDITORIAL.secondary.href} variant="onImage">
            {EDITORIAL.secondary.label}
          </GhostButton>
        </div>
      </div>
    </section>
  );
}
