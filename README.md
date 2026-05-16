# Pickup Pilot

Pickup Pilot helps people picking someone up at the airport track arrivals, avoid unnecessary waiting, and find useful pickup options near the terminal.

Enter a flight number and date to get live arrival information, including flight status, delay, terminal, gate, baggage carousel, arrival weather, and a pre-pickup checklist.

## Live Demo

🔗 https://pickup-pilot.vercel.app/


## Features

- Live flight lookup by flight number and date
- Flight status, delay, terminal, gate, and baggage carousel
- Arrival airport weather
- Shareable search URLs, e.g. `/?flight=EW8426&date=2026-05-16`
- Pre-pickup checklist
- Contextual airport parking card
- Parking affiliate routing by arrival airport / country
- Demo mode when no API key is configured

## Tech Stack

- Next.js 15
- TypeScript
- Tailwind CSS v4
- AeroDataBox API via RapidAPI
- Open-Meteo API for weather

## Getting Started

```bash
npm install
cp .env.example .env.local
npm run dev
