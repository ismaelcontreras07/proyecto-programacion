import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock3, MapPin, Users, ArrowRight } from "lucide-react";
import { resolveEventImageSrc, type EventSummary } from "../../lib/api";
import { formatEventDate, normalizeEventTimeLabel } from "../../lib/datetime";
import "./event-card.css";

interface EventCardProps {
    event: EventSummary;
}

export default function EventCard({ event }: EventCardProps) {
    const getTypeBadgeClass = (type: EventSummary["type"]) => {
        return type === "Presencial" ? "badge-onsite" : "badge-online";
    };

    const getAvailability = (spots: number, lifecycle: EventSummary["lifecycle"]) => {
        if (lifecycle === "past") return { label: "Evento pasado", className: "availability-past" };
        if (spots <= 20) return { label: "Últimos lugares", className: "availability-critical" };
        if (spots <= 80) return { label: "Alta demanda", className: "availability-warning" };
        return { label: "Disponible", className: "availability-ok" };
    };

    const availability = getAvailability(event.spots, event.lifecycle);
    const isLowSpots = event.spots <= 20;
    const summary = event.summary?.trim() || "Evento académico y profesional para impulsar tu perfil.";

    return (
        <article className="event-card">
            <div className="event-image-container">
                <Image
                    src={resolveEventImageSrc(event.image)}
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
                    <span>{formatEventDate(event.date)}</span>
                </div>
            </div>

            <div className="event-content">
                <div className="event-header">
                    <h3 className="event-title">{event.name}</h3>
                    <p className="event-subtitle">{event.place}</p>
                    <p className="event-summary truncate-2-lines">{summary}</p>
                </div>

                <div className="event-details-grid">
                    <div className="event-detail-card">
                        <Calendar className="event-detail-icon" />
                        <div className="event-detail-copy">
                            <span className="event-detail-label">Fecha</span>
                            <span className="event-detail-value">{formatEventDate(event.date)}</span>
                        </div>
                    </div>
                    <div className="event-detail-card">
                        <Clock3 className="event-detail-icon" />
                        <div className="event-detail-copy">
                            <span className="event-detail-label">Horario</span>
                            <span className="event-detail-value">{normalizeEventTimeLabel(event.time)}</span>
                        </div>
                    </div>
                    <div className="event-detail-card event-detail-card-full">
                        <MapPin className="event-detail-icon" />
                        <div className="event-detail-copy">
                            <span className="event-detail-label">Ubicación</span>
                            <span className="event-detail-value truncate-2-lines">{event.location}</span>
                        </div>
                    </div>
                </div>

                <div className="event-footer">
                    <div className="event-spots">
                        <Users className="event-detail-icon" />
                        <div className="event-detail-copy">
                            <span className="spots-label">Cupos disponibles</span>
                            <span className={`spots-count ${isLowSpots ? "spots-low" : ""}`}>
                                {event.lifecycle === "past" ? "Finalizado" : event.spots}
                            </span>
                        </div>
                    </div>

                    <Link href={`/eventos/${event.id}`} className="event-cta">
                        Ver evento
                        <ArrowRight className="event-cta-icon" />
                    </Link>
                </div>
            </div>
        </article>
    );
}
