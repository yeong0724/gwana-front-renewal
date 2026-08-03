"use client";

import Image from "next/image";
import { useRef } from "react";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { BG, BORDER, TEXT } from "@/constants/colors";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, CustomEase);

const WORDMARK = "Gwana Tea House";

/*
 * 레퍼런스(postevand.com) 실측: 워드마크 글자 10개가 각자 자기 높이의 110% 아래에서
 * 시작해 50ms 간격으로 하나씩 올라온다. 이징은 끝이 길게 늘어지는 형태라
 * 이 프로젝트가 이미 쓰는 "custom"(cubic-bezier(.25,.1,.25,1))과 같은 계열이다.
 */
const CHAR_STAGGER = 0.05;
const CHAR_DURATION = 1.2;

/**
 * 글자마다 개별 마스크를 씌운다. 마스크가 없으면 올라오기 전 글자가 그대로 보인다.
 *
 * 마스크 높이는 leading-[0.85]가 정하는 줄상자다. 폰트의 어센더는 그보다 위로
 * 넘치므로(140px 기준 약 20px) pt 없이는 대문자 윗부분이 잘린다. pt는 위로만
 * 자라고 워드마크는 아래 정렬이라 글자 위치는 그대로다.
 * pb는 하강부(g, y, p 같은 글자) 여유다. 지금 문구엔 없지만 문구가 바뀔 수 있다.
 */
function WordmarkChars() {
  return WORDMARK.split("").map((char, index) =>
    char === " " ? (
      <span key={index} aria-hidden className="inline-block w-[0.26em]" />
    ) : (
      <span
        key={index}
        aria-hidden
        className="inline-block overflow-hidden pt-[0.2em] pb-[0.06em] align-bottom"
      >
        <span className="hero-char inline-block">{char}</span>
      </span>
    ),
  );
}

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageWrapRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useIsomorphicLayoutEffect(() => {
    // The reference registers this ease as "custom": cubic-bezier(.25,.1,.25,1).
    CustomEase.create("custom", "M0,0 C0.25,0.1 0.25,1 1,1");

    const mm = gsap.matchMedia();

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

        // Opening camera drift over the photo.
        if (isDesktop) {
          gsap.fromTo(
            imageRef.current,
            { objectPosition: "50% 32%" },
            { duration: 1.5, ease: "custom", objectPosition: "50% 40%" },
          );
        } else {
          gsap.fromTo(
            imageRef.current,
            { y: "6rem" },
            { duration: 1.5, ease: "custom", y: "0rem" },
          );
        }

        /*
         * Wordmark rises out of its mask one character at a time.
         *
         * 끝난 뒤 인라인 transform이 남으면 글자가 합성 레이어에 머문다. 합성
         * 레이어의 텍스트는 서브픽셀 안티에일리어싱을 못 쓰고, 레이어가 승격/해제
         * 되는 프레임에서 다시 래스터화되며 한 번 튄다. force3D를 끄고(3D 승격
         * 자체를 안 만든다) 끝나면 transform을 지워 평범한 텍스트로 되돌린다.
         */
        gsap.fromTo(
          ".hero-char",
          { yPercent: 110 },
          {
            duration: CHAR_DURATION,
            ease: "custom",
            stagger: CHAR_STAGGER,
            yPercent: 0,
            force3D: false,
            clearProps: "transform",
          },
        );

        if (!isDesktop) return;

        // Photo dims to 60% from 30% into the hero until it leaves the top.
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

        // ScrollSmoother parallax: the photo travels at 0.85 of page speed.
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

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={cn(
        "relative h-svh overflow-hidden border-b",
        "lg:h-[calc(100vh+1px)]",
        BG.black,
        BORDER.line,
      )}
    >
      {/* 모바일 인트로가 사진을 6rem 아래에서 끌어올린다. 그만큼 위로 덧대지
          않으면 그 시간 동안 검은 섹션 배경이 상단에 그대로 드러난다.
          (next/image의 fill은 img에 인라인 스타일을 쓰므로 래퍼에서 늘린다.) */}
      <div
        ref={imageWrapRef}
        className={cn(
          "absolute inset-0",
          "max-lg:-top-24 max-lg:h-[calc(100%+6rem)]",
        )}
      >
        <Image
          ref={imageRef}
          src="/home/main_1.jpg"
          alt="산비탈에 층층이 이어진 가와나 차밭"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[50%_40%]"
        />
      </div>

      <div className="relative flex h-full items-end">
        <div className="w-full overflow-hidden pb-7 pl-5.5 pr-[12.5vw]">
          <h1
            aria-label={WORDMARK}
            className={cn(
              "whitespace-nowrap font-wordmark text-[11vw] font-bold leading-[0.85] tracking-[-0.02em]",
              "lg:text-[10vw]",
              TEXT.white,
            )}
          >
            <WordmarkChars />
          </h1>
        </div>
      </div>
    </section>
  );
}
