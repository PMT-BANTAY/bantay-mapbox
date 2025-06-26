// components/Sidebar.tsx

import '../styles/Sidebar.css'

type Props = {
  currentCoords: {
    lng: number;
    lat: number;
    zoom: number;
  };
  resetView: () => void;
  toggle3D: () => void;
  toggleWaterAreas: () => void;
  toggle3DBuildings: () => void;
  togglePixelatedOverlay: () => void;
  showWaterAreas: boolean;
  show3DBuildings: boolean;
  showPixelatedOverlay: boolean;
};

const Sidebar = ({ 
  currentCoords, 
  resetView, 
  toggle3D, 
  toggleWaterAreas, 
  toggle3DBuildings, 
  togglePixelatedOverlay,
  showWaterAreas,
  show3DBuildings,
  showPixelatedOverlay 
}: Props) => {
  const { lng, lat, zoom } = currentCoords;

  return (
    <div className="sidebar">
      <div className="sidebar-title">Metro Manila Dam Risk Assessment</div>
      
      <div className="coordinates-section">
        <div>Longitude: {lng.toFixed(6)}</div>
        <div>Latitude: {lat.toFixed(6)}</div>
        <div>Zoom: {zoom.toFixed(2)}</div>
      </div>

      <div className="controls-section">
        <h3>Map Controls</h3>
        
        <button onClick={resetView} className="control-button">
          Reset View
        </button>
        
        <button onClick={toggle3D} className="control-button">
          Toggle 3D View
        </button>
        
        <div className="layer-toggles">
          <h4>Layers</h4>
          
          <label className="toggle-item">
            <input 
              type="checkbox" 
              checked={showWaterAreas} 
              onChange={toggleWaterAreas}
            />
            <span>Water Areas</span>
          </label>
          
          <label className="toggle-item">
            <input 
              type="checkbox" 
              checked={show3DBuildings} 
              onChange={toggle3DBuildings}
            />
            <span>3D Buildings</span>
          </label>
          
          <label className="toggle-item">
            <input 
              type="checkbox" 
              checked={showPixelatedOverlay} 
              onChange={togglePixelatedOverlay}
            />
            <span>Risk Grid Overlay</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;