"use client";

import Image from "next/image";
import { useRef } from "react";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

import { GhostButton } from "@/components/common/ghost-button";
import { HeadlineLines } from "@/components/common/headline-lines";
import { BG, SCRIM, TEXT } from "@/constants/colors";
import { HERO } from "@/constants/home-content";
import { DISPLAY_HERO, LABEL_KO } from "@/constants/typography";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText, CustomEase);

/**
 * 히어로.
 *
 * 레퍼런스 구성 그대로: 사진이 뷰포트를 가득 채우고, 왼쪽 아래에
 * `모노 라벨 → 큰 문장 → 버튼 두 개` 가 쌓인다. 가운데 정렬을 쓰지 않는다.
 *
 * 사진은 홈 최상단 하나만 실제 에셋(`/home/main_2.webp`)을 쓴다.
 *
 * ### 움직임이 하는 일
 *
 * | 트윈            | 이유                                                    |
 * | --------------- | ------------------------------------------------------- |
 * | 사진 드리프트   | 정지 사진이 아니라 장면이라는 신호. 도착 순간에만 1.4초 |
 * | 줄 마스크 리빌  | 라벨 → 문장 → 버튼의 읽기 순서를 시간축으로 옮긴다      |
 * | 스크롤 디밍     | 아래 섹션으로 넘어갈 때 사진이 배경으로 물러난다        |
 * | 패럴랙스 0.85   | 사진이 본문보다 느리게 흘러 깊이가 생긴다               |
 *
 * 넷 다 `prefers-reduced-motion` 에서 통째로 꺼진다.
 */
export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageWrapRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    CustomEase.create("custom", "M0,0 C0.25,0.1 0.25,1 1,1");

    const mm = gsap.matchMedia();
    let split: SplitText | undefined;

    mm.add(
      {
        isDesktop: "(min-width: 1024px)",
        // 여집합이 없으면 좁은 화면에서는 맞는 조건이 하나도 없어
        // gsap이 콜백 자체를 부르지 않는다. 아래 모바일 분기가 죽는다.
        isMobile: "(max-width: 1023px)",
        reduce: "(prefers-reduced-motion: reduce)",
      },
      (context) => {
        const { isDesktop, reduce } = context.conditions as {
          isDesktop: boolean;
          isMobile: boolean;
          reduce: boolean;
        };

        if (reduce) return;

        // 도착 시 카메라가 미세하게 내려앉는다.
        gsap.fromTo(
          imageRef.current,
          { objectPosition: "50% 44%", scale: 1.06 },
          {
            duration: 1.4,
            ease: "custom",
            objectPosition: "50% 50%",
            scale: 1,
          },
        );

        // 라벨 → 헤드라인 줄 → 버튼. 읽는 순서 그대로 들어온다.
        const headline = copyRef.current?.querySelector(".hero-headline");
        if (headline) {
          split = SplitText.create(headline, { type: "lines", mask: "lines" });
          gsap.from(split.lines, {
            yPercent: 110,
            duration: 1.1,
            delay: 0.15,
            ease: "custom",
            stagger: 0.1,
            force3D: false,
            clearProps: "transform",
          });
        }

        gsap.from(".hero-eyebrow", {
          yPercent: 110,
          duration: 0.7,
          ease: "custom",
          force3D: false,
          clearProps: "transform",
        });

        gsap.from(".hero-cta", {
          opacity: 0,
          y: 12,
          duration: 0.7,
          delay: 0.75,
          ease: "custom",
          stagger: 0.08,
          clearProps: "transform,opacity",
        });

        if (!isDesktop) return;

        // 사진은 히어로의 30% 지점부터 위로 빠져나갈 때까지 60%로 눌린다.
        gsap.to(imageWrapRef.current, {
          ease: "none",
          opacity: 0.6,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top+=30% top",
            end: "bottom top",
            scrub: true,
          },
        });

        // ScrollSmoother 패럴랙스: 사진이 페이지 속도의 0.85배로 흐른다.
        const smoother = ScrollSmoother.get();
        if (!smoother || !imageWrapRef.current) return;

        const effect = smoother.effects(imageWrapRef.current, {
          speed: 0.85,
        })[0];
        ScrollTrigger.refresh();
        return () => effect?.kill();
      },
      sectionRef,
    );

    return () => {
      mm.revert();
      split?.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className={cn("relative h-svh overflow-hidden", "lg:h-dvh", BG.ink)}
    >
      <div ref={imageWrapRef} className="absolute inset-0">
        <Image
          ref={imageRef}
          src="/home/main_1.webp"
          alt="지리산 화개골의 차밭"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[50%_50%]"
        />
      </div>

      {/* 사진 밝은 부분에서 흰 글자 대비가 1.01:1까지 떨어진다. 아래쪽만 눌러준다. */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 h-[58%]",
          SCRIM.heroBottom,
        )}
      />

      <div
        ref={copyRef}
        className={cn(
          "relative flex h-full flex-col justify-end px-4 pb-8",
          "lg:px-6 lg:pb-10",
          TEXT.white,
        )}
      >
        <p className="overflow-hidden pb-[0.15em]">
          <span className={cn(LABEL_KO, "hero-eyebrow inline-block")}>
            {HERO.eyebrow}
          </span>
        </p>

        {/* 줄 수는 카피가 정한다(§ components/common/headline-lines.tsx). */}
        <h1
          className={cn(
            "hero-headline mt-2",
            "lg:mt-3 lg:text-[6.1vw]",
            DISPLAY_HERO,
          )}
        >
          <HeadlineLines lines={HERO.headline} />
        </h1>

        <div className={cn("mt-6 flex flex-wrap gap-2", "lg:mt-8")}>
          <GhostButton
            href={HERO.primary.href}
            variant="onImage"
            className="hero-cta"
          >
            {HERO.primary.label}
          </GhostButton>
          <GhostButton
            href={HERO.secondary.href}
            variant="onImage"
            className="hero-cta"
          >
            {HERO.secondary.label}
          </GhostButton>
        </div>
      </div>
    </section>
  );
}
