import React, { useState } from "react";
import { Filter, Calendar as CalendarIcon } from "lucide-react";
import EventCard, { EventData } from "./EventCard";
import "./event-section.css";
import SplitText from "../ui/SplitText"

// Mock Data
const MOCK_EVENTS: EventData[] = [
    {
        id: "1",
        image: "/Photos/photo1.jpg",
        name: "Taller exprés de liderazgo y trabajo en equipo",
        date: "06/05/2026 ",
        time: "9:00 a.m.-1:00 p.m.",
        place: "Plaza Universidad",
        location: "Universidad 1000, Col. Santa Cruz Atoyac, Benito Juárez, CDMX",
        spots: 1500,
        type: "Presencial"
    },
    {
        id: "2",
        image: "/Photos/photo2.jpg",
        name: "Simulación de exportación/importanción de un producto",
        date: "06/05/2026",
        time: "10:00 a.m.-1:00 p.m.",
        place: "Forum Buenavista",
        location: "Av. Insurgentes Norte 259, Col. Buenavista, Cuauhtémoc, CDMX",
        spots: 1500,
        type: "En línea"
    },
    {
        id: "3",
        image: "/Photos/photo3.jpg",
        name: "Cabina de radio o podcast en vivo",
        date: "11/04/2026",
        time: "4:00 p.m.-7:00 p.m.",
        place: "Alameda Central",
        location: "Av. Juárez s/n, Centro Histórico, Cuauhtémoc, CDMX",
        spots: 1500,
        type: "En línea"
    },
    {
        id: "4",
        image: "/Photos/photo4.jpg",
        name: "Escena del crimen simulada para análisis",
        date: "04/13/2026",
        time: "10:00 a.m.-3:00 p.m",
        place: "Explanada del Monumento a la Revolución",
        location: "Plaza de la República s/n, Tabacalera, Cuauhtémoc, CDMX",
        spots: 1500,
        type: "Presencial"
    },
    {
        id: "5",
        image: "/Photos/photo5.jpg",
        name: "Demostración de apps o videojuegos",
        date: "04/22/2026",
        time: "3:00 p.m.-7:00 p.m",
        place: "Plaza Antara",
        location: "Av. Ejército Nacional 843-B, Col. Granada, Miguel Hidalgo, CDMX",
        spots: 1500,
        type: "Presencial"
    },
    {
        id: "6",
        image: "/Photos/photo6.jpg",
        name: "Taller de inteligencia emocional",
        date: "04/19/2026",
        time: "9:00 a.m.-1:00 p.m",
        place: "Parque Hundido",
        location: "Av. Insurgentes Sur s/n, Col. Extremadura Insurgentes, Benito Juárez, CDMX",
        spots: 1500,
        type: "Presencial"
    },
    {
        id: "7",
        image: "/Photos/photo7.jpg",
        name: "Atención al cliente en escenarios reales",
        date: "04/23/2026",
        time: "10:00 a.m.-4:00 p.m",
        place: "Embarcadero Natitivas",
        location: "Calle del Mercado 133, Col. Xochimilco, CDMX",
        spots: 1500,
        type: "Presencial"
    },
    {
        id: "8",
        image: "/Photos/photo8.jpg",
        name: "Retos de pronunciación o vocabulario",
        date: "10/17/2026",
        time: "11:00 a.m.- 1:00 p.m.",
        place: "Plaza Hidalgo, Coyoacán",
        location: "Plaza Hidalgo s/n, Col. Centro, Coyoacán, CDMX",
        spots: 1500,
        type: "En línea"
    },
    {
        id: "9",
        image: "/Photos/photo9.jpg",
        name: "Retos de lógica y algoritmos",
        date: "06/05/2026",
        time: "3:00 p.m.-7:00 p.m.",
        place: "Biblioteca Vasconcelos",
        location: "Eje 1 Norte Mosqueta s/n, Col. Buenavista, Alcaldía Cuauhtémoc, CDMX",
        spots: 1500,
        type: "Presencial"
    },
];

export default function EventSection() {
    const [selectedType, setSelectedType] = useState<string>("Todos");
    const [selectedMonth, setSelectedMonth] = useState<string>("Todos");

    // Filtros
    const filteredEvents = MOCK_EVENTS.filter(event => {
        const typeMatch = selectedType === "Todos" || event.type === selectedType;
        const date = new Date(event.date);
        const month = date.toLocaleString('default', { month: 'long' });
        const monthMatch = selectedMonth === "Todos" || month.toLowerCase() === selectedMonth.toLowerCase();

        return typeMatch && monthMatch;
    });

    const types = ["Todos", ...Array.from(new Set(MOCK_EVENTS.map(e => e.type)))];
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
