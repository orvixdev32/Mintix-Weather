# Mintix Weather

A weather app built with React. Search for Ukrainian cities, get current conditions, hourly and 5-day forecasts, and see the location on an interactive map. Supports light and dark themes, Celsius and Fahrenheit, and works on mobile too.

## What it does

- City search with quick-select buttons for major cities
- Current temperature, feels-like, wind speed, humidity, and weather condition
- Hourly forecast for the next 8 hours
- 5-day weather outlook
- Interactive MapLibre GL map that centers on the selected city
- Celsius / Fahrenheit toggle
- Light and dark theme, saved between sessions

## Stack

- React 19
- Vite 8
- MapLibre GL for the map
- Open-Meteo for geocoding and weather data (free, no API key needed)
- Lucide React for icons
- Plain CSS with design tokens

## Getting Started

Clone and install:

```bash
git clone https://github.com/orvixdev32/Mintix-Weather.git
cd Mintix-Weather
npm install
```

Start the dev server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

## Project Structure

```
src/
  components/   Header, Footer, WeatherArt, WeatherMap
  styles/       CSS files and map style definitions
  utils/        Date, time, and unit conversion helpers
  App.jsx       Main state and layout
docs/           Interview guide and architecture notes
```

## License

MIT
