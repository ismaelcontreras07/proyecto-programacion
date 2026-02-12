import React from "react";
import Image from "next/image";
import { Calendar, Clock3, MapPin, Ticket, ArrowRight } from "lucide-react";
import "./event-card.css";

export interface EventData {
    id: string;
    image: string;
    name: string;
    date: string;
    time: string;
    place: string;
    location: string;
    spots: number;
    type: "Presencial"|"En línea";
}

interface EventCardProps {
    event: EventData;
}

export default function EventCard({ event }: EventCardProps) {
    const getTypeBadgeClass = (type: EventData["type"]) => {
        return type === "Presencial" ? "badge-onsite" : "badge-online";
    };

    const getAvailability = (spots: number) => {
        if (spots <= 20) return { label: "Ultimos lugares", className: "availability-critical" };
        if (spots <= 80) return { label: "Alta demanda", className: "availability-warning" };
        return { label: "Disponible", className: "availability-ok" };
    };

    const formatDate = (date: string, options?: Intl.DateTimeFormatOptions) => {
        const parsedDate = new Date(date);
        if (Number.isNaN(parsedDate.getTime())) return date;

        return parsedDate.toLocaleDateString("es-MX", options ?? {
            weekday: "short",
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const availability = getAvailability(event.spots);
    const isLowSpots = event.spots <= 20;

    return (
        <div className="event-card group">
            <div className="event-image-container">
                <Image
                    src={event.image}
                    alt={event.name}
                    fill
                    className="event-image"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="event-image-overlay" />

                <div className="event-badges">
                    <span className={`event-badge event-type-badge ${getTypeBadgeClass(event.type)}`}>
                        {event.type}
                    </span>
                    <span className={`event-badge event-availability-badge ${availability.className}`}>
                        {availability.label}
                    </span>
                </div>

                <div className="event-date-chip">
                    <Calendar className="event-date-chip-icon" />
                    <span>{formatDate(event.date, { day: "2-digit", month: "short" })}</span>
                </div>
            </div>

            <div className="event-content">
                <div className="event-header">
                    <h3 className="event-title">{event.name}</h3>
                    <p className="event-subtitle">{event.place}</p>
                </div>

                <div className="event-details-grid">
                    <div className="event-detail-card">
                        <Calendar className="event-detail-icon" />
                        <div className="event-detail-copy">
                            <span className="event-detail-label">Fecha</span>
                            <span className="event-detail-value">{formatDate(event.date)}</span>
                        </div>
                    </div>
                    <div className="event-detail-card">
                        <Clock3 className="event-detail-icon" />
                        <div className="event-detail-copy">
                            <span className="event-detail-label">Horario</span>
                            <span className="event-detail-value">{event.time}</span>
                        </div>
                    </div>
                    <div className="event-detail-card event-detail-card-full">
                        <MapPin className="event-detail-icon" />
                        <div className="event-detail-copy">
                            <span className="event-detail-label">Ubicacion</span>
                            <span className="event-detail-value truncate-2-lines">{event.location}</span>
                        </div>
                    </div>
                </div>

                <div className="event-footer">
                    <div className="event-spots">
                        <Ticket className="event-detail-icon" />
                        <div className="event-detail-copy">
                            <span className="spots-label">Cupos disponibles</span>
                            <span className={`spots-count ${isLowSpots ? "spots-low" : ""}`}>
                                {event.spots}
                            </span>
                        </div>
                    </div>

                    <button type="button" className="event-cta">
                        Ver detalles
                        <ArrowRight className="event-cta-icon" />
                    </button>
                </div>
            </div>
        </div>
    );
}
