"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Clock3, MapPin, Ticket, ArrowRight, XCircle } from "lucide-react";
import { cancelMyRegistration, fetchMyRegistrations, type UserEventRegistration } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import "./registrations.css";

function formatDate(date: string, options?: Intl.DateTimeFormatOptions): string {
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return date;
  return parsedDate.toLocaleDateString("es-MX", options ?? {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function MyRegistrationsPage() {
  const { accessToken, isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<UserEventRegistration[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [cancellingRegistrationId, setCancellingRegistrationId] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || !accessToken) {
      router.push("/login");
      return;
    }

    if (user?.role !== "user") {
      setLoadingData(false);
      return;
    }

    const controller = new AbortController();

    const loadRegistrations = async () => {
      setLoadingData(true);
      setError("");
      setSuccessMessage("");
      try {
        const response = await fetchMyRegistrations(accessToken, controller.signal);
        setItems(response);
      } catch (loadError) {
        if (controller.signal.aborted) return;
        setError(loadError instanceof Error ? loadError.message : "No se pudieron cargar tus eventos");
      } finally {
        if (!controller.signal.aborted) {
          setLoadingData(false);
        }
      }
    };

    void loadRegistrations();
    return () => controller.abort();
  }, [accessToken, isAuthenticated, isLoading, router, user?.role]);

  const handleCancelRegistration = async (registrationId: string, eventId: string, eventName: string) => {
    if (!accessToken) return;

    setError("");
    setSuccessMessage("");
    setCancellingRegistrationId(registrationId);
    try {
      await cancelMyRegistration(accessToken, eventId);
      setItems((currentItems) =>
        currentItems.map((item) =>
          item.registration_id === registrationId
            ? { ...item, status: "cancelled" }
            : item,
        ),
      );
      setSuccessMessage(`Cancelaste tu asistencia a "${eventName}".`);
    } catch (cancelError) {
      setError(cancelError instanceof Error ? cancelError.message : "No se pudo cancelar tu asistencia");
    } finally {
      setCancellingRegistrationId(null);
    }
  };

  if (isLoading || loadingData) {
    return (
      <main className="my-events-page">
        <section className="my-events-shell">
          <h1>Mis eventos</h1>
          <p>Cargando tus registros...</p>
        </section>
      </main>
    );
  }

  if (user?.role !== "user") {
    return (
      <main className="my-events-page">
        <section className="my-events-shell">
          <h1>Mis eventos</h1>
          <p>Esta sección está disponible solo para cuentas de alumno.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="my-events-page">
      <section className="my-events-shell">
        <header className="my-events-header">
          <h1>Mis eventos registrados</h1>
          <p>Aquí puedes consultar todos los eventos en los que ya apartaste lugar.</p>
        </header>

        {error && <div className="my-events-alert my-events-alert-error">{error}</div>}
        {!error && successMessage && <div className="my-events-alert my-events-alert-success">{successMessage}</div>}

        {!error && items.length === 0 && (
          <div className="my-events-empty">
            <p>Aún no tienes registros. Explora los eventos y aparta tu lugar.</p>
            <Link href="/" className="my-events-link-btn">
              Ver eventos disponibles
            </Link>
          </div>
        )}

        <div className="my-events-grid">
          {items.map((item) => (
            <article key={item.registration_id} className="my-events-card">
              <span className={`my-events-status ${item.status === "cancelled" ? "my-events-status-cancelled" : ""}`}>
                {item.status === "registered" ? "Registrado" : "Cancelado"}
              </span>
              <h2>{item.event.name}</h2>

              <div className="my-events-meta-grid">
                <div className="my-events-meta-item">
                  <Calendar size={16} />
                  <span>{formatDate(item.event.date)}</span>
                </div>
                <div className="my-events-meta-item">
                  <Clock3 size={16} />
                  <span>{item.event.time}</span>
                </div>
                <div className="my-events-meta-item my-events-meta-item-full">
                  <MapPin size={16} />
                  <span>{item.event.place}</span>
                </div>
                <div className="my-events-meta-item my-events-meta-item-full">
                  <Ticket size={16} />
                  <span>Te registraste el {formatDate(item.registered_at, { day: "2-digit", month: "long", year: "numeric" })}</span>
                </div>
              </div>

              <p className="my-events-summary">{item.event.summary}</p>

              <div className="my-events-actions">
                <Link href={`/eventos/${item.event_id}`} className="my-events-cta">
                  Ver detalle del evento
                  <ArrowRight size={14} />
                </Link>

                {item.status === "registered" ? (
                  <button
                    type="button"
                    className="my-events-cancel-btn"
                    onClick={() => handleCancelRegistration(item.registration_id, item.event_id, item.event.name)}
                    disabled={cancellingRegistrationId === item.registration_id}
                  >
                    <XCircle size={14} />
                    {cancellingRegistrationId === item.registration_id ? "Cancelando..." : "Cancelar asistencia"}
                  </button>
                ) : (
                  <p className="my-events-cancel-note">Tu asistencia ya fue cancelada.</p>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
