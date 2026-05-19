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
  const [routeOpen, setRouteOpen] = useState(Boolean(initialArrival));
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
    setRouteOpen(Boolean(initialArrival));
  }, [initialArrival, initialOrigin]);

  useEffect(() => {
    setDate(initialDate ?? today);
  }, [initialDate, today]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (routeOpen) {
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
    <form onSubmit={handleSubmit} className="glass-card space-y-5 p-6">
      {!routeOpen ? (
        <>
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

          <p className="text-center">
            <button
              type="button"
              onClick={() => setRouteOpen(true)}
              className="text-sm text-slate-500 underline-offset-2 transition hover:text-sky-300 hover:underline"
            >
              Don&apos;t know the flight number? Search by airport
            </button>
          </p>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-300">
              Search by airport
            </p>
            <button
              type="button"
              onClick={() => setRouteOpen(false)}
              className="shrink-0 text-sm text-slate-500 underline-offset-2 transition hover:text-sky-300 hover:underline"
            >
              ← Flight number instead
            </button>
          </div>

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
        </>
      )}
    </form>
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
