export interface ParsedFlight {
  carrier: string;
  number: string;
  display: string;
}

/** Parse "AF123", "AF 123", "af1234" into carrier + number */
export function parseFlightNumber(input: string): ParsedFlight | null {
  const cleaned = input.trim().toUpperCase().replace(/\s+/g, "");
  const match = cleaned.match(/^([A-Z]{2,3})(\d{1,4})$/);
  if (!match) return null;
  const [, carrier, number] = match;
  return {
    carrier,
    number,
    display: `${carrier}${number}`,
  };
}

export function formatTime(iso: string | null, locale = "en-US"): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleTimeString(locale, {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function formatDate(iso: string, locale = "en-US"): string {
  return new Date(iso).toLocaleDateString(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

/** Format YYYY-MM-DD for display (search date) */
export function formatSearchDate(isoDate: string, locale = "en-US"): string {
  if (!isoDate) return "—";
  const d = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString(locale, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

/** Format AeroDataBox local time strings (e.g. 2026-04-21 15:52-07:00) */
export function formatLegDate(local: string | null | undefined, locale = "en-US"): string | null {
  if (!local) return null;
  try {
    const d = new Date(local);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleDateString(locale, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  } catch {
    return null;
  }
}
