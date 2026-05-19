import type { FlightInfo, FlightSearchResult, FlightStatus } from "../types";
import { formatLegDate, formatTime } from "../flight-parser";

function isDepartureInFuture(scheduledLocal?: string): boolean {
  if (!scheduledLocal) return false;
  const t = new Date(scheduledLocal).getTime();
  if (Number.isNaN(t)) return false;
  return t > Date.now() + 10 * 60_000;
}

function mapStatus(
  text: string | undefined,
  departureScheduled?: string,
): { status: FlightStatus; label: string } {
  if (isDepartureInFuture(departureScheduled)) {
    return { status: "scheduled", label: "Scheduled" };
  }

  const s = (text ?? "").toLowerCase();
  if (s.includes("cancel")) return { status: "cancelled", label: "Cancelled" };
  if (s.includes("delay")) return { status: "delayed", label: "Delayed" };
  if (s.includes("landed") || s.includes("arrived"))
    return { status: "landed", label: "Landed" };
  if (s.includes("approaching"))
    return { status: "in_air", label: "Approaching" };
  if (s.includes("airborne") || s.includes("en route") || s.includes("enroute"))
    return { status: "in_air", label: "In flight" };
  if (s.includes("boarding")) return { status: "boarding", label: "Boarding" };
  if (s.includes("departed")) return { status: "departed", label: "Departed" };
  if (
    s.includes("expected") ||
    s.includes("scheduled") ||
    s.includes("predicted") ||
    s.includes("unknown")
  ) {
    return { status: "scheduled", label: "Scheduled" };
  }

  return { status: "scheduled", label: "Scheduled" };
}

function normalizeFlightNumber(value: string) {
  return value.replace(/\s+/g, "").toUpperCase();
}

function normalizeAirport(value: string) {
  return value.trim().toUpperCase();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapAeroFlight(raw: any, display: string, flightDate: string): FlightInfo {
  const dep = raw.departure;
  const arr = raw.arrival;

  const depScheduled = dep?.scheduledTime?.local ?? dep?.scheduledTime?.utc;
  const depRevised =
    dep?.revisedTime?.local ??
    dep?.predictedTime?.local ??
    dep?.runwayTime?.local;
  const arrScheduled = arr?.scheduledTime?.local ?? arr?.scheduledTime?.utc;
  const arrRevised = arr?.revisedTime?.local ?? arr?.predictedTime?.local;

  let delayMinutes: number | null = null;
  if (typeof dep?.delay === "number") delayMinutes = dep.delay;
  else if (depScheduled && depRevised) {
    const diff = new Date(depRevised).getTime() - new Date(depScheduled).getTime();
    delayMinutes = diff > 0 ? Math.round(diff / 60_000) : 0;
  }

  const statusText =
    typeof raw.status === "string" ? raw.status : raw.status?.text;
  const { status, label } = mapStatus(statusText, depScheduled);

  return {
    flightNumber: display,
    carrier: raw.airline?.name ?? raw.airline?.iata ?? display.slice(0, 2),
    flightDate,
    status: delayMinutes && delayMinutes > 0 ? "delayed" : status,
    statusLabel:
      delayMinutes && delayMinutes > 0
        ? `Delayed (+${delayMinutes} min)`
        : label,
    delayMinutes,
    departure: {
      airport: dep?.airport?.iata ?? "—",
      airportName: dep?.airport?.name ?? dep?.airport?.shortName ?? "—",
      city: dep?.airport?.municipalityName ?? "",
      terminal: dep?.terminal ?? null,
      gate: dep?.gate ?? null,
      scheduledDate: formatLegDate(depScheduled),
      scheduledTime: formatTime(depScheduled),
      estimatedTime: depRevised ? formatTime(depRevised) : null,
      actualTime: dep?.actualTime?.local
        ? formatTime(dep.actualTime.local)
        : dep?.runwayTime?.local
          ? formatTime(dep.runwayTime.local)
          : null,
    },
    arrival: {
      airport: arr?.airport?.iata ?? "—",
      airportName: arr?.airport?.name ?? arr?.airport?.shortName ?? "—",
      city: arr?.airport?.municipalityName ?? "",
      terminal: arr?.terminal ?? null,
      gate: arr?.gate ?? null,
      scheduledDate: formatLegDate(arrScheduled),
      scheduledTime: formatTime(arrScheduled),
      estimatedTime: arrRevised ? formatTime(arrRevised) : null,
      actualTime: arr?.actualTime?.local ? formatTime(arr.actualTime.local) : null,
    },
    baggageCarousel: arr?.baggageBelt ?? null,
    aircraft: raw.aircraft?.model ?? raw.aircraft?.reg ?? null,
    provider: "aerodatabox",
  };
}

export async function fetchAeroDataBoxFlight(
  display: string,
  date: string,
): Promise<FlightInfo | null> {
  const apiKey = process.env.AERODATABOX_API_KEY;
  if (!apiKey) throw new Error("AERODATABOX_API_KEY missing");

  const host = process.env.AERODATABOX_HOST ?? "aerodatabox.p.rapidapi.com";

  const params = new URLSearchParams({
    dateLocal: date,
    withAircraftImage: "false",
    withLocation: "false",
    withFlightPlan: "false",
  });

  const res = await fetch(
    `https://${host}/flights/number/${encodeURIComponent(display)}?${params}`,
    {
      headers: {
        "Content-Type": "application/json",
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": host,
      },
    },
  );

  const body = await res.text();

  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(
      `AeroDataBox failed (${res.status}): ${body.slice(0, 200) || res.statusText}`,
    );
  }

  let data: unknown;
  try {
    data = JSON.parse(body);
  } catch {
    throw new Error("AeroDataBox returned an invalid response");
  }
  const flights = Array.isArray(data) ? data : [data];
  const flight = flights[0];
  if (!flight) return null;
  return mapAeroFlight(flight, display, date);
}

async function fetchAirportArrivalsWindow(
  arrivalAirport: string,
  date: string,
  fromTime: string,
  toTime: string,
): Promise<unknown[]> {
  const apiKey = process.env.AERODATABOX_API_KEY;
  if (!apiKey) throw new Error("AERODATABOX_API_KEY missing");

  const host = process.env.AERODATABOX_HOST ?? "aerodatabox.p.rapidapi.com";
  const params = new URLSearchParams({
    direction: "Arrival",
    withLeg: "true",
    withCancelled: "true",
    withCodeshared: "true",
    withCargo: "false",
    withPrivate: "false",
  });

  const res = await fetch(
    `https://${host}/flights/airports/iata/${encodeURIComponent(
      arrivalAirport,
    )}/${date}T${fromTime}/${date}T${toTime}?${params}`,
    {
      headers: {
        "Content-Type": "application/json",
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": host,
      },
    },
  );

  const body = await res.text();

  if (!res.ok) {
    throw new Error(
      `AeroDataBox airport search failed (${res.status}): ${
        body.slice(0, 200) || res.statusText
      }`,
    );
  }

  let data: unknown;
  try {
    data = JSON.parse(body);
  } catch {
    throw new Error("AeroDataBox returned an invalid airport search response");
  }

  if (!data || typeof data !== "object") return [];
  const arrivals = (data as { arrivals?: unknown[] }).arrivals;
  return Array.isArray(arrivals) ? arrivals : [];
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapAirportArrival(raw: any, arrivalAirport: string): FlightSearchResult | null {
  const number = typeof raw.number === "string" ? raw.number : "";
  if (!number) return null;

  const dep = raw.departure;
  const arr = raw.arrival;
  const statusText =
    typeof raw.status === "string" ? raw.status : raw.status?.text;
  const { status, label } = mapStatus(statusText, dep?.scheduledTime?.local);

  return {
    flightNumber: normalizeFlightNumber(number),
    airline: raw.airline?.name ?? raw.airline?.iata ?? number.slice(0, 2),
    status,
    statusLabel: label,
    departure: {
      airport: dep?.airport?.iata ?? "—",
      city: dep?.airport?.municipalityName ?? dep?.airport?.name ?? "",
      scheduledTime: formatTime(dep?.scheduledTime?.local ?? dep?.scheduledTime?.utc),
    },
    arrival: {
      airport: arr?.airport?.iata ?? arrivalAirport,
      city: arr?.airport?.municipalityName ?? arr?.airport?.name ?? "",
      scheduledTime: formatTime(arr?.scheduledTime?.local ?? arr?.scheduledTime?.utc),
      terminal: arr?.terminal ?? null,
    },
  };
}

export async function searchAeroDataBoxArrivals({
  arrivalAirport,
  originAirport,
  date,
}: {
  arrivalAirport: string;
  originAirport?: string;
  date: string;
}): Promise<FlightSearchResult[]> {
  const normalizedArrival = normalizeAirport(arrivalAirport);
  const normalizedOrigin = originAirport ? normalizeAirport(originAirport) : "";

  const morning = await fetchAirportArrivalsWindow(
    normalizedArrival,
    date,
    "00:00",
    "11:59",
  );
  // Basic RapidAPI plans can reject concurrent/rapid requests.
  await wait(1100);
  const afternoon = await fetchAirportArrivalsWindow(
    normalizedArrival,
    date,
    "12:00",
    "23:59",
  );

  const seen = new Set<string>();
  return [...morning, ...afternoon]
    .filter((raw) => {
      if (!normalizedOrigin) return true;
      const depAirport =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (raw as any)?.departure?.airport?.iata?.toUpperCase() ?? "";
      return depAirport === normalizedOrigin;
    })
    .sort((a, b) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const aTime = (a as any)?.arrival?.scheduledTime?.local ?? "";
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const bTime = (b as any)?.arrival?.scheduledTime?.local ?? "";
      return new Date(aTime).getTime() - new Date(bTime).getTime();
    })
    .map((raw) => mapAirportArrival(raw, normalizedArrival))
    .filter((flight): flight is FlightSearchResult => Boolean(flight))
    .filter((flight) => {
      const key = `${flight.flightNumber}-${flight.arrival.scheduledTime}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}
