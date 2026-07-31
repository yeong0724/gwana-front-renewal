"use client";

import Image from "next/image";
import { useRef } from "react";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { useIsomorphicLayoutEffect } from "@/lib/use-isomorphic-layout-effect";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, CustomEase);

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageWrapRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    // The reference registers this ease as "custom": cubic-bezier(.25,.1,.25,1).
    CustomEase.create("custom", "M0,0 C0.25,0.1 0.25,1 1,1");

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

        // Wordmark rises out of its mask along the bottom edge.
        gsap.fromTo(
          logoRef.current,
          { yPercent: 100 },
          { duration: 0.8, ease: "custom", yPercent: 0 },
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
      className="relative h-[100svh] overflow-hidden border-b border-header-line bg-black lg:h-[calc(100vh+1px)]"
    >
      <div ref={imageWrapRef} className="absolute inset-0">
        <Image
          ref={imageRef}
          src="/hero-tea-field.jpg"
          alt="산비탈에 층층이 이어진 가와나 차밭"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[50%_40%]"
        />
      </div>

      <div className="relative flex h-full items-end">
        <div className="w-full overflow-hidden pb-7 pl-[22px] pr-[12.5vw]">
          <div ref={logoRef}>
            <Image
              src="/gwana-logo.png"
              alt=""
              width={1726}
              height={676}
              priority
              sizes="(min-width: 1024px) 46vw, 70vw"
              className="w-[70vw] max-w-[560px] invert lg:w-[46vw]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
