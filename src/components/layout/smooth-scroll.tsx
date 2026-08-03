"use client";

import gsap from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

/**
 * Rendered as the first child of `#smooth-content` on purpose. Sibling layout
 * effects fire in render order, so the smoother exists before any section sets
 * up a ScrollTrigger. Creating it later leaves those triggers measuring an
 * untransformed document.
 */
function SmoothScrollInit() {
  useIsomorphicLayoutEffect(() => {
    ScrollTrigger.config({ ignoreMobileResize: true });

    const mm = gsap.matchMedia();
    // Reference config, verbatim, and desktop only.
    mm.add("(min-width: 1024px)", () => {
      const smoother = ScrollSmoother.create({
        smooth: 1,
        smoothTouch: 1,
        effects: true,
      });
      return () => smoother.kill();
    });

    return () => mm.revert();
  }, []);

  return null;
}

/**
 * Anything `position: fixed` (the header, toasts) must stay outside the
 * wrapper, because the smoother transforms `#smooth-content`.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  return (
    <div id="smooth-wrapper">
      <div id="smooth-content">
        <SmoothScrollInit />
        {children}
      </div>
    </div>
  );
}
