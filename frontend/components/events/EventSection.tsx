"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AlertCircle, Calendar as CalendarIcon, Filter, RefreshCcw, Sparkles } from "lucide-react";
import EventCard from "./EventCard";
import type { EventSummary } from "../../lib/api";
import { fetchEvents } from "../../lib/api";
import "./event-section.css";

type FilterOption = {
    label: string;
    value: string;
};

function getMonthKey(dateValue: string): string {
    const parsedDate = new Date(dateValue);
    if (Number.isNaN(parsedDate.getTime())) return "";

    const year = parsedDate.getFullYear();
    const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
}

function formatMonthLabel(dateValue: string): string {
    const parsedDate = new Date(dateValue);
    if (Number.isNaN(parsedDate.getTime())) return dateValue;

    const label = parsedDate.toLocaleDateString("es-MX", {
        month: "long",
        year: "numeric",
    });

    return label.charAt(0).toUpperCase() + label.slice(1);
}

export default function EventSection() {
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
                const response = await fetchEvents({ signal: controller.signal });
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

    const filteredEvents = useMemo(() => {
        return events.filter((event) => {
            const typeMatch = selectedType === "Todos" || event.type === selectedType;
            const monthMatch = selectedMonth === "Todos" || getMonthKey(event.date) === selectedMonth;
            return typeMatch && monthMatch;
        });
    }, [events, selectedMonth, selectedType]);

    const typeOptions = useMemo<FilterOption[]>(
        () => [{ label: "Todos los tipos", value: "Todos" }, ...Array.from(new Set(events.map((event) => event.type))).map((type) => ({ label: type, value: type }))],
        [events],
    );

    const monthOptions = useMemo<FilterOption[]>(() => {
        const uniqueMonths = new Map<string, string>();
        const sortedByDate = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        sortedByDate.forEach((event) => {
            const key = getMonthKey(event.date);
            if (!key || uniqueMonths.has(key)) return;
            uniqueMonths.set(key, formatMonthLabel(event.date));
        });

        return [
            { label: "Todos los meses", value: "Todos" },
            ...Array.from(uniqueMonths.entries()).map(([value, label]) => ({ value, label })),
        ];
    }, [events]);

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
                        <h2 className="section-title">Próximos eventos</h2>
                        <p className="section-subtitle">
                            Encuentra actividades académicas y profesionales con cupo limitado, ubicaciones claras y registro rápido.
                        </p>
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
                            {filteredEvents.length} de {events.length} evento{events.length === 1 ? "" : "s"}
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
