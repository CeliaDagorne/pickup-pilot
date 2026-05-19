"use client";

import { FlightDashboard } from "@/components/FlightDashboard";
import { FlightMatchList } from "@/components/FlightMatchList";
import { FlightSearch } from "@/components/FlightSearch";
import { readJsonResponse } from "@/lib/api-response";
import type { FlightLookupResult, FlightSearchResult } from "@/lib/types";
import { Plane } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type ApiResponse = FlightLookupResult & {
  meta?: { provider: string; date: string; demo: boolean };
  error?: string;
};

type RouteSearchResponse = {
  flights: FlightSearchResult[];
  meta?: {
    arrival: string;
    origin: string | null;
    date: string;
    count: number;
  };
  error?: string;
};

function writeSearchParams(flight: string, date: string) {
  const url = new URL(window.location.href);
  url.search = "";
  url.searchParams.set("flight", flight);
  url.searchParams.set("date", date);
  window.history.pushState(null, "", url);
}

function writeRouteSearchParams({
  arrival,
  origin,
  date,
}: {
  arrival: string;
  origin: string;
  date: string;
}) {
  const url = new URL(window.location.href);
  url.search = "";
  url.searchParams.set("arrival", arrival);
  if (origin) url.searchParams.set("origin", origin);
  url.searchParams.set("date", date);
  window.history.pushState(null, "", url);
}

export default function Home() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [matches, setMatches] = useState<FlightSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchValues, setSearchValues] = useState({
    flight: "",
    arrival: "",
    origin: "",
    date: new Date().toISOString().slice(0, 10),
  });

  const handleSearch = useCallback(async (
    flight: string,
    date: string,
    updateUrl = true,
  ) => {
    const normalizedFlight = flight.trim().toUpperCase();
    setSearchValues((prev) => ({ ...prev, flight: normalizedFlight, date }));

    if (updateUrl) {
      writeSearchParams(normalizedFlight, date);
    }

    setLoading(true);
    setError(null);
    setData(null);
    setMatches([]);

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

  const handleRouteSearch = useCallback(async ({
    arrival,
    origin,
    date,
  }: {
    arrival: string;
    origin: string;
    date: string;
  }) => {
    const normalizedArrival = arrival.trim().toUpperCase();
    const normalizedOrigin = origin.trim().toUpperCase();
    setSearchValues({
      flight: "",
      arrival: normalizedArrival,
      origin: normalizedOrigin,
      date,
    });

    setLoading(true);
    setError(null);
    setData(null);
    setMatches([]);

    try {
      const params = new URLSearchParams({ arrival: normalizedArrival, date });
      if (normalizedOrigin) params.set("origin", normalizedOrigin);
      const res = await fetch(`/api/flights/search?${params}`);
      const json = await readJsonResponse<RouteSearchResponse>(res);

      if (!res.ok) {
        throw new Error(json.error ?? `Could not search flights (${res.status})`);
      }

      setMatches(json.flights);
      if (json.flights.length === 0) {
        setError("No matching flights found for this route and date.");
      }
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
      const arrival = params.get("arrival")?.trim().toUpperCase() ?? "";
      const origin = params.get("origin")?.trim().toUpperCase() ?? "";
      const date =
        params.get("date") ?? new Date().toISOString().slice(0, 10);

      setSearchValues({ flight, arrival, origin, date });

      if (flight) {
        void handleSearch(flight, date, false);
      } else if (arrival) {
        void handleRouteSearch({ arrival, origin, date });
      }
    }

    searchFromUrl();
    window.addEventListener("popstate", searchFromUrl);
    return () => window.removeEventListener("popstate", searchFromUrl);
  }, [handleRouteSearch, handleSearch]);

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
            Track an arriving flight by number or find it by airport and route —
            perfect when you&apos;re picking someone up.
          </p>
        </header>

        <FlightSearch
          onSearch={(flight, date) => handleSearch(flight, date, false)}
          onRouteSearch={handleRouteSearch}
          loading={loading}
          initialFlight={searchValues.flight}
          initialDate={searchValues.date}
          initialArrival={searchValues.arrival}
          initialOrigin={searchValues.origin}
          onUrlSync={writeSearchParams}
          onRouteUrlSync={writeRouteSearchParams}
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

        {matches.length > 0 && (
          <div className="mt-8">
            <FlightMatchList
              flights={matches}
              onSelect={(flightNumber) => {
                writeSearchParams(flightNumber, searchValues.date);
                void handleSearch(flightNumber, searchValues.date, false);
              }}
            />
          </div>
        )}

        {!data && !loading && !error && matches.length === 0 && (
          <p className="mt-8 text-center text-sm text-slate-500">
            Examples: AF123 · route search NCE from BER on today&apos;s date
          </p>
        )}
      </div>
    </main>
  );
}
