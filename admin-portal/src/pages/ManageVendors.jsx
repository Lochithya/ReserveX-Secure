import React, { useEffect, useState } from 'react';
import { getAllVendors, getVendorById, getVendorReservations } from '../services/admin.service';
import './ManageVendors.css';

export default function ManageVendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search and filter
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');

  // Vendor details modal
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [vendorReservations, setVendorReservations] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

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

  const filteredAndSortedVendors = () => {
    let filtered = vendors.filter(vendor => {
      const searchLower = searchQuery.toLowerCase();
      return (
        vendor.fullName?.toLowerCase().includes(searchLower) ||
        vendor.email?.toLowerCase().includes(searchLower) ||
        vendor.businessName?.toLowerCase().includes(searchLower)
      );
    });

    // Sort vendors
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.fullName || '').localeCompare(b.fullName || '');
        case 'email':
          return (a.email || '').localeCompare(b.email || '');
        case 'reservations':
          return (b.totalReservations || 0) - (a.totalReservations || 0);
        default:
          return 0;
      }
    });

    return filtered;
  };

  const displayedVendors = filteredAndSortedVendors();

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
      <div className="vendors-header">
        <h1>Manage Vendors</h1>
        <p className="vendors-subtitle">View vendor information and reservation history</p>
      </div>

      {/* Controls Section */}
      <div className="vendors-controls">
        <div className="search-section">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or business..."
            className="search-input"
          />
        </div>

        <div className="sort-section">
          <label>Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="name">Name</option>
            <option value="email">Email</option>
            <option value="reservations">Total Reservations</option>
          </select>
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
        ) : displayedVendors.length === 0 ? (
          <div className="empty-state">
            <p>No vendors found</p>
          </div>
        ) : (
          <>
            <div className="vendors-grid">
              {displayedVendors.map(vendor => (
                <div key={vendor.id} className="vendor-card">
                  <div className="vendor-card-header">
                    <div className="vendor-avatar">
                      {vendor.fullName?.charAt(0).toUpperCase() || 'V'}
                    </div>
                    <div className="vendor-info">
                      <h3>{vendor.fullName || 'N/A'}</h3>
                      <p className="vendor-email">{vendor.email}</p>
                    </div>
                  </div>

                  <div className="vendor-card-body">
                    {vendor.businessName && (
                      <div className="info-row">
                        <span className="info-label">Business:</span>
                        <span className="info-value">{vendor.businessName}</span>
                      </div>
                    )}
                    {vendor.phone && (
                      <div className="info-row">
                        <span className="info-label">Phone:</span>
                        <span className="info-value">{vendor.phone}</span>
                      </div>
                    )}
                    <div className="info-row">
                      <span className="info-label">Total Reservations:</span>
                      <span className="info-value reservation-count">
                        {vendor.totalReservations || 0}
                      </span>
                    </div>
                  </div>

                  <div className="vendor-card-footer">
                    <button
                      onClick={() => handleViewDetails(vendor)}
                      className="btn-view-details"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="vendors-summary">
              <p>Showing {displayedVendors.length} of {vendors.length} vendors</p>
            </div>
          </>
        )}
      </div>

      {/* Vendor Details Modal */}
      {showDetailsModal && selectedVendor && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content vendor-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Vendor Details</h2>
              <button className="modal-close" onClick={() => setShowDetailsModal(false)}>×</button>
            </div>

            <div className="modal-body">
              {/* Vendor Information */}
              <div className="vendor-details-section">
                <h3>Personal Information</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Full Name:</span>
                    <span className="detail-value">{selectedVendor.fullName || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{selectedVendor.email || 'N/A'}</span>
                  </div>
                  {selectedVendor.phone && (
                    <div className="detail-item">
                      <span className="detail-label">Phone:</span>
                      <span className="detail-value">{selectedVendor.phone}</span>
                    </div>
                  )}
                  {selectedVendor.businessName && (
                    <div className="detail-item">
                      <span className="detail-label">Business Name:</span>
                      <span className="detail-value">{selectedVendor.businessName}</span>
                    </div>
                  )}
                  <div className="detail-item">
                    <span className="detail-label">Total Reservations:</span>
                    <span className="detail-value">{selectedVendor.totalReservations || 0}</span>
                  </div>
                </div>
              </div>

              {/* Reservation History */}
              <div className="vendor-details-section">
                <h3>Reservation History</h3>
                {loadingDetails ? (
                  <div className="loading-small">
                    <div className="spinner-small"></div>
                    <p>Loading reservations...</p>
                  </div>
                ) : vendorReservations.length === 0 ? (
                  <p className="no-reservations">No reservations found</p>
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
                              ${reservation.totalPrice?.toFixed(2)}
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
  );
}
