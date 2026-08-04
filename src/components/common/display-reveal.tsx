"use client";

import { useRef } from "react";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);

/**
 * 디스플레이 헤드라인이 줄 단위로 마스크 밖에서 올라온다.
 *
 * **왜 넣었나**: 레퍼런스는 섹션마다 사진과 큰 문장 하나로 이야기를 끊어 간다.
 * 줄이 순서대로 들어오면 그 끊김이 읽기 순서와 같아진다(= 위계와 전개).
 * 장식이 아니라 순서를 만드는 장치라서 헤드라인에만 쓰고, 본문·라벨에는 안 쓴다.
 *
 * 마스크가 없으면 올라오기 전 글자가 그대로 보이므로 SplitText 의
 * `mask: "lines"` 로 줄마다 클립 상자를 만든다(GSAP 3.13+ 내장. 예전처럼
 * SplitText 를 두 번 부를 필요가 없다).
 *
 * 폰트가 바뀌면 줄바꿈 위치가 바뀌므로 `document.fonts.ready` 뒤에 나눈다.
 * 그 전에 나누면 폴백 폰트 기준으로 잘린 줄이 그대로 굳는다.
 */
export function DisplayReveal({
  children,
  className,
  /** 같은 섹션에서 여러 덩어리를 순서대로 들일 때. 초 단위. */
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const target = ref.current;
    if (!target) return;

    CustomEase.create("custom", "M0,0 C0.25,0.1 0.25,1 1,1");

    let split: SplitText | undefined;
    let cancelled = false;
    const mm = gsap.matchMedia();

    void document.fonts.ready.then(() => {
      if (cancelled) return;

      mm.add(
        {
          // 여집합이 없으면 조건이 하나도 맞지 않는 사용자에게 콜백이
          // 아예 불리지 않아 헤드라인이 숨은 채로 남는다.
          motion: "(prefers-reduced-motion: no-preference)",
          reduce: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { reduce } = context.conditions as { reduce: boolean };
          if (reduce) return;

          split = SplitText.create(target, { type: "lines", mask: "lines" });

          gsap.from(split.lines, {
            yPercent: 110,
            duration: 1,
            delay,
            ease: "custom",
            stagger: 0.09,
            force3D: false,
            // 끝난 뒤 인라인 transform 이 남으면 줄이 합성 레이어에 머물러
            // 서브픽셀 안티에일리어싱을 잃는다. 평범한 텍스트로 되돌린다.
            clearProps: "transform",
            scrollTrigger: {
              trigger: target,
              start: "top 85%",
              once: true,
            },
          });

          return () => split?.revert();
        },
        ref,
      );
    });

    return () => {
      cancelled = true;
      mm.revert();
      split?.revert();
    };
  }, [delay]);

  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  );
}
