import { useState } from 'react'
import './App.css'

function App() {
const [city, setCity] = useState('Ivano-Frankivsk')
const [searchCity, setSearchCity] = useState('')
const [unit, setUnit] = useState('C')
const formatTemp = (celsius) => {
  const temperature =
    unit === 'C'
      ? celsius
      : (celsius * 9) / 5 + 32

  return `${Math.round(temperature)}°`
}
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
    onClick={() => setUnit('C')}
  >
    °C
  </button>

  <button
    type="button"
    className={unit === 'F' ? 'active' : ''}
    onClick={() => setUnit('F')}
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
  onSubmit={(event) => {
    event.preventDefault()

    const trimmedCity = searchCity.trim()
    
    if (trimmedCity) {
    setCity(trimmedCity)
    setSearchCity('')
  }
  }}
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
</section>


<section className="current-weather">
  <div className="weather-heading">
    <div>
      <p className="weather-eyebrow">RIGHT NOW</p>
      <h2>{city}</h2>
      <p className="weather-condition">Partly cloudy</p>
    </div>

    <span className="weather-date">TODAY</span>
  </div>

  <div className="weather-main">
    <div className="temperature-block">
      <p className="temperature">
        {formatTemp(18)}
        <span>°{unit}</span></p>
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
      <strong>{formatTemp(20)}</strong>
    </div>

    <div>
      <span>HIGH / LOW</span>
      <strong>{formatTemp(21)} / {formatTemp(13)}</strong>
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
    <div className="forecast-day">
      <span className="day-name">MON</span>
      <span className="forecast-icon sunny">☀</span>
      <span className="day-condition">Sunny</span>
      <div className="day-temperatures">
        <strong>{formatTemp(21)}</strong>
        <span>{formatTemp(13)}</span>
      </div>
    </div>

    <div className="forecast-day">
      <span className="day-name">TUE</span>
      <span className="forecast-icon cloudy">☁</span>
      <span className="day-condition">Cloudy</span>
      <div className="day-temperatures">
        <strong>{formatTemp(19)}</strong>
        <span>{formatTemp(12)}</span>
      </div>
    </div>

    <div className="forecast-day">
      <span className="day-name">WED</span>
      <span className="forecast-icon rainy">☂</span>
      <span className="day-condition">Rain</span>
      <div className="day-temperatures">
        <strong>{formatTemp(16)}</strong>
        <span>{formatTemp(10)}</span>
      </div>
    </div>

    <div className="forecast-day">
      <span className="day-name">THU</span>
      <span className="forecast-icon cloudy">☁</span>
      <span className="day-condition">Cloudy</span>
      <div className="day-temperatures">
        <strong>{formatTemp(18)}</strong>
        <span>{formatTemp(11)}</span>
      </div>
    </div>

    <div className="forecast-day">
      <span className="day-name">FRI</span>
      <span className="forecast-icon sunny">☀</span>
      <span className="day-condition">Sunny</span>
      <div className="day-temperatures">
        <strong>{formatTemp(22)}</strong>
        <span>{formatTemp(14)}</span>
      </div>
    </div>
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
