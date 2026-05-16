import type { ChecklistItem, FlightInfo } from "./types";

const BASE_ITEMS: ChecklistItem[] = [
  {
    id: "passport",
    label: "Passport / ID",
    hint: "Check validity (often 6 months beyond return date)",
    timing: "24h",
  },
  {
    id: "boarding-pass",
    label: "Boarding pass",
    hint: "Check in online or at the counter",
    timing: "24h",
  },
  {
    id: "liquids",
    label: "Carry-on liquids ≤ 100 ml",
    hint: "In a clear, resealable bag",
    timing: "3h",
  },
  {
    id: "powerbank",
    label: "Power banks in carry-on",
    hint: "Usually not allowed in checked baggage",
    timing: "3h",
  },
  {
    id: "arrival-time",
    label: "Arrive at the airport",
    hint: "2 h before (international) / 1 h 30 (domestic)",
    timing: "3h",
  },
  {
    id: "security",
    label: "Prepare for security",
    hint: "Belt, watch, laptop, and liquids ready",
    timing: "1h",
  },
  {
    id: "gate",
    label: "Confirm boarding gate",
    hint: "Gates can change — watch the screens",
    timing: "1h",
  },
  {
    id: "boarding",
    label: "Boarding",
    hint: "Usually 30–40 min before departure",
    timing: "30m",
  },
];

export function buildChecklist(flight: FlightInfo): ChecklistItem[] {
  const items = [...BASE_ITEMS];
  if (flight.delayMinutes && flight.delayMinutes > 15) {
    items.unshift({
      id: "delay",
      label: `Estimated delay: +${flight.delayMinutes} min`,
      hint: "Adjust your airport arrival time if needed",
      timing: "3h",
    });
  }
  if (flight.baggageCarousel) {
    items.push({
      id: "baggage",
      label: `Baggage carousel: ${flight.baggageCarousel}`,
      hint: "Follow the Baggage Claim signs on arrival",
      timing: "30m",
    });
  }
  return items;
}
