/** Common airport coordinates for weather lookup */
const AIRPORT_COORDS: Record<string, { lat: number; lon: number; city: string; name: string }> = {
  CDG: { lat: 49.0097, lon: 2.5479, city: "Paris", name: "Charles de Gaulle" },
  ORY: { lat: 48.7233, lon: 2.3794, city: "Paris", name: "Orly" },
  LHR: { lat: 51.47, lon: -0.4543, city: "London", name: "Heathrow" },
  LGW: { lat: 51.1537, lon: -0.1821, city: "London", name: "Gatwick" },
  JFK: { lat: 40.6413, lon: -73.7781, city: "New York", name: "JFK" },
  LAX: { lat: 33.9416, lon: -118.4085, city: "Los Angeles", name: "LAX" },
  AMS: { lat: 52.3105, lon: 4.7683, city: "Amsterdam", name: "Schiphol" },
  FRA: { lat: 50.0379, lon: 8.5622, city: "Frankfurt", name: "Frankfurt" },
  MAD: { lat: 40.4983, lon: -3.5676, city: "Madrid", name: "Barajas" },
  BCN: { lat: 41.2974, lon: 2.0833, city: "Barcelona", name: "El Prat" },
  FCO: { lat: 41.8003, lon: 12.2389, city: "Rome", name: "Fiumicino" },
  MXP: { lat: 45.6306, lon: 8.7281, city: "Milan", name: "Malpensa" },
  DXB: { lat: 25.2532, lon: 55.3657, city: "Dubai", name: "DXB" },
  SIN: { lat: 1.3644, lon: 103.9915, city: "Singapore", name: "Changi" },
  NRT: { lat: 35.772, lon: 140.3929, city: "Tokyo", name: "Narita" },
  HND: { lat: 35.5494, lon: 139.7798, city: "Tokyo", name: "Haneda" },
};

export function getAirportCoords(iata: string) {
  return AIRPORT_COORDS[iata.toUpperCase()] ?? null;
}
