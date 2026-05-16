"use client";

import { FlightDashboard } from "@/components/FlightDashboard";
import { FlightSearch } from "@/components/FlightSearch";
import { readJsonResponse } from "@/lib/api-response";
import type { FlightLookupResult } from "@/lib/types";
import { Plane } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type ApiResponse = FlightLookupResult & {
  meta?: { provider: string; date: string; demo: boolean };
  error?: string;
};

function writeSearchParams(flight: string, date: string) {
  const url = new URL(window.location.href);
  url.searchParams.set("flight", flight);
  url.searchParams.set("date", date);
  window.history.pushState(null, "", url);
}

export default function Home() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchValues, setSearchValues] = useState({
    flight: "",
    date: new Date().toISOString().slice(0, 10),
  });

  const handleSearch = useCallback(async (
    flight: string,
    date: string,
    updateUrl = true,
  ) => {
    const normalizedFlight = flight.trim().toUpperCase();
    setSearchValues({ flight: normalizedFlight, date });

    if (updateUrl) {
      writeSearchParams(normalizedFlight, date);
    }

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const params = new URLSearchParams({ flight: normalizedFlight, date });
      const res = await fetch(`/api/flight?${params}`);
      const json = await readJsonResponse<ApiResponse>(res);

      if (!res.ok) {
        throw new Error(json.error ?? `Could not fetch flight (${res.status})`);
      }

      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    function searchFromUrl() {
      const params = new URLSearchParams(window.location.search);
      const flight = params.get("flight")?.trim().toUpperCase() ?? "";
      const date =
        params.get("date") ?? new Date().toISOString().slice(0, 10);

      setSearchValues({ flight, date });

      if (flight) {
        void handleSearch(flight, date, false);
      }
    }

    searchFromUrl();
    window.addEventListener("popstate", searchFromUrl);
    return () => window.removeEventListener("popstate", searchFromUrl);
  }, [handleSearch]);

  return (
    <main className="min-h-screen">
      <div className="hero-gradient pointer-events-none fixed inset-0 -z-10" />

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
        <header className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center justify-center rounded-2xl bg-sky-500/20 p-4 ring-1 ring-sky-400/30">
            <Plane className="h-10 w-10 text-sky-300" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Pickup Pilot
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-lg text-slate-300">
            Enter your flight — status, delay, terminal, gate, baggage carousel,
            arrival weather, and pre-departure checklist.
          </p>
        </header>

        <FlightSearch
          onSearch={(flight, date) => handleSearch(flight, date, false)}
          loading={loading}
          initialFlight={searchValues.flight}
          initialDate={searchValues.date}
          onUrlSync={writeSearchParams}
        />

        {error && (
          <p
            role="alert"
            className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-center text-red-200"
          >
            {error}
          </p>
        )}

        {data && (
          <div className="mt-8">
            <FlightDashboard data={data} />
          </div>
        )}

        {!data && !loading && !error && (
          <p className="mt-8 text-center text-sm text-slate-500">
            Examples: AF123 (demo), BA117 (simulated delay)
          </p>
        )}
      </div>
    </main>
  );
}
