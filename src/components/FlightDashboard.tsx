"use client";

import type { AirportLeg, FlightLookupResult } from "@/lib/types";
import {
  AlertCircle,
  BaggageClaim,
  Car,
  Clock,
  CloudSun,
  DoorOpen,
  ExternalLink,
  MapPin,
  PlaneLanding,
  PlaneTakeoff,
  Terminal,
} from "lucide-react";
import { formatSearchDate } from "@/lib/flight-parser";
import { StatusBadge } from "./StatusBadge";
import { ChecklistPanel } from "./ChecklistPanel";

interface FlightDashboardProps {
  data: FlightLookupResult & {
    meta?: { provider: string; date: string; demo: boolean };
  };
}

function InfoTile({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="glass-card flex flex-col gap-2 p-4">
      <div className="flex items-center gap-2 text-sky-300/80">
        <Icon className="h-4 w-4 shrink-0" />
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-xl font-bold text-white">{value}</p>
      {sub && <p className="text-sm text-slate-400">{sub}</p>}
    </div>
  );
}

function buildParkingUrl({
  airport,
  terminal,
  flightNumber,
  date,
}: {
  airport: string;
  terminal: string | null;
  flightNumber: string;
  date: string;
}) {
  const template = process.env.NEXT_PUBLIC_PARKING_AFFILIATE_URL;
  const query = new URLSearchParams({
    airport,
    terminal: terminal ?? "",
    flight: flightNumber,
    date,
    utm_source: "airport-companion",
    utm_medium: "arrival-card",
    utm_campaign: "parking",
  });

  if (!template) {
    return `https://www.google.com/search?${new URLSearchParams({
      q: `${airport} airport short stay parking terminal ${terminal ?? ""}`,
    })}`;
  }

  return template
    .replaceAll("{airport}", encodeURIComponent(airport))
    .replaceAll("{terminal}", encodeURIComponent(terminal ?? ""))
    .replaceAll("{flight}", encodeURIComponent(flightNumber))
    .replaceAll("{date}", encodeURIComponent(date))
    .concat(template.includes("?") ? `&${query}` : `?${query}`);
}

function ParkingAffiliateCard({ flight }: { flight: FlightLookupResult["flight"] }) {
  const parkingUrl = buildParkingUrl({
    airport: flight.arrival.airport,
    terminal: flight.arrival.terminal,
    flightNumber: flight.flightNumber,
    date: flight.flightDate,
  });

  return (
    <section className="glass-card overflow-hidden border-sky-400/20 p-6">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-300 ring-1 ring-sky-400/25">
            <Car className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-sky-300">
              Picking someone up?
            </p>
            <h3 className="mt-1 text-xl font-bold text-white">
              Find short-stay parking near {flight.arrival.airport}
              {flight.arrival.terminal ? ` Terminal ${flight.arrival.terminal}` : ""}
            </h3>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              Avoid circling around arrivals. Compare pickup parking options and
              wait close to the terminal while the flight lands and bags arrive.
            </p>
          </div>
        </div>

        <a
          href={parkingUrl}
          target="_blank"
          rel="noreferrer sponsored"
          className="btn-primary inline-flex shrink-0 items-center justify-center gap-2"
        >
          Compare parking
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </section>
  );
}

export function FlightDashboard({ data }: FlightDashboardProps) {
  const { flight, weather, checklist, meta } = data;
  const delay =
    flight.delayMinutes != null && flight.delayMinutes > 0
      ? `+${flight.delayMinutes} min`
      : flight.delayMinutes === 0
        ? "On time"
        : "—";

  return (
    <div className="space-y-6 animate-fade-in">
      {meta?.demo && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
          <p>
            Demo mode — set{" "}
            <code className="rounded bg-black/30 px-1">AERODATABOX_API_KEY</code> in{" "}
            <code className="rounded bg-black/30 px-1">.env.local</code>. Try{" "}
            <strong>AF123</strong> or <strong>BA117</strong>.
          </p>
        </div>
      )}

      <header className="glass-card flex flex-wrap items-center justify-between gap-4 p-6">
        <div>
          <p className="text-sm text-sky-300">{flight.carrier}</p>
          <h2 className="text-3xl font-bold tracking-tight text-white">
            {flight.flightNumber}
          </h2>
          {(flight.flightDate || meta?.date) && (
            <p className="mt-1 text-sm text-slate-400">
              {formatSearchDate(flight.flightDate || meta?.date || "")}
            </p>
          )}
          {flight.aircraft && (
            <p className="mt-1 text-sm text-slate-400">{flight.aircraft}</p>
          )}
        </div>
        <StatusBadge status={flight.status} label={flight.statusLabel} />
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <InfoTile icon={Clock} label="Delay" value={delay} />
        <InfoTile
          icon={Terminal}
          label="Departure terminal"
          value={flight.departure.terminal ?? "—"}
          sub={flight.departure.airport}
        />
        <InfoTile
          icon={DoorOpen}
          label="Departure gate"
          value={flight.departure.gate ?? "—"}
        />
        <InfoTile
          icon={BaggageClaim}
          label="Baggage carousel"
          value={flight.baggageCarousel ?? "—"}
          sub={`Arrival ${flight.arrival.airport}`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <LegCard type="departure" leg={flight.departure} icon={PlaneTakeoff} />
        <LegCard type="arrival" leg={flight.arrival} icon={PlaneLanding} />
      </div>

      <ParkingAffiliateCard flight={flight} />

      {weather && (
        <section className="glass-card p-6">
          <div className="mb-4 flex items-center gap-2 text-sky-300">
            <CloudSun className="h-5 w-5" />
            <h3 className="font-semibold">Arrival weather — {weather.city}</h3>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <span className="text-5xl">{weather.icon}</span>
            <div>
              <p className="text-4xl font-bold text-white">{weather.temperatureC}°C</p>
              <p className="text-slate-300">{weather.condition}</p>
            </div>
            <div className="flex gap-6 text-sm text-slate-400">
              <span>Humidity {weather.humidity}%</span>
              <span>Wind {weather.windKph} km/h</span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {weather.airport}
              </span>
            </div>
          </div>
        </section>
      )}

      <ChecklistPanel items={checklist} />
    </div>
  );
}

function LegCard({
  type,
  leg,
  icon: Icon,
}: {
  type: "departure" | "arrival";
  leg: AirportLeg;
  icon: React.ComponentType<{ className?: string }>;
}) {
  const title = type === "departure" ? "Departure" : "Arrival";

  return (
    <article className="glass-card p-6">
      <div className="mb-4 flex items-center gap-2 text-sky-300">
        <Icon className="h-5 w-5" />
        <h3 className="font-semibold">{title}</h3>
      </div>
      <p className="text-2xl font-bold text-white">
        {leg.airport}{" "}
        <span className="text-lg font-normal text-slate-400">{leg.city}</span>
      </p>
      <p className="text-sm text-slate-400">{leg.airportName}</p>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-slate-500">Scheduled</dt>
          {leg.scheduledDate && (
            <dd className="text-sm font-medium text-slate-300">{leg.scheduledDate}</dd>
          )}
          <dd className="font-mono text-lg text-white">{leg.scheduledTime}</dd>
        </div>
        {leg.estimatedTime && leg.estimatedTime !== leg.scheduledTime && (
          <div>
            <dt className="text-slate-500">Estimated</dt>
            <dd className="font-mono text-lg text-amber-300">{leg.estimatedTime}</dd>
          </div>
        )}
        <div>
          <dt className="text-slate-500">Terminal</dt>
          <dd className="font-semibold text-white">{leg.terminal ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Gate</dt>
          <dd className="font-semibold text-white">{leg.gate ?? "—"}</dd>
        </div>
      </dl>
    </article>
  );
}
