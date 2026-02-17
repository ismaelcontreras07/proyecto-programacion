"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  createEvent,
  deleteEvent,
  fetchEventById,
  fetchEvents,
  resolveEventImageSrc,
  type EventMutationPayload,
  type EventSummary,
  type EventType,
  uploadEventImage,
  updateEvent,
} from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import "./admin.css";

type EventFormState = {
  image: string;
  name: string;
  date: string;
  time: string;
  place: string;
  location: string;
  spots: number;
  type: EventType;
  summary: string;
  agenda: string;
  requirements: string;
};

const DEFAULT_FORM: EventFormState = {
  image: "",
  name: "",
  date: "",
  time: "",
  place: "",
  location: "",
  spots: 50,
  type: "Presencial",
  summary: "",
  agenda: "",
  requirements: "",
};

function linesToItems(value: string): string[] {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function formToPayload(form: EventFormState): EventMutationPayload {
  return {
    image: form.image.trim(),
    name: form.name.trim(),
    date: form.date,
    time: form.time.trim(),
    place: form.place.trim(),
    location: form.location.trim(),
    spots: Number(form.spots),
    type: form.type,
    summary: form.summary.trim(),
    agenda: linesToItems(form.agenda),
    requirements: linesToItems(form.requirements),
  };
}

export default function AdminPage() {
  const { accessToken } = useAuth();
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [form, setForm] = useState<EventFormState>(DEFAULT_FORM);

  const isEditing = useMemo(() => editingEventId !== null, [editingEventId]);

  const loadEvents = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetchEvents();
      setEvents(response);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No se pudieron cargar los eventos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadEvents();
  }, []);

  const resetForm = () => {
    setEditingEventId(null);
    setForm(DEFAULT_FORM);
  };

  const handleEdit = async (eventId: string) => {
    setError("");
    setSuccess("");
    try {
      const detail = await fetchEventById(eventId);
      if (!detail) {
        setError("El evento no existe o fue eliminado.");
        return;
      }
      setEditingEventId(detail.id);
      setForm({
        image: detail.image,
        name: detail.name,
        date: detail.date,
        time: detail.time,
        place: detail.place,
        location: detail.location,
        spots: detail.spots,
        type: detail.type,
        summary: detail.summary,
        agenda: detail.agenda.join("\n"),
        requirements: detail.requirements.join("\n"),
      });
    } catch (editError) {
      setError(editError instanceof Error ? editError.message : "No se pudo cargar el evento");
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!accessToken) return;
    const confirmed = window.confirm("¿Eliminar este evento? También se eliminarán sus registros.");
    if (!confirmed) return;

    setError("");
    setSuccess("");
    try {
      await deleteEvent(accessToken, eventId);
      if (editingEventId === eventId) {
        resetForm();
      }
      setSuccess("Evento eliminado correctamente.");
      await loadEvents();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "No se pudo eliminar el evento");
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!accessToken) return;

    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      if (!form.image.trim()) {
        throw new Error("Debes subir una imagen para el evento.");
      }
      const payload = formToPayload(form);
      if (isEditing && editingEventId) {
        await updateEvent(accessToken, editingEventId, payload);
        setSuccess("Evento actualizado correctamente.");
      } else {
        await createEvent(accessToken, payload);
        setSuccess("Evento creado correctamente.");
      }
      resetForm();
      await loadEvents();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "No se pudo guardar el evento");
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!accessToken) return;
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setError("");
    setSuccess("");
    try {
      const imageUrl = await uploadEventImage(accessToken, file);
      setForm((prev) => ({ ...prev, image: imageUrl }));
      setSuccess("Imagen cargada correctamente.");
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "No se pudo cargar la imagen");
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  };

  return (
    <main className="admin-page">
      <section className="admin-shell">
        <header className="admin-header">
          <h1>Gestión de eventos</h1>
          <p>Solo administradores pueden crear, editar y eliminar eventos.</p>
        </header>

        {error && <div className="admin-alert admin-alert-error">{error}</div>}
        {success && <div className="admin-alert admin-alert-success">{success}</div>}

        <section className="admin-grid">
          <article className="admin-panel">
            <h2>{isEditing ? "Editar evento" : "Nuevo evento"}</h2>
            <form className="admin-form" onSubmit={handleSubmit}>
              <label>
                Nombre
                <input
                  type="text"
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  required
                />
              </label>
              <label className="admin-form-full">
                Imagen del evento
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(event) => void handleImageChange(event)}
                  disabled={uploadingImage}
                />
                <span className="admin-field-help">
                  Formatos permitidos: JPG, PNG o WEBP. Tamaño máximo: 5 MB.
                </span>
                {uploadingImage && <span className="admin-field-help">Subiendo imagen...</span>}
                {form.image && (
                  <span className="admin-field-help">
                    Imagen cargada: {form.image}
                  </span>
                )}
                {form.image && (
                  <Image
                    src={resolveEventImageSrc(form.image)}
                    alt="Vista previa del evento"
                    width={640}
                    height={360}
                    className="admin-image-preview"
                    unoptimized
                  />
                )}
              </label>
              <label>
                Fecha
                <input
                  type="date"
                  value={form.date}
                  onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
                  required
                />
              </label>
              <label>
                Horario
                <input
                  type="text"
                  value={form.time}
                  onChange={(event) => setForm((prev) => ({ ...prev, time: event.target.value }))}
                  placeholder="Ej. 10:00 a.m.-1:00 p.m."
                  required
                />
              </label>
              <label>
                Sede
                <input
                  type="text"
                  value={form.place}
                  onChange={(event) => setForm((prev) => ({ ...prev, place: event.target.value }))}
                  required
                />
              </label>
              <label>
                Ubicación completa
                <input
                  type="text"
                  value={form.location}
                  onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))}
                  required
                />
              </label>
              <label>
                Cupos
                <input
                  type="number"
                  min={0}
                  value={form.spots}
                  onChange={(event) => setForm((prev) => ({ ...prev, spots: Number(event.target.value) }))}
                  required
                />
              </label>
              <label>
                Tipo
                <select
                  value={form.type}
                  onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value as EventType }))}
                >
                  <option value="Presencial">Presencial</option>
                  <option value="En línea">En línea</option>
                </select>
              </label>
              <label className="admin-form-full">
                Resumen
                <textarea
                  value={form.summary}
                  onChange={(event) => setForm((prev) => ({ ...prev, summary: event.target.value }))}
                  rows={3}
                  required
                />
              </label>
              <label className="admin-form-full">
                Agenda (una línea por punto)
                <textarea
                  value={form.agenda}
                  onChange={(event) => setForm((prev) => ({ ...prev, agenda: event.target.value }))}
                  rows={4}
                />
              </label>
              <label className="admin-form-full">
                Requisitos (una línea por punto)
                <textarea
                  value={form.requirements}
                  onChange={(event) => setForm((prev) => ({ ...prev, requirements: event.target.value }))}
                  rows={4}
                />
              </label>
              <div className="admin-form-actions admin-form-full">
                <button type="submit" disabled={submitting || uploadingImage}>
                  {submitting ? "Guardando..." : uploadingImage ? "Subiendo imagen..." : isEditing ? "Actualizar evento" : "Crear evento"}
                </button>
                {isEditing && (
                  <button type="button" className="secondary" onClick={resetForm}>
                    Cancelar edición
                  </button>
                )}
              </div>
            </form>
          </article>

          <article className="admin-panel">
            <h2>Eventos publicados</h2>
            {loading ? (
              <p>Cargando eventos...</p>
            ) : events.length === 0 ? (
              <p>No hay eventos disponibles.</p>
            ) : (
              <ul className="admin-event-list">
                {events.map((item) => (
                  <li key={item.id} className="admin-event-row">
                    <div>
                      <strong>{item.name}</strong>
                      <span>{item.date} · {item.type}</span>
                    </div>
                    <div className="admin-event-actions">
                      <button type="button" className="secondary" onClick={() => void handleEdit(item.id)}>
                        Editar
                      </button>
                      <button type="button" className="danger" onClick={() => void handleDelete(item.id)}>
                        Eliminar
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </article>
        </section>
      </section>
    </main>
  );
}
