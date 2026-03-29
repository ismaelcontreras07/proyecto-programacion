"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AlertCircle, Calendar as CalendarIcon, Filter, RefreshCcw, Sparkles } from "lucide-react";
import EventCard from "./EventCard";
import BlurText from "../ui/BlurText";
import type { EventLifecycle, EventSummary } from "../../lib/api";
import { fetchEvents } from "../../lib/api";
import { formatMonthYearLabel, getYearMonthKey, parseDateValue } from "../../lib/datetime";
import "./event-section.css";

type FilterOption = {
    label: string;
    value: string;
};

gsap.registerPlugin(ScrollTrigger);

export default function EventSection() {
    const sectionRef = useRef<HTMLElement | null>(null);
    const [selectedLifecycle, setSelectedLifecycle] = useState<EventLifecycle>("active");
    const [selectedType, setSelectedType] = useState<string>("Todos");
    const [selectedMonth, setSelectedMonth] = useState<string>("Todos");
    const [events, setEvents] = useState<EventSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const controller = new AbortController();

        const loadEvents = async () => {
            setLoading(true);
            setError("");
            try {
                const response = await fetchEvents({ lifecycle: "all", signal: controller.signal });
                setEvents(response);
            } catch (loadError) {
                if (controller.signal.aborted) return;
                setError(loadError instanceof Error ? loadError.message : "No se pudieron cargar los eventos");
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        void loadEvents();
        return () => controller.abort();
    }, []);

    const lifecycleEvents = useMemo(() => {
        return events.filter((event) => event.lifecycle === selectedLifecycle);
    }, [events, selectedLifecycle]);

    const filteredEvents = useMemo(() => {
        return lifecycleEvents.filter((event) => {
            const typeMatch = selectedType === "Todos" || event.type === selectedType;
            const monthMatch = selectedMonth === "Todos" || getYearMonthKey(event.date) === selectedMonth;
            return typeMatch && monthMatch;
        });
    }, [lifecycleEvents, selectedMonth, selectedType]);

    const availableTypes = useMemo(() => {
        return Array.from(new Set(lifecycleEvents.map((event) => event.type)));
    }, [lifecycleEvents]);

    const typeOptions = useMemo<FilterOption[]>(
        () => [{ label: "Todos los tipos", value: "Todos" }, ...availableTypes.map((type) => ({ label: type, value: type }))],
        [availableTypes],
    );

    const monthOptions = useMemo<FilterOption[]>(() => {
        const uniqueMonths = new Map<string, string>();
        const sortedByDate = [...lifecycleEvents].sort((a, b) => {
            const timeA = parseDateValue(a.date)?.getTime() ?? Number.MAX_SAFE_INTEGER;
            const timeB = parseDateValue(b.date)?.getTime() ?? Number.MAX_SAFE_INTEGER;
            return timeA - timeB;
        });

        sortedByDate.forEach((event) => {
            const key = getYearMonthKey(event.date);
            if (!key || uniqueMonths.has(key)) return;
            uniqueMonths.set(key, formatMonthYearLabel(event.date));
        });

        return [
            { label: "Todos los meses", value: "Todos" },
            ...Array.from(uniqueMonths.entries()).map(([value, label]) => ({ value, label })),
        ];
    }, [lifecycleEvents]);

    const hasActiveFilters = selectedType !== "Todos" || selectedMonth !== "Todos";

    const clearFilters = () => {
        setSelectedType("Todos");
        setSelectedMonth("Todos");
    };

    useGSAP(
        () => {
            if (loading || error || filteredEvents.length === 0) return;
            if (!sectionRef.current) return;

            const cards = gsap.utils.toArray<HTMLElement>(".events-grid .event-card", sectionRef.current);
            if (cards.length === 0) return;

            gsap.set(cards, { autoAlpha: 0, y: 24, scale: 0.985 });

            ScrollTrigger.batch(cards, {
                start: "top 88%",
                once: true,
                onEnter: (batch) => {
                    gsap.to(batch, {
                        autoAlpha: 1,
                        y: 0,
                        scale: 1,
                        duration: 0.6,
                        stagger: 0.08,
                        ease: "power3.out",
                        clearProps: "opacity,visibility,transform",
                    });
                },
            });
        },
        {
            scope: sectionRef,
            dependencies: [loading, error, filteredEvents],
            revertOnUpdate: true,
        },
    );

    useGSAP(
        () => {
            if (!sectionRef.current) return;

            gsap.fromTo(
                ".section-header",
                { autoAlpha: 0, y: 22 },
                {
                    autoAlpha: 1,
                    y: 0,
                    duration: 0.62,
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
        <section className="event-section" ref={sectionRef}>
            <div className="event-shell">
                <div className="section-header">
                    <div className="section-main">
                        <p className="section-kicker">
                            <Sparkles size={15} />
                            Agenda UNIMEX
                        </p>

                        <div className="section-heading-row">
                            <h2 className="section-title">Eventos</h2>
                            <div className="section-lifecycle-switch" role="tablist" aria-label="Filtro por estado de evento">
                                <button
                                    type="button"
                                    role="tab"
                                    aria-selected={selectedLifecycle === "active"}
                                    className={`section-lifecycle-btn${selectedLifecycle === "active" ? " is-active" : ""}`}
                                    onClick={() => setSelectedLifecycle("active")}
                                >
                                    Activos
                                </button>
                                <button
                                    type="button"
                                    role="tab"
                                    aria-selected={selectedLifecycle === "past"}
                                    className={`section-lifecycle-btn${selectedLifecycle === "past" ? " is-active" : ""}`}
                                    onClick={() => setSelectedLifecycle("past")}
                                >
                                    Pasados
                                </button>
                            </div>
                        </div>

                        <BlurText
                            text="Explora eventos activos o revisa los pasados con sus reseñas de alumnos."
                            className="section-subtitle"
                            animateBy="words"
                            direction="bottom"
                            delay={24}
                            threshold={0.08}
                            rootMargin="-6% 0px"
                            stepDuration={0.28}
                        />
                    </div>

                    <div className="section-controls">
                        <label className="filter-inline" htmlFor="event-filter-type">
                            <span className="filter-label">
                                <Filter size={14} />
                                Tipo
                            </span>
                            <select
                                id="event-filter-type"
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value)}
                                className="filter-select"
                            >
                                {typeOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="filter-inline" htmlFor="event-filter-month">
                            <span className="filter-label">
                                <CalendarIcon size={14} />
                                Mes
                            </span>
                            <select
                                id="event-filter-month"
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="filter-select"
                            >
                                {monthOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <button
                            type="button"
                            className={`filter-reset${hasActiveFilters ? "" : " filter-reset-hidden"}`}
                            onClick={clearFilters}
                            disabled={!hasActiveFilters}
                        >
                            <RefreshCcw size={14} />
                            Limpiar
                        </button>
                    </div>
                </div>

                {!error && !loading && (
                    <div className="results-meta">
                        <span className="results-count">
                            {filteredEvents.length} de {lifecycleEvents.length} evento{lifecycleEvents.length === 1 ? "" : "s"}
                        </span>
                        <span className="results-hint">Filtra por tipo o mes para encontrar más rápido.</span>
                    </div>
                )}

                {error && (
                    <div className="status-card status-card-error">
                        <AlertCircle size={18} />
                        <div>
                            <p className="status-title">No se pudieron cargar los eventos</p>
                            <p className="status-description">{error}</p>
                        </div>
                    </div>
                )}

                {!error && loading && (
                    <div className="events-grid" aria-hidden="true">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <article key={index} className="event-skeleton-card">
                                <div className="event-skeleton-image" />
                                <div className="event-skeleton-body">
                                    <div className="event-skeleton-line event-skeleton-line-lg" />
                                    <div className="event-skeleton-line event-skeleton-line-md" />
                                    <div className="event-skeleton-line event-skeleton-line-sm" />
                                </div>
                            </article>
                        ))}
                    </div>
                )}

                {!error && !loading && (
                    <div className="events-grid">
                        {filteredEvents.map((event) => (
                            <EventCard key={event.id} event={event} />
                        ))}
                    </div>
                )}

                {!error && !loading && filteredEvents.length === 0 && (
                    <div className="status-card status-card-empty">
                        <AlertCircle size={18} />
                        <div>
                            <p className="status-title">Sin resultados con estos filtros</p>
                            <p className="status-description">Prueba con otro tipo de evento o un mes diferente.</p>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
