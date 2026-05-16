import { NextRequest, NextResponse } from "next/server";
import { buildChecklist } from "@/lib/checklist";
import { parseFlightNumber } from "@/lib/flight-parser";
import { lookupFlight } from "@/lib/providers";
import { fetchArrivalWeather } from "@/lib/weather";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const flightInput = searchParams.get("flight");
    const date = searchParams.get("date");

    if (!flightInput?.trim()) {
      return NextResponse.json(
        { error: "Flight number required (e.g. AF123)" },
        { status: 400 },
      );
    }

    const parsed = parseFlightNumber(flightInput);
    if (!parsed) {
      return NextResponse.json(
        {
          error: "Invalid format. Use airline code + number (e.g. AF123, BA117)",
        },
        { status: 400 },
      );
    }

    const flightDate = date ?? new Date().toISOString().slice(0, 10);

    const { flight, provider } = await lookupFlight(
      parsed.carrier,
      parsed.number,
      flightDate,
      parsed.display,
    );

    const weather = await fetchArrivalWeather(
      flight.arrival.airport,
      flight.arrival.city,
    );

    const checklist = buildChecklist(flight);

    return NextResponse.json({
      flight,
      weather,
      checklist,
      meta: {
        provider,
        date: flightDate,
        demo: provider === "demo",
      },
    });
  } catch (err) {
    console.error("[/api/flight]", err);
    const message =
      err instanceof Error ? err.message : "Something went wrong";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
