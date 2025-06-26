// utils/grid.ts
import type { DamFeatureCollection } from '../types/dam';

export const metersToDegrees = (meters: number, latitude: number) => {
  const metersPerDegreeLat = 111320
  const metersPerDegreeLng = 111320 * Math.cos(latitude * Math.PI / 180)
  return {
    lat: meters / metersPerDegreeLat,
    lng: meters / metersPerDegreeLng
  }
}

export const calculateDistanceInMeters = (
  lng1: number,
  lat1: number,
  lng2: number,
  lat2: number
) => {
  const R = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
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

  damsData.features.forEach((damFeature) => {
    const [damLng, damLat] = damFeature.geometry.coordinates
    const damAlertLevel = damFeature.properties.alert_level

    const boxSizeDegrees = metersToDegrees(boxSizeMeters, damLat)
    const radiusDegrees = metersToDegrees(radiusMeters, damLat)

    const minLng = damLng - radiusDegrees.lng
    const minLat = damLat - radiusDegrees.lat

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const cellLng = minLng + i * boxSizeDegrees.lng
        const cellLat = minLat + j * boxSizeDegrees.lat

        const distanceToDam = calculateDistanceInMeters(cellLng, cellLat, damLng, damLat)
        if (distanceToDam <= radiusMeters) {
          let baseRiskLevel = 0
          if (distanceToDam < 500) baseRiskLevel = 3
          else if (distanceToDam < 1000) baseRiskLevel = 2
          else if (distanceToDam < 1500) baseRiskLevel = 1

          const riskMultiplier = damAlertLevel >= 3 ? 1.0 : damAlertLevel >= 2 ? 0.8 : 0.6
          const finalRiskLevel = Math.min(3, Math.floor(baseRiskLevel * riskMultiplier))
          const randomVariation = Math.random() * 0.3 - 0.15
          const adjustedRiskLevel = Math.max(0, Math.min(3, Math.floor(finalRiskLevel + randomVariation)))

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
              elevation: Math.random() * 100,
              population: Math.max(0, Math.random() * 100 * (1 - distanceToDam / radiusMeters)),
              riskLevel: adjustedRiskLevel,
              distanceToDam: Math.round(distanceToDam),
              damId: damFeature.properties.sensor_id,
              damAlertLevel: damAlertLevel,
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
