"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AlertCircle, Calendar as CalendarIcon, Filter, RefreshCcw, Sparkles } from "lucide-react";
import EventCard from "./EventCard";
import type { EventLifecycle, EventSummary } from "../../lib/api";
import { fetchEvents } from "../../lib/api";
import { formatMonthYearLabel, getYearMonthKey, parseDateValue } from "../../lib/datetime";
import "./event-section.css";

type FilterOption = {
    label: string;
    value: string;
};

export default function EventSection() {
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

    return (
        <section className="event-section">
            <div className="event-shell">
                <div className="section-header">
                    <div className="section-copy">
                        <p className="section-kicker">
                            <Sparkles size={16} />
                            Agenda UNIMEX
                        </p>
                        <h2 className="section-title">Eventos</h2>
                        <p className="section-subtitle">
                            Explora eventos activos o revisa los pasados con sus reseñas de alumnos.
                        </p>

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

                    <div className="section-filters">
                        <label className="filter-group" htmlFor="event-filter-type">
                            <span className="filter-label">
                                <Filter size={15} />
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

                        <label className="filter-group" htmlFor="event-filter-month">
                            <span className="filter-label">
                                <CalendarIcon size={15} />
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
