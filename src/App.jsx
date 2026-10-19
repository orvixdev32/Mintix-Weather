import { useEffect, useState } from 'react'
import './App.css'
import {
  Sun,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  CloudLightning,
} from 'lucide-react'

function getDayName(dateString, index) {
  if (index === 0) return 'TODAY'

  return new Date(`${dateString}T12:00:00`).toLocaleDateString(
    'en-US',
    { weekday: 'short' }
  ).toUpperCase()
}

function getWeatherIcon(code) {
  if (code === 0) return <Sun />
  if ([1, 2].includes(code)) return <CloudSun />
  if (code === 3) return <Cloud />
  if ([45, 48].includes(code)) return <CloudFog />
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return <CloudRain />
  if ([71, 73, 75, 77, 85, 86].includes(code)) return <CloudSnow />
  if ([95, 96, 99].includes(code)) return <CloudLightning />

  return '🌡'
}

function App() {
const [city, setCity] = useState(() => {
  const savedCity = localStorage.getItem('weatherCity')

  if (savedCity) {
    return JSON.parse(savedCity).name
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
    const parsedCity = JSON.parse(savedCity)

    return {
      latitude: parsedCity.latitude,
      longitude: parsedCity.longitude,
    }
  }

  return {
    latitude: 48.92312,
    longitude: 24.71248,
  }
})


const handleSearch = async (event) => {
  event.preventDefault()

  const trimmedCity = searchCity.trim()

  if (!trimmedCity) {
    setSearchError('Введи назву міста')
    return
  }

  setSearchError('')

  try {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(trimmedCity)}&count=10&language=uk&format=json`
    )

    if (!response.ok) {
      throw new Error('Failed to find city')
    }

    const data = await response.json()
    const results = data.results ?? []

    const foundCity = results.find(
      (result) => result.country_code === 'UA'
    )

    if (!foundCity) {
      setSearchError(
        'Не знайшов українське місто з такою назвою'
      )
      return
    }

    setCity(foundCity.name)

    setCoordinates({
      latitude: foundCity.latitude,
      longitude: foundCity.longitude,
    })
    localStorage.setItem('weatherCity', JSON.stringify({
    name: foundCity.name,
    latitude: foundCity.latitude,
    longitude: foundCity.longitude,
    }))
    setSearchCity('')
  } catch (error) {
    console.error('City search failed:', error)
    setSearchError('Не вдалося виконати пошук. Спробуй ще раз')
  }
}

const formatTemp = (celsius) => {
  const temperature =
    unit === 'C'
      ? celsius
      : (celsius * 9) / 5 + 32

  return `${Math.round(temperature)}°`
}

const getWeatherDescription = (code) => {
  if (code === 0) return 'Clear sky'
  if (code === 1) return 'Mainly clear'
  if (code === 2) return 'Partly cloudy'
  if (code === 3) return 'Overcast'

  if ([45, 48].includes(code)) return 'Foggy'

  if ([51, 53, 55, 56, 57].includes(code)) {
    return 'Drizzle'
  }

  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    return 'Rain'
  }

  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return 'Snow'
  }

  if ([95, 96, 99].includes(code)) {
    return 'Thunderstorm'
  }

  return 'Weather unavailable'
}


useEffect(() => {
  let ignore = false

  async function fetchWeather() {
    setIsLoading(true)
    setWeatherError('')
    setWeather(null)

    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${coordinates.latitude}&longitude=${coordinates.longitude}&current=temperature_2m,apparent_temperature,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=5&timezone=auto`
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
          'Не вдалося завантажити погоду. Перевір з’єднання та спробуй ще раз.'
        )
      }
    } finally {
      await new Promise((resolve) => setTimeout(resolve, 600))

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

  return (
    <div>
<header className="site-header">
  <div className="brand">
    <p className="brand-name">Mintix Weather</p>
    <span className="brand-caption">
      YOUR LITTLE WEATHER SPACE
    </span>
  </div>


<div className="unit-switch">
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

</header>
      <main>
<section className="welcome-section">
  <p className="welcome-label">
    YOUR WEATHER, YOUR WAY
  </p>

  <h1>
    A little sky,
    <br />
    a lot of feeling.
  </h1>

  <p className="welcome-description">
    Your daily forecast, with a little more sunshine.
  </p>

  <form 
  className="city-search"
  onSubmit={handleSearch}

  >
    <span className="search-icon" aria-hidden="true">
      ↗
    </span>

    <input
      type="text"
      placeholder="Where do you want to go?"
      aria-label="Search for a city"
      value={searchCity}
      onChange={(event) => setSearchCity(event.target.value)}
    />

    <button type="submit">Find weather</button>
  </form>
  {searchError && (
  <p className="search-error">{searchError}</p>
)}
</section>


<section className="current-weather">
  <div className="weather-heading">
    <div>
      <p className="weather-eyebrow">RIGHT NOW</p>
      <h2>{city}</h2>
<p className="weather-condition">
  {isLoading ? (
    <span className="weather-loading">
      <span className="loading-spinner" />
      Завантажуємо погоду...
    </span>
  ) : weatherError ? (
    weatherError
  ) : weather ? (
    getWeatherDescription(weather.current.weather_code)
  ) : (
    ''
  )}
</p>
    </div>

    <span className="weather-date">TODAY</span>
  </div>

  <div className="weather-main">
    <div className="temperature-block">
<p className="temperature">
  {isLoading
    ? '...'
    : weatherError
      ? '--'
      : weather
        ? formatTemp(weather.current.temperature_2m)
        : '--'}
  {!isLoading && !weatherError && weather && (
    <span>{unit}</span>
  )}
</p>
      <p className="temperature-note">A lovely day to be outside.</p>
    </div>

    <div className="weather-art" aria-label="Sun behind a cloud" role="img">
      <div className="weather-sun"></div>
      <div className="weather-cloud">
        <span></span>
      </div>
    </div>
  </div>

  <div className="weather-summary">
    <div>
      <span>FEELS LIKE</span>
      <strong>
          {weather
            ? formatTemp(weather.current.apparent_temperature)
            : '...'}
      </strong>
    </div>

    <div>
      <span>HIGH / LOW</span>
      <strong>
        {weather
          ? `${formatTemp(weather.daily.temperature_2m_max[0])} / ${formatTemp(weather.daily.temperature_2m_min[0])}`
          : '...'}
      </strong>
    </div>
  </div>
</section>



<section className="forecast-section">
  <div className="forecast-heading">
    <div>
      <p className="forecast-eyebrow">PLAN AHEAD</p>
      <h2>The next few days</h2>
    </div>

    <span className="forecast-caption">5-DAY FORECAST</span>
  </div>

  <div className="forecast-list">


{weather?.daily &&
  weather.daily.time.map((date, index) => (
    <div className="forecast-day" key={date}>
      <span className="day-name">
        {getDayName(date, index)}
      </span>

      <span className="forecast-icon">
        {getWeatherIcon(weather.daily.weather_code[index])}
      </span>

      <span className="day-condition">
        {getWeatherDescription(weather.daily.weather_code[index])}
      </span>

      <div className="day-temperatures">
        <strong>
          {formatTemp(weather.daily.temperature_2m_max[index])}
        </strong>

        <span>
          {formatTemp(weather.daily.temperature_2m_min[index])}
        </span>
      </div>
    </div>
  ))}

  </div>
</section>

      </main>


<footer className="site-footer">
  <div className="footer-brand">
    <span className="footer-logo">m.</span>

    <div>
      <p className="footer-name">mintix weather</p>
      <span className="footer-tagline">
        A LITTLE MORE SUNSHINE.
      </span>
    </div>
  </div>

  <p className="footer-message">
    Wherever you go, take a little sunshine with you.
  </p>

  <div className="footer-bottom">
    <span>© 2026 Mintix Weather</span>
    <span>Made for everyday life <span className="footer-heart">♥</span></span>
  </div>
</footer>

    </div>
  )
}

export default App
