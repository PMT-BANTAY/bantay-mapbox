import { useRef, useEffect } from 'react'
import mapboxgl, { Map } from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import './App.css'
import damsDataRaw from '../data/dams.json'

// Replace with your actual Mapbox access token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;


type DamFeature = {
  type: string
  geometry: {
    type: string
    coordinates: [number, number]
  }
  properties: {
    sensor_id: string
    location: string
    alert_level: number
    alarm_level: number
    critical_level: number
  }
}

type DamFeatureCollection = {
  type: string
  features: DamFeature[]
}


const damsData = damsDataRaw as DamFeatureCollection

function App() {
  const mapRef = useRef<Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {

    // Updated NCR bounds to cover the entire National Capital Region
    const bounds: mapboxgl.LngLatBoundsLike = [
      [120.94, 14.45], // Southwest coordinates (121.02369634296613, 14.402215203012032)
      [121.12, 14.76]  // Northeast coordinates (121.04167396332541, 14.78848086918476)
    ];

    if (!mapContainerRef.current) return

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [121.049309, 14.651489], // Corrected Quezon Memorial Circle coordinates
      zoom: 11,
      maxBounds: bounds
    });

    mapRef.current = map


    map.on('load', () => {

    map.addLayer({
      id: 'dam-vicinity-fill',
      type: 'fill',
      source: 'dam-vicinity-boxes',
      paint: {
        'fill-color': [
          'step',
          ['get', 'alert_level'],
          '#ffffcc',     // default / 0 or undefined
          1, '#ffff99',  // alert level 1 - Low
          2, '#ffcc00',  // alert level 2 - Medium
          3, '#ff3300'   // alert level 3 - High
        ],
        'fill-opacity': 0.4
      }
    })

      map.addLayer({
        id: 'dam-vicinity-outline',
        type: 'line',
        source: 'dam-vicinity-boxes',
        paint: {
          'line-color': '#007cbf',
          'line-width': 2
        }
      })

      // Add markers
      damsData.features.forEach((feature) => {
        const { coordinates } = feature.geometry
        const { sensor_id, location, alert_level, alarm_level, critical_level } = feature.properties

        const popupContent = `
          <strong>${sensor_id}</strong><br/>
          Location: ${location}<br/>
          Alert: ${alert_level}<br/>
          Alarm: ${alarm_level}<br/>
          Critical: ${critical_level}
        `

        new mapboxgl.Marker()
          .setLngLat(coordinates)
          .setPopup(new mapboxgl.Popup().setHTML(popupContent))
          .addTo(map)
      })
    })

    return () => {
      map.remove()
    }
  }, [])

  return <div id="map-container" ref={mapContainerRef} style={{ width: '100%', height: '100vh' }} />
}

export default App