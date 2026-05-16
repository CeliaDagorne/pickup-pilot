"use client";

import { Search } from "lucide-react";
import { FormEvent, useState } from "react";

interface FlightSearchProps {
  onSearch: (flight: string, date: string) => void;
  loading: boolean;
}

export function FlightSearch({ onSearch, loading }: FlightSearchProps) {
  const today = new Date().toISOString().slice(0, 10);
  const [flight, setFlight] = useState("");
  const [date, setDate] = useState(today);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!flight.trim()) return;
    onSearch(flight.trim().toUpperCase(), date);
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
