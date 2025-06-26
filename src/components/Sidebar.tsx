// components/Sidebar.tsx

import React, { useState } from 'react';
import '../styles/Sidebar.css';

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
  const [location, setLocation] = useState('Caniogan, Pasig City');
  const [waterLevel, setWaterLevel] = useState('NORMAL');
  const [floodHazard, setFloodHazard] = useState('NO FLOODING');
  const [mapControlsExpanded, setMapControlsExpanded] = useState(false);

  const handleEmergencyCall = () => {
    window.open('tel:911', '_self');
  };

  const handleEvacuation = () => {
    // Trigger evacuation route display
    console.log('Showing evacuation routes...');
  };

  const handleWeather = () => {
    // Open weather information
    console.log('Showing weather information...');
  };

  const handleLocationSearch = () => {
    console.log('Searching for location:', location);
  };

  const toggleMapControls = () => {
    setMapControlsExpanded(!mapControlsExpanded);
  };

  const facilities = [
    {
      id: 1,
      title: 'THIS IS FOR RESCUER RELATED',
      distance: '0.2 km away',
      type: 'FIRE STATION',
      category: 'fire'
    },
    {
      id: 2,
      title: 'THIS IS FOR RESCUER RELATED',
      distance: '0.2 km away',
      type: 'BARANGAY HALL',
      category: 'barangay'
    },
    {
      id: 3,
      title: 'THIS IS FOR COVERED COURTS, ETC.',
      distance: '0.2 km away',
      type: 'EVACUATION',
      category: 'evacuation'
    },
    {
      id: 4,
      title: 'THIS IS FOR SCHOOL',
      distance: '0.2 km away',
      type: 'SCHOOL',
      category: 'school'
    },
    {
      id: 5,
      title: 'THIS IS FOR MEDICAL CENTERS',
      distance: '0.2 km away',
      type: 'HEALTH CENTER',
      category: 'health'
    }
  ];

  const WaveIcon = () => (
    <svg viewBox="0 0 40 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 12c2.5-3 5-3 7.5 0s5 3 7.5 0 5-3 7.5 0 5 3 7.5 0 5-3 7.5 0v12H0V12z" />
    </svg>
  );

  const WaterDropIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '100%', height: '100%' }}>
      <path d="M12 2c-5.5 7.5-8 10-8 14 0 4.4 3.6 8 8 8s8-3.6 8-8c0-4-2.5-6.5-8-14z" />
    </svg>
  );

  const WavesIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '100%', height: '100%' }}>
      <path d="M17 16.99c-1.35 0-2.2.42-2.95.8-.75.38-1.49.8-2.05.8-.56 0-1.3-.42-2.05-.8-.75-.38-1.6-.8-2.95-.8s-2.2.42-2.95.8c-.75.38-1.49.8-2.05.8v2c1.35 0 2.2-.42 2.95-.8.75-.38 1.49-.8 2.05-.8s1.3.42 2.05.8c.75.38 1.6.8 2.95.8s2.2-.42 2.95-.8c.75-.38 1.49-.8 2.05-.8.56 0 1.3.42 2.05.8.75.38 1.6.8 2.95.8v-2c-.56 0-1.3-.42-2.05-.8-.75-.38-1.6-.8-2.95-.8zm0-4.5c-1.35 0-2.2.43-2.95.8-.75.38-1.49.8-2.05.8-.56 0-1.3-.42-2.05-.8-.75-.38-1.6-.8-2.95-.8s-2.2.43-2.95.8c-.75.38-1.49.8-2.05.8v2c1.35 0 2.2-.43 2.95-.8.75-.38 1.49-.8 2.05-.8s1.3.43 2.05.8c.75.38 1.6.8 2.95.8s2.2-.43 2.95-.8c.75-.38 1.49-.8 2.05-.8.56 0 1.3.43 2.05.8.75.38 1.6.8 2.95.8v-2c-.56 0-1.3-.43-2.05-.8-.75-.38-1.6-.8-2.95-.8z" />
    </svg>
  );

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="wave-icon">
          <WaveIcon />
        </div>
        
        <div className="location-section">
          <div className="location-label">Current Location:</div>
          <div className="location-input-container">
            <span className="location-icon">📍</span>
            <input 
              type="text" 
              className="location-input"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter location"
            />
            <span className="search-icon" onClick={handleLocationSearch}>🔍</span>
          </div>
        </div>

        <div className="action-buttons">
          <button className="action-button" onClick={handleEmergencyCall}>
            <div className="action-button-icon">📞</div>
            <span>Emergency</span>
          </button>
          <button className="action-button" onClick={handleEvacuation}>
            <div className="action-button-icon">🏃</div>
            <span>Evacuation</span>
          </button>
          <button className="action-button" onClick={handleWeather}>
            <div className="action-button-icon">☁️</div>
            <span>Weather</span>
          </button>
        </div>
      </div>

      <div className="main-content">
        <div className="status-section">
          <h2 className="status-title">Your Area's Status</h2>
          
          <div className="status-cards">
            <div className="status-card">
              <div className="status-card-title">Current Water Level</div>
              <div className="status-icon water-level-icon">
                <WaterDropIcon />
              </div>
              <div className={`status-label status-${waterLevel.toLowerCase().replace(' ', '-')}`}>
                {waterLevel}
              </div>
            </div>
            
            <div className="status-card">
              <div className="status-card-title">Flood Hazard Level</div>
              <div className="status-icon flood-hazard-icon">
                <WavesIcon />
              </div>
              <div className={`status-label status-${floodHazard.toLowerCase().replace(' ', '-')}`}>
                {floodHazard}
              </div>
            </div>
          </div>
        </div>

        <div className="facilities-section">
          <h2 className="facilities-title">Nearby Support Facilities</h2>
          
          {facilities.map((facility) => (
            <div key={facility.id} className="facility-item">
              <div className="facility-info">
                <div className="facility-title">{facility.title}</div>
                <div className="facility-distance">{facility.distance}</div>
              </div>
              <div className={`facility-type facility-${facility.category}`}>
                {facility.type}
              </div>
            </div>
          ))}
        </div>

        <div className="map-controls-section">
          <div className="map-controls-title" onClick={toggleMapControls}>
            Map Controls
            <span className={`map-controls-toggle ${mapControlsExpanded ? 'expanded' : ''}`}>
              ▼
            </span>
          </div>
          
          <div className={`map-controls-content ${mapControlsExpanded ? 'visible' : ''}`}>
            <div className="coordinates-display">
              <div className="coordinates-title">Current Map Position</div>
              <div className="coordinate-item">
                <span className="coordinate-label">Longitude:</span>
                <span className="coordinate-value">{currentCoords.lng.toFixed(6)}</span>
              </div>
              <div className="coordinate-item">
                <span className="coordinate-label">Latitude:</span>
                <span className="coordinate-value">{currentCoords.lat.toFixed(6)}</span>
              </div>
              <div className="coordinate-item">
                <span className="coordinate-label">Zoom Level:</span>
                <span className="coordinate-value">{currentCoords.zoom.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="map-control-group">
              <div className="map-control-group-title">View Controls</div>
              <button className="map-control-button" onClick={resetView}>
                🏠 Reset to Default View
              </button>
              <button className="map-control-button" onClick={toggle3D}>
                🌐 Toggle 3D View
              </button>
            </div>
            
            <div className="map-control-group">
              <div className="map-control-group-title">Layer Toggles</div>
              
              <div className="toggle-switch" onClick={toggleWaterAreas}>
                <span className="toggle-switch-label">Water Areas</span>
                <div className={`toggle-switch-input ${showWaterAreas ? 'active' : ''}`}></div>
              </div>
              
              <div className="toggle-switch" onClick={toggle3DBuildings}>
                <span className="toggle-switch-label">3D Buildings</span>
                <div className={`toggle-switch-input ${show3DBuildings ? 'active' : ''}`}></div>
              </div>
              
              <div className="toggle-switch" onClick={togglePixelatedOverlay}>
                <span className="toggle-switch-label">Risk Grid Overlay</span>
                <div className={`toggle-switch-input ${showPixelatedOverlay ? 'active' : ''}`}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Legacy hidden controls - kept for any other dependencies */}
        <div style={{ display: 'none' }}>
          <button onClick={resetView}>Reset View</button>
          <button onClick={toggle3D}>Toggle 3D</button>
          <button onClick={toggleWaterAreas}>Toggle Water Areas</button>
          <button onClick={toggle3DBuildings}>Toggle 3D Buildings</button>
          <button onClick={togglePixelatedOverlay}>Toggle Overlay</button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;