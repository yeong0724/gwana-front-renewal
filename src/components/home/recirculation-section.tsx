"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { AmbientVideo } from "@/components/common/ambient-video";
import { DisplayReveal } from "@/components/common/display-reveal";
import { GhostButton } from "@/components/common/ghost-button";
import { HeadlineLines } from "@/components/common/headline-lines";
import { BG, TEXT } from "@/constants/colors";
import { RECIRC } from "@/constants/home-content";
import { DISPLAY_SECTION } from "@/constants/typography";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

/**
 * 마지막 밴드. 푸터 바로 위에 놓인다.
 *
 * ### 왜 전면 배경 영상이 아닌가
 *
 * 소스가 **812×1444 세로 영상**이다. 1440×630 짜리 가로 밴드에 `object-cover`
 * 로 깔면 폭에 맞춰 1.77배 확대되어 세로 2560px 이 되고, 실제로 보이는 건
 * 원본의 약 25% 다. 나머지를 버리는 셈이라 촬영본이 아깝다.
 *
 * 그래서 **세로 비율을 그대로 살린 기둥**으로 세우고 왼쪽에 문장을 붙였다.
 * 세로 영상을 세로로 보여주는 건 잘린 것이 아니라 의도로 읽힌다.
 * 모바일(<1024px)에서는 화면 자체가 세로라 폭을 꽉 채워도 18% 만 잘린다.
 *
 * ### 배치 계열
 *
 * 앞의 밴드들(§6)과 겹치지 않는 유일한 형태다: **왼쪽 문장 + 오른쪽 세로
 * 미디어 기둥**. Finder 는 사진 두 장이 왼쪽에 어긋나게 놓이고, Promise 는
 * 글이 왼쪽 끝이며 사진이 둘로 흩어진다. 여기는 미디어가 하나의 기둥이다.
 *
 * ### 움직임
 *
 * 영상 기둥에만 ScrollSmoother 패럴랙스(0.92)를 건다. 문장은 제자리에 있고
 * 영상만 느리게 흘러, 스크롤이 끝나가는 구간에서 속도가 한 번 꺾인다.
 * 재생/정지와 `prefers-reduced-motion` 은 `AmbientVideo` 가 처리한다.
 */
export function RecirculationSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const columnRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const mm = gsap.matchMedia();

    mm.add(
      {
        isDesktop: "(min-width: 1024px)",
        // 여집합이 없으면 좁은 화면에서 콜백이 아예 불리지 않는다.
        isMobile: "(max-width: 1023px)",
        reduce: "(prefers-reduced-motion: reduce)",
      },
      (context) => {
        const { isDesktop, reduce } = context.conditions as {
          isDesktop: boolean;
          isMobile: boolean;
          reduce: boolean;
        };

        if (reduce || !isDesktop) return;

        const smoother = ScrollSmoother.get();
        if (!smoother || !columnRef.current) return;

        const effect = smoother.effects(columnRef.current, { speed: 0.92 })[0];
        ScrollTrigger.refresh();
        return () => effect?.kill();
      },
      sectionRef,
    );

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={cn(
        "px-4 py-20",
        "lg:grid lg:grid-cols-12 lg:items-center lg:gap-6 lg:px-6 lg:py-32",
        BG.surface,
      )}
    >
      <div className={cn("lg:col-span-5")}>
        <DisplayReveal>
          <h2 className={cn("lg:text-[3.2vw]", DISPLAY_SECTION, TEXT.ink)}>
            <HeadlineLines lines={RECIRC.headline} />
          </h2>
        </DisplayReveal>

        <GhostButton href={RECIRC.cta.href} className="mt-7">
          {RECIRC.cta.label}
        </GhostButton>
      </div>

      {/*
       * 세로 영상의 원본 비율(812:1444)을 그대로 쓴다. 폭은 칼럼이 정하고
       * 높이는 비율이 따라온다. 데스크톱에서 너무 길어지지 않도록 폭을
       * 420px 로 묶고 오른쪽 끝에 붙인다.
       */}
      <div
        ref={columnRef}
        className={cn(
          "mt-10 aspect-812/1444 w-full",
          "lg:col-span-6 lg:col-start-7 lg:mt-0 lg:ml-auto lg:max-w-105",
        )}
      >
        <AmbientVideo
          src="/home/gwana_main_video_1.mp4"
          label={RECIRC.videoLabel}
        />
      </div>
    </section>
  );
}
