
import { useEffect, useRef } from 'react'
import mintixMapStyle from '../styles/mintix-map-style.json'
import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import '../styles/weather-map.css'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import { setWorkerUrl } from 'maplibre-gl'

setWorkerUrl(workerUrl)

const MAP_ZOOM = 12

const mapColors = {
  background: '#F3F8F1',
  water: '#C8E8F3',
  park: '#D7EEDC',
  landcover_grass: '#E0F0DF',
  landcover_wood: '#C9E4D0',
  landcover_wetland: '#D5E9DF',
  landcover_sand: '#F0EBDD',
  landuse_residential: '#EAF1E7',
  building: '#DFE8DE',

  road_minor_casing: '#D8E3D9',
  road_minor: '#FFFFFF',
  road_service_track_casing: '#D8E3D9',
  road_service_track: '#F9FCF8',
  road_path_pedestrian: '#BFD8C5',

  road_secondary_tertiary_casing: '#D2E0D3',
  road_secondary_tertiary: '#FFFFFF',
  road_trunk_primary_casing: '#B8D9BD',
  road_trunk_primary: '#F7FCF5',
  road_motorway_casing: '#A8D2B0',
  road_motorway: '#F3FAF1',

  boundary_2: '#B8CDBB',
  boundary_3: '#CCD9CD',
}

function applyMapColors(map) {
  Object.entries(mapColors).forEach(([layerId, color]) => {
    const layer = map.getLayer(layerId)

    if (!layer) return

    const paintProperty = {
      background: 'background-color',
      fill: 'fill-color',
      line: 'line-color',
    }[layer.type]

    if (paintProperty) {
      map.setPaintProperty(layerId, paintProperty, color)
    }
  })

  // Прибираємо дефолтні чорні кружечки-точки міст/сіл від стилю карти,
  // щоб вони не вилазили як чорні плями під кастомним маркером або назвами міст
  ;['label_village', 'label_town', 'label_city', 'label_city_capital'].forEach(
    (layerId) => {
      if (map.getLayer(layerId)) {
        map.setLayoutProperty(layerId, 'icon-image', '')
      }
    }
  )
}

function createCityMarker() {
  const element = document.createElement('div')

  element.setAttribute('role', 'img')
  element.setAttribute('aria-label', 'Вибране місто')

  Object.assign(element.style, {
    width: '18px',
    height: '18px',
    boxSizing: 'border-box',
    borderRadius: '50%',
    background: '#B7F34A',
    border: '3px solid #FFFFFF',
    boxShadow:
      '0 0 0 5px rgba(183, 243, 74, 0.28), 0 2px 8px rgba(20, 40, 20, 0.25)',
  })

  return element
}

function createRecenterControl(getCoordinates) {
  return {
    onAdd(map) {
      this.map = map

      const container = document.createElement('div')
      container.className = 'maplibregl-ctrl maplibregl-ctrl-group'

      const button = document.createElement('button')
      button.type = 'button'
      button.title = 'Повернутися до вибраного міста'
      button.setAttribute(
        'aria-label',
        'Повернутися до вибраного міста',
      )

      button.innerHTML = `
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="8"></circle>
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M12 2v2M12 20v2M2 12h2M20 12h2"></path>
        </svg>
      `

      Object.assign(button.style, {
        width: '32px',
        height: '32px',
        display: 'grid',
        placeItems: 'center',
        color: '#477344',
        cursor: 'pointer',
      })

      button.addEventListener('click', () => {
        const { latitude, longitude } = getCoordinates()

        map.flyTo({
          center: [longitude, latitude],
          zoom: MAP_ZOOM,
          speed: 1.2,
          curve: 1.4,
          essential: true,
        })
      })

      container.appendChild(button)
      this.container = container

      return container
    },

    onRemove() {
      this.container?.remove()
      this.map = undefined
    },
  }
}

function WeatherMap({ coordinates }) {
  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const previousCoordinatesRef = useRef(coordinates)
  const selectedCoordinatesRef = useRef(coordinates)

  selectedCoordinatesRef.current = coordinates

  useEffect(() => {
    const container = mapContainerRef.current

    if (!container || mapRef.current) return

    const map = new maplibregl.Map({
      container,
      style: mintixMapStyle,
      center: [
        coordinates.longitude,
        coordinates.latitude,
      ],
      zoom: MAP_ZOOM,
      minZoom: 5,
      maxZoom: 17,
      maxBounds: [
        [22.0, 44.0],
        [41.0, 53.0],
      ],
      attributionControl: true,
    })

    mapRef.current = map

    map.addControl(
      new maplibregl.NavigationControl(),
      'top-right',
    )

    map.addControl(
      createRecenterControl(() => selectedCoordinatesRef.current),
      'bottom-right',
    )

    map.on('load', () => {
      applyMapColors(map)

      const { latitude, longitude } =
        selectedCoordinatesRef.current

      markerRef.current = new maplibregl.Marker({
        element: createCityMarker(),
        anchor: 'center',
      })
        .setLngLat([longitude, latitude])
        .addTo(map)
    })

    return () => {
      markerRef.current?.remove()
      markerRef.current = null

      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    const previous = previousCoordinatesRef.current

    const hasChanged =
      previous.latitude !== coordinates.latitude ||
      previous.longitude !== coordinates.longitude

    previousCoordinatesRef.current = coordinates

    if (!hasChanged) return

    const { latitude, longitude } = coordinates

    markerRef.current?.setLngLat([longitude, latitude])

    mapRef.current?.flyTo({
      center: [longitude, latitude],
      zoom: MAP_ZOOM,
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
