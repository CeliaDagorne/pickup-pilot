"use client";

import { Search } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

interface FlightSearchProps {
  onSearch: (flight: string, date: string) => void;
  loading: boolean;
  initialFlight?: string;
  initialDate?: string;
  onUrlSync?: (flight: string, date: string) => void;
}

export function FlightSearch({
  onSearch,
  loading,
  initialFlight = "",
  initialDate,
  onUrlSync,
}: FlightSearchProps) {
  const today = new Date().toISOString().slice(0, 10);
  const [flight, setFlight] = useState(initialFlight);
  const [date, setDate] = useState(initialDate ?? today);

  useEffect(() => {
    setFlight(initialFlight);
  }, [initialFlight]);

  useEffect(() => {
    setDate(initialDate ?? today);
  }, [initialDate, today]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const normalizedFlight = flight.trim().toUpperCase();
    if (!normalizedFlight) return;
    onUrlSync?.(normalizedFlight, date);
    onSearch(normalizedFlight, date);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="glass-card flex flex-col gap-4 p-6 sm:flex-row sm:items-end"
    >
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
      <button
        type="submit"
        disabled={loading || !flight.trim()}
        className="btn-primary flex items-center justify-center gap-2 sm:w-auto"
      >
        {loading ? (
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        ) : (
          <Search className="h-5 w-5" />
        )}
        Search
      </button>
    </form>
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
