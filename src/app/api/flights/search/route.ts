import { NextRequest, NextResponse } from "next/server";
import { searchFlightsByRoute } from "@/lib/providers";
import { isAeroDataBoxRateLimitError } from "@/lib/providers/aerodatabox-request";

function airportParam(value: string | null) {
  const normalized = value?.trim().toUpperCase() ?? "";
  return /^[A-Z]{3}$/.test(normalized) ? normalized : null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const arrival = airportParam(searchParams.get("arrival"));
    const origin = airportParam(searchParams.get("origin"));
    const date = searchParams.get("date") ?? new Date().toISOString().slice(0, 10);

    if (!arrival) {
      return NextResponse.json(
        { error: "Arrival airport is required (IATA code, e.g. NCE)" },
        { status: 400 },
      );
    }

    if (searchParams.get("origin") && !origin) {
      return NextResponse.json(
        { error: "Origin airport must be a 3-letter IATA code (e.g. BER)" },
        { status: 400 },
      );
    }

    const { flights, provider } = await searchFlightsByRoute({
      arrivalAirport: arrival,
      originAirport: origin ?? undefined,
      date,
    });

    return NextResponse.json({
      flights,
      meta: {
        arrival,
        origin,
        date,
        count: flights.length,
        demo: provider === "demo",
      },
    });
  } catch (err) {
    console.error("[/api/flights/search]", err);
    const message =
      err instanceof Error ? err.message : "Could not search flights";

    if (isAeroDataBoxRateLimitError(message)) {
      return NextResponse.json(
        {
          error:
            "AeroDataBox rate limit reached (1 request/second on BASIC). Wait a few seconds and try again. Route search uses 2 API calls per search.",
        },
        { status: 429 },
      );
    }

    return NextResponse.json({ error: message }, { status: 502 });
  }
}
