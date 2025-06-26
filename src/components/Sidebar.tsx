// components/Sidebar.tsx

import '../styles/Sidebar.css'

type SidebarProps = {
  currentCoords: {
    lng: number
    lat: number
    zoom: number
  }
  resetView: () => void
  toggle3D: () => void
  toggleWaterAreas: () => void
  toggle3DBuildings: () => void
  togglePixelatedOverlay: () => void
  showWaterAreas: boolean
  show3DBuildings: boolean
  showPixelatedOverlay: boolean
}

export default function Sidebar({
  currentCoords,
  resetView,
  toggle3D,
  toggleWaterAreas,
  toggle3DBuildings,
  togglePixelatedOverlay,
  showWaterAreas,
  show3DBuildings,
  showPixelatedOverlay
}: SidebarProps) {
  return (
    <div className="sidebar">
      <div className="sidebar-title">Metro Manila Dam Risk Assessment</div>
      <div>Longitude: {currentCoords.lng.toFixed(6)}</div>
      <div>Latitude: {currentCoords.lat.toFixed(6)}</div>
      <div>Zoom: {currentCoords.zoom.toFixed(2)}</div>

      <div className="controls-container">
        <button onClick={resetView} className="control-button">Reset View</button>
        <button onClick={toggle3D} className="control-button">Toggle 3D</button>

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
    </div>
  )
}
