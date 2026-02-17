import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Clock3, MapPin, Ticket, GraduationCap } from "lucide-react";
import EventRegistrationAction from "../../../components/events/EventRegistrationAction";
import { resolveEventImageSrc, type EventDetail } from "../../../lib/api";
import "./event-detail.css";

type EventDetailPageProps = {
  params: Promise<{ id: string }>;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

function formatDate(date: string, options?: Intl.DateTimeFormatOptions) {
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return date;

  return parsedDate.toLocaleDateString("es-MX", options ?? {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function getAvailabilityLabel(spots: number) {
  if (spots <= 20) return "Últimos lugares";
  if (spots <= 80) return "Alta demanda";
  return "Registro abierto";
}

async function fetchEvent(eventId: string): Promise<EventDetail | null> {
  const response = await fetch(`${API_BASE_URL}/api/events/${eventId}`, { cache: "no-store" });
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`Unable to load event (${response.status})`);
  }
  return (await response.json()) as EventDetail;
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { id } = await params;
  const event = await fetchEvent(id);

  if (!event) {
    notFound();
  }

  const availability = getAvailabilityLabel(event.spots);

  return (
    <main className="event-detail-page">
      <section className="event-detail-shell">
        <Link href="/" className="event-back-link">
          <ArrowLeft className="event-back-icon" />
          Volver a eventos
        </Link>

        <article className="event-detail-hero">
          <div className="event-detail-image-wrap">
            <Image
              src={resolveEventImageSrc(event.image)}
              alt={event.name}
              fill
              className="event-detail-image"
              sizes="(max-width: 900px) 100vw, 42vw"
            />
            <div className="event-detail-image-overlay" />
            <div className="event-detail-badges">
              <span className="event-detail-badge event-detail-badge-type">{event.type}</span>
              <span className="event-detail-badge event-detail-badge-status">{availability}</span>
            </div>
          </div>

          <div className="event-detail-main-info">
            <h1>{event.name}</h1>
            <p>{event.summary}</p>

            <div className="event-detail-meta-grid">
              <div className="event-detail-meta-item">
                <Calendar />
                <div>
                  <span>Fecha</span>
                  <strong>{formatDate(event.date)}</strong>
                </div>
              </div>
              <div className="event-detail-meta-item">
                <Clock3 />
                <div>
                  <span>Horario</span>
                  <strong>{event.time}</strong>
                </div>
              </div>
              <div className="event-detail-meta-item">
                <MapPin />
                <div>
                  <span>Sede</span>
                  <strong>{event.place}</strong>
                </div>
              </div>
              <div className="event-detail-meta-item">
                <Ticket />
                <div>
                  <span>Cupos disponibles</span>
                  <strong>{event.spots}</strong>
                </div>
              </div>
            </div>

            <div className="event-detail-address">
              <span>Ubicación completa</span>
              <p>{event.location}</p>
            </div>
          </div>
        </article>

        <section className="event-detail-sections">
          <article className="event-detail-panel">
            <h2>
              <GraduationCap />
              Agenda del evento
            </h2>
            <ul>
              {event.agenda.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className="event-detail-panel">
            <h2>Requisitos para alumnos</h2>
            <ul>
              {event.requirements.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </section>

        <section className="event-detail-registration">
          <div className="event-detail-registration-copy">
            <h2>Regístrate al evento</h2>
            <p>
              El registro ahora se hace directamente desde tu cuenta activa. Si no tienes sesión iniciada,
              se te enviará automáticamente a la página de acceso.
            </p>
          </div>
          <EventRegistrationAction eventId={event.id} eventName={event.name} />
        </section>
      </section>
    </main>
  );
}
