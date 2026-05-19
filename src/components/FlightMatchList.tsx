"use client";

import type { FlightSearchResult } from "@/lib/types";

interface FlightMatchListProps {
  flights: FlightSearchResult[];
  onSelect: (flightNumber: string) => void;
}

export function FlightMatchList({ flights, onSelect }: FlightMatchListProps) {
  return (
    <section className="glass-card p-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-white">Matching flights</h2>
        <p className="text-sm text-slate-400">
          Select the flight you want to track for pickup.
        </p>
      </div>
      <div className="space-y-3">
        {flights.map((match) => (
          <button
            key={`${match.flightNumber}-${match.arrival.scheduledTime}`}
            type="button"
            onClick={() => onSelect(match.flightNumber)}
            className="flex w-full flex-col gap-3 rounded-xl border border-white/10 bg-white/5 p-4 text-left transition hover:border-sky-400/40 hover:bg-white/8 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="text-lg font-bold text-white">
                {match.flightNumber}{" "}
                <span className="text-sm font-normal text-slate-400">
                  {match.airline}
                </span>
              </p>
              <p className="text-sm text-slate-400">
                {match.departure.airport} {match.departure.city} →{" "}
                {match.arrival.airport} {match.arrival.city}
                {match.arrival.terminal ? ` · Terminal ${match.arrival.terminal}` : ""}
              </p>
            </div>
            <div className="flex gap-6 text-sm">
              <span>
                <span className="block text-slate-500">Arrival</span>
                <span className="font-mono text-white">
                  {match.arrival.scheduledTime}
                </span>
              </span>
              <span>
                <span className="block text-slate-500">Status</span>
                <span className="text-sky-300">{match.statusLabel}</span>
              </span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
