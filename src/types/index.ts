// types/index.ts

export type DamFeature = {
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

export type DamFeatureCollection = {
  type: string
  features: DamFeature[]
}