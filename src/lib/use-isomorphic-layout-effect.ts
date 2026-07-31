import { useEffect, useLayoutEffect } from "react";

/**
 * GSAP setup has to run before paint so elements never flash in their final
 * state, but useLayoutEffect warns during server rendering.
 */
export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
