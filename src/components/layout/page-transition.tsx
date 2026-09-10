"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

/** Class the reference puts on <html> for the length of a transition. */
const LOCK = "page-transitioning";
const DURATION = 0.3;
/** Releases the lock if a navigation never resolves. */
const UNLOCK_FALLBACK_MS = 3000;
const SCROLL_KEYS = new Set([
  "ArrowUp",
  "ArrowDown",
  "PageUp",
  "PageDown",
  "Home",
  "End",
  " ",
]);

export function PageTransition({ children }: { children: React.ReactNode }) {
  const viewRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const previousPathname = useRef(pathname);
  const bypassPopstate = useRef(false);

  // show(): measure the committed route, reset scroll, then fade it back in.
  useIsomorphicLayoutEffect(() => {
    if (previousPathname.current === pathname) return;
    previousPathname.current = pathname;

    document.documentElement.classList.add(LOCK);
    gsap.set(viewRef.current, { opacity: 0 });
    let tween: gsap.core.Tween | undefined;

    // Wait for this commit's pin cleanup/setup before measuring. Reset AFTER
    // refresh so its scroll restoration cannot undo the new route's position.
    const frame = window.requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      // Hash destinations retain Next's anchor scrolling.
      if (!window.location.hash) {
        const smoother = ScrollSmoother.get();
        if (smoother) smoother.scrollTo(0, false);
        else window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      }

      tween = gsap.to(viewRef.current, {
        duration: DURATION,
        ease: "power1.in",
        opacity: 1,
        onComplete: () => document.documentElement.classList.remove(LOCK),
      });
    });

    return () => {
      tween?.kill();
      window.cancelAnimationFrame(frame);
      document.documentElement.classList.remove(LOCK);
    };
  }, [pathname]);

  useEffect(() => {
    let unlockTimer = 0;

    // pointer-events only blocks clicks: wheel/trackpad momentum and touch
    // scrolling otherwise move the new route during its fade-in.
    const preventScroll = (event: Event) => {
      if (document.documentElement.classList.contains(LOCK)) {
        event.preventDefault();
      }
    };
    const preventScrollKey = (event: KeyboardEvent) => {
      if (SCROLL_KEYS.has(event.key)) preventScroll(event);
    };

    const hide = (onComplete: () => void) => {
      document.documentElement.classList.add(LOCK);
      window.clearTimeout(unlockTimer);
      unlockTimer = window.setTimeout(
        () => document.documentElement.classList.remove(LOCK),
        UNLOCK_FALLBACK_MS,
      );

      gsap.fromTo(
        viewRef.current,
        { opacity: 1 },
        { duration: DURATION, ease: "power1.out", opacity: 0, onComplete },
      );
    };

    // Capture phase, so this runs before next/link's own click handler and the
    // router never starts navigating until the view has faded out.
    const handleClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const anchor = (event.target as Element | null)?.closest?.("a");
      if (
        !anchor ||
        anchor.target ||
        anchor.hasAttribute("download") ||
        anchor.hasAttribute("data-page-transition-disabled")
      ) {
        return;
      }

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;

      const url = new URL(anchor.href, window.location.href);
      // Cross-origin keeps the browser's own full page load, as in the reference.
      if (url.origin !== window.location.origin) return;
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search
      ) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      if (document.documentElement.classList.contains(LOCK)) return;

      hide(() =>
        router.push(`${url.pathname}${url.search}${url.hash}`, {
          scroll: Boolean(url.hash),
        }),
      );
    };

    // Back and forward get the identical transition. The browser has already
    // changed the URL by now, so the old view is held on screen while it fades
    // and the pop is replayed for the router afterwards.
    const handlePopstate = (event: PopStateEvent) => {
      if (bypassPopstate.current) {
        bypassPopstate.current = false;
        return;
      }

      event.stopImmediatePropagation();

      hide(() => {
        bypassPopstate.current = true;
        window.dispatchEvent(
          new PopStateEvent("popstate", { state: window.history.state }),
        );
      });
    };

    document.addEventListener("click", handleClick, true);
    window.addEventListener("wheel", preventScroll, { passive: false });
    window.addEventListener("touchmove", preventScroll, { passive: false });
    window.addEventListener("keydown", preventScrollKey);
    window.addEventListener("popstate", handlePopstate);

    return () => {
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("wheel", preventScroll);
      window.removeEventListener("touchmove", preventScroll);
      window.removeEventListener("keydown", preventScrollKey);
      window.removeEventListener("popstate", handlePopstate);
      window.clearTimeout(unlockTimer);
    };
  }, [router]);

  return (
    <div id="view" ref={viewRef}>
      {children}
    </div>
  );
}
