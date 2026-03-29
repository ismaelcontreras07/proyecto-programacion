import React from "react";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, Clock3 } from "lucide-react";
import { resolveEventImageSrc, type EventSummary } from "../../lib/api";
import { formatEventDate, normalizeEventTimeLabel } from "../../lib/datetime";
import "./event-card.css";

interface EventCardProps {
    event: EventSummary;
}

export default function EventCard({ event }: EventCardProps) {
    const statusLabel = event.lifecycle === "past"
        ? "Pasado"
        : event.spots <= 20
            ? "Últimos lugares"
            : "Activo";
    const summary = event.summary?.trim() || "Evento académico y profesional para impulsar tu perfil.";

    return (
        <article className="event-card">
            <div className="event-media">
                <div className="event-image-wrap">
                    <Image
                        src={resolveEventImageSrc(event.image)}
                        alt={event.name}
                        fill
                        className="event-image"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        quality={72}
                    />
                </div>
                <div className="event-media-overlay" />

                <div className="event-top-tags">
                    <span className="event-tag">{event.type}</span>
                    <span className="event-tag event-tag-muted">{statusLabel}</span>
                </div>

                <div className="event-media-action">
                    <Link href={`/eventos/${event.id}`} className="event-action-btn">
                        <BookOpen size={14} />
                        Ver evento
                    </Link>
                </div>
            </div>

            <div className="event-body">
                <div className="event-copy">
                    <h3 className="event-title">{event.name}</h3>
                    <p className="event-summary">{summary}</p>
                </div>

                <div className="event-footer">
                    <div className="event-author">
                        <div className="event-avatar">U</div>
                        <div className="event-author-copy">
                            <span className="event-author-name">UNIMEX</span>
                            <span className="event-author-date">{formatEventDate(event.date)}</span>
                        </div>
                    </div>

                    <div className="event-read-time">
                        <Clock3 size={12} />
                        <span>{normalizeEventTimeLabel(event.time)}</span>
                    </div>
                </div>
            </div>
        </article>
    );
}
