import type { FlightInfo } from "./types";

type ParkingPartnerId =
  | "onepark"
  | "parkvia"
  | "holidayExtras"
  | "looking4Parking"
  | "generic";

interface ParkingPartner {
  id: ParkingPartnerId;
  name: string;
  template?: string;
}

interface ParkingAffiliateResult {
  partnerName: string;
  url: string;
  isFallback: boolean;
}

const AIRPORT_COUNTRIES: Record<string, string> = {
  AMS: "NL",
  BCN: "ES",
  BER: "DE",
  CDG: "FR",
  DXB: "AE",
  FCO: "IT",
  FRA: "DE",
  LGW: "GB",
  LHR: "GB",
  MAD: "ES",
  MXP: "IT",
  NCE: "FR",
  ORY: "FR",
  SIN: "SG",
};

const PARTNERS: Record<ParkingPartnerId, ParkingPartner> = {
  onepark: {
    id: "onepark",
    name: "Onepark",
    template: process.env.NEXT_PUBLIC_ONEPARK_AFFILIATE_URL,
  },
  parkvia: {
    id: "parkvia",
    name: "ParkVia",
    template: process.env.NEXT_PUBLIC_PARKVIA_AFFILIATE_URL,
  },
  holidayExtras: {
    id: "holidayExtras",
    name: "Holiday Extras",
    template: process.env.NEXT_PUBLIC_HOLIDAY_EXTRAS_AFFILIATE_URL,
  },
  looking4Parking: {
    id: "looking4Parking",
    name: "Looking4Parking",
    template: process.env.NEXT_PUBLIC_LOOKING4PARKING_AFFILIATE_URL,
  },
  generic: {
    id: "generic",
    name: "Parking partner",
    template: process.env.NEXT_PUBLIC_PARKING_AFFILIATE_URL,
  },
};

const COUNTRY_PARTNERS: Record<string, ParkingPartnerId> = {
  FR: "onepark",
  DE: "parkvia",
  ES: "parkvia",
  IT: "parkvia",
  NL: "parkvia",
  GB: "holidayExtras",
};

function partnerForAirport(iata: string): ParkingPartner {
  const country = AIRPORT_COUNTRIES[iata.toUpperCase()];
  const partnerId = country ? COUNTRY_PARTNERS[country] : undefined;
  return PARTNERS[partnerId ?? "parkvia"];
}

function fillTemplate(template: string, flight: FlightInfo) {
  const values = {
    airport: flight.arrival.airport,
    terminal: flight.arrival.terminal ?? "",
    flight: flight.flightNumber,
    date: flight.flightDate,
  };

  const url = template
    .replaceAll("{airport}", encodeURIComponent(values.airport))
    .replaceAll("{terminal}", encodeURIComponent(values.terminal))
    .replaceAll("{flight}", encodeURIComponent(values.flight))
    .replaceAll("{date}", encodeURIComponent(values.date));

  const separator = url.includes("?") ? "&" : "?";
  const tracking = new URLSearchParams({
    airport: values.airport,
    terminal: values.terminal,
    flight: values.flight,
    date: values.date,
    utm_source: "pickup-pilot",
    utm_medium: "arrival-card",
    utm_campaign: "parking",
  });

  return `${url}${separator}${tracking}`;
}

function googleParkingSearch(flight: FlightInfo) {
  const query = new URLSearchParams({
    q: `${flight.arrival.airport} airport short stay parking terminal ${
      flight.arrival.terminal ?? ""
    }`,
  });

  return `https://www.google.com/search?${query}`;
}

export function buildParkingAffiliate(flight: FlightInfo): ParkingAffiliateResult {
  const preferredPartner = partnerForAirport(flight.arrival.airport);
  const partner = preferredPartner.template
    ? preferredPartner
    : PARTNERS.generic.template
      ? PARTNERS.generic
      : preferredPartner;

  if (!partner.template) {
    return {
      partnerName: "parking options",
      url: googleParkingSearch(flight),
      isFallback: true,
    };
  }

  return {
    partnerName: partner.name,
    url: fillTemplate(partner.template, flight),
    isFallback: partner.id === "generic",
  };
}
