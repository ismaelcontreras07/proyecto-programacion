"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CircleCheck, LogIn, Ticket } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

interface EventRegistrationActionProps {
  eventId: string;
  eventName: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

async function parseApiError(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as { detail?: string };
    return payload.detail ?? "No se pudo completar el registro";
  } catch {
    return "No se pudo completar el registro";
  }
}

export default function EventRegistrationAction({ eventId, eventName }: EventRegistrationActionProps) {
  const { isAuthenticated, isLoading, accessToken } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleRegister = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (isLoading) return;

    if (!isAuthenticated || !accessToken) {
      router.push("/login");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/registrations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          event_id: eventId,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error(await parseApiError(response));
      }

      setSuccessMessage(`Tu registro para "${eventName}" quedó confirmado.`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No se pudo completar el registro");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <article className="event-detail-register-card">
      <h3 className="event-detail-register-title">Registro al evento</h3>
      <p className="event-detail-register-description">
        Para registrarte debes tener sesión activa. El sistema usará automáticamente los datos de tu cuenta.
      </p>

      {errorMessage && <p className="event-detail-register-error">{errorMessage}</p>}
      {successMessage && <p className="event-detail-register-success">{successMessage}</p>}

      <div className="event-detail-register-actions">
        {isAuthenticated ? (
          <button type="button" onClick={handleRegister} className="event-detail-register-btn" disabled={submitting}>
            <Ticket size={16} />
            {submitting ? "Registrando..." : "Registrarme al evento"}
          </button>
        ) : (
          <button
            type="button"
            className="event-detail-register-btn event-detail-register-btn-login"
            onClick={() => router.push("/login")}
          >
            <LogIn size={16} />
            Iniciar sesión para registrarme
          </button>
        )}
      </div>

      {isAuthenticated && (
        <p className="event-detail-register-note">
          <CircleCheck size={14} />
          Si ya tienes sesión, no necesitas llenar formularios adicionales.
        </p>
      )}
    </article>
  );
}

