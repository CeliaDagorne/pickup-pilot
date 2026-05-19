import type { FlightInfo, FlightSearchResult } from "../types";
import { fetchAeroDataBoxFlight, searchAeroDataBoxArrivals } from "./aerodatabox";
import { getDemoFlight } from "./demo";
import { searchDemoArrivals } from "./demo-search";

export type ProviderName = "aerodatabox" | "demo";

export function resolveProvider(): ProviderName {
  const forced = process.env.FLIGHT_PROVIDER as ProviderName | undefined;
  if (forced === "demo" || forced === "aerodatabox") {
    return forced;
  }
  if (process.env.AERODATABOX_API_KEY) return "aerodatabox";
  return "demo";
}

export async function lookupFlight(
  carrier: string,
  number: string,
  date: string,
  display: string,
): Promise<{ flight: FlightInfo; provider: ProviderName }> {
  const provider = resolveProvider();

  if (provider === "demo") {
    return { flight: getDemoFlight(display, carrier, date), provider };
  }

  const flight = await fetchAeroDataBoxFlight(display, date);
  if (!flight) throw new Error("Flight not found for this date");
  return { flight, provider };
}

export async function searchFlightsByRoute({
  arrivalAirport,
  originAirport,
  date,
}: {
  arrivalAirport: string;
  originAirport?: string;
  date: string;
}): Promise<{ flights: FlightSearchResult[]; provider: ProviderName }> {
  const provider = resolveProvider();

  if (provider === "demo") {
    return {
      flights: searchDemoArrivals({ arrivalAirport, originAirport }),
      provider,
    };
  }

  const flights = await searchAeroDataBoxArrivals({
    arrivalAirport,
    originAirport,
    date,
  });

  return { flights, provider };
}
