import React, { useState } from "react";
import { Filter, Calendar as CalendarIcon } from "lucide-react";
import EventCard from "./EventCard";
import { EVENTS } from "../../lib/events";
import "./event-section.css";
import SplitText from "../ui/SplitText"

export default function EventSection() {
    const [selectedType, setSelectedType] = useState<string>("Todos");
    const [selectedMonth, setSelectedMonth] = useState<string>("Todos");

    // Filtros
    const filteredEvents = EVENTS.filter(event => {
        const typeMatch = selectedType === "Todos" || event.type === selectedType;
        const date = new Date(event.date);
        const month = date.toLocaleString('default', { month: 'long' });
        const monthMatch = selectedMonth === "Todos" || month.toLowerCase() === selectedMonth.toLowerCase();

        return typeMatch && monthMatch;
    });

    const types = ["Todos", ...Array.from(new Set(EVENTS.map(e => e.type)))];
    const months = ["Todos", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio"];

    return (
        <section className="event-section">
            <div className="section-header">
                <SplitText
                    key={"Próximos Eventos"}
                    text="Próximos Eventos"
                    className="section-title"
                    tag="h2"
                    delay={50}
                    duration={1}
                    splitType="words"

                    threshold={0.1}
                />

                <div className="section-filters">
                    <div className="filter-group">
                        <Filter size={16} className="text-zinc-500" />
                        <select
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                            className="filter-select"
                        >
                            {types.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <CalendarIcon size={16} className="text-zinc-500" />
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="filter-select"
                        >
                            {months.map(month => (
                                <option key={month} value={month}>{month}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="events-grid">
                {filteredEvents.map(event => (
                    <EventCard key={event.id} event={event} />
                ))}
            </div>

            {filteredEvents.length === 0 && (
                <div className="no-results">
                    <p>No se encontraron eventos con estos filtros.</p>
                </div>
            )}
        </section>
    );
}
