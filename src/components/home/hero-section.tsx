"use client";

import Image from "next/image";
import { useRef } from "react";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { BG, BORDER, SCRIM, TEXT } from "@/constants/colors";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger, CustomEase);

/*
 * 워드마크는 이름과 업종을 분리한 2단 락업이다. 한 줄에 같은 크기로 늘어놓으면
 * 브랜드 마크가 아니라 캡션처럼 읽힌다. 크기 차(약 8배)가 위계를 만든다.
 */
const WORDMARK = "관아수제차";
const WORDMARK_SUB = "TEA HOUSE";

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
 *
 * 좌우도 같은 문제가 있다. 마스크 폭은 글자의 advance 폭인데 w처럼 사선이 넓은
 * 글자는 획이 그 폭을 넘어가 잘린다. px로 넓히고 같은 값의 음수 mx로 되돌리면
 * 잘림만 사라지고 글자 간격과 위치는 그대로다.
 */
function WordmarkChars({ text }: { text: string }) {
  return text.split("").map((char, index) =>
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

        /*
         * 업종은 이름이 자리를 잡기 시작할 때 뒤따른다. 두 박자로 나눠야
         * 이름이 먼저 읽히고 업종이 그것을 받치는 순서로 보인다.
         */
        gsap.fromTo(
          ".hero-sub",
          { yPercent: 110 },
          {
            duration: 0.9,
            ease: "custom",
            delay: CHAR_STAGGER * WORDMARK.length + 0.15,
            yPercent: 0,
            force3D: false,
            clearProps: "transform",
          },
        );

        if (!isDesktop) return;

        /*
         * 사진은 히어로가 화면을 떠날 때까지 뷰포트에 고정되고, 워드마크와 그
         * 아래 제품 섹션만 그 위로 올라간다. 고정은 sticky도 fixed도 아닌
         * ScrollTrigger pin이다(§5: #smooth-content가 transform을 갖고 있어
         * 둘 다 뷰포트를 기준으로 잡지 못한다).
         *
         * pinSpacing은 꺼야 한다. 켜면 핀이 물린 100vh만큼 빈 공간이 섹션에
         * 덧대져 히어로가 200vh가 되고, 제품 섹션이 한 화면 아래로 밀린다.
         * 사진 래퍼는 이미 섹션 높이만큼 자리를 차지하고 있으므로 보정이
         * 필요 없다.
         *
         * 핀이 풀리는 지점(= 히어로 아래끝이 화면 위로 나가는 순간)에는 흰
         * 제품 섹션이 화면을 꽉 채우고 있다. 그래서 사진이 원래 자리로 돌아가는
         * 100vh짜리 점프가 화면에 보이지 않는다. end를 이보다 늦추면 그 점프가
         * 그대로 드러난다.
         */
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          pin: imageWrapRef.current,
          pinSpacing: false,
        });

        /*
         * 사진이 어두워진다. 레퍼런스는 30% 지점부터 opacity 1 → 0.6이지만,
         * 사진이 고정된 뒤로는 이 디밍이 유일한 스크롤 피드백이라 처음부터
         * 걸고 더 깊게(0.45) 내린다.
         *
         * opacity로 어두워지는 이유: 뒤에 깔린 것이 섹션의 검은 배경이다.
         * 보이는 사진 영역은 항상 "뷰포트 - 흰 제품 섹션" = 히어로의 남은
         * 부분과 정확히 겹치므로, 사진이 고정된 뒤에도 배경은 검정 그대로다.
         *
         * 패럴랙스(speed 0.85)는 뺐다. 핀과 같은 transform을 놓고 싸우고,
         * 고정된 사진에는 시차라는 개념 자체가 없다.
         */
        gsap.to(imageWrapRef.current, {
          ease: "none",
          opacity: 0.45,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      },
      sectionRef,
    );

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={cn(
        // overflow-hidden이 핀의 짝이다. 고정된 사진은 스크롤한 만큼 섹션 박스
        // 아래로 밀려나는데, 그 넘친 부분이 잘려 나가는 경계가 곧 제품 섹션이
        // 시작하는 선이다(섹션 아래끝 = 제품 섹션 위끝). 이걸 풀면 사진이 제품
        // 섹션의 배경 없는 왼쪽 절반을 뚫고 그대로 비친다.
        "relative h-svh overflow-hidden border-b",
        "lg:h-[calc(100vh+1px)]",
        BG.black,
        BORDER.line,
      )}
    >
      {/* 사진 레이어는 absolute가 아니라 흐름 안의 블록이다. ScrollTrigger는
          핀을 걸 때 요소를 pin-spacer 안으로 옮겨 넣고 거기서 크기를 재는데,
          `absolute inset-0`처럼 부모 박스에 기대어 크기가 정해지는 요소는
          그 순간 0x0으로 무너져 사진이 통째로 사라진다. 그래서 높이를 뷰포트
          단위로 직접 적고(부모와 무관) 폭은 흐름에서 받는다. 제품 섹션이 미는
          래퍼(`lg:h-screen` 블록)와 같은 형태다.

          모바일 인트로가 사진을 6rem 아래에서 끌어올린다. 그만큼 위로 덧대지
          않으면 그 시간 동안 검은 섹션 배경이 상단에 그대로 드러난다.
          (next/image의 fill은 img에 인라인 스타일을 쓰므로 래퍼에서 늘린다.) */}
      <div
        ref={imageWrapRef}
        className={cn(
          "relative -mt-24 h-[calc(100svh+6rem)]",
          "lg:mt-0 lg:h-[calc(100vh+1px)]",
        )}
      >
        <Image
          ref={imageRef}
          src="/home/main_2.webp"
          alt="산비탈에 층층이 이어진 가와나 차밭"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[50%_40%]"
        />
      </div>

      {/* 사진 밝은 부분에서 흰 글자 대비가 1.01:1까지 떨어진다. 아래쪽만 눌러준다. */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 h-[52%]",
          SCRIM.heroBottom,
        )}
      />

      {/* 사진이 흐름을 차지하므로 워드마크가 absolute로 자리를 바꿨다. */}
      <div className="absolute inset-0 flex items-end">
        <div className="w-full overflow-hidden pb-7 pl-5.5 pr-[12.5vw]">
          <h1
            aria-label={`${WORDMARK} ${WORDMARK_SUB}`}
            className={cn("font-wordmark", TEXT.white)}
          >
            {/* 이름. 큰 글자는 자간을 조여야 덩어리로 읽힌다. */}
            <span
              className={cn(
                "block whitespace-nowrap text-[14vw] leading-[0.82] font-extrabold",
                "lg:text-[6vw]",
              )}
            >
              <WordmarkChars text={WORDMARK} />
            </span>

            {/* 업종. 자간을 벌려 이름 아래를 받치는 선처럼 놓는다. */}
            <span
              className={cn(
                "mt-[-0.1em] ml-[0.7em] block overflow-hidden pt-[0.25em] pb-[0.06em] text-[3.4vw] leading-none font-medium tracking-[0.34em] uppercase",
                "lg:text-[2vw]",
              )}
            >
              <span className="hero-sub inline-block">{WORDMARK_SUB}</span>
            </span>
          </h1>
        </div>
      </div>
    </section>
  );
}
