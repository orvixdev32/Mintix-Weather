
import { useEffect, useRef } from 'react'
import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import '../styles/weather-map.css'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import { setWorkerUrl } from 'maplibre-gl'

setWorkerUrl(workerUrl)

function WeatherMap({ coordinates }) {
  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)

  useEffect(() => {
    const container = mapContainerRef.current

    if (!container || mapRef.current) {
      return
    }

    const map = new maplibregl.Map({
      container,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: [
          coordinates.longitude,
          coordinates.latitude,
      ],
      zoom: 6,
      minZoom: 5,
      maxZoom: 17,
      maxBounds: [
        [22.0, 44.0],
        [41.0, 53.0],
      ],
      attributionControl: true,
    })

    map.addControl(
      new maplibregl.NavigationControl(),
      'top-right',
    )

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])
  const previousCoordinatesRef = useRef(coordinates)

useEffect(() => {
  const previous = previousCoordinatesRef.current

  const hasChanged =
    previous.latitude !== coordinates.latitude ||
    previous.longitude !== coordinates.longitude

  previousCoordinatesRef.current = coordinates

  if (!hasChanged || !mapRef.current) {
    return
  }

  mapRef.current.flyTo({
    center: [
      coordinates.longitude,
      coordinates.latitude,
    ],
    zoom: 9,
    speed: 1.2,
    curve: 1.4,
    essential: true,
  })
}, [coordinates.latitude, coordinates.longitude])

  return (
    <div
      ref={mapContainerRef}
      className="weather-map"
      aria-label="Interactive weather map"
    />
  )
}

export default WeatherMap
