import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Clock3, MapPin } from "lucide-react";
import { resolveEventImageSrc, type EventSummary } from "../../lib/api";
import { formatEventDate, normalizeEventTimeLabel } from "../../lib/datetime";
import "./event-card.css";

interface EventCardProps {
  event: EventSummary;
}

export default function EventCard({ event }: EventCardProps) {
  const statusLabel =
    event.lifecycle === "past"
      ? "Finalizado"
      : event.spots <= 20
        ? "Últimos lugares"
        : "Disponible";

  const summary = event.summary?.trim() || "Evento académico diseñado para fortalecer competencias profesionales.";

  return (
    <motion.article className="event-card" whileHover={{ y: -6 }} transition={{ duration: 0.22, ease: "easeOut" }}>
      <div className="event-card-media">
        <Image
          src={resolveEventImageSrc(event.image)}
          alt={event.name}
          fill
          className="event-card-image"
          sizes="(max-width: 640px) 100vw, (max-width: 1080px) 50vw, 33vw"
          quality={72}
        />

        <div className="event-card-chips">
          <span>{event.type}</span>
          <span className="is-muted">{statusLabel}</span>
        </div>
      </div>

      <div className="event-card-body">
        <h3 className="event-card-title">{event.name}</h3>
        <p className="event-card-summary">{summary}</p>

        <div className="event-card-meta">
          <p>
            <Clock3 size={14} />
            <span>
              {formatEventDate(event.date)} · {normalizeEventTimeLabel(event.time)}
            </span>
          </p>
          <p>
            <MapPin size={14} />
            <span>{event.place}</span>
          </p>
        </div>

        <div className="event-card-footer">
          <span className="event-card-spots">{Math.max(event.spots, 0)} cupos disponibles</span>
          <Link href={`/eventos/${event.id}`} className="event-card-link">
            Ver detalle
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
