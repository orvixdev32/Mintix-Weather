import { useEffect, useState } from 'react'
import WeatherMap from './components/WeatherMap'
import './App.css'
import {
  Sun,
  CloudSun,
  Cloud,
  CloudFog,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Search,
  Compass,
  Wind,
  Droplets,
  ArrowUpRight,
  ArrowDownRight,
  Thermometer,
  Moon,
} from 'lucide-react'

function getDayName(dateString, index) {
  if (index === 0) return 'Today'

  return new Date(`${dateString}T12:00:00`).toLocaleDateString('en-US', {
    weekday: 'short',
  })
}

function getFormattedDate() {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  }).format(new Date())
}

function getNextHours(hourly, count = 8) {
  if (!hourly?.time || !hourly?.temperature_2m || !hourly?.weather_code) {
    return []
  }

  // Get current hour in Kyiv time
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Kyiv',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date())

  const getPart = (type) => parts.find((part) => part.type === type)?.value

  const currentHour = `${getPart('year')}-${getPart('month')}-${getPart('day')}T${getPart('hour')}`

  let startIndex = hourly.time.findIndex(
    (time) => time.slice(0, 13) >= currentHour
  )

  if (startIndex === -1) return []

  return hourly.time
    .slice(startIndex, startIndex + count)
    .map((time, index) => {
      const dataIndex = startIndex + index

      return {
        time,
        temperature: hourly.temperature_2m[dataIndex],
        weatherCode: hourly.weather_code[dataIndex],
      }
    })
    .filter(
      (hour) =>
        hour.temperature !== undefined && hour.weatherCode !== undefined
    )
}

function renderAnimatedWeatherArt(weatherCode) {
  // 0: Clear sky (сонце світить, промені дихають)
  if (weatherCode === 0) {
    return (
      <div className="weather-art art-clear-sky" aria-hidden="true">
        <div className="art-sun-glow"></div>
        <div className="art-sun-rays"></div>
        <div className="weather-sun art-sun-core"></div>
      </div>
    )
  }

  // 1, 2: Partly cloudy / Mainly clear (сонце світить + хмаринка трохи плаває)
  if (weatherCode === 1 || weatherCode === 2) {
    return (
      <div className="weather-art art-partly-cloudy" aria-hidden="true">
        <div className="art-sun-glow"></div>
        <div className="weather-sun"></div>
        <div className="weather-cloud">
          <span></span>
        </div>
      </div>
    )
  }

  // 3: Overcast (хмари перекривають небо й злегка коливаються)
  if (weatherCode === 3) {
    return (
      <div className="weather-art art-overcast" aria-hidden="true">
        <div className="weather-cloud cloud-back">
          <span></span>
        </div>
        <div className="weather-cloud cloud-front">
          <span></span>
        </div>
      </div>
    )
  }

  // 45, 48: Foggy (туманні м'які смуги)
  if (weatherCode === 45 || weatherCode === 48) {
    return (
      <div className="weather-art art-foggy" aria-hidden="true">
        <div className="weather-cloud cloud-fog">
          <span></span>
        </div>
        <div className="fog-lines">
          <span className="fog-line l1"></span>
          <span className="fog-line l2"></span>
          <span className="fog-line l3"></span>
        </div>
      </div>
    )
  }

  // 51..82: Drizzle, Rain, Showers (хмаринка + краплі дощу падають)
  if (
    [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(weatherCode)
  ) {
    return (
      <div className="weather-art art-rainy" aria-hidden="true">
        <div className="weather-cloud cloud-rain">
          <span></span>
        </div>
        <div className="rain-drops">
          <span className="rain-drop d1"></span>
          <span className="rain-drop d2"></span>
          <span className="rain-drop d3"></span>
          <span className="rain-drop d4"></span>
        </div>
      </div>
    )
  }

  // 71..86: Snow (падає сніг)
  if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) {
    return (
      <div className="weather-art art-snowy" aria-hidden="true">
        <div className="weather-cloud cloud-snow">
          <span></span>
        </div>
        <div className="snow-flakes">
          <span className="snow-flake s1">•</span>
          <span className="snow-flake s2">•</span>
          <span className="snow-flake s3">•</span>
          <span className="snow-flake s4">•</span>
        </div>
      </div>
    )
  }

  // 95, 96, 99: Thunderstorm (гроза, спалах блискавки)
  if ([95, 96, 99].includes(weatherCode)) {
    return (
      <div className="weather-art art-thunder" aria-hidden="true">
        <div className="weather-cloud cloud-storm">
          <span></span>
        </div>
        <div className="art-lightning">
          <CloudLightning className="lightning-bolt" size={28} />
        </div>
        <div className="rain-drops storm-drops">
          <span className="rain-drop d1"></span>
          <span className="rain-drop d3"></span>
        </div>
      </div>
    )
  }

  // За замовчуванням
  return (
    <div className="weather-art art-partly-cloudy" aria-hidden="true">
      <div className="art-sun-glow"></div>
      <div className="weather-sun"></div>
      <div className="weather-cloud">
        <span></span>
      </div>
    </div>
  )
}

function getWeatherIcon(code, className = 'weather-icon') {
  if (code === 0) return <Sun className={`${className} icon-sun`} />
  if ([1, 2].includes(code)) return <CloudSun className={`${className} icon-cloud-sun`} />
  if (code === 3) return <Cloud className={`${className} icon-cloud`} />
  if ([45, 48].includes(code)) return <CloudFog className={`${className} icon-fog`} />
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code))
    return <CloudRain className={`${className} icon-rain`} />
  if ([71, 73, 75, 77, 85, 86].includes(code))
    return <CloudSnow className={`${className} icon-snow`} />
  if ([95, 96, 99].includes(code))
    return <CloudLightning className={`${className} icon-lightning`} />

  return <Sun className={`${className} icon-sun`} />
}

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

  const formatTemp = (celsius) => {
    if (celsius === undefined || celsius === null) return '--'
    const temperature =
      unit === 'C' ? celsius : (celsius * 9) / 5 + 32
    return `${Math.round(temperature)}°`
  }

  const getWeatherDescription = (code) => {
    if (code === 0) return 'Clear sky'
    if (code === 1) return 'Mainly clear'
    if (code === 2) return 'Partly cloudy'
    if (code === 3) return 'Overcast'
    if ([45, 48].includes(code)) return 'Foggy'
    if ([51, 53, 55, 56, 57].includes(code)) return 'Drizzle'
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'Rain'
    if ([71, 73, 75, 77, 85, 86].includes(code)) return 'Snow'
    if ([95, 96, 99].includes(code)) return 'Thunderstorm'
    return 'Weather conditions'
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
          setWeatherError('Не вдалося завантажити погоду. Перевірте з’єднання та спробуйте ще раз.')
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

  const quickCities = ['Kyiv', 'Lviv', 'Odesa', 'Kharkiv', 'Ivano-Frankivsk']

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
      <header className="site-header">
        <div className="header-inner">
          <div className="brand-group">
            <div className="brand-mark">
              <span className="brand-dot" aria-hidden="true"></span>
              <span className="brand-initial">m.</span>
            </div>
            <div className="brand-meta">
              <span className="brand-name">Mintix Weather</span>
              <span className="brand-badge">EDITION 2026</span>
            </div>
          </div>

          <div className="header-actions">
            <button
              type="button"
              className="theme-toggle-btn"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
            >
              {theme === 'light' ? (
                <Moon size={16} aria-hidden="true" />
              ) : (
                <Sun size={16} aria-hidden="true" />
              )}
            </button>

            <div className="unit-switch" role="group" aria-label="Temperature unit selector">
              <button
                type="button"
                className={unit === 'C' ? 'active' : ''}
                onClick={() => {
                  setUnit('C')
                  localStorage.setItem('weatherUnit', 'C')
                }}
              >
                °C
              </button>
              <button
                type="button"
                className={unit === 'F' ? 'active' : ''}
                onClick={() => {
                  setUnit('F')
                  localStorage.setItem('weatherUnit', 'F')
                }}
              >
                °F
              </button>
            </div>
          </div>
        </div>
      </header>

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
              {quickCities.map((c) => (
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
                      ? formatTemp(weather.current.temperature_2m)
                      : '--'}
                  </span>
                  {!isLoading && !weatherError && weather && (
                    <span className="temp-unit">{unit}</span>
                  )}
                </div>
                <p className="editorial-lead">
                  {weather
                    ? `Feels like ${formatTemp(weather.current.apparent_temperature)}${unit}. `
                    : ''}
                  {weather?.current.weather_code === 0
                    ? 'Clear conditions across the city.'
                    : weather?.current.weather_code < 4
                    ? 'Mild atmospheric cloud cover.'
                    : 'Variable weather front observed.'}
                </p>
              </div>

              <div className="illustration-wrapper">
                {renderAnimatedWeatherArt(weather?.current?.weather_code ?? 0)}
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
                  {weather ? `${formatTemp(weather.current.apparent_temperature)}${unit}` : '—'}
                </span>
              </div>

              <div className="metric-cell">
                <div className="metric-header">
                  <ArrowUpRight size={14} className="metric-icon" aria-hidden="true" />
                  <span>HIGH / LOW</span>
                </div>
                <span className="metric-value">
                  {weather
                    ? `${formatTemp(weather.daily.temperature_2m_max[0])} / ${formatTemp(
                        weather.daily.temperature_2m_min[0]
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
                    {getWeatherIcon(hour.weatherCode)}
                  </div>
                  <span className="hourly-temp">
                    {formatTemp(hour.temperature)}
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
                    {getWeatherIcon(weather.daily.weather_code[index])}
                  </div>

                  <span className="daily-condition">
                    {getWeatherDescription(weather.daily.weather_code[index])}
                  </span>

                  <div className="daily-temp-range">
                    <span className="temp-hi">
                      {formatTemp(weather.daily.temperature_2m_max[index])}
                    </span>
                    <span className="temp-divider">/</span>
                    <span className="temp-lo">
                      {formatTemp(weather.daily.temperature_2m_min[index])}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </section>
      </main>

      {/* Editorial Footer */}
      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-left">
            <div className="footer-brand">
              <span className="footer-mark">m.</span>
              <span className="footer-name">Mintix Weather</span>
            </div>
            <p className="footer-bio">
              A calm, editorial atmospheric instrument designed for daily life in Ukraine.
            </p>
          </div>

          <div className="footer-right">
            <div className="footer-metadata">
              <span>Data source: Open-Meteo API</span>
              <span>Cartography: MapLibre GL & OpenFreeMap</span>
            </div>
            <p className="footer-copy">
              © 2026 Mintix Ecosystem • Crafted with restraint and clarity.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
