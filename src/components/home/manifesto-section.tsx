import { DisplayReveal } from "@/components/common/display-reveal";
import { GhostButton } from "@/components/common/ghost-button";
import { BG, TEXT } from "@/constants/colors";
import { MANIFESTO } from "@/constants/home-content";
import { DISPLAY_MANIFESTO } from "@/constants/typography";
import { cn } from "@/lib/utils";

/**
 * 선언문.
 *
 * 이 페이지에서 **가운데 정렬을 쓰는 유일한 섹션**이다. 레퍼런스도 여기
 * 하나뿐이고, 사진도 이미지도 없이 문장만 놓아 앞뒤의 사진 섹션 사이에
 * 숨 쉴 자리를 만든다. 그래서 위아래 여백이 페이지에서 가장 크다.
 */
export function ManifestoSection() {
  return (
    <section
      className={cn(
        "flex flex-col items-center px-4 py-24 text-center",
        "lg:px-6 lg:py-32",
        BG.surface,
      )}
    >
      {/*
       * 폭을 `ch` 로 잡지 않는다. `ch` 는 "0" 글리프 폭이라 한글 한 글자가
       * 약 2ch 를 먹는다. 20ch 로 두면 한글 10자에서 줄이 꺾여 선언문이
       * 네 줄로 부서진다(실제 렌더에서 확인). px 로 고정한다.
       */}
      <DisplayReveal className="max-w-[860px]">
        <p className={cn(DISPLAY_MANIFESTO, "lg:text-[3.9vw]", TEXT.ink)}>
          {MANIFESTO.statement}
        </p>
      </DisplayReveal>

      <GhostButton href={MANIFESTO.cta.href} className="mt-10 lg:mt-12">
        {MANIFESTO.cta.label}
      </GhostButton>
    </section>
  );
}
