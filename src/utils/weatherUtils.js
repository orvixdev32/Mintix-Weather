/**
 * Weather and date utility helpers for Mintix Weather
 */

export function getDayName(dateString, index) {
  if (index === 0) return 'Today'

  return new Date(`${dateString}T12:00:00`).toLocaleDateString('en-US', {
    weekday: 'short',
  })
}

export function getFormattedDate() {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  }).format(new Date())
}

export function getNextHours(hourly, count = 8) {
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

export function getWeatherDescription(code) {
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

export function formatTemp(celsius, unit = 'C') {
  if (celsius === undefined || celsius === null) return '--'
  const temperature = unit === 'C' ? celsius : (celsius * 9) / 5 + 32
  return `${Math.round(temperature)}°`
}

