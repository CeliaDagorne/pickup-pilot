import { getAirportCoords } from "./airports";
import type { ArrivalWeather } from "./types";

const WMO_LABELS: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Heavy drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  71: "Light snow",
  73: "Snow",
  75: "Heavy snow",
  80: "Rain showers",
  95: "Thunderstorm",
};

const WMO_ICONS: Record<number, string> = {
  0: "☀️",
  1: "🌤️",
  2: "⛅",
  3: "☁️",
  45: "🌫️",
  48: "🌫️",
  51: "🌦️",
  61: "🌧️",
  71: "🌨️",
  95: "⛈️",
};

export async function fetchArrivalWeather(
  iata: string,
  cityFallback?: string,
): Promise<ArrivalWeather | null> {
  const airport = getAirportCoords(iata);
  if (!airport) {
    if (!cityFallback) return null;
    return {
      airport: iata,
      city: cityFallback,
      temperatureC: 0,
      condition: "Data unavailable",
      humidity: 0,
      windKph: 0,
      icon: "🌡️",
    };
  }

  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(airport.lat));
  url.searchParams.set("longitude", String(airport.lon));
  url.searchParams.set("current", "temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code");
  url.searchParams.set("timezone", "auto");

  const res = await fetch(url.toString(), { next: { revalidate: 1800 } });
  if (!res.ok) return null;

  const data = (await res.json()) as {
    current: {
      temperature_2m: number;
      relative_humidity_2m: number;
      wind_speed_10m: number;
      weather_code: number;
    };
  };

  const code = data.current.weather_code;
  return {
    airport: iata,
    city: airport.city,
    temperatureC: Math.round(data.current.temperature_2m),
    condition: WMO_LABELS[code] ?? "Variable conditions",
    humidity: data.current.relative_humidity_2m,
    windKph: Math.round(data.current.wind_speed_10m),
    icon: WMO_ICONS[code] ?? "🌡️",
  };
}
