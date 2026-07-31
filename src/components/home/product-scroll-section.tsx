"use client";

import Image from "next/image";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

import { useIsomorphicLayoutEffect } from "@/lib/use-isomorphic-layout-effect";

gsap.registerPlugin(ScrollTrigger, SplitText);

/** TODO: placeholder product copy, replace with the real product claims. */
const TITLE = "지리산 화개골, 사람 손으로 딴 잎";
const BODY =
  "가와나의 차는 한 해 한 번, 곡우 전에 딴 어린 잎으로만 만듭니다.";
const STAT_ONE = "해발 500m 야생 차밭";
const STAT_TWO = "곡우 전에 딴 그 해 첫 잎";
const REFERENCE =
  "산지와 수확 시기는 자리를 보여주기 위한 예시 문구입니다. 실제 제품 정보로 교체해 주세요.";

/** How far the product is held back before the panel opens. */
const PRODUCT_SCALE_FROM = 0.78;

export function ProductScrollSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);
  const productRef = useRef<HTMLImageElement>(null);
  const bodyRef = useRef<HTMLParagraphElement>(null);
  const statOneRef = useRef<HTMLParagraphElement>(null);
  const statTwoRef = useRef<HTMLParagraphElement>(null);
  const referenceRef = useRef<HTMLParagraphElement>(null);

  useIsomorphicLayoutEffect(() => {
    const mm = gsap.matchMedia();

    mm.add(
      {
        isDesktop: "(min-width: 1024px)",
        reduce: "(prefers-reduced-motion: reduce)",
      },
      (context) => {
        const { isDesktop, reduce } = context.conditions as {
          isDesktop: boolean;
          reduce: boolean;
        };

        // The reference double-splits each paragraph so every line sits in its
        // own overflow-hidden wrapper. `mask: "lines"` is the built-in form.
        const splits = [
          bodyRef.current,
          statOneRef.current,
          statTwoRef.current,
        ].map((el) =>
          SplitText.create(el, { type: "lines", mask: "lines" }),
        );
        const [bodySplit, statOneSplit, statTwoSplit] = splits;
        const cleanup = () => splits.forEach((split) => split.revert());

        if (reduce) return cleanup;

        if (!isDesktop) {
          // Below 1024 the reference leaves the body copy in place and only
          // reveals the two statements as they enter.
          gsap.set([statOneSplit.lines, statTwoSplit.lines], { yPercent: 100 });
          gsap
            .timeline({
              scrollTrigger: { trigger: statOneRef.current, start: "center bottom" },
            })
            .to(statOneSplit.lines, { duration: 0.6, stagger: 0.2, yPercent: 0 })
            .to(
              statTwoSplit.lines,
              { duration: 0.6, stagger: 0.2, yPercent: 0 },
              "<+=0.5",
            );
          return cleanup;
        }

        gsap.set(
          [bodySplit.lines, statOneSplit.lines, statTwoSplit.lines],
          { yPercent: 100 },
        );
        gsap.set(referenceRef.current, { opacity: 0 });
        // Product starts held back and grows into its full size as the panel
        // opens, so arriving at centre reads as an emphasis rather than a slide.
        gsap.set(productRef.current, { scale: PRODUCT_SCALE_FROM });

        // Beat-for-beat copy of the reference timeline: eight sequential tweens
        // scrubbed across a 600vh section while the wrapper stays pinned.
        gsap
          .timeline({
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top top",
              end: "bottom bottom",
              pin: wrapperRef.current,
              scrub: true,
              invalidateOnRefresh: true,
            },
          })
          .to(detailsRef.current, { duration: 1 })
          .to(detailsRef.current, { duration: 1, width: "100%" })
          .to(productRef.current, { duration: 1, scale: 1, ease: "power2.out" }, "<")
          .to(detailsRef.current, { duration: 0, borderLeftColor: "transparent" })
          .to(bodySplit.lines, { duration: 1, yPercent: 0, stagger: 0.2 })
          .to(statOneSplit.lines, { duration: 1, stagger: 0.4, yPercent: 0 })
          .to(statTwoSplit.lines, { duration: 1, stagger: 0.4, yPercent: 0 })
          .to(referenceRef.current, { duration: 1, opacity: 1 })
          .to(detailsRef.current, { duration: 1 });

        return cleanup;
      },
      sectionRef,
    );

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      /* No pin under reduced motion, so the 600vh scroll runway collapses too. */
      className="relative overflow-hidden border-b border-header-line lg:h-[600vh] motion-reduce:lg:h-auto"
    >
      <div ref={wrapperRef} className="relative lg:h-screen">
        <div className="flex items-center px-4 py-20 lg:h-screen lg:w-1/2 lg:px-[4.6667vw] lg:py-0">
          <h2 className="mx-auto max-w-[425px] text-center text-[40px] leading-none tracking-[-0.01em] lg:mx-0 lg:max-w-none lg:text-left lg:text-[5.5556vw]">
            {TITLE}
          </h2>
        </div>

        {/* Half-width panel that opens to full bleed as the scroll begins. */}
        <div
          ref={detailsRef}
          className="relative bg-background lg:absolute lg:top-0 lg:right-0 lg:h-screen lg:w-1/2 lg:border-l lg:border-header-line"
        >
          {/* Product sits contained on white, as in the reference, rather than
              cropped to fill: the panel is the stage, the tin is the subject. */}
          <div className="relative flex h-[378px] items-center justify-center bg-background md:h-[520px] lg:absolute lg:inset-0 lg:h-full">
            <Image
              ref={productRef}
              src="/product-tin.jpg"
              alt="가와나 티하우스 차통"
              width={1024}
              height={1024}
              sizes="(min-width: 1024px) 48vh, 62vw"
              className="h-auto w-auto max-h-[72%] max-w-[62%] object-contain lg:max-h-[48vh] lg:max-w-none"
            />
          </div>

          <p
            ref={bodyRef}
            className="relative border-t border-header-line px-4 py-10 text-center text-[20px] leading-[1.2] lg:absolute lg:top-[16%] lg:left-1/2 lg:w-[300px] lg:-translate-x-1/2 lg:border-0 lg:p-0 lg:tracking-[-0.01em]"
          >
            {BODY}
          </p>

          {/* Static on desktop so the statements anchor to the panel itself. */}
          <div className="relative flex gap-px border-t border-header-line bg-black lg:static lg:block lg:gap-0 lg:border-0 lg:bg-transparent">
            <p
              ref={statOneRef}
              className="w-1/2 bg-background px-4 py-10 text-center text-[32px] leading-none tracking-[-0.01em] lg:absolute lg:top-1/2 lg:left-[5vw] lg:w-[28vw] lg:-translate-y-[40%] lg:bg-transparent lg:p-0 lg:text-left lg:text-[4.6vw]"
            >
              {STAT_ONE}
            </p>

            <p
              ref={statTwoRef}
              className="w-1/2 bg-background px-4 py-10 text-center text-[32px] leading-none tracking-[-0.01em] lg:absolute lg:top-1/2 lg:right-[5vw] lg:w-[28vw] lg:-translate-y-[40%] lg:bg-transparent lg:p-0 lg:text-left lg:text-[4.6vw]"
            >
              {STAT_TWO}
            </p>
          </div>

          <p
            ref={referenceRef}
            className="relative border-t border-header-line p-4 text-[10px] leading-[1.4] lg:absolute lg:right-7 lg:bottom-7 lg:max-w-[400px] lg:border-0 lg:p-0 lg:text-right"
          >
            {REFERENCE}
          </p>
        </div>
      </div>
    </section>
  );
}
