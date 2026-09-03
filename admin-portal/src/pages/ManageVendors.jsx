import React, { useEffect, useState, useMemo } from 'react';
import NavBar from '../components/NavBar';
import { getAllVendors, getVendorById, getVendorReservations } from '../services/admin.service';
import './ManageVendors.css';

export default function ManageVendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [reservationFilter, setReservationFilter] = useState('all'); // all, hasReservations, noReservations
  const [sortBy, setSortBy] = useState('name');

  // Vendor details modal
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [vendorReservations, setVendorReservations] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Expanded card state
  const [expandedCards, setExpandedCards] = useState(new Set());

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const data = await getAllVendors();
      setVendors(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching vendors:', err);
      setError(err.response?.data?.message || 'Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  const toggleCardExpansion = (vendorId) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(vendorId)) {
      newExpanded.delete(vendorId);
    } else {
      newExpanded.add(vendorId);
    }
    setExpandedCards(newExpanded);
  };

  const handleViewDetails = async (vendor) => {
    setSelectedVendor(vendor);
    setShowDetailsModal(true);
    setLoadingDetails(true);
    
    try {
      const reservations = await getVendorReservations(vendor.id);
      setVendorReservations(reservations);
    } catch (err) {
      console.error('Error fetching vendor reservations:', err);
      setVendorReservations([]);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Statistics
  const stats = useMemo(() => {
    const total = vendors.length;
    const withReservations = vendors.filter(v => (v.totalReservations || 0) > 0).length;
    const withoutReservations = total - withReservations;
    return { total, withReservations, withoutReservations };
  }, [vendors]);

  // Filtered vendors
  const filteredVendors = useMemo(() => {
    let filtered = vendors.filter(vendor => {
      // Search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = (
          vendor.fullName?.toLowerCase().includes(searchLower) ||
          vendor.email?.toLowerCase().includes(searchLower) ||
          vendor.businessName?.toLowerCase().includes(searchLower) ||
          vendor.phone?.includes(searchQuery)
        );
        if (!matchesSearch) return false;
      }

      // Reservation filter
      if (reservationFilter === 'hasReservations' && (vendor.totalReservations || 0) === 0) {
        return false;
      }
      if (reservationFilter === 'noReservations' && (vendor.totalReservations || 0) > 0) {
        return false;
      }

      return true;
    });

    // Sort vendors
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.fullName || '').localeCompare(b.fullName || '');
        case 'email':
          return (a.email || '').localeCompare(b.email || '');
        case 'business':
          return (a.businessName || '').localeCompare(b.businessName || '');
        case 'reservations-desc':
          return (b.totalReservations || 0) - (a.totalReservations || 0);
        case 'reservations-asc':
          return (a.totalReservations || 0) - (b.totalReservations || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [vendors, searchQuery, reservationFilter, sortBy]);

  const clearFilters = () => {
    setSearchQuery('');
    setReservationFilter('all');
    setSortBy('name');
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'status-badge status-approved';
      case 'PENDING':
        return 'status-badge status-pending';
      case 'REJECTED':
        return 'status-badge status-rejected';
      default:
        return 'status-badge';
    }
  };

  return (
    <div className="manage-vendors-page">
      <NavBar />
      
      <div className="vendors-container">
        {/* Statistics Cards */}
        <div className="stats-grid">
          <div className="stat-card stat-total">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total Vendors</div>
            </div>
          </div>

          <div className="stat-card stat-active">
            <div className="stat-icon">✓</div>
            <div className="stat-content">
              <div className="stat-value">{stats.withReservations}</div>
              <div className="stat-label">With Reservations</div>
            </div>
          </div>

          <div className="stat-card stat-inactive">
            <div className="stat-icon">○</div>
            <div className="stat-content">
              <div className="stat-value">{stats.withoutReservations}</div>
              <div className="stat-label">No Reservations</div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="vendors-filters">
          <h2 className="filters-heading">Filter Vendors</h2>
          
          <div className="filter-row">
            <div className="filter-group">
              <label>Search Vendor</label>
              <div className="search-input-wrapper">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, email, business, phone..."
                  className="filter-input search-input"
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

            <div className="filter-group">
              <label>Reservations</label>
              <select
                value={reservationFilter}
                onChange={(e) => setReservationFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Vendors</option>
                <option value="hasReservations">With Reservations</option>
                <option value="noReservations">No Reservations</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
              >
                <option value="name">Name (A-Z)</option>
                <option value="email">Email (A-Z)</option>
                <option value="business">Business Name (A-Z)</option>
                <option value="reservations-desc">Reservations (High to Low)</option>
                <option value="reservations-asc">Reservations (Low to High)</option>
              </select>
            </div>

            <div className="filter-actions">
              <button onClick={clearFilters} className="btn-clear-filters">
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Vendors Content */}
        <div className="vendors-content">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading vendors...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p>{error}</p>
              <button onClick={fetchVendors} className="btn-retry">Retry</button>
            </div>
          ) : filteredVendors.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👤</div>
              <h3>No Vendors Found</h3>
              <p>Try adjusting your filters</p>
              {(searchQuery || reservationFilter !== 'all') && (
                <button onClick={clearFilters} className="btn-clear-inline">
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="vendors-grid">
                {filteredVendors.map(vendor => {
                  const isExpanded = expandedCards.has(vendor.id);
                  
                  return (
                    <div key={vendor.id} className="vendor-card">
                      {/* Card Header */}
                      <div className="card-header">
                        <div className="card-header-left">
                          <div className="vendor-avatar">
                            {vendor.fullName?.charAt(0).toUpperCase() || 'V'}
                          </div>
                          <div className="vendor-info">
                            <span className="vendor-name-main">{vendor.fullName || 'N/A'}</span>
                            <span className="vendor-email-sub">{vendor.email}</span>
                          </div>
                        </div>
                        <div className="card-header-right">
                          <div className="reservation-badge">
                            <span className="badge-icon">📊</span>
                            <span className="badge-value">{vendor.totalReservations || 0}</span>
                          </div>
                        </div>
                      </div>

                      {/* Card Body - Key Details */}
                      <div className="card-body">
                        <div className="card-meta-grid">
                          {vendor.businessName && (
                            <div className="meta-block">
                              <span className="meta-label">Business Name</span>
                              <span className="meta-value">{vendor.businessName}</span>
                            </div>
                          )}

                          {vendor.phone && (
                            <div className="meta-block">
                              <span className="meta-label">Phone Number</span>
                              <span className="meta-value">{vendor.phone}</span>
                            </div>
                          )}

                          <div className="meta-block">
                            <span className="meta-label">Total Reservations</span>
                            <span className="meta-value-highlight">{vendor.totalReservations || 0} booking(s)</span>
                          </div>

                          {vendor.noOfCurrentBookings !== undefined && (
                            <div className="meta-block">
                              <span className="meta-label">Current Bookings</span>
                              <span className="meta-value">{vendor.noOfCurrentBookings || 0}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Expandable Details Section */}
                      {isExpanded && (
                        <div className="card-expanded-details">
                          <div className="expanded-header">
                            <span className="expanded-title">Additional Information</span>
                          </div>
                          
                          <div className="details-grid">
                            <div className="detail-item">
                              <span className="detail-label">User ID:</span>
                              <span className="detail-value">{vendor.id}</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Email:</span>
                              <span className="detail-value">{vendor.email}</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Full Name:</span>
                              <span className="detail-value">{vendor.fullName || 'N/A'}</span>
                            </div>
                            {vendor.businessName && (
                              <div className="detail-item">
                                <span className="detail-label">Business:</span>
                                <span className="detail-value">{vendor.businessName}</span>
                              </div>
                            )}
                            {vendor.phone && (
                              <div className="detail-item">
                                <span className="detail-label">Contact:</span>
                                <span className="detail-value">{vendor.phone}</span>
                              </div>
                            )}
                            <div className="detail-item">
                              <span className="detail-label">Status:</span>
                              <span className="detail-value">
                                {(vendor.totalReservations || 0) > 0 ? 'Active Vendor' : 'No Bookings'}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Card Footer Actions */}
                      <div className="card-footer-actions">
                        <button
                          onClick={() => toggleCardExpansion(vendor.id)}
                          className={`btn-show-details ${isExpanded ? 'expanded' : ''}`}
                        >
                          {isExpanded ? '▲ Show Less' : '▼ Show Details'}
                        </button>
                        
                        <button
                          onClick={() => handleViewDetails(vendor)}
                          className="btn-action btn-view-reservations"
                        >
                          View Reservations
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="vendors-summary">
                <p>Showing <strong>{filteredVendors.length}</strong> of <strong>{vendors.length}</strong> vendors</p>
              </div>
            </>
          )}
        </div>

        {/* Vendor Details Modal */}
        {showDetailsModal && selectedVendor && (
          <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
            <div className="modal-content vendor-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Reservation History - {selectedVendor.fullName}</h2>
                <button className="modal-close" onClick={() => setShowDetailsModal(false)}>×</button>
              </div>

              <div className="modal-body">
                {loadingDetails ? (
                  <div className="loading-small">
                    <div className="spinner-small"></div>
                    <p>Loading reservations...</p>
                  </div>
                ) : vendorReservations.length === 0 ? (
                  <div className="no-reservations">
                    <div className="empty-icon-small">📋</div>
                    <p>No reservations found for this vendor</p>
                  </div>
                ) : (
                  <div className="reservations-list">
                    {vendorReservations.map(reservation => (
                      <div key={reservation.id} className="reservation-item">
                        <div className="reservation-header">
                          <span className="reservation-id">#{reservation.id}</span>
                          <span className={getStatusBadgeClass(reservation.status)}>
                            {reservation.status}
                          </span>
                        </div>
                        <div className="reservation-details">
                          <div className="reservation-row">
                            <span className="res-label">Exhibition:</span>
                            <span className="res-value">{reservation.exhibitionName}</span>
                          </div>
                          <div className="reservation-row">
                            <span className="res-label">Venue:</span>
                            <span className="res-value">{reservation.venueName}</span>
                          </div>
                          <div className="reservation-row">
                            <span className="res-label">Stalls:</span>
                            <span className="res-value">
                              {reservation.stallNames?.join(', ') || 'N/A'}
                            </span>
                          </div>
                          <div className="reservation-row">
                            <span className="res-label">Date:</span>
                            <span className="res-value">
                              {new Date(reservation.reservationDate).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="reservation-row">
                            <span className="res-label">Total Price:</span>
                            <span className="res-value price-value">
                              LKR {reservation.totalPrice?.toLocaleString() || '0'}
                            </span>
                          </div>
                          {reservation.businessCategories && reservation.businessCategories.length > 0 && (
                            <div className="reservation-row">
                              <span className="res-label">Categories:</span>
                              <div className="categories-inline">
                                {reservation.businessCategories.map((cat, idx) => (
                                  <span key={idx} className="category-tag-small">{cat}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button onClick={() => setShowDetailsModal(false)} className="btn-close-modal">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
