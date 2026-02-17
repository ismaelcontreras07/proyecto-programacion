export type Role = "admin" | "user";

export type EventType = "Presencial" | "En línea";

export interface EventSummary {
  id: string;
  image: string;
  name: string;
  date: string;
  time: string;
  place: string;
  location: string;
  spots: number;
  type: EventType;
  summary: string;
}

export interface EventDetail extends EventSummary {
  agenda: string[];
  requirements: string[];
}

export interface UserEventRegistration {
  registration_id: string;
  event_id: string;
  status: "registered" | "cancelled";
  registered_at: string;
  event: EventSummary;
}

export interface RegistrationPublic {
  id: string;
  event_id: string;
  full_name: string;
  student_id: string;
  career: string;
  semester: number;
  status: "registered" | "cancelled";
  created_at: string;
}

export interface AdminSummary {
  total_users: number;
  total_events: number;
  total_registrations: number;
  registrations_today: number;
  top_events: Array<{
    event_id: string;
    event_name: string;
    total_registrations: number;
    available_spots: number;
  }>;
}

export interface EventMutationPayload {
  image: string;
  name: string;
  date: string;
  time: string;
  place: string;
  location: string;
  spots: number;
  type: EventType;
  summary: string;
  agenda: string[];
  requirements: string[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

function toUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}

export function resolveEventImageSrc(image: string): string {
  if (!image) return image;
  if (/^https?:\/\//i.test(image)) return image;
  if (image.startsWith("/uploads/")) return toUrl(image);
  return image;
}

export async function parseApiError(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as { detail?: string };
    return payload.detail ?? `Request failed (${response.status})`;
  } catch {
    return `Request failed (${response.status})`;
  }
}

export async function fetchEvents(params?: {
  type?: EventType;
  month?: number;
  signal?: AbortSignal;
}): Promise<EventSummary[]> {
  const searchParams = new URLSearchParams();
  if (params?.type) searchParams.set("type", params.type);
  if (params?.month) searchParams.set("month", String(params.month));
  const query = searchParams.toString();

  const response = await fetch(toUrl(`/api/events${query ? `?${query}` : ""}`), {
    cache: "no-store",
    signal: params?.signal,
  });
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  return (await response.json()) as EventSummary[];
}

export async function fetchEventById(eventId: string, options?: { signal?: AbortSignal }): Promise<EventDetail | null> {
  const response = await fetch(toUrl(`/api/events/${eventId}`), {
    cache: "no-store",
    signal: options?.signal,
  });

  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  return (await response.json()) as EventDetail;
}

export async function fetchMyRegistrations(accessToken: string, signal?: AbortSignal): Promise<UserEventRegistration[]> {
  const response = await fetch(toUrl("/api/registrations/me"), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
    signal,
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  return (await response.json()) as UserEventRegistration[];
}

export async function cancelMyRegistration(accessToken: string, eventId: string): Promise<RegistrationPublic> {
  const response = await fetch(toUrl(`/api/registrations/event/${eventId}`), {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  return (await response.json()) as RegistrationPublic;
}

export async function fetchAdminSummary(accessToken: string, signal?: AbortSignal): Promise<AdminSummary> {
  const response = await fetch(toUrl("/api/admin/summary"), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
    signal,
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  return (await response.json()) as AdminSummary;
}

export async function createEvent(accessToken: string, payload: EventMutationPayload): Promise<EventDetail> {
  const response = await fetch(toUrl("/api/events"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  return (await response.json()) as EventDetail;
}

export async function uploadEventImage(accessToken: string, file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(toUrl("/api/events/upload-image"), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  const payload = (await response.json()) as { image_url: string };
  return payload.image_url;
}

export async function updateEvent(
  accessToken: string,
  eventId: string,
  payload: EventMutationPayload,
): Promise<EventDetail> {
  const response = await fetch(toUrl(`/api/events/${eventId}`), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  return (await response.json()) as EventDetail;
}

export async function deleteEvent(accessToken: string, eventId: string): Promise<void> {
  const response = await fetch(toUrl(`/api/events/${eventId}`), {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
}
