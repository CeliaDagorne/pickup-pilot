import type { FlightSearchResult } from "../types";

const DEMO_ROUTE_FLIGHTS: FlightSearchResult[] = [
  {
    flightNumber: "EW8426",
    airline: "Eurowings",
    status: "scheduled",
    statusLabel: "Scheduled",
    departure: { airport: "BER", city: "Berlin", scheduledTime: "5:00 PM" },
    arrival: { airport: "NCE", city: "Nice", scheduledTime: "7:05 PM", terminal: "1" },
  },
  {
    flightNumber: "AF123",
    airline: "Air France",
    status: "scheduled",
    statusLabel: "On time",
    departure: { airport: "CDG", city: "Paris", scheduledTime: "10:30 AM" },
    arrival: { airport: "JFK", city: "New York", scheduledTime: "1:15 PM", terminal: "1" },
  },
  {
    flightNumber: "BA117",
    airline: "British Airways",
    status: "delayed",
    statusLabel: "Delayed",
    departure: { airport: "LHR", city: "London", scheduledTime: "4:00 PM" },
    arrival: { airport: "JFK", city: "New York", scheduledTime: "7:10 PM", terminal: "7" },
  },
];

export function searchDemoArrivals({
  arrivalAirport,
  originAirport,
}: {
  arrivalAirport: string;
  originAirport?: string;
}): FlightSearchResult[] {
  const arrival = arrivalAirport.toUpperCase();
  const origin = originAirport?.toUpperCase();

  return DEMO_ROUTE_FLIGHTS.filter((flight) => {
    if (flight.arrival.airport !== arrival) return false;
    if (origin && flight.departure.airport !== origin) return false;
    return true;
  });
}
