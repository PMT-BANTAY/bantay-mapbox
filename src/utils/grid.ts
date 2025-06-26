// utils/grid.ts
import { DamFeatureCollection } from './types/index'

export const metersToDegrees = (meters: number, latitude: number) => {
  const metersPerDegreeLat = 111320
  const metersPerDegreeLng = 111320 * Math.cos(latitude * Math.PI / 180)
  return {
    lat: meters / metersPerDegreeLat,
    lng: meters / metersPerDegreeLng
  }
}

export const calculateDistanceInMeters = (lng1: number, lat1: number, lng2: number, lat2: number) => {
  const R = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export const createDamVicinityGrid = (damsData: DamFeatureCollection) => {
  const features: any[] = []
  const gridSize = 99
  const boxSizeMeters = 30
  const totalAreaMeters = gridSize * boxSizeMeters
  const radiusMeters = totalAreaMeters / 2

  damsData.features.forEach(dam => {
    const [damLng, damLat] = dam.geometry.coordinates
    const alertLevel = dam.properties.alert_level
    const boxSizeDeg = metersToDegrees(boxSizeMeters, damLat)
    const radiusDeg = metersToDegrees(radiusMeters, damLat)

    const minLng = damLng - radiusDeg.lng
    const minLat = damLat - radiusDeg.lat

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const cellLng = minLng + (i * boxSizeDeg.lng)
        const cellLat = minLat + (j * boxSizeDeg.lat)
        const distance = calculateDistanceInMeters(cellLng, cellLat, damLng, damLat)

        if (distance <= radiusMeters) {
          let baseRisk = 0
          if (distance < 500) baseRisk = 3
          else if (distance < 1000) baseRisk = 2
          else if (distance < 1500) baseRisk = 1

          const riskMultiplier = alertLevel >= 3 ? 1.0 : alertLevel >= 2 ? 0.8 : 0.6
          const risk = Math.min(3, Math.floor(baseRisk * riskMultiplier))
          const variation = Math.random() * 0.3 - 0.15
          const adjusted = Math.max(0, Math.min(3, Math.floor(risk + variation)))

          features.push({
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [[
                [cellLng, cellLat],
                [cellLng + boxSizeDeg.lng, cellLat],
                [cellLng + boxSizeDeg.lng, cellLat + boxSizeDeg.lat],
                [cellLng, cellLat + boxSizeDeg.lat],
                [cellLng, cellLat]
              ]]
            },
            properties: {
              elevation: Math.random() * 100,
              population: Math.max(0, Math.random() * 100 * (1 - distance / radiusMeters)),
              riskLevel: adjusted,
              distanceToDam: Math.round(distance),
              damId: dam.properties.sensor_id,
              damAlertLevel: alertLevel,
              boxSizeMeters
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
