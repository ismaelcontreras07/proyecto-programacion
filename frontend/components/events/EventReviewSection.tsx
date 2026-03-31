"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquareText, Star } from "lucide-react";
import {
  createOrUpdateEventReview,
  fetchEventReviews,
  type EventLifecycle,
  type EventReviewPublic,
} from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { formatEventDate } from "../../lib/datetime";

interface EventReviewSectionProps {
  eventId: string;
  eventLifecycle: EventLifecycle;
}

function formatReviewDate(value: string): string {
  return formatEventDate(value);
}

function renderStars(rating: number) {
  return (
    <span className="event-review-stars" aria-label={`${rating} de 5 estrellas`}>
      {Array.from({ length: 5 }).map((_, index) => {
        const starValue = index + 1;
        return (
          <Star
            key={starValue}
            size={14}
            className={starValue <= rating ? "event-review-star-active" : "event-review-star"}
            fill={starValue <= rating ? "currentColor" : "none"}
          />
        );
      })}
    </span>
  );
}

export default function EventReviewSection({ eventId, eventLifecycle }: EventReviewSectionProps) {
  const router = useRouter();
  const { accessToken, isAuthenticated, user } = useAuth();
  const [reviews, setReviews] = useState<EventReviewPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const loadReviews = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetchEventReviews(eventId);
      setReviews(response);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No se pudieron cargar las reseñas");
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    void loadReviews();
  }, [loadReviews]);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return total / reviews.length;
  }, [reviews]);

  const canReview = eventLifecycle === "past";

  const handleSubmitReview = async () => {
    setError("");
    setSuccessMessage("");

    if (!canReview) {
      setError("Las reseñas se habilitan cuando el evento finaliza.");
      return;
    }

    if (!isAuthenticated || !accessToken) {
      router.push("/login");
      return;
    }

    if (user?.role !== "user") {
      setError("Solo cuentas de alumno pueden calificar y comentar eventos.");
      return;
    }

    if (rating < 1 || rating > 5) {
      setError("Selecciona una calificación de 1 a 5 estrellas.");
      return;
    }

    if (comment.trim().length < 3) {
      setError("Escribe un comentario de al menos 3 caracteres.");
      return;
    }

    setSubmitting(true);
    try {
      await createOrUpdateEventReview(accessToken, eventId, {
        rating,
        comment: comment.trim(),
      });
      setSuccessMessage("Tu reseña fue guardada correctamente.");
      await loadReviews();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "No se pudo guardar tu reseña");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="event-reviews-section">
      <article className="event-reviews-panel">
        <header className="event-reviews-header">
          <h2>
            <MessageSquareText size={18} />
            Calificaciones y comentarios
          </h2>
          <p>
            {reviews.length > 0
              ? `${averageRating.toFixed(1)} / 5 (${reviews.length} reseña${reviews.length === 1 ? "" : "s"})`
              : "Aún no hay reseñas para este evento."}
          </p>
        </header>

        {!canReview && (
          <p className="event-reviews-note">
            Este evento sigue activo. Podrás calificarlo y comentarlo cuando finalice.
          </p>
        )}

        {error && <p className="event-detail-register-error">{error}</p>}
        {successMessage && <p className="event-detail-register-success">{successMessage}</p>}

        {canReview && (
          <div className="event-review-form">
            <div className="event-review-rating-picker" role="group" aria-label="Seleccionar calificación">
              {Array.from({ length: 5 }).map((_, index) => {
                const starValue = index + 1;
                const active = starValue <= rating;
                return (
                  <button
                    key={starValue}
                    type="button"
                    className={`event-review-star-btn${active ? " is-active" : ""}`}
                    onClick={() => setRating(starValue)}
                    aria-label={`${starValue} estrella${starValue > 1 ? "s" : ""}`}
                  >
                    <Star size={18} fill={active ? "currentColor" : "none"} />
                  </button>
                );
              })}
            </div>

            <label className="event-review-comment-label" htmlFor="event-review-comment">
              Comentario
            </label>
            <textarea
              id="event-review-comment"
              className="event-review-comment-input"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              rows={4}
              placeholder="Comparte tu experiencia en este evento"
              maxLength={1200}
            />

            <button
              type="button"
              className="event-detail-register-btn"
              onClick={() => void handleSubmitReview()}
              disabled={submitting}
            >
              {submitting ? "Guardando..." : "Guardar reseña"}
            </button>
          </div>
        )}

        <div className="event-review-list">
          {loading ? (
            <p className="event-reviews-note">Cargando reseñas...</p>
          ) : reviews.length === 0 ? (
            <p className="event-reviews-note">Aún no hay comentarios de alumnos.</p>
          ) : (
            reviews.map((review) => (
              <article key={review.id} className="event-review-item">
                <div className="event-review-item-head">
                  <strong>{`${review.first_name} ${review.last_name}`.trim()}</strong>
                  {renderStars(review.rating)}
                </div>
                <p>{review.comment}</p>
                <small>Actualizado el {formatReviewDate(review.updated_at)}</small>
              </article>
            ))
          )}
        </div>
      </article>
    </section>
  );
}
