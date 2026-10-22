import {
  Sun,
  CloudSun,
  Cloud,
  CloudFog,
  CloudRain,
  CloudSnow,
  CloudLightning,
} from 'lucide-react'

export function WeatherIcon({ code, className = 'weather-icon' }) {
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

export function AnimatedWeatherArt({ weatherCode }) {
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

