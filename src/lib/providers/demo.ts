import { formatSearchDate } from "../flight-parser";
import type { FlightInfo } from "../types";

type DemoBase = Omit<FlightInfo, "flightNumber" | "provider" | "flightDate">;

const DEMO_FLIGHTS: Record<string, DemoBase> = {
  AF123: {
    carrier: "Air France",
    status: "scheduled",
    statusLabel: "On time",
    delayMinutes: 0,
    departure: {
      airport: "CDG",
      airportName: "Charles de Gaulle",
      city: "Paris",
      terminal: "2E",
      gate: "K42",
      scheduledDate: null,
      scheduledTime: "10:30",
      estimatedTime: "10:30",
      actualTime: null,
    },
    arrival: {
      airport: "JFK",
      airportName: "John F. Kennedy",
      city: "New York",
      terminal: "1",
      gate: "B24",
      scheduledDate: null,
      scheduledTime: "13:15",
      estimatedTime: "13:15",
      actualTime: null,
    },
    baggageCarousel: "7",
    aircraft: "Boeing 777-300ER",
  },
  BA117: {
    carrier: "British Airways",
    status: "delayed",
    statusLabel: "Delayed",
    delayMinutes: 45,
    departure: {
      airport: "LHR",
      airportName: "Heathrow",
      city: "London",
      terminal: "5",
      gate: "C52",
      scheduledDate: null,
      scheduledTime: "16:00",
      estimatedTime: "16:45",
      actualTime: null,
    },
    arrival: {
      airport: "JFK",
      airportName: "John F. Kennedy",
      city: "New York",
      terminal: "7",
      gate: null,
      scheduledDate: null,
      scheduledTime: "19:10",
      estimatedTime: "19:55",
      actualTime: null,
    },
    baggageCarousel: null,
    aircraft: "Airbus A380",
  },
};

function defaultDemo(display: string, carrier: string): DemoBase {
  return {
    carrier,
    status: "scheduled",
    statusLabel: "Scheduled",
    delayMinutes: null,
    departure: {
      airport: "CDG",
      airportName: "Charles de Gaulle",
      city: "Paris",
      terminal: "2F",
      gate: "A12",
      scheduledDate: null,
      scheduledTime: "14:00",
      estimatedTime: null,
      actualTime: null,
    },
    arrival: {
      airport: "BCN",
      airportName: "El Prat",
      city: "Barcelona",
      terminal: "1",
      gate: null,
      scheduledDate: null,
      scheduledTime: "16:05",
      estimatedTime: null,
      actualTime: null,
    },
    baggageCarousel: "3",
    aircraft: null,
  };
}

function withFlightDate(base: DemoBase, flightDate: string): Omit<FlightInfo, "flightNumber" | "provider"> {
  const dateLabel = formatSearchDate(flightDate);
  return {
    ...base,
    flightDate,
    departure: { ...base.departure, scheduledDate: dateLabel },
    arrival: { ...base.arrival, scheduledDate: dateLabel },
  };
}

export function getDemoFlight(
  display: string,
  carrierCode: string,
  flightDate: string,
): FlightInfo {
  const preset = DEMO_FLIGHTS[display];
  const base = preset ?? defaultDemo(display, carrierCode);
  return {
    ...withFlightDate(base, flightDate),
    flightNumber: display,
    provider: "demo",
  };
}
