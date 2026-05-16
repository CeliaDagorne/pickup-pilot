import type { FlightInfo } from "../types";
import { fetchAeroDataBoxFlight } from "./aerodatabox";
import { getDemoFlight } from "./demo";

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
