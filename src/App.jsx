import { useEffect, useState } from 'react'
import WeatherMap from './components/WeatherMap'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { WeatherIcon, AnimatedWeatherArt } from './components/WeatherArt'
import {
  getDayName,
  getFormattedDate,
  getNextHours,
  getWeatherDescription,
  formatTemp,
} from './utils/weatherUtils'
import './App.css'
import {
  Search,
  Compass,
  Wind,
  Droplets,
  ArrowUpRight,
  Thermometer,
} from 'lucide-react'

const QUICK_CITIES = ['Kyiv', 'Lviv', 'Odesa', 'Kharkiv', 'Ivano-Frankivsk']

function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('weatherTheme') || 'light'
  })

  const [city, setCity] = useState(() => {
    const savedCity = localStorage.getItem('weatherCity')
    if (savedCity) {
      try {
        return JSON.parse(savedCity).name
      } catch {
        return 'Ivano-Frankivsk'
      }
    }
    return 'Ivano-Frankivsk'
  })

  const [searchCity, setSearchCity] = useState('')
  const [unit, setUnit] = useState(() => {
    return localStorage.getItem('weatherUnit') || 'C'
  })
  const [weather, setWeather] = useState(null)
  const [searchError, setSearchError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [weatherError, setWeatherError] = useState('')

  const [coordinates, setCoordinates] = useState(() => {
    const savedCity = localStorage.getItem('weatherCity')
    if (savedCity) {
      try {
        const parsedCity = JSON.parse(savedCity)
        return {
          latitude: parsedCity.latitude,
          longitude: parsedCity.longitude,
        }
      } catch {
        return { latitude: 48.92312, longitude: 24.71248 }
      }
    }
    return {
      latitude: 48.92312,
      longitude: 24.71248,
    }
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('weatherTheme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  const handleSearch = async (event) => {
    event.preventDefault()
    const trimmedCity = searchCity.trim()

    if (!trimmedCity) {
      setSearchError('Введіть назву міста')
      return
    }

    setSearchError('')

    try {
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          trimmedCity
        )}&count=10&language=uk&format=json`
      )

      if (!response.ok) {
        throw new Error('Failed to find city')
      }

      const data = await response.json()
      const results = data.results ?? []

      const foundCity = results.find((result) => result.country_code === 'UA')

      if (!foundCity) {
        setSearchError('Не знайдено українське місто з такою назвою')
        return
      }

      setCity(foundCity.name)
      setCoordinates({
        latitude: foundCity.latitude,
        longitude: foundCity.longitude,
      })

      localStorage.setItem(
        'weatherCity',
        JSON.stringify({
          name: foundCity.name,
          latitude: foundCity.latitude,
          longitude: foundCity.longitude,
        })
      )
      setSearchCity('')
    } catch (error) {
      console.error('City search failed:', error)
      setSearchError('Не вдалося виконати пошук. Спробуйте ще раз')
    }
  }

  useEffect(() => {
    let ignore = false

    async function fetchWeather() {
      setIsLoading(true)
      setWeatherError('')

      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${coordinates.latitude}&longitude=${coordinates.longitude}&current=temperature_2m,apparent_temperature,weather_code,relative_humidity_2m,wind_speed_10m&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=5&timezone=auto`
        )

        if (!response.ok) {
          throw new Error('Failed to fetch weather')
        }

        const data = await response.json()

        if (!ignore) {
          setWeather(data)
        }
      } catch (error) {
        console.error('Weather request failed:', error)
        if (!ignore) {
          setWeatherError(
            'Не вдалося завантажити погоду. Перевірте з’єднання та спробуйте ще раз.'
          )
        }
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    fetchWeather()

    return () => {
      ignore = true
    }
  }, [coordinates])

  const handleQuickCitySelect = async (selectedCityName) => {
    if (selectedCityName === city) return
    setSearchCity(selectedCityName)
    try {
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          selectedCityName
        )}&count=10&language=uk&format=json`
      )
      if (!response.ok) return
      const data = await response.json()
      const found = (data.results ?? []).find((r) => r.country_code === 'UA')
      if (found) {
        setCity(found.name)
        setCoordinates({
          latitude: found.latitude,
          longitude: found.longitude,
        })
        localStorage.setItem(
          'weatherCity',
          JSON.stringify({
            name: found.name,
            latitude: found.latitude,
            longitude: found.longitude,
          })
        )
        setSearchCity('')
        setSearchError('')
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="app-layout">
      {/* Editorial Header */}
      <Header
        theme={theme}
        toggleTheme={toggleTheme}
        unit={unit}
        setUnit={setUnit}
      />

      <main className="main-content">
        {/* Editorial Action Bar / Compact Hero */}
        <section className="editorial-bar" aria-label="City search and edition details">
          <div className="editorial-meta">
            <span className="editorial-tag">ATMOSPHERIC REPORT</span>
            <span className="editorial-divider" aria-hidden="true">•</span>
            <span className="editorial-date">{getFormattedDate()}</span>
          </div>

          <form className="city-search" onSubmit={handleSearch} role="search">
            <Search className="search-icon" size={17} aria-hidden="true" />
            <input
              type="text"
              placeholder="Search Ukrainian city (e.g. Lviv, Kyiv)..."
              aria-label="Search for a Ukrainian city"
              value={searchCity}
              onChange={(event) => setSearchCity(event.target.value)}
            />
            <button type="submit" aria-label="Find city weather">
              <span>Find</span>
              <ArrowUpRight size={15} aria-hidden="true" />
            </button>
          </form>

          {searchError && (
            <div className="search-error-banner" role="alert">
              <span>{searchError}</span>
            </div>
          )}

          <div className="quick-cities" aria-label="Quick city suggestions">
            <span className="quick-label">Jump to:</span>
            <div className="quick-chips">
              {QUICK_CITIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`quick-chip ${c === city ? 'active' : ''}`}
                  onClick={() => handleQuickCitySelect(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Primary Weather Experience — Editorial Grid */}
        <section className="weather-stage" aria-label="Current weather and interactive map">
          {/* Main Weather Card */}
          <article className="current-weather-card">
            <header className="card-topline">
              <div className="location-info">
                <div className="location-badge">
                  <Compass size={13} className="compass-icon" aria-hidden="true" />
                  <span>Ukraine</span>
                </div>
                <h1 className="city-title">{city}</h1>
              </div>

              <div className="condition-status">
                {isLoading ? (
                  <span className="loading-badge">
                    <span className="loading-spinner" aria-hidden="true" />
                    Updating data...
                  </span>
                ) : weatherError ? (
                  <span className="error-badge">{weatherError}</span>
                ) : (
                  <span className="condition-badge">
                    {weather ? getWeatherDescription(weather.current.weather_code) : '—'}
                  </span>
                )}
              </div>
            </header>

            {/* Core Temperature & Illustration */}
            <div className="weather-centerpiece">
              <div className="temp-display">
                <div className="temp-num-wrap">
                  <span className="temp-value">
                    {isLoading
                      ? '—'
                      : weatherError
                      ? '--'
                      : weather
                      ? formatTemp(weather.current.temperature_2m, unit)
                      : '--'}
                  </span>
                  {!isLoading && !weatherError && weather && (
                    <span className="temp-unit">{unit}</span>
                  )}
                </div>
                <p className="editorial-lead">
                  {weather
                    ? `Feels like ${formatTemp(weather.current.apparent_temperature, unit)}${unit}. `
                    : ''}
                  {weather?.current.weather_code === 0
                    ? 'Clear conditions across the city.'
                    : weather?.current.weather_code < 4
                    ? 'Mild atmospheric cloud cover.'
                    : 'Variable weather front observed.'}
                </p>
              </div>

              <div className="illustration-wrapper">
                <AnimatedWeatherArt
                  weatherCode={weather?.current?.weather_code ?? 0}
                />
              </div>
            </div>

            {/* Metric Strip (Tabular Numerals & Clear Semantic Accents) */}
            <div className="metrics-grid">
              <div className="metric-cell">
                <div className="metric-header">
                  <Thermometer size={14} className="metric-icon" aria-hidden="true" />
                  <span>FEELS LIKE</span>
                </div>
                <span className="metric-value">
                  {weather
                    ? `${formatTemp(weather.current.apparent_temperature, unit)}${unit}`
                    : '—'}
                </span>
              </div>

              <div className="metric-cell">
                <div className="metric-header">
                  <ArrowUpRight size={14} className="metric-icon" aria-hidden="true" />
                  <span>HIGH / LOW</span>
                </div>
                <span className="metric-value">
                  {weather
                    ? `${formatTemp(weather.daily.temperature_2m_max[0], unit)} / ${formatTemp(
                        weather.daily.temperature_2m_min[0],
                        unit
                      )}`
                    : '—'}
                </span>
              </div>

              <div className="metric-cell">
                <div className="metric-header">
                  <Wind size={14} className="metric-icon" aria-hidden="true" />
                  <span>WIND</span>
                </div>
                <span className="metric-value">
                  {weather ? `${Math.round(weather.current.wind_speed_10m)} km/h` : '—'}
                </span>
              </div>

              <div className="metric-cell">
                <div className="metric-header">
                  <Droplets size={14} className="metric-icon" aria-hidden="true" />
                  <span>HUMIDITY</span>
                </div>
                <span className="metric-value">
                  {weather ? `${weather.current.relative_humidity_2m}%` : '—'}
                </span>
              </div>
            </div>
          </article>

          {/* Integrated Map Panel */}
          <aside className="weather-map-panel" aria-label="Interactive map of selected city">
            <div className="map-panel-header">
              <div className="map-header-content">
                <span className="panel-kicker">CARTOGRAPHY</span>
                <h2 className="panel-title">{city} Regional Context</h2>
              </div>
              <span className="map-coords-badge">
                {coordinates.latitude.toFixed(2)}°N, {coordinates.longitude.toFixed(2)}°E
              </span>
            </div>

            <div className="map-viewport-wrapper">
              <WeatherMap coordinates={coordinates} />
            </div>
          </aside>
        </section>

        {/* Hourly Forecast Strip */}
        <section className="forecast-block" aria-label="Next 8 hours forecast">
          <div className="section-head">
            <div className="section-head-title">
              <span className="head-kicker">CHRONOLOGY</span>
              <h2>Next 8 Hours</h2>
            </div>
            <span className="head-caption">HOURLY PROJECTION</span>
          </div>

          <div className="hourly-grid">
            {weather?.hourly &&
              getNextHours(weather.hourly).map((hour) => (
                <div className="hourly-card" key={hour.time}>
                  <time className="hourly-time">{hour.time.slice(11, 16)}</time>
                  <div className="hourly-icon-slot">
                    <WeatherIcon code={hour.weatherCode} />
                  </div>
                  <span className="hourly-temp">
                    {formatTemp(hour.temperature, unit)}
                  </span>
                  <span className="hourly-desc">
                    {getWeatherDescription(hour.weatherCode)}
                  </span>
                </div>
              ))}
          </div>
        </section>

        {/* 5-Day Outlook */}
        <section className="forecast-block" aria-label="5-day outlook">
          <div className="section-head">
            <div className="section-head-title">
              <span className="head-kicker">EXTENDED HORIZON</span>
              <h2>5-Day Outlook</h2>
            </div>
            <span className="head-caption">REGIONAL FORECAST</span>
          </div>

          <div className="daily-grid">
            {weather?.daily &&
              weather.daily.time.map((date, index) => (
                <div className="daily-card" key={date}>
                  <div className="daily-date-group">
                    <span className="daily-day-label">{getDayName(date, index)}</span>
                    <span className="daily-subdate">{date.slice(5).replace('-', '/')}</span>
                  </div>

                  <div className="daily-icon-slot">
                    <WeatherIcon code={weather.daily.weather_code[index]} />
                  </div>

                  <span className="daily-condition">
                    {getWeatherDescription(weather.daily.weather_code[index])}
                  </span>

                  <div className="daily-temp-range">
                    <span className="temp-hi">
                      {formatTemp(weather.daily.temperature_2m_max[index], unit)}
                    </span>
                    <span className="temp-divider">/</span>
                    <span className="temp-lo">
                      {formatTemp(weather.daily.temperature_2m_min[index], unit)}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </section>
      </main>

      {/* Editorial Footer */}
      <Footer />
    </div>
  )
}

export default App
