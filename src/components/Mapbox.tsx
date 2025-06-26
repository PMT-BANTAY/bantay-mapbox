import { useRef, useEffect, useState } from 'react'
import mapboxgl, { Map } from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import './App.css'
import damsDataRaw from '../data/dams.json'
import Legend from 'Legend'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || import.meta.env.VITE_MAPBOX_API;

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
  const [showWaterAreas, setShowWaterAreas] = useState(true)
  const [show3DBuildings, setShow3DBuildings] = useState(true)
  const [showPixelatedOverlay, setShowPixelatedOverlay] = useState(false)
  const [currentCoords, setCurrentCoords] = useState({ lng: 121.049309, lat: 14.651489, zoom: 11 })

  // Function to convert meters to degrees (approximate)
  const metersToDegrees = (meters: number, latitude: number) => {
    const metersPerDegreeLat = 111320
    const metersPerDegreeLng = 111320 * Math.cos(latitude * Math.PI / 180)
    return {
      lat: meters / metersPerDegreeLat,
      lng: meters / metersPerDegreeLng
    }
  }

  // Function to calculate distance between two points in meters
  const calculateDistanceInMeters = (lng1: number, lat1: number, lng2: number, lat2: number) => {
    const R = 6371000 // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  // Function to create pixelated grid around dams
  const createDamVicinityGrid = () => {
    const features: any[] = []
    const gridSize = 99 // 99x99 grid
    const boxSizeMeters = 30 // 30 meters per box
    const totalAreaMeters = gridSize * boxSizeMeters // 2970m x 2970m area
    const radiusMeters = totalAreaMeters / 2 // ~1485m radius from dam center

    damsData.features.forEach(damFeature => {
      const [damLng, damLat] = damFeature.geometry.coordinates
      const damAlertLevel = damFeature.properties.alert_level
      
      // Convert box size from meters to degrees
      const boxSizeDegrees = metersToDegrees(boxSizeMeters, damLat)
      
      // Calculate grid bounds around dam
      const radiusDegrees = metersToDegrees(radiusMeters, damLat)
      const minLng = damLng - radiusDegrees.lng
      const maxLng = damLng + radiusDegrees.lng
      const minLat = damLat - radiusDegrees.lat
      const maxLat = damLat + radiusDegrees.lat

      // Create grid cells
      for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
          const cellLng = minLng + (i * boxSizeDegrees.lng)
          const cellLat = minLat + (j * boxSizeDegrees.lat)
          
          // Check if cell is within circular vicinity of dam
          const distanceToDam = calculateDistanceInMeters(cellLng, cellLat, damLng, damLat)
          if (distanceToDam <= radiusMeters) {
            
            // Calculate risk level based on distance from dam and dam alert level
            let baseRiskLevel = 0
            if (distanceToDam < 500) { // Within 500m - highest risk
              baseRiskLevel = 3
            } else if (distanceToDam < 1000) { // 500m-1km - high risk
              baseRiskLevel = 2
            } else if (distanceToDam < 1500) { // 1-1.5km - medium risk
              baseRiskLevel = 1
            } else { // Beyond 1.5km - low risk
              baseRiskLevel = 0
            }
            
            // Adjust risk based on dam alert level
            const riskMultiplier = damAlertLevel >= 3 ? 1.0 : damAlertLevel >= 2 ? 0.8 : 0.6
            const finalRiskLevel = Math.min(3, Math.floor(baseRiskLevel * riskMultiplier))
            
            // Add some randomness for more realistic visualization
            const randomVariation = Math.random() * 0.3 - 0.15 // ±15% variation
            const adjustedRiskLevel = Math.max(0, Math.min(3, Math.floor(finalRiskLevel + randomVariation)))
            
            // Generate other properties
            const elevation = Math.random() * 100
            const population = Math.max(0, Math.random() * 100 * (1 - distanceToDam / radiusMeters)) // Lower population farther from center
            
            features.push({
              type: 'Feature',
              geometry: {
                type: 'Polygon',
                coordinates: [[
                  [cellLng, cellLat],
                  [cellLng + boxSizeDegrees.lng, cellLat],
                  [cellLng + boxSizeDegrees.lng, cellLat + boxSizeDegrees.lat],
                  [cellLng, cellLat + boxSizeDegrees.lat],
                  [cellLng, cellLat]
                ]]
              },
              properties: {
                elevation,
                population,
                riskLevel: adjustedRiskLevel,
                distanceToDam: Math.round(distanceToDam),
                damId: damFeature.properties.sensor_id,
                damAlertLevel: damAlertLevel,
                boxSizeMeters: boxSizeMeters
              }
            })
          }
        }
      }
    })

    return {
      type: 'FeatureCollection',
      features
    }
  }

  useEffect(() => {
    if (!mapContainerRef.current) return

    // Updated NCR bounds to cover the entire National Capital Region
    const bounds: mapboxgl.LngLatBoundsLike = [
      [120.94, 14.45], // Southwest coordinates
      [121.12, 14.76]  // Northeast coordinates
    ];

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [121.049309, 14.651489], // Quezon Memorial Circle coordinates
      zoom: 11,
      pitch: 45, // Tilt the map for 3D effect
      bearing: 0,
      maxBounds: bounds,
      minZoom: 9,
      maxZoom: 18
    });

    mapRef.current = map

    // Update coordinates on map move
    map.on('mousemove', (e) => {
      setCurrentCoords({
        lng: e.lngLat.lng,
        lat: e.lngLat.lat,
        zoom: map.getZoom()
      })
    })

    map.on('load', () => {
      // Add water areas layer using Mapbox vector tiles
      map.addLayer({
        'id': 'water-areas',
        'type': 'fill',
        'source': 'composite',
        'source-layer': 'water',
        'paint': {
          'fill-color': '#1CB5E0',
          'fill-opacity': 0.6
        }
      })

      // Create and add pixelated grid overlay around dams
      const pixelatedData = createDamVicinityGrid()
      
      map.addSource('pixelated-grid', {
        type: 'geojson',
        data: pixelatedData
      })

      // Add pixelated fill layer
      map.addLayer({
        'id': 'pixelated-overlay',
        'type': 'fill',
        'source': 'pixelated-grid',
        'layout': {
          'visibility': 'none'
        },
        'paint': {
          'fill-color': [
            'case',
            ['==', ['get', 'riskLevel'], 3],
            '#ff0000', // High risk - red
            ['==', ['get', 'riskLevel'], 2],
            '#ff8800', // Medium-high risk - orange
            ['==', ['get', 'riskLevel'], 1],
            '#ffff00', // Medium risk - yellow
            '#00ff00'  // Low risk - green
          ],
          'fill-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            9, 0.6,
            12, 0.5,
            15, 0.3
          ]
        }
      }, 'water-areas') // Place below water areas

      // Add pixelated outline layer for better definition
      map.addLayer({
        'id': 'pixelated-outline',
        'type': 'line',
        'source': 'pixelated-grid',
        'layout': {
          'visibility': 'none'
        },
        'paint': {
          'line-color': '#333333',
          'line-width': [
            'interpolate',
            ['linear'],
            ['zoom'],
            9, 0.1,
            12, 0.2,
            15, 0.5
          ],
          'line-opacity': 0.2
        }
      }, 'water-areas')

      // Add 3D buildings layer (placed above pixelated overlay)
      map.addLayer({
        'id': '3d-buildings',
        'source': 'composite',
        'source-layer': 'building',
        'filter': ['==', 'extrude', 'true'],
        'type': 'fill-extrusion',
        'minzoom': 12,
        'paint': {
          'fill-extrusion-color': [
            'case',
            ['>', ['get', 'height'], 100],
            '#2E5266', // Dark blue for tall buildings
            ['>', ['get', 'height'], 50],
            '#FF8C42', // Orange for medium buildings
            '#e8e8e8'  // Light gray for shorter buildings
          ],
          'fill-extrusion-height': [
            'interpolate',
            ['linear'],
            ['zoom'],
            12, 0,
            12.05, ['get', 'height']
          ],
          'fill-extrusion-base': [
            'interpolate',
            ['linear'],
            ['zoom'],
            12, 0,
            12.05, ['get', 'min_height']
          ],
          'fill-extrusion-opacity': 0.8
        }
      })

      // Add roads layer to ensure they're visible above pixelated overlay
      map.addLayer({
        'id': 'roads-overlay',
        'type': 'line',
        'source': 'composite',
        'source-layer': 'road',
        'filter': ['in', 'class', 'motorway', 'trunk', 'primary', 'secondary'],
        'paint': {
          'line-color': '#666666',
          'line-width': [
            'interpolate',
            ['linear'],
            ['zoom'],
            10, 1,
            15, 3
          ],
          'line-opacity': 0.7
        }
      })

      // Add dam markers
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

      // Change cursor on hover events
      const layersWithHover = ['pixelated-overlay']
      
      layersWithHover.forEach(layerId => {
        map.on('mouseenter', layerId, () => {
          if (map) {
            map.getCanvas().style.cursor = 'pointer'
          }
        })

        map.on('mouseleave', layerId, () => {
          if (map) {
            map.getCanvas().style.cursor = ''
          }
        })
      })
    })

    return () => {
      map.remove()
    }
  }, [])

  const resetView = () => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [121.049309, 14.651489],
        zoom: 11,
        pitch: 45,
        bearing: 0,
        duration: 2000
      })
    }
  }

  const toggle3D = () => {
    if (mapRef.current) {
      const currentPitch = mapRef.current.getPitch()
      mapRef.current.flyTo({
        pitch: currentPitch > 0 ? 0 : 45,
        duration: 1000
      })
    }
  }

  const toggleWaterAreas = () => {
    if (mapRef.current) {
      const visibility = showWaterAreas ? 'none' : 'visible'
      mapRef.current.setLayoutProperty('water-areas', 'visibility', visibility)
      setShowWaterAreas(!showWaterAreas)
    }
  }

  const toggle3DBuildings = () => {
    if (mapRef.current) {
      const visibility = show3DBuildings ? 'none' : 'visible'
      mapRef.current.setLayoutProperty('3d-buildings', 'visibility', visibility)
      setShow3DBuildings(!show3DBuildings)
    }
  }

  const togglePixelatedOverlay = () => {
    if (mapRef.current) {
      const visibility = showPixelatedOverlay ? 'none' : 'visible'
      mapRef.current.setLayoutProperty('pixelated-overlay', 'visibility', visibility)
      mapRef.current.setLayoutProperty('pixelated-outline', 'visibility', visibility)
      setShowPixelatedOverlay(!showPixelatedOverlay)
    }
  }

  return (
    <>
      <div className="sidebar">
        <div className="sidebar-title">
          Metro Manila Dam Risk Assessment
        </div>
        <div>Longitude: {currentCoords.lng.toFixed(6)}</div>
        <div>Latitude: {currentCoords.lat.toFixed(6)}</div>
        <div>Zoom: {currentCoords.zoom.toFixed(2)}</div>
      </div>

      <div className="controls-container">
        <button onClick={resetView} className="control-button">
          Reset View
        </button>

        <button onClick={toggle3D} className="control-button">
          Toggle 3D
        </button>

        <button 
          onClick={toggleWaterAreas}
          className={`control-button ${showWaterAreas ? 'active' : ''}`}
        >
          Water Areas
        </button>

        <button 
          onClick={toggle3DBuildings}
          className={`control-button ${show3DBuildings ? 'active' : ''}`}
        >
          3D Buildings
        </button>

        <button 
          onClick={togglePixelatedOverlay}
          className={`control-button ${showPixelatedOverlay ? 'active' : ''}`}
        >
          Dam Risk Grid
        </button>
      </div>

      <Legend />

      <div id="map-container" ref={mapContainerRef} />
    </>
  )
}

export default App