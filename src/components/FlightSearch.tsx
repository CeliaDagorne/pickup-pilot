"use client";

import { Search } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

interface FlightSearchProps {
  onSearch: (flight: string, date: string) => void;
  onRouteSearch: (params: {
    arrival: string;
    origin: string;
    date: string;
  }) => void;
  loading: boolean;
  initialFlight?: string;
  initialDate?: string;
  initialArrival?: string;
  initialOrigin?: string;
  onUrlSync?: (flight: string, date: string) => void;
  onRouteUrlSync?: (params: {
    arrival: string;
    origin: string;
    date: string;
  }) => void;
}

export function FlightSearch({
  onSearch,
  onRouteSearch,
  loading,
  initialFlight = "",
  initialDate,
  initialArrival = "",
  initialOrigin = "",
  onUrlSync,
  onRouteUrlSync,
}: FlightSearchProps) {
  const today = new Date().toISOString().slice(0, 10);
  const [mode, setMode] = useState<"number" | "route">(
    initialArrival ? "route" : "number",
  );
  const [flight, setFlight] = useState(initialFlight);
  const [date, setDate] = useState(initialDate ?? today);
  const [arrival, setArrival] = useState(initialArrival);
  const [origin, setOrigin] = useState(initialOrigin);

  useEffect(() => {
    setFlight(initialFlight);
  }, [initialFlight]);

  useEffect(() => {
    setArrival(initialArrival);
    setOrigin(initialOrigin);
    if (initialArrival) setMode("route");
  }, [initialArrival, initialOrigin]);

  useEffect(() => {
    setDate(initialDate ?? today);
  }, [initialDate, today]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (mode === "route") {
      const normalizedArrival = arrival.trim().toUpperCase();
      const normalizedOrigin = origin.trim().toUpperCase();
      if (!normalizedArrival) return;
      const params = {
        arrival: normalizedArrival,
        origin: normalizedOrigin,
        date,
      };
      onRouteUrlSync?.(params);
      onRouteSearch(params);
      return;
    }

    const normalizedFlight = flight.trim().toUpperCase();
    if (!normalizedFlight) return;
    onUrlSync?.(normalizedFlight, date);
    onSearch(normalizedFlight, date);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="glass-card space-y-5 p-6"
    >
      <div className="mx-auto flex w-fit max-w-full rounded-xl border border-white/10 bg-slate-950/40 p-1">
        <ModeButton active={mode === "number"} onClick={() => setMode("number")}>
          Flight number
        </ModeButton>
        <ModeButton active={mode === "route"} onClick={() => setMode("route")}>
          I don&apos;t know the flight number
        </ModeButton>
      </div>

      {mode === "number" ? (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <SearchField
            id="flight"
            label="Flight number"
            type="text"
            placeholder="AF123, BA117, U2456…"
            value={flight}
            onChange={(e) => setFlight(e.target.value)}
            className="flex-1"
            autoComplete="off"
            spellCheck={false}
          />
          <SearchField
            id="date"
            label="Flight date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="sm:w-44"
          />
          <SearchButton disabled={loading || !flight.trim()} loading={loading}>
            Search
          </SearchButton>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto_auto] md:items-end">
          <SearchField
            id="arrival"
            label="Arrival airport"
            type="text"
            placeholder="NCE"
            value={arrival}
            onChange={(e) => setArrival(e.target.value)}
            maxLength={3}
            autoComplete="off"
            spellCheck={false}
          />
          <SearchField
            id="origin"
            label="Origin airport (optional)"
            type="text"
            placeholder="BER"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            maxLength={3}
            autoComplete="off"
            spellCheck={false}
          />
          <SearchField
            id="route-date"
            label="Arrival date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="md:w-44"
          />
          <SearchButton disabled={loading || !arrival.trim()} loading={loading}>
            Find flights
          </SearchButton>
        </div>
      )}
    </form>
  );
}

function ModeButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition ${
        active
          ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20"
          : "text-slate-400 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function SearchButton({
  children,
  disabled,
  loading,
}: {
  children: React.ReactNode;
  disabled: boolean;
  loading: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="btn-primary flex items-center justify-center gap-2 sm:w-auto"
    >
      {loading ? (
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      ) : (
        <Search className="h-5 w-5" />
      )}
      {children}
    </button>
  );
}

function SearchField({
  id,
  label,
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      <label htmlFor={id} className="text-sm font-medium text-sky-200">
        {label}
      </label>
      <input id={id} className="input-field w-full" {...props} />
    </div>
  );
}
