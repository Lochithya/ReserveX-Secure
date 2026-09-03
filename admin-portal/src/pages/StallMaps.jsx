import React, { useState, useEffect, useMemo } from 'react';
import NavBar from '../components/NavBar';
import { getAllExhibitions, getStallsByExhibition } from '../services/admin.service';
import './StallMaps.css';

const StallMaps = () => {
  const [selectedExhibition, setSelectedExhibition] = useState('');
  const [exhibitions, setExhibitions] = useState([]);
  const [stalls, setStalls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hoveredStall, setHoveredStall] = useState(null);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sizeFilter, setSizeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

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
      console.error('Failed to load exhibitions:', error);
    }
  };

  const fetchStalls = async () => {
    try {
      setLoading(true);
      const data = await getStallsByExhibition(selectedExhibition);
      setStalls(data);
    } catch (error) {
      console.error('Failed to load stalls:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter stalls based on all filters
  const filteredStalls = useMemo(() => {
    return stalls.filter(stall => {
      // Status filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'available' && (stall.reservedBy || !stall.isActive)) return false;
        if (statusFilter === 'reserved' && !stall.reservedBy) return false;
        if (statusFilter === 'inactive' && stall.isActive) return false;
      }

      // Type filter
      if (typeFilter !== 'all' && stall.type?.toLowerCase() !== typeFilter.toLowerCase()) {
        return false;
      }

      // Size filter
      if (sizeFilter !== 'all' && stall.size?.toLowerCase() !== sizeFilter.toLowerCase()) {
        return false;
      }

      // Search query
      if (searchQuery && !stall.name?.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      return true;
    });
  }, [stalls, statusFilter, typeFilter, sizeFilter, searchQuery]);

  // Get unique types and sizes from all stalls
  const uniqueTypes = useMemo(() => {
    return [...new Set(stalls.map(s => s.type).filter(Boolean))];
  }, [stalls]);

  const uniqueSizes = useMemo(() => {
    return [...new Set(stalls.map(s => s.size).filter(Boolean))];
  }, [stalls]);

  // Get statistics
  const stats = useMemo(() => {
    const total = stalls.length;
    const available = stalls.filter(s => !s.reservedBy && s.isActive).length;
    const reserved = stalls.filter(s => s.reservedBy).length;
    const inactive = stalls.filter(s => !s.isActive).length;
    return { total, available, reserved, inactive };
  }, [stalls]);

  const clearFilters = () => {
    setStatusFilter('all');
    setTypeFilter('all');
    setSizeFilter('all');
    setSearchQuery('');
  };

  const getMaxGridDimensions = () => {
    if (filteredStalls.length === 0) return { maxRow: 3, maxCol: 3 };
    const maxRow = Math.max(...filteredStalls.map(s => s.gridRow), 3);
    const maxCol = Math.max(...filteredStalls.map(s => s.gridCol), 3);
    return { maxRow, maxCol };
  };

  const getStallAtPosition = (row, col) => {
    return filteredStalls.find(s => s.gridRow === row && s.gridCol === col);
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
        {/* Combined Header: Exhibition Selector + Statistics */}
        <div className="top-bar">
          <div className="exhibition-selector-card">
            <label className="selector-label">Exhibition</label>
            <select
              value={selectedExhibition}
              onChange={(e) => setSelectedExhibition(e.target.value)}
              className="exhibition-select"
            >
              {exhibitions.map(exhibition => (
                <option key={exhibition.id} value={exhibition.id}>
                  {exhibition.name} • {exhibition.venueName}
                </option>
              ))}
            </select>
          </div>

          <div className="stats-row">
            <div className="stat-card stat-total">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <div className="stat-value">{stats.total}</div>
                <div className="stat-label">Total Stalls</div>
              </div>
            </div>

            <div className="stat-card stat-available">
              <div className="stat-icon">✓</div>
              <div className="stat-content">
                <div className="stat-value">{stats.available}</div>
                <div className="stat-label">Available</div>
              </div>
            </div>

            <div className="stat-card stat-reserved">
              <div className="stat-icon">🔒</div>
              <div className="stat-content">
                <div className="stat-value">{stats.reserved}</div>
                <div className="stat-label">Reserved</div>
              </div>
            </div>

            <div className="stat-card stat-inactive">
              <div className="stat-icon">⏸</div>
              <div className="stat-content">
                <div className="stat-value">{stats.inactive}</div>
                <div className="stat-label">Inactive</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Map Section */}
        <div className="content-layout">
          {/* Filters Sidebar */}
          <aside className="filters-sidebar">
            <div className="filters-card">
              <div className="filters-header">
                <h2 className="filters-title">Filters</h2>
                <button onClick={clearFilters} className="btn-clear-filters">
                  Clear All
                </button>
              </div>

              {/* Search */}
              <div className="filter-section">
                <label className="filter-label">Search Stall</label>
                <div className="search-input-wrapper">
                  <span className="search-icon">🔍</span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by stall name..."
                    className="search-input"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="clear-search-btn"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>

              {/* Status Filter */}
              <div className="filter-section">
                <label className="filter-label">Status</label>
                <div className="filter-options">
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`filter-chip ${statusFilter === 'all' ? 'active' : ''}`}
                  >
                    All ({stalls.length})
                  </button>
                  <button
                    onClick={() => setStatusFilter('available')}
                    className={`filter-chip chip-available ${statusFilter === 'available' ? 'active' : ''}`}
                  >
                    Available ({stats.available})
                  </button>
                  <button
                    onClick={() => setStatusFilter('reserved')}
                    className={`filter-chip chip-reserved ${statusFilter === 'reserved' ? 'active' : ''}`}
                  >
                    Reserved ({stats.reserved})
                  </button>
                  <button
                    onClick={() => setStatusFilter('inactive')}
                    className={`filter-chip chip-inactive ${statusFilter === 'inactive' ? 'active' : ''}`}
                  >
                    Inactive ({stats.inactive})
                  </button>
                </div>
              </div>

              {/* Type Filter */}
              <div className="filter-section">
                <label className="filter-label">Stall Type</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Types</option>
                  {uniqueTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Size Filter */}
              <div className="filter-section">
                <label className="filter-label">Stall Size</label>
                <select
                  value={sizeFilter}
                  onChange={(e) => setSizeFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Sizes</option>
                  {uniqueSizes.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>

              {/* Active Filters Display */}
              {(statusFilter !== 'all' || typeFilter !== 'all' || sizeFilter !== 'all' || searchQuery) && (
                <div className="active-filters">
                  <div className="active-filters-label">Active Filters:</div>
                  {statusFilter !== 'all' && (
                    <span className="active-filter-tag">
                      Status: {statusFilter}
                      <button onClick={() => setStatusFilter('all')}>×</button>
                    </span>
                  )}
                  {typeFilter !== 'all' && (
                    <span className="active-filter-tag">
                      Type: {typeFilter}
                      <button onClick={() => setTypeFilter('all')}>×</button>
                    </span>
                  )}
                  {sizeFilter !== 'all' && (
                    <span className="active-filter-tag">
                      Size: {sizeFilter}
                      <button onClick={() => setSizeFilter('all')}>×</button>
                    </span>
                  )}
                  {searchQuery && (
                    <span className="active-filter-tag">
                      Search: "{searchQuery}"
                      <button onClick={() => setSearchQuery('')}>×</button>
                    </span>
                  )}
                </div>
              )}

              {/* Results Counter */}
              <div className="results-counter">
                Showing <strong>{filteredStalls.length}</strong> of <strong>{stalls.length}</strong> stalls
              </div>
            </div>
          </aside>

          {/* Map Section */}
          <main className="map-section">
            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading stall map...</p>
              </div>
            ) : stalls.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🗺️</div>
                <h3>No Stalls Available</h3>
                <p>Add stalls to this exhibition to see the map</p>
              </div>
            ) : filteredStalls.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🔍</div>
                <h3>No Stalls Match Your Filters</h3>
                <p>Try adjusting your filters to see more results</p>
                <button onClick={clearFilters} className="btn-clear-inline">
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="map-container">
                {/* Legend */}
                <div className="map-legend">
                  <div className="legend-item">
                    <div className="legend-dot available"></div>
                    <span>Available</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-dot reserved"></div>
                    <span>Reserved</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-dot inactive"></div>
                    <span>Inactive</span>
                  </div>
                </div>

                {/* Grid with Row/Column Labels */}
                <div className="stall-grid-wrapper">
                  <div className="grid-with-labels">
                    {/* Column Headers */}
                    <div className="column-headers">
                      <div className="corner-spacer"></div>
                      {Array.from({ length: getMaxGridDimensions().maxCol }, (_, col) => (
                        <div key={col} className="column-label">
                          Col {col + 1}
                        </div>
                      ))}
                    </div>

                    {/* Rows with Labels */}
                    <div className="rows-container">
                      {Array.from({ length: getMaxGridDimensions().maxRow }, (_, row) => (
                        <div key={row} className="grid-row-with-label">
                          <div className="row-label">
                            Row {String.fromCharCode(65 + row)}
                          </div>
                          <div className="grid-row">
                            {Array.from({ length: getMaxGridDimensions().maxCol }, (_, col) => {
                              const stall = getStallAtPosition(row + 1, col + 1);
                              return (
                                <div
                                  key={`${row}-${col}`}
                                  className={getStallClass(stall)}
                                  onMouseEnter={() => stall && setHoveredStall(stall)}
                                  onMouseLeave={() => setHoveredStall(null)}
                                >
                                  {stall && (
                                    <>
                                      <div className="stall-name">{stall.name}</div>
                                      {stall.reservedBy && (
                                        <div className="stall-reserved-icon">🔒</div>
                                      )}
                                    </>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>

        {/* Hover Tooltip */}
        {hoveredStall && (
          <div className="stall-tooltip">
            <div className="tooltip-header">
              <h4>{hoveredStall.name}</h4>
              <span className={`tooltip-status ${hoveredStall.reservedBy ? 'reserved' : hoveredStall.isActive ? 'available' : 'inactive'}`}>
                {hoveredStall.reservedBy ? 'Reserved' : hoveredStall.isActive ? 'Available' : 'Inactive'}
              </span>
            </div>
            
            <div className="tooltip-details">
              <div className="tooltip-row">
                <span className="tooltip-label">Type:</span>
                <span className="tooltip-value">{hoveredStall.type || 'N/A'}</span>
              </div>
              <div className="tooltip-row">
                <span className="tooltip-label">Size:</span>
                <span className="tooltip-value">{hoveredStall.size || 'N/A'}</span>
              </div>
              <div className="tooltip-row">
                <span className="tooltip-label">Price:</span>
                <span className="tooltip-value">LKR {hoveredStall.price?.toLocaleString() || '0'}</span>
              </div>
              {hoveredStall.reservedBy && (
                <div className="tooltip-row highlight">
                  <span className="tooltip-label">Reserved by:</span>
                  <span className="tooltip-value">{hoveredStall.reservedBy}</span>
                </div>
              )}
            </div>

            {hoveredStall.description && (
              <div className="tooltip-description">
                {hoveredStall.description}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StallMaps;
