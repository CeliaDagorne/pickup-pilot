"use client";

import { FlightDashboard } from "@/components/FlightDashboard";
import { FlightSearch } from "@/components/FlightSearch";
import { readJsonResponse } from "@/lib/api-response";
import type { FlightLookupResult } from "@/lib/types";
import { Plane } from "lucide-react";
import { useCallback, useState } from "react";

type ApiResponse = FlightLookupResult & {
  meta?: { provider: string; date: string; demo: boolean };
  error?: string;
};

export default function Home() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async (flight: string, date: string) => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const params = new URLSearchParams({ flight, date });
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

  return (
    <main className="min-h-screen">
      <div className="hero-gradient pointer-events-none fixed inset-0 -z-10" />

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
        <header className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center justify-center rounded-2xl bg-sky-500/20 p-4 ring-1 ring-sky-400/30">
            <Plane className="h-10 w-10 text-sky-300" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Airport Companion
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-lg text-slate-300">
            Enter your flight — status, delay, terminal, gate, baggage carousel,
            arrival weather, and pre-departure checklist.
          </p>
        </header>

        <FlightSearch onSearch={handleSearch} loading={loading} />

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
