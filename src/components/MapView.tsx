import { useRef, useEffect, useState } from 'react'
import mapboxgl, { Map } from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import '../styles/MapView.css'

import damsDataRaw from '../../data/dams.json'
import Legend from './Legend'
import Sidebar from './Sidebar'

import { createDamVicinityGrid } from '../utils/grid'
import type { DamFeatureCollection } from '../types/dam'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || import.meta.env.VITE_MAPBOX_API

const damsData = damsDataRaw as DamFeatureCollection

function App() {
  const mapRef = useRef<Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const [showWaterAreas, setShowWaterAreas] = useState(true)
  const [show3DBuildings, setShow3DBuildings] = useState(true)
  const [showPixelatedOverlay, setShowPixelatedOverlay] = useState(false)
  const [currentCoords, setCurrentCoords] = useState({
    lng: 121.049309,
    lat: 14.651489,
    zoom: 11
  })

  useEffect(() => {
    if (!mapContainerRef.current) return

    const bounds: mapboxgl.LngLatBoundsLike = [
      [120.94, 14.45],
      [121.12, 14.76]
    ]

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [121.049309, 14.651489],
      zoom: 11,
      pitch: 45,
      bearing: 0,
      maxBounds: bounds,
      minZoom: 9,
      maxZoom: 18
    })

    mapRef.current = map

    map.on('mousemove', (e) => {
      setCurrentCoords({
        lng: e.lngLat.lng,
        lat: e.lngLat.lat,
        zoom: map.getZoom()
      })
    })

    map.on('load', () => {
      // Water areas layer
      map.addLayer({
        id: 'water-areas',
        type: 'fill',
        source: 'composite',
        'source-layer': 'water',
        paint: {
          'fill-color': '#1CB5E0',
          'fill-opacity': 0.6
        }
      })

        damsData.features.forEach((feature) => {
        const { coordinates } = feature.geometry
        const { sensor_id, location, alert_level, alarm_level, critical_level } = feature.properties

        const alertLevelColor = alert_level >= 3 ? '#ff3300' : alert_level >= 2 ? '#ffcc00' : '#00ff00'

        const popupContent = `
          <div class="popup-content">
            <h3 class="popup-title">${sensor_id}</h3>
            <p><strong>Location:</strong> ${location}</p>
            <p><strong>Alert Level:</strong> <span class="alert-level-text" style="color: ${alertLevelColor};">${alert_level}</span></p>
            <p><strong>Alarm Level:</strong> ${alarm_level}</p>
            <p><strong>Critical Level:</strong> ${critical_level}</p>
            <p><strong>Risk Assessment Area:</strong> ~3km radius</p>
            <p><strong>Grid Resolution:</strong> 30m per cell</p>
          </div>
        `

        // Create custom marker element
        const markerElement = document.createElement('div')
        markerElement.className = 'dam-marker'
        markerElement.style.backgroundColor = alertLevelColor

        new mapboxgl.Marker({ element: markerElement })
          .setLngLat(coordinates)
          .setPopup(new mapboxgl.Popup().setHTML(popupContent))
          .addTo(map)
      })
      // Pixelated overlay
      const pixelatedData = createDamVicinityGrid(damsData)
      map.addSource('pixelated-grid', {
        type: 'geojson',
        data: pixelatedData
      })

      map.addLayer({
        id: 'pixelated-overlay',
        type: 'fill',
        source: 'pixelated-grid',
        layout: { visibility: 'none' },
        paint: {
          'fill-color': [
            'case',
            ['==', ['get', 'riskLevel'], 3], '#ff0000',
            ['==', ['get', 'riskLevel'], 2], '#ff8800',
            ['==', ['get', 'riskLevel'], 1], '#ffff00',
            '#00ff00'
          ],
          'fill-opacity': [
            'interpolate', ['linear'], ['zoom'],
            9, 0.6,
            12, 0.5,
            15, 0.3
          ]
        }
      }, 'water-areas')

      map.addLayer({
        id: 'pixelated-outline',
        type: 'line',
        source: 'pixelated-grid',
        layout: { visibility: 'none' },
        paint: {
          'line-color': '#333333',
          'line-width': [
            'interpolate', ['linear'], ['zoom'],
            9, 0.1,
            12, 0.2,
            15, 0.5
          ],
          'line-opacity': 0.2
        }
      }, 'water-areas')

      // 3D buildings
      map.addLayer({
        id: '3d-buildings',
        source: 'composite',
        'source-layer': 'building',
        filter: ['==', 'extrude', 'true'],
        type: 'fill-extrusion',
        minzoom: 12,
        paint: {
          'fill-extrusion-color': [
            'case',
            ['>', ['get', 'height'], 100], '#2E5266',
            ['>', ['get', 'height'], 50], '#FF8C42',
            '#e8e8e8'
          ],
          'fill-extrusion-height': [
            'interpolate', ['linear'], ['zoom'],
            12, 0,
            12.05, ['get', 'height']
          ],
          'fill-extrusion-base': [
            'interpolate', ['linear'], ['zoom'],
            12, 0,
            12.05, ['get', 'min_height']
          ],
          'fill-extrusion-opacity': 0.8
        }
      })

            // Add navigation controls
      map.addControl(new mapboxgl.NavigationControl(), 'top-right')

      // Add scale control
      map.addControl(new mapboxgl.ScaleControl({
        maxWidth: 100,
        unit: 'metric'
      }), 'bottom-left')

      // Add fullscreen control
      map.addControl(new mapboxgl.FullscreenControl(), 'top-right')

      // Add click event for pixelated grid
      map.on('click', 'pixelated-overlay', (e) => {
        if (!e.features || !e.features[0]) return

        const feature = e.features[0]

        // Calculate centroid of the polygon
        const coordinates = feature.geometry.coordinates[0]
        let lngSum = 0
        let latSum = 0
        const pointCount = coordinates.length - 1 // Exclude duplicate closing point

        for (let i = 0; i < pointCount; i++) {
          lngSum += coordinates[i][0]
          latSum += coordinates[i][1]
        }

        const centroidLng = lngSum / pointCount
        const centroidLat = latSum / pointCount

        new mapboxgl.Popup()
          .setLngLat(e.lngLat)
          .setHTML(`
            <div class="popup-content">
              <h3 class="popup-title">Dam Risk Assessment</h3>
              <p><strong>Risk Level:</strong> ${feature.properties?.riskLevel || 0}</p>
              <p><strong>Dam ID:</strong> ${feature.properties?.damId || 'Unknown'}</p>
              <p><strong>Dam Alert Level:</strong> ${feature.properties?.damAlertLevel || 0}</p>
              <p><strong>Distance to Dam:</strong> ${feature.properties?.distanceToDam || 0}m</p>
              <p><strong>Elevation:</strong> ${Math.round(feature.properties?.elevation || 0)}m</p>
              <p><strong>Population Density:</strong> ${Math.round(feature.properties?.population || 0)}</p>
              <p><strong>Grid Cell Size:</strong> ${feature.properties?.boxSizeMeters || 30}m × ${feature.properties?.boxSizeMeters || 30}m</p>
              <p><strong>Mean Coordinate:</strong> ${centroidLat.toFixed(6)}, ${centroidLng.toFixed(6)}</p>
            </div>
          `)
          .addTo(map)
      })

      // Roads overlay
      map.addLayer({
        id: 'roads-overlay',
        type: 'line',
        source: 'composite',
        'source-layer': 'road',
        filter: ['in', 'class', 'motorway', 'trunk', 'primary', 'secondary'],
        paint: {
          'line-color': '#666666',
          'line-width': [
            'interpolate', ['linear'], ['zoom'],
            10, 1,
            15, 3
          ],
          'line-opacity': 0.7
        }
      })
    })

    return () => {
      map.remove()
    }
  }, [])

  const toggleLayer = (id: string, visible: boolean) => {
    if (mapRef.current) {
      const visibility = visible ? 'none' : 'visible'
      mapRef.current.setLayoutProperty(id, 'visibility', visibility)
    }
  }

  return (
    <>
      <Sidebar
        currentCoords={currentCoords}
        resetView={() => {
          mapRef.current?.flyTo({
            center: [121.049309, 14.651489],
            zoom: 11,
            pitch: 45,
            bearing: 0,
            duration: 2000
          })
        }}
        toggle3D={() => {
          if (mapRef.current) {
            const currentPitch = mapRef.current.getPitch()
            mapRef.current.flyTo({
              pitch: currentPitch > 0 ? 0 : 45,
              duration: 1000
            })
          }
        }}
        toggleWaterAreas={() => {
          toggleLayer('water-areas', showWaterAreas)
          setShowWaterAreas(!showWaterAreas)
        }}
        toggle3DBuildings={() => {
          toggleLayer('3d-buildings', show3DBuildings)
          setShow3DBuildings(!show3DBuildings)
        }}
        togglePixelatedOverlay={() => {
          toggleLayer('pixelated-overlay', showPixelatedOverlay)
          toggleLayer('pixelated-outline', showPixelatedOverlay)
          setShowPixelatedOverlay(!showPixelatedOverlay)
        }}
        showWaterAreas={showWaterAreas}
        show3DBuildings={show3DBuildings}
        showPixelatedOverlay={showPixelatedOverlay}
      />

      <Legend />
      <div id="map-container" ref={mapContainerRef} />
    </>
  )
}

export default App
