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
    const mobileUA = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

    const teardown = () => {
      const active = ScrollSmoother.get();
      if (active) {
        active.kill();
      }
      root.classList.remove("has-smooth-scroll");
    };

    const shouldDisableSmooth = () => {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const isTouchDevice =
        window.matchMedia("(hover: none) and (pointer: coarse)").matches
        || navigator.maxTouchPoints > 0;
      const isSmallViewport = window.matchMedia("(max-width: 1023px)").matches;
      const isLowPowerDevice =
        ((navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8) <= 4
        || (navigator.hardwareConcurrency ?? 8) <= 4;

      return reduceMotion || isTouchDevice || isSmallViewport || isLowPowerDevice || mobileUA;
    };

    const setup = () => {
      if (shouldDisableSmooth()) {
        teardown();
        return;
      }

      if (ScrollSmoother.get()) return;

      registerGsapPlugins();
      root.classList.add("has-smooth-scroll");
      ScrollSmoother.create({
        wrapper: "#smooth-wrapper",
        content: "#smooth-content",
        smooth: 0.55,
        smoothTouch: 0,
        normalizeScroll: true,
        ignoreMobileResize: true,
        effects: false,
      });
    };

    setup();
    const onViewportChange = () => {
      window.requestAnimationFrame(setup);
    };

    window.addEventListener("resize", onViewportChange, { passive: true });
    window.addEventListener("orientationchange", onViewportChange, { passive: true });

    return () => {
      window.removeEventListener("resize", onViewportChange);
      window.removeEventListener("orientationchange", onViewportChange);
      teardown();
    };
  }, []);

  return (
    <div id="smooth-wrapper">
      <div id="smooth-content">{children}</div>
    </div>
  );
}
