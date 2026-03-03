const ISO_DATE_ONLY_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_TOKEN_REGEX = /(\d{1,2}:\d{2}\s*(?:[ap]\.?m\.?)?)/gi;
const TIME_INPUT_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

function normalizeMeridiem(token: string): { value: string; meridiem: "am" | "pm" | null } {
  const compact = token.trim().toLowerCase().replace(/\s+/g, "");
  const meridiem = /a\.?m\.?$/.test(compact) ? "am" : /p\.?m\.?$/.test(compact) ? "pm" : null;
  const value = compact.replace(/(a\.?m\.?|p\.?m\.?)$/, "").replace(/\./g, "");
  return { value, meridiem };
}

function timeTokenToMinutes(token: string): number | null {
  const { value, meridiem } = normalizeMeridiem(token);
  const match = /^(\d{1,2}):(\d{2})$/.exec(value);
  if (!match) return null;

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (Number.isNaN(hours) || Number.isNaN(minutes) || minutes < 0 || minutes > 59) {
    return null;
  }

  if (meridiem) {
    if (hours < 1 || hours > 12) return null;
    if (meridiem === "am") {
      hours = hours === 12 ? 0 : hours;
    } else {
      hours = hours === 12 ? 12 : hours + 12;
    }
  } else if (hours < 0 || hours > 23) {
    return null;
  }

  return (hours * 60) + minutes;
}

function minutesToHHMM(totalMinutes: number): string {
  const minutesPerDay = 24 * 60;
  const normalized = ((totalMinutes % minutesPerDay) + minutesPerDay) % minutesPerDay;
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function extractTimeWindow(value: string): [number, number] | null {
  const tokens = value.match(TIME_TOKEN_REGEX);
  if (!tokens || tokens.length === 0) return null;

  const start = timeTokenToMinutes(tokens[0]);
  if (start === null) return null;

  if (tokens.length < 2) {
    return [start, start];
  }

  let end = timeTokenToMinutes(tokens[1]);
  if (end === null) return null;
  if (end < start) end += 24 * 60;

  return [start, end];
}

export function normalizeEventTimeLabel(value: string): string {
  const window = extractTimeWindow(value);
  if (!window) return value.trim();
  const [start, end] = window;
  if (end <= start) return value.trim();
  return `${minutesToHHMM(start)} - ${minutesToHHMM(end)}`;
}

export function parseEventTimeRange(value: string): { startTime: string; endTime: string } {
  const window = extractTimeWindow(value);
  if (!window) return { startTime: "", endTime: "" };

  const [start, end] = window;
  if (end <= start) return { startTime: "", endTime: "" };

  return {
    startTime: minutesToHHMM(start),
    endTime: minutesToHHMM(end),
  };
}

export function buildEventTimeRange(startTime: string, endTime: string): string | null {
  const startMatch = TIME_INPUT_REGEX.exec(startTime);
  const endMatch = TIME_INPUT_REGEX.exec(endTime);
  if (!startMatch || !endMatch) return null;

  const start = (Number(startMatch[1]) * 60) + Number(startMatch[2]);
  const end = (Number(endMatch[1]) * 60) + Number(endMatch[2]);
  if (end <= start) return null;

  return `${startTime} - ${endTime}`;
}

export function parseDateValue(value: string): Date | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const isoDateOnly = ISO_DATE_ONLY_REGEX.exec(trimmed);
  if (isoDateOnly) {
    const year = Number(isoDateOnly[1]);
    const month = Number(isoDateOnly[2]);
    const day = Number(isoDateOnly[3]);
    const parsed = new Date(year, month - 1, day, 12, 0, 0, 0);
    if (
      parsed.getFullYear() !== year
      || parsed.getMonth() !== month - 1
      || parsed.getDate() !== day
    ) {
      return null;
    }
    return parsed;
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

export function formatEventDate(
  value: string,
  options: Intl.DateTimeFormatOptions = { day: "2-digit", month: "2-digit", year: "numeric" },
): string {
  const parsed = parseDateValue(value);
  if (!parsed) return value;
  return parsed.toLocaleDateString("es-MX", options);
}

export function getYearMonthKey(value: string): string {
  const parsed = parseDateValue(value);
  if (!parsed) return "";
  return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}`;
}

export function formatMonthYearLabel(value: string): string {
  const parsed = parseDateValue(value);
  if (!parsed) return value;
  const label = parsed.toLocaleDateString("es-MX", { month: "long", year: "numeric" });
  return label.charAt(0).toUpperCase() + label.slice(1);
}
