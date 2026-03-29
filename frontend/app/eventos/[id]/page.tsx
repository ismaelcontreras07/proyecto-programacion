import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Clock3, GraduationCap, ListChecks, MapPin, Ticket } from "lucide-react";
import EventRegistrationAction from "../../../components/events/EventRegistrationAction";
import EventReviewSection from "../../../components/events/EventReviewSection";
import { resolveEventImageSrc, type EventDetail } from "../../../lib/api";
import { formatEventDate, normalizeEventTimeLabel } from "../../../lib/datetime";
import "./event-detail.css";

type EventDetailPageProps = {
  params: Promise<{ id: string }>;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

function getAvailabilityLabel(spots: number) {
  if (spots < 0) return "Registro cerrado";
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

  const availability = event.lifecycle === "past" ? "Evento finalizado" : getAvailabilityLabel(event.spots);

  return (
    <main className="event-detail-page">
      <section className="event-detail-shell">
        <Link href="/" className="event-back-link">
          <ArrowLeft className="event-back-icon" />
          Volver a eventos
        </Link>

        <article className="event-detail-hero-card">
          <div className="event-detail-hero-media">
            <div className="event-detail-image-wrap">
              <Image
                src={resolveEventImageSrc(event.image)}
                alt={event.name}
                fill
                className="event-detail-image"
                sizes="(max-width: 900px) 100vw, 48vw"
              />
              <div className="event-detail-image-overlay" />
            </div>
            <div className="event-detail-badges">
              <span className="event-detail-badge event-detail-badge-type">{event.type}</span>
              <span className="event-detail-badge event-detail-badge-status">{availability}</span>
            </div>
          </div>
        </article>

        <section className="event-detail-layout">
          <article className="event-detail-main-info">
            <header className="event-detail-head">
              <h1>{event.name}</h1>
              <p>{event.summary}</p>
            </header>

            <div className="event-detail-meta-grid">
              <div className="event-detail-meta-item">
                <Calendar />
                <div>
                  <span>Fecha</span>
                  <strong>{formatEventDate(event.date)}</strong>
                </div>
              </div>
              <div className="event-detail-meta-item">
                <Clock3 />
                <div>
                  <span>Horario</span>
                  <strong>{normalizeEventTimeLabel(event.time)}</strong>
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
                  <span>Cupos</span>
                  <strong>{event.lifecycle === "past" ? "Evento finalizado" : event.spots}</strong>
                </div>
              </div>
            </div>

            <div className="event-detail-address">
              <span>Ubicación completa</span>
              <p>{event.location}</p>
            </div>

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
                <h2>
                  <ListChecks />
                  Requisitos
                </h2>
                <ul>
                  {event.requirements.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            </section>

            <EventReviewSection eventId={event.id} eventLifecycle={event.lifecycle} />
          </article>
          <aside className="event-detail-aside">
            <EventRegistrationAction eventId={event.id} eventName={event.name} eventLifecycle={event.lifecycle} />
          </aside>
        </section>
        <section className="event-detail-mobile-registration">
          <EventRegistrationAction eventId={event.id} eventName={event.name} eventLifecycle={event.lifecycle} />
        </section>
      </section>
    </main>
  );
}
