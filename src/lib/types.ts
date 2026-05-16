export type FlightStatus =
  | "scheduled"
  | "boarding"
  | "departed"
  | "in_air"
  | "landed"
  | "delayed"
  | "cancelled"
  | "unknown";

export interface FlightInfo {
  flightNumber: string;
  carrier: string;
  flightDate: string;
  status: FlightStatus;
  statusLabel: string;
  delayMinutes: number | null;
  departure: AirportLeg;
  arrival: AirportLeg;
  baggageCarousel: string | null;
  aircraft: string | null;
  provider: "aerodatabox" | "demo";
}

export interface AirportLeg {
  airport: string;
  airportName: string;
  city: string;
  terminal: string | null;
  gate: string | null;
  scheduledDate: string | null;
  scheduledTime: string;
  estimatedTime: string | null;
  actualTime: string | null;
}

export interface ArrivalWeather {
  airport: string;
  city: string;
  temperatureC: number;
  condition: string;
  humidity: number;
  windKph: number;
  icon: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  hint: string;
  timing: "24h" | "3h" | "1h" | "30m";
}

export interface FlightLookupResult {
  flight: FlightInfo;
  weather: ArrivalWeather | null;
  checklist: ChecklistItem[];
}
