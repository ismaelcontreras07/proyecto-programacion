"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, ChartNoAxesColumn, GraduationCap, UsersRound } from "lucide-react";
import "./home-highlights.css";

gsap.registerPlugin(ScrollTrigger);

const highlightItems = [
  {
    icon: GraduationCap,
    title: "Agenda académica",
    description: "Eventos diseñados para reforzar competencias reales y perfil profesional.",
  },
  {
    icon: UsersRound,
    title: "Participación inteligente",
    description: "Registro por matrícula y validaciones de horario para evitar conflictos.",
  },
  {
    icon: ChartNoAxesColumn,
    title: "Seguimiento con datos",
    description: "Dashboard, reseñas y reportes para operar con evidencia institucional.",
  },
] as const;

export default function HomeHighlights() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      if (!sectionRef.current) return;

      const cards = gsap.utils.toArray<HTMLElement>(".home-highlights-grid .home-highlight-card", sectionRef.current);
      if (cards.length === 0) return;

      gsap.set(cards, { autoAlpha: 0, y: 28 });

      ScrollTrigger.batch(cards, {
        start: "top 88%",
        once: true,
        onEnter: (batch) => {
          gsap.to(batch, {
            autoAlpha: 1,
            y: 0,
            duration: 0.72,
            stagger: 0.12,
            ease: "power3.out",
            clearProps: "opacity,visibility,transform",
          });
        },
      });

      gsap.fromTo(
        ".home-highlights-heading",
        { autoAlpha: 0, y: 20 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.66,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 84%",
            once: true,
          },
        },
      );
    },
    { scope: sectionRef },
  );

  return (
    <section className="home-highlights" ref={sectionRef}>
      <div className="home-highlights-shell">
        <div className="home-highlights-heading">
          <p className="home-highlights-kicker">Experiencia UNIMEX</p>
          <h2 className="home-highlights-title">Una plataforma académica moderna, clara y accionable</h2>
          <p className="home-highlights-subtitle">
            Diseñada para estudiantes y coordinación académica, con una experiencia enfocada en fluidez y control.
          </p>
        </div>

        <div className="home-highlights-grid">
          {highlightItems.map((item) => {
            const Icon = item.icon;
            return (
              <motion.article
                key={item.title}
                className="home-highlight-card"
                whileHover={{ y: -6 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <div className="home-highlight-icon" aria-hidden="true">
                  <Icon size={18} />
                </div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </motion.article>
            );
          })}
        </div>

        <motion.div
          className="home-highlights-cta"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <p>¿Listo para participar en tu siguiente evento?</p>
          <Link href="/login">
            Ingresar a mi cuenta
            <ArrowRight size={15} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
