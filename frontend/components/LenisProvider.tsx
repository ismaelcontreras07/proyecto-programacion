"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export default function LenisProvider() {
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const isTouchDevice =
      window.matchMedia("(hover: none) and (pointer: coarse)").matches ||
      navigator.maxTouchPoints > 0;

    // On touch devices, native scrolling is usually smoother and avoids Lenis jumpiness.
    if (isTouchDevice) return;

    const lenis = new Lenis({
      autoRaf: true,
      smoothWheel: true,
      syncTouch: false,
      lerp: 0.09,
      wheelMultiplier: 0.9,
      touchMultiplier: 1,
      gestureOrientation: "vertical",
      autoResize: true,
      overscroll: true,
    });

    return () => {
      lenis.destroy();
    };
  }, []);

  return null;
}
