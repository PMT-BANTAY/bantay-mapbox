import '../styles/Legend.css'

const Legend = () => {
  return (
    <div>
    <div className="legend">
        <h4>Legend</h4>
        
        <div className="legend-section">
          <strong>Building Heights:</strong>
          <div className="legend-item">
            <span className="legend-color building-tall"></span>
            Tall (&gt;100m)
          </div>
          <div className="legend-item">
            <span className="legend-color building-medium"></span>
            Medium (50-100m)
          </div>
          <div className="legend-item">
            <span className="legend-color building-short"></span>
            Short (&lt;50m)
          </div>
        </div>

        <div className="legend-section">
          <strong>Water Areas:</strong>
          <div className="legend-item">
            <span className="legend-color water-area"></span>
            Rivers, Lakes, Creeks
          </div>
        </div>

        <div className="legend-section">
          <strong>Dam Alert Levels:</strong>
          <div className="legend-item">
            <span className="legend-color dam-high"></span>
            High (Level 3)
          </div>
          <div className="legend-item">
            <span className="legend-color dam-medium"></span>
            Medium (Level 2)
          </div>
          <div className="legend-item">
            <span className="legend-color dam-low"></span>
            Low (Level 1)
          </div>
        </div>

        <div className="legend-section">
          <strong>Dam Risk Assessment:</strong>
          <div className="legend-item">
            <span style={{backgroundColor: '#ff0000', width: '12px', height: '12px', display: 'inline-block', marginRight: '5px'}}></span>
            High Risk (0-5km)
          </div>
          <div className="legend-item">
            <span style={{backgroundColor: '#ff8800', width: '12px', height: '12px', display: 'inline-block', marginRight: '5px'}}></span>
            Medium-High Risk (5-10km)
          </div>
          <div className="legend-item">
            <span style={{backgroundColor: '#ffff00', width: '12px', height: '12px', display: 'inline-block', marginRight: '5px'}}></span>
            Medium Risk (10-15km)
          </div>
          <div className="legend-item">
            <span style={{backgroundColor: '#00ff00', width: '12px', height: '12px', display: 'inline-block', marginRight: '5px'}}></span>
            Low Risk (15km+)
          </div>
        </div>

        <div className="legend-section">
          <strong>Grid Specifications:</strong>
          <div className="legend-item">
            <small>• 99x99 grid per dam</small>
          </div>
          <div className="legend-item">
            <small>• 30m × 30m per cell</small>
          </div>
          <div className="legend-item">
            <small>• 30 radius coverage</small>
          </div>
          <div className="legend-item">
            <small>• Risk based on distance to dam</small>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Legend
