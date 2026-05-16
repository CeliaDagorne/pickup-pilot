import type { FlightInfo, FlightStatus } from "../types";
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
