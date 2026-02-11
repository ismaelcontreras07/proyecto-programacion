import React, { useState } from "react";
import { Filter, Calendar as CalendarIcon } from "lucide-react";
import EventCard, { EventData } from "./EventCard";
import "./event-section.css";

// Mock Data
const MOCK_EVENTS: EventData[] = [
    {
        id: "1",
        image: "",
        name: "",
        date: "",
        time: "",
        place: "",
        location: "",
        spots: 1500,
        type: "XD"
    }
];

export default function EventSection() {
    const [selectedType, setSelectedType] = useState<string>("All");
    const [selectedMonth, setSelectedMonth] = useState<string>("All");

    // Filtros
    const filteredEvents = MOCK_EVENTS.filter(event => {
        const typeMatch = selectedType === "All" || event.type === selectedType;
        const date = new Date(event.date);
        const month = date.toLocaleString('default', { month: 'long' });
        const monthMatch = selectedMonth === "All" || month.toLowerCase() === selectedMonth.toLowerCase();

        return typeMatch && monthMatch;
    });

    const types = ["Todo", ...Array.from(new Set(MOCK_EVENTS.map(e => e.type)))];
    const months = ["Todo"];

    return (
        <section className="event-section">
            <div className="section-header">
                <h2 className="section-title">Próximos Eventos</h2>

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
