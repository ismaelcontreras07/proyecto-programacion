"use client";

import { type ReactNode, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";

let pluginsRegistered = false;

function registerGsapPlugins() {
  if (pluginsRegistered) return;
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
  pluginsRegistered = true;
}

export default function LenisProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const root = document.documentElement;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isTouchDevice =
      window.matchMedia("(hover: none) and (pointer: coarse)").matches
      || navigator.maxTouchPoints > 0;
    const isLowPowerDevice =
      ((navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8) <= 4
      || (navigator.hardwareConcurrency ?? 8) <= 4;
    const isSmallViewport = window.matchMedia("(max-width: 1023px)").matches;

    if (reduceMotion || isTouchDevice || isLowPowerDevice || isSmallViewport) {
      root.classList.remove("has-smooth-scroll");
      return undefined;
    }

    registerGsapPlugins();
    const previousSmoother = ScrollSmoother.get();
    previousSmoother?.kill();
    root.classList.add("has-smooth-scroll");

    const hasEffectsTargets = !!document.querySelector("[data-speed], [data-lag]");

    const smoother = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: 0.75,
      smoothTouch: 0,
      normalizeScroll: true,
      ignoreMobileResize: true,
      effects: hasEffectsTargets,
    });

    return () => {
      smoother.kill();
      root.classList.remove("has-smooth-scroll");
    };
  }, []);

  return (
    <div id="smooth-wrapper">
      <div id="smooth-content">{children}</div>
    </div>
  );
}
