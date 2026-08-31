import React, { useState, useEffect } from 'react';
import NavBar from '../components/NavBar';
import { getAllExhibitions, getStallsByExhibition } from '../services/admin.service';
import './StallMaps.css';

const StallMaps = () => {
  const [selectedExhibition, setSelectedExhibition] = useState('');
  const [exhibitions, setExhibitions] = useState([]);
  const [stalls, setStalls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hoveredStall, setHoveredStall] = useState(null);

  useEffect(() => {
    fetchExhibitions();
  }, []);

  useEffect(() => {
    if (selectedExhibition) {
      fetchStalls();
    }
  }, [selectedExhibition]);

  const fetchExhibitions = async () => {
    try {
      const data = await getAllExhibitions();
      setExhibitions(data);
      if (data.length > 0) {
        setSelectedExhibition(data[0].id.toString());
      }
    } catch (error) {
      toast.error('Failed to load exhibitions');
    }
  };

  const fetchStalls = async () => {
    try {
      setLoading(true);
      const data = await getStallsByExhibition(selectedExhibition);
      setStalls(data);
    } catch (error) {
      toast.error('Failed to load stalls');
    } finally {
      setLoading(false);
    }
  };

  const getMaxGridDimensions = () => {
    if (stalls.length === 0) return { maxRow: 3, maxCol: 3 };
    const maxRow = Math.max(...stalls.map(s => s.gridRow), 3);
    const maxCol = Math.max(...stalls.map(s => s.gridCol), 3);
    return { maxRow, maxCol };
  };

  const getStallAtPosition = (row, col) => {
    return stalls.find(s => s.gridRow === row && s.gridCol === col);
  };

  const getStallClass = (stall) => {
    if (!stall) return 'grid-cell empty';
    if (stall.reservedBy) return 'grid-cell stall reserved';
    if (!stall.isActive) return 'grid-cell stall inactive';
    return 'grid-cell stall available';
  };

  const { maxRow, maxCol } = getMaxGridDimensions();

  return (
    <div className="stall-maps-page">
      <NavBar />
      
      <div className="stall-maps-container">
        <div className="page-header">
          <h1 className="page-title">Stall Maps</h1>
          <p className="page-subtitle">Interactive stall layout visualization</p>
        </div>

        <div className="exhibition-selector-card">
          <label className="selector-label">
            <span className="label-icon">🏛️</span>
            Select Exhibition
          </label>
          <select
            value={selectedExhibition}
            onChange={(e) => setSelectedExhibition(e.target.value)}
            className="exhibition-select"
          >
            {exhibitions.map(exhibition => (
              <option key={exhibition.id} value={exhibition.id}>
                {exhibition.name}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="loading-state">Loading stall map...</div>
        ) : stalls.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🗺️</div>
            <h3>No Stalls Available</h3>
            <p>Add stalls to this exhibition to see the map</p>
          </div>
        ) : (
          <div className="map-container">
            <div className="map-legend">
              <div className="legend-item">
                <div className="legend-color available"></div>
                <span>Available</span>
              </div>
              <div className="legend-item">
                <div className="legend-color reserved"></div>
                <span>Reserved</span>
              </div>
              <div className="legend-item">
                <div className="legend-color inactive"></div>
                <span>Inactive</span>
              </div>
            </div>

            <div className="stall-grid-map">
              {Array.from({ length: maxRow }, (_, row) => (
                <div key={row} className="grid-row">
                  {Array.from({ length: maxCol }, (_, col) => {
                    const stall = getStallAtPosition(row + 1, col + 1);
                    return (
                      <div
                        key={`${row}-${col}`}
                        className={getStallClass(stall)}
                        onMouseEnter={() => stall && setHoveredStall(stall)}
                        onMouseLeave={() => setHoveredStall(null)}
                      >
                        {stall && (
                          <div className="stall-label">
                            {stall.name}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {hoveredStall && (
              <div className="stall-tooltip">
                <h4>{hoveredStall.name}</h4>
                <p><strong>Type:</strong> {hoveredStall.type}</p>
                <p><strong>Size:</strong> {hoveredStall.size}</p>
                <p><strong>Price:</strong> LKR {hoveredStall.price?.toLocaleString()}</p>
                {hoveredStall.reservedBy && (
                  <p><strong>Reserved by:</strong> {hoveredStall.reservedBy}</p>
                )}
                {hoveredStall.description && (
                  <p className="tooltip-description">{hoveredStall.description}</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StallMaps;
