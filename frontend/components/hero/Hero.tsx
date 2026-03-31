"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, CalendarCheck2, Sparkles } from "lucide-react";
import { fetchEventById, resolveEventImageSrc, type EventDetail } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { formatEventDate, normalizeEventTimeLabel } from "../../lib/datetime";
import "./hero.css";

gsap.registerPlugin(ScrollTrigger);

type HeroMetric = {
  value: string;
  label: string;
};

type HeroContent = {
  kicker: string;
  title: string;
  subtitle: string;
  supporting: string;
  primaryCta: {
    label: string;
    href: string;
  };
  secondaryCta: {
    label: string;
    href: string;
  };
  metrics: HeroMetric[];
};

function getEventIdFromPath(pathname: string | null): string | null {
  if (!pathname) return null;
  const match = pathname.match(/^\/eventos\/([^/?#]+)/);
  return match?.[1] ?? null;
}

function buildEventContent(event: EventDetail): HeroContent {
  const availability = event.lifecycle === "past" ? "Finalizado" : `${Math.max(event.spots, 0)} cupos`;
  return {
    kicker: "Detalle del evento",
    title: event.name,
    subtitle: event.summary,
    supporting: `${formatEventDate(event.date)} · ${normalizeEventTimeLabel(event.time)} · ${event.place}`,
    primaryCta: {
      label: "Ver mis eventos",
      href: "/mis-eventos",
    },
    secondaryCta: {
      label: "Volver a inicio",
      href: "/",
    },
    metrics: [
      { value: formatEventDate(event.date), label: "Fecha" },
      { value: normalizeEventTimeLabel(event.time), label: "Horario" },
      { value: event.type, label: "Modalidad" },
      { value: availability, label: "Disponibilidad" },
    ],
  };
}

function resolveContent(pathname: string | null): HeroContent {
  if (pathname === "/") {
    return {
      kicker: "UNIMEX Eventos",
      title: "Formación universitaria conectada con oportunidades reales",
      subtitle: "Regístrate a actividades académicas, organiza tu agenda y da seguimiento a tu participación.",
      supporting: "Todo desde tu matrícula, con una experiencia clara y rápida.",
      primaryCta: {
        label: "Ver eventos activos",
        href: "#eventos",
      },
      secondaryCta: {
        label: "Acceder a mi cuenta",
        href: "/login",
      },
      metrics: [
        { value: "Activos", label: "Eventos disponibles" },
        { value: "Pasados", label: "Con reseñas" },
        { value: "1 cuenta", label: "Registro simplificado" },
        { value: "Mi agenda", label: "Control personal" },
      ],
    };
  }

  if (pathname?.startsWith("/mis-eventos")) {
    return {
      kicker: "Mi actividad",
      title: "Consulta y administra tus eventos registrados",
      subtitle: "Visualiza tus eventos activos y pasados con estado actualizado al momento.",
      supporting: "Cancela asistencia solo cuando el evento todavía no finaliza.",
      primaryCta: {
        label: "Explorar eventos",
        href: "/#eventos",
      },
      secondaryCta: {
        label: "Ir a inicio",
        href: "/",
      },
      metrics: [
        { value: "Activo/Pasado", label: "Estado del evento" },
        { value: "Horario", label: "Sin traslapes" },
        { value: "1 click", label: "Acciones rápidas" },
        { value: "Reseñas", label: "Al finalizar" },
      ],
    };
  }

  return {
    kicker: "Comunidad UNIMEX",
    title: "Experiencia académica digital, moderna y enfocada en estudiantes",
    subtitle: "Navegación consistente y datos claros para cada sección de la plataforma.",
    supporting: "Diseño limpio, rápido y funcional para uso diario.",
    primaryCta: {
      label: "Ir al inicio",
      href: "/",
    },
    secondaryCta: {
      label: "Iniciar sesión",
      href: "/login",
    },
    metrics: [
      { value: "Eventos", label: "Información centralizada" },
      { value: "Registro", label: "Con matrícula" },
      { value: "Historial", label: "Siempre visible" },
      { value: "Calificación", label: "Después del evento" },
    ],
  };
}

export default function Hero() {
  const heroRef = useRef<HTMLElement | null>(null);
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuth();

  const [eventHero, setEventHero] = useState<EventDetail | null>(null);
  const [eventHeroLoading, setEventHeroLoading] = useState(false);

  const eventId = useMemo(() => getEventIdFromPath(pathname), [pathname]);
  const baseContent = useMemo(() => resolveContent(pathname), [pathname]);
  const content = useMemo(() => {
    if (eventHero) return buildEventContent(eventHero);
    if (eventId && eventHeroLoading) {
      return {
        ...baseContent,
        kicker: "Cargando evento",
        title: "Preparando la información del evento",
        subtitle: "Estamos cargando datos actualizados para mostrarte fecha, horario y disponibilidad.",
      };
    }
    return baseContent;
  }, [baseContent, eventHero, eventHeroLoading, eventId]);

  const resolvedSecondaryCta = useMemo(() => {
    if (!isAuthenticated) return content.secondaryCta;
    if (user?.role === "admin") {
      return { label: "Ir a dashboard", href: "/dashboard" };
    }
    return { label: "Ver mis eventos", href: "/mis-eventos" };
  }, [content.secondaryCta, isAuthenticated, user?.role]);

  const defaultImageSrc = "/hero-campus-optimized.jpg";
  const fallbackImageSrc = "/logo-unimex-horizontal.png";
  const [heroImageSrc, setHeroImageSrc] = useState(defaultImageSrc);
  const [didFallbackImage, setDidFallbackImage] = useState(false);

  useEffect(() => {
    let ignore = false;

    const loadEventHero = async () => {
      if (!eventId) {
        setEventHero(null);
        setEventHeroLoading(false);
        return;
      }

      setEventHero(null);
      setDidFallbackImage(false);
      setHeroImageSrc(defaultImageSrc);
      setEventHeroLoading(true);
      try {
        const detail = await fetchEventById(eventId);
        if (!ignore && detail) {
          setEventHero(detail);
          setHeroImageSrc(resolveEventImageSrc(detail.image || defaultImageSrc));
        }
      } catch {
        if (!ignore) setEventHero(null);
      } finally {
        if (!ignore) setEventHeroLoading(false);
      }
    };

    void loadEventHero();

    if (!eventId) {
      setHeroImageSrc(defaultImageSrc);
      setDidFallbackImage(false);
    }

    return () => {
      ignore = true;
    };
  }, [eventId]);

  useGSAP(
    () => {
      if (!heroRef.current) return;

      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReducedMotion) return;

      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px)", () => {
        gsap.to(".hero-media-image", {
          yPercent: 4,
          ease: "none",
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 0.6,
          },
        });
      });

      return () => {
        mm.revert();
      };
    },
    { scope: heroRef, dependencies: [pathname] },
  );

  const handleHeroImageError = () => {
    if (didFallbackImage) return;
    setDidFallbackImage(true);
    setHeroImageSrc(fallbackImageSrc);
  };

  return (
    <section className="hero" ref={heroRef}>
      <div className="hero-backdrop" aria-hidden="true">
        <img
          src={heroImageSrc}
          alt="Hero UNIMEX"
          className="hero-media-image"
          loading={pathname === "/" ? "eager" : "lazy"}
          fetchPriority={pathname === "/" ? "high" : "auto"}
          decoding="async"
          onError={handleHeroImageError}
        />
      </div>

      <div className="hero-ambient" aria-hidden="true">
        <span className="hero-ambient-shape hero-ambient-shape--a" />
        <span className="hero-ambient-shape hero-ambient-shape--b" />
      </div>

      <div className="hero-overlay" aria-hidden="true" />

      <div className="hero-shell">
        <div className="hero-grid">
          <motion.div
            className="hero-copy"
            key={`copy-${pathname}-${content.title}`}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.34, ease: "easeOut" }}
          >
            <p className="hero-kicker hero-animate-kicker">
              <Sparkles size={14} />
              {content.kicker}
            </p>

            <h1 className="hero-title hero-animate-title">{content.title}</h1>

            <p className="hero-subtitle hero-animate-subtitle">{content.subtitle}</p>
            <p className="hero-supporting hero-animate-supporting">{content.supporting}</p>

            <div className="hero-actions hero-animate-actions">
              <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.18 }}>
                <Link href={content.primaryCta.href} className="hero-btn hero-btn-primary">
                  <CalendarCheck2 size={16} />
                  {content.primaryCta.label}
                </Link>
              </motion.div>

              <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.18 }}>
                <Link href={resolvedSecondaryCta.href} className="hero-btn hero-btn-secondary">
                  {resolvedSecondaryCta.label}
                  <ArrowRight size={16} />
                </Link>
              </motion.div>
            </div>
          </motion.div>

          <motion.aside
            className="hero-metrics-panel"
            key={`metrics-${pathname}-${content.metrics[0]?.value ?? "default"}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.34, ease: "easeOut", delay: 0.06 }}
          >
            <p className="hero-metrics-kicker">Indicadores para estudiantes</p>
            <div className="hero-metrics-grid">
              {content.metrics.map((metric) => (
                <motion.article
                  key={metric.label}
                  className="hero-metric hero-animate-metric"
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.18 }}
                >
                  <p className="hero-metric-value">{metric.value}</p>
                  <p className="hero-metric-label">{metric.label}</p>
                </motion.article>
              ))}
            </div>
          </motion.aside>
        </div>
      </div>
    </section>
  );
}
