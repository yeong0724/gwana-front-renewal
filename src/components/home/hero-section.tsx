"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { BG, BORDER, OUTLINE, SCRIM, TEXT } from "@/constants/colors";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger, CustomEase);

/*
 * 히어로 문구는 세 단이다. 눈썹 → 이름 → 진입점.
 *
 * 이전에는 이름 아래에 업종("TEA HOUSE")을 자간 벌려 깔아 받침선처럼 썼다.
 * 그 자리를 버튼이 가져갔고, 업종은 이름 **위** 한 줄로 올라와 눈썹이 됐다.
 * 받침이 둘(업종 + 버튼)이면 이름이 가운데 끼어 무게가 흩어진다.
 */
const WORDMARK = "지리산이 품고 키운 찻잎";
const EYEBROW = "그 맑음을 그대로";

/** 히어로 진입점. 왼쪽이 주 동선(구매), 오른쪽이 보조(브랜드)다. */
const HERO_CTAS = [
  { label: "차 보러가기", href: "/shop" },
  { label: "브랜드 이야기", href: "/about" },
] as const;

/*
 * 레퍼런스(postevand.com) 실측: 워드마크 글자 10개가 각자 자기 높이의 110% 아래에서
 * 시작해 50ms 간격으로 하나씩 올라온다. 이징은 끝이 길게 늘어지는 형태라
 * 이 프로젝트가 이미 쓰는 "custom"(cubic-bezier(.25,.1,.25,1))과 같은 계열이다.
 */
const CHAR_STAGGER = 0.05;
const CHAR_DURATION = 1.2;

/*
 * 마지막 글자까지 다 올라오는 시각. 버튼은 그보다 반 박자 먼저 출발해서
 * 워드마크가 자리를 잡는 순간 함께 도착한다. 다 끝난 뒤에 시작하면
 * 인트로가 두 토막으로 끊긴다.
 */
const WORDMARK_SETTLED = CHAR_STAGGER * (WORDMARK.length - 1) + CHAR_DURATION;
const CTA_DELAY = WORDMARK_SETTLED - 0.5;

/** 인트로가 건드리는 것 전부. 끝날 때 한 프레임에 같이 원복한다. */
const INTRO_TARGETS = [".hero-eyebrow", ".hero-char", ".hero-cta"];

/**
 * 히어로 진입점의 공통 박스.
 *
 * 사진 위에 놓이므로 면색 없이 테두리만 쓰고, 색은 `border-current` /
 * `text-current`로 부모(흰 글자)에서 물려받는다. 팔레트 맵을 거치지 않는
 * 예외가 `transparent`와 `currentColor` 둘뿐이라는 규칙에 걸리지 않는다(§9.B).
 *
 * hover도 색이 아니라 투명도다. 사진 위에서 통하는 규칙이 그것뿐이라
 * 새 헤더가 쓰는 방식과 같게 맞췄다.
 */
const HERO_CTA = cn(
  "inline-flex h-11 items-center justify-center border border-current px-5 text-[13px] leading-none",
  "lg:h-12 lg:px-7 lg:text-[15px]",
  "transition-opacity duration-150 hover:opacity-70",
  "focus-visible:outline-2 focus-visible:outline-offset-2",
  OUTLINE.ring,
);

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
         * 인트로는 **하나의 타임라인**이다. 트윈 세 개를 따로 두면 안 되는
         * 이유가 아래 clearProps 때문이다.
         *
         * 원복(clearProps)은 공짜가 아니다. transform이 걸린 글자와 안 걸린
         * 글자는 브라우저가 다른 방식으로 그린다(합성 레이어 위 텍스트는 서브픽셀
         * 안티에일리어싱을 못 쓴다). 그래서 transform을 지우는 프레임마다 글자가
         * 한 번 다시 그려지며 굵기가 미세하게 바뀐다.
         *
         * 트윈마다 clearProps를 걸면 이 원복이 **스태거 간격대로 순차 발생**한다.
         * 워드마크 5글자가 50ms 간격으로, 버튼 2개가 80ms 간격으로 차례차례
         * 한 번씩 튄다. 다 올라온 직후에 떨리는 것처럼 보이는 정체가 이것이다.
         * 타임라인 끝에서 한 번에 지우면 여덟 번이 한 번이 된다.
         */
        /*
         * `force3D: false`. 글자를 GPU 레이어에 올리지 않는다.
         *
         * 여기까지 오는 데 세 번 갈아엎었고, 셋 다 같은 벽에 부딪혔다.
         * 이징(`cubic-bezier(.25,.1,.25,1)`)의 꼬리가 길어서 **마지막 0.5초 동안
         * 5px도 못 움직인다.** 프레임당 0.2px씩 기어가는 이 구간을 어떻게 그릴
         * 것이냐가 전부다.
         *
         *   1. force3D:true          → 합성기가 텍스처를 소수점 위치로 리샘플링.
         *                              기는 내내 반 픽셀 흐리다가 끝에서 격자에
         *                              딱 붙으며 초점이 맞는다.
         *   2. force3D:true + snap   → 정수 픽셀로만 움직이니 선명하지만, 한 칸이
         *                              여러 프레임 유지돼 계단처럼 툭툭 끊긴다.
         *   3. force3D:false (지금)  → 레이어에 안 올리므로 매 프레임 텍스트
         *                              래스터라이저가 글자를 **다시 그린다**.
         *                              소수점 위치도 힌팅·AA를 거쳐 그려지므로
         *                              리샘플링 같은 흐림이 없고, 계단도 없다.
         *                              대가는 프레임당 CPU 비용이다.
         *
         * 다 올라오면 transform이 translate(0,0)이라 아래 clearProps가 지워도
         * 화면이 바뀌지 않는다. 1·2번에 있던 "끝에서 한 번 튀는" 지점이 없다.
         *
         * 그래도 남는다면 남은 손잡이는 이징의 꼬리다(§ 아래 문서).
         */
        const intro = gsap.timeline({
          defaults: { ease: "custom", force3D: false },
          onComplete: () => {
            gsap.set(INTRO_TARGETS, { clearProps: "transform,opacity" });
          },
        });

        // 눈썹은 이름 위에 있으므로 먼저 도착한다(0.9s). 이름을 소개하는 줄이
        // 이름보다 늦게 뜨면 순서가 거꾸로 읽힌다.
        intro.fromTo(
          ".hero-eyebrow",
          { yPercent: 110 },
          { duration: 0.9, yPercent: 0 },
          0,
        );

        // 이름. 글자마다 자기 마스크 밖에서 올라온다.
        intro.fromTo(
          ".hero-char",
          { yPercent: 110 },
          { duration: CHAR_DURATION, stagger: CHAR_STAGGER, yPercent: 0 },
          0,
        );

        /*
         * 버튼은 마스크가 아니라 y + opacity다. 테두리가 있는 박스라 마스크로
         * 자르면 쉬는 상태에서도 1px 테두리가 반올림에 따라 잘려 보인다.
         */
        intro.fromTo(
          ".hero-cta",
          { y: 18, opacity: 0 },
          { duration: 0.7, stagger: 0.08, y: 0, opacity: 1 },
          CTA_DELAY,
        );

        /*
         * 사진은 히어로가 화면을 떠날 때까지 뷰포트에 고정되고, 워드마크와 그
         * 아래 제품 섹션만 그 위로 올라간다. 고정은 sticky도 fixed도 아닌
         * ScrollTrigger pin이다(§5: 데스크톱은 #smooth-content가 transform을
         * 갖고 있어 sticky도 fixed도 뷰포트를 기준으로 잡지 못한다).
         *
         * **데스크톱과 모바일 모두 건다.** 다만 ScrollTrigger가 고르는 방식이
         * 다르다. 데스크톱은 스무더가 있어 `pinType: "transform"`(요소를 흐름에
         * 둔 채 translate), 모바일은 스무더가 없어 `pinType: "fixed"`(요소를
         * 흐름에서 빼고 position:fixed)다. 후자는 요소가 흐름에서 빠지므로
         * 보통은 뒤 내용이 위로 튀는데, 여기서는 섹션 높이가 `h-svh`로 못 박혀
         * 있고 워드마크가 absolute라 흐름에 기대는 것이 하나도 없다. 그래서
         * pinSpacing 없이도 레이아웃이 그대로다.
         *
         * pinSpacing은 꺼야 한다. 켜면 핀이 물린 한 화면만큼 빈 공간이 섹션에
         * 덧대져 히어로가 두 배가 되고, 제품 섹션이 한 화면 아래로 밀린다.
         * 사진 래퍼는 이미 섹션 높이만큼 자리를 차지하고 있으므로 보정이
         * 필요 없다.
         *
         * 핀이 풀리는 지점(= 히어로 아래끝이 화면 위로 나가는 순간)에는 흰
         * 제품 섹션이 화면을 꽉 채우고 있다. 그래서 사진이 원래 자리로 돌아가는
         * 한 화면짜리 점프가 화면에 보이지 않는다. end를 이보다 늦추면 그 점프가
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
         * 걸고 더 깊게(0.45) 내린다. 핀과 한 몸이라 모바일에도 같이 건다.
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

      {/* 사진이 흐름을 차지하므로 문구 묶음이 absolute로 자리를 바꿨다.
          흰색은 여기서 한 번만 정하고 눈썹·이름·버튼이 전부 물려받는다.
          버튼 테두리의 `border-current`가 이 값을 읽는다. */}
      <div className="absolute inset-0 flex items-end">
        <div
          className={cn(
            "w-full overflow-hidden pb-7 pl-5.5 pr-[12.5vw]",
            TEXT.white,
          )}
        >
          {/* 눈썹. 이름을 소개하는 한 줄이라 이름 위에 놓인다.
              마스크(overflow-hidden)와 pt/pb는 워드마크 글자와 같은 이유다. */}

          {/* 이름. 큰 글자는 자간을 조여야 덩어리로 읽힌다. */}
          <h1 aria-label={WORDMARK} className="font-wordmark">
            <span
              className={cn(
                "block whitespace-nowrap text-[8vw] leading-[0.82] font-extrabold",
                "lg:text-[4vw]",
              )}
            >
              <WordmarkChars text={WORDMARK} />
            </span>
          </h1>

          <p
            className={cn(
              "overflow-hidden pt-[0.8em] pb-[0.06em] pl-[0.3em] text-[4vw] leading-none",
              "lg:text-[2vw] lg:pt-[0.5em]",
            )}
          >
            <span className="hero-eyebrow inline-block">{EYEBROW}</span>
          </p>

          {/* 진입점. 좁은 화면에서 두 칸이 안 들어가면 줄을 바꾼다. */}
          <div className={cn("mt-5 flex flex-wrap gap-2", "lg:mt-7 lg:gap-3")}>
            {HERO_CTAS.map(({ label, href }) => (
              <Link key={href} href={href} className={cn("hero-cta", HERO_CTA)}>
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
