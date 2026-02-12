"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export default function LenisProvider() {
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
    const lenis = new Lenis({
      autoRaf: true,
      smoothWheel: true,
      syncTouch: isTouchDevice,
      syncTouchLerp: 0.085,
      touchInertiaExponent: 26,
      lerp: isTouchDevice ? 0.14 : 0.1,
      wheelMultiplier: 0.92,
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
