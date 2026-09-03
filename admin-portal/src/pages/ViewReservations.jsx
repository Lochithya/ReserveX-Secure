import React, { useEffect, useState, useMemo } from 'react';
import NavBar from '../components/NavBar';
import { 
  getAllReservationsAdmin, 
  getReservationsByExhibition,
  getAllExhibitions,
  updateReservationStatus,
  deleteReservation 
} from '../services/admin.service';
import './ViewReservations.css';

export default function ViewReservations() {
  const [reservations, setReservations] = useState([]);
  const [exhibitions, setExhibitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [selectedExhibition, setSelectedExhibition] = useState('all');
  const [searchVendor, setSearchVendor] = useState('');
  const [searchStall, setSearchStall] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Modal state for status update
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  // Delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reservationToDelete, setReservationToDelete] = useState(null);

  // Success modal
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Add state for expanded cards
  const [expandedCards, setExpandedCards] = useState(new Set());

  const toggleCardExpansion = (reservationId) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(reservationId)) {
      newExpanded.delete(reservationId);
    } else {
      newExpanded.add(reservationId);
    }
    setExpandedCards(newExpanded);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reservationsData, exhibitionsData] = await Promise.all([
        getAllReservationsAdmin(),
        getAllExhibitions()
      ]);
      
      setReservations(reservationsData);
      setExhibitions(exhibitionsData);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleExhibitionChange = async (exhibitionId) => {
    setSelectedExhibition(exhibitionId);
    if (exhibitionId === 'all') {
      fetchData();
    } else {
      try {
        setLoading(true);
        const data = await getReservationsByExhibition(exhibitionId);
        setReservations(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching reservations:', err);
        setError(err.response?.data?.message || 'Failed to load reservations');
      } finally {
        setLoading(false);
      }
    }
  };

  const filteredReservations = useMemo(() => {
    return reservations.filter(reservation => {
      // Vendor name filter
      if (searchVendor && !reservation.vendorName?.toLowerCase().includes(searchVendor.toLowerCase())) {
        return false;
      }

      // Stall name filter
      if (searchStall) {
        const stallNames = reservation.stallNames?.join(' ').toLowerCase() || '';
        if (!stallNames.includes(searchStall.toLowerCase())) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== 'all' && reservation.status !== statusFilter) {
        return false;
      }

      // Date range filter
      if (fromDate || toDate) {
        const reservationDate = new Date(reservation.reservationDate);
        if (fromDate && reservationDate < new Date(fromDate)) {
          return false;
        }
        if (toDate && reservationDate > new Date(toDate + 'T23:59:59')) {
          return false;
        }
      }

      return true;
    });
  }, [reservations, searchVendor, searchStall, statusFilter, fromDate, toDate]);

  const handleStatusUpdate = (reservation) => {
    setSelectedReservation(reservation);
    setNewStatus(reservation.status);
    setShowStatusModal(true);
  };

  const confirmStatusUpdate = async () => {
    try {
      await updateReservationStatus(selectedReservation.id, newStatus);
      setShowStatusModal(false);
      setSelectedReservation(null);
      
      // Refresh data
      if (selectedExhibition === 'all') {
        fetchData();
      } else {
        handleExhibitionChange(selectedExhibition);
      }
      
      setSuccessMessage(`Reservation #${selectedReservation.id} status updated to ${newStatus}`);
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Error updating status:', err);
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDeleteReservation = (reservation) => {
    setReservationToDelete(reservation);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteReservation(reservationToDelete.id);
      setShowDeleteModal(false);
      
      // Refresh data
      if (selectedExhibition === 'all') {
        fetchData();
      } else {
        handleExhibitionChange(selectedExhibition);
      }
      
      setSuccessMessage(`Reservation #${reservationToDelete.id} deleted successfully. Reserved stalls are now available.`);
      setReservationToDelete(null);
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Error deleting reservation:', err);
      alert(err.response?.data?.message || 'Failed to delete reservation');
      setShowDeleteModal(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    setSuccessMessage('');
    // Auto reload page after short delay to ensure backend completes
    setTimeout(() => {
      window.location.reload();
    }, 500); // 0.5 second delay - fast but safe
  };

  const clearFilters = () => {
    setSearchVendor('');
    setSearchStall('');
    setStatusFilter('all');
    setFromDate('');
    setToDate('');
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'APPROVED':
        return { cls: 'status-badge status-approved', icon: '✓', label: 'Approved' };
      case 'PENDING':
        return { cls: 'status-badge status-pending', icon: '⏳', label: 'Pending' };
      case 'REJECTED':
        return { cls: 'status-badge status-rejected', icon: '✕', label: 'Rejected' };
      default:
        return { cls: 'status-badge', icon: '•', label: status };
    }
  };

  return (
    <div className="view-reservations-page">
      <NavBar />
      
      {/* Filters Section */}
      <div className="reservations-container">
        <div className="reservations-filters">
          <h2 className="filters-heading">Filter Reservations</h2>
          
          <div className="filter-row">
            <div className="filter-group">
              <label>Exhibition</label>
              <select
                value={selectedExhibition}
                onChange={(e) => handleExhibitionChange(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Exhibitions</option>
                {exhibitions.map(ex => (
                  <option key={ex.id} value={ex.id}>
                    {ex.name} ({ex.venueName})
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Vendor Name</label>
              <input
                type="text"
                value={searchVendor}
                onChange={(e) => setSearchVendor(e.target.value)}
                placeholder="Search vendor..."
                className="filter-input"
              />
            </div>

            <div className="filter-group">
              <label>Stall Name</label>
              <input
                type="text"
                value={searchStall}
                onChange={(e) => setSearchStall(e.target.value)}
                placeholder="Search stall..."
                className="filter-input"
              />
            </div>
          </div>

          <div className="filter-row filter-row-bottom">
            <div className="filter-group">
              <label>Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            <div className="filter-group filter-date">
              <label>From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="filter-input"
              />
            </div>

            <div className="filter-group filter-date">
              <label>To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="filter-input"
              />
            </div>

            <div className="filter-actions">
            <button onClick={clearFilters} className="btn-clear-filters">
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Reservations Cards */}
      <div className="reservations-content">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading reservations...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>{error}</p>
            <button onClick={fetchData} className="btn-retry">Retry</button>
          </div>
        ) : filteredReservations.length === 0 ? (
          <div className="empty-state">
            <p>No reservations found</p>
          </div>
        ) : (
          <div className="reservations-grid">
            {filteredReservations.map(reservation => {
              const isExpanded = expandedCards.has(reservation.id);
              const statusConfig = getStatusConfig(reservation.status);
              
              return (
                <div key={reservation.id} className={`reservation-card ${reservation.status?.toLowerCase()}`}>
                  {/* Card Header */}
                  <div className="card-header">
                    <div className="card-header-left">
                      <div className="reservation-id-badge">
                        <span className="id-hash">#</span>
                        <span className="id-num">{reservation.id}</span>
                      </div>
                      <div className="vendor-info">
                        <span className="vendor-name-main">{reservation.vendorName}</span>
                        <span className="vendor-email-sub">{reservation.vendorEmail}</span>
                      </div>
                    </div>
                    <div className="card-header-right">
                      <span className={statusConfig.cls}>
                        <span className="status-icon">{statusConfig.icon}</span>
                        {statusConfig.label}
                      </span>
                    </div>
                  </div>

                  {/* Card Body - Key Details */}
                  <div className="card-body">
                    <div className="card-meta-grid">
                      <div className="meta-block">
                        <span className="meta-label">Exhibition</span>
                        <span className="meta-value">{reservation.exhibitionName}</span>
                        <span className="meta-sub">{reservation.venueName}</span>
                      </div>

                      <div className="meta-block">
                        <span className="meta-label">Stalls Reserved</span>
                        <div className="stall-tags-inline">
                          {reservation.stallNames?.map((name, i) => (
                            <span key={i} className="stall-pill">{name}</span>
                          )) || <span className="meta-value">N/A</span>}
                        </div>
                      </div>

                      <div className="meta-block">
                        <span className="meta-label">Reserved On</span>
                        <span className="meta-value">
                          {new Date(reservation.reservationDate).toLocaleDateString('en-US', { 
                            year: 'numeric', month: 'short', day: 'numeric' 
                          })}
                        </span>
                      </div>

                      <div className="meta-block meta-block-price">
                        <span className="meta-label">Total Amount</span>
                        <span className="price-amount">
                          LKR {reservation.totalPrice ? Number(reservation.totalPrice).toLocaleString() : '0'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Stall Details */}
                  {isExpanded && (
                    <div className="card-expanded-details">
                      <div className="expanded-header">
                        <span className="expanded-title">Stall Breakdown</span>
                      </div>
                      <div className="stalls-columns">
                        {reservation.stallDetails && reservation.stallDetails.length > 0 ? (
                          reservation.stallDetails.map((stall, idx) => (
                            <div key={idx} className="stall-column">
                              <div className="stall-column-header">
                                <h4>Stall: {stall.stallName}</h4>
                              </div>
                              
                              <div className="stall-column-content">
                                <div className="stall-info-grid">
                                  <div className="stall-info-item">
                                    <span className="detail-label">Stall Number:</span>
                                    <span className="detail-value">{stall.stallName}</span>
                                  </div>

                                  <div className="stall-info-item">
                                    <span className="detail-label">Stall Type:</span>
                                    <span className="detail-value">{stall.stallType || stall.type || 'N/A'}</span>
                                  </div>

                                  <div className="stall-info-item">
                                    <span className="detail-label">Stall Size:</span>
                                    <span className="detail-value">{stall.stallSize || stall.size || 'N/A'}</span>
                                  </div>

                                  <div className="stall-info-item">
                                    <span className="detail-label">Stall Price:</span>
                                    <span className="detail-value-price">LKR {Number(stall.price).toLocaleString()}</span>
                                  </div>
                                </div>

                                <div className="detail-row">
                                  <span className="detail-label">Business Category:</span>
                                  <span className="detail-value">{stall.businessCategory || 'N/A'}</span>
                                </div>
                                
                                {/* Per-stall genres from stallDetails */}
                                {stall.genres && stall.genres.length > 0 && (
                                  <div className="detail-row">
                                    <span className="detail-label">Genres:</span>
                                    <div className="detail-tags">
                                      {stall.genres.map((genre, gIdx) => (
                                        <span key={gIdx} className="tag-genre">{genre}</span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                <div className="detail-row">
                                  <span className="detail-label">Vendor Email:</span>
                                  <span className="detail-value">{reservation.vendorEmail}</span>
                                </div>
                                
                                <div className="detail-row">
                                  <span className="detail-label">Venue:</span>
                                  <span className="detail-value">{reservation.venueName}</span>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          // Fallback if stallDetails not available
                          reservation.stallNames?.map((stallName, idx) => (
                            <div key={idx} className="stall-column">
                              <div className="stall-column-header">
                                <h4>Stall: {stallName}</h4>
                              </div>
                              
                              <div className="stall-column-content">
                                <div className="detail-row">
                                  <span className="detail-label">Stall Number:</span>
                                  <span className="detail-value">{stallName}</span>
                                </div>

                                {reservation.genres && reservation.genres.length > 0 && (
                                  <div className="detail-row">
                                    <span className="detail-label">Genres:</span>
                                    <div className="detail-tags">
                                      {reservation.genres.map((genre, gIdx) => (
                                        <span key={gIdx} className="tag-genre">{genre}</span>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {reservation.businessCategories && reservation.businessCategories.length > 0 && (
                                  <div className="detail-row">
                                    <span className="detail-label">Categories:</span>
                                    <div className="detail-tags">
                                      {reservation.businessCategories.map((cat, cIdx) => (
                                        <span key={cIdx} className="tag-category">{cat}</span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                <div className="detail-row">
                                  <span className="detail-label">Vendor Email:</span>
                                  <span className="detail-value">{reservation.vendorEmail}</span>
                                </div>
                                
                                <div className="detail-row">
                                  <span className="detail-label">Venue:</span>
                                  <span className="detail-value">{reservation.venueName}</span>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Special requirements if any */}
                      {reservation.specialRequirements && (
                        <div className="special-requirements">
                          <span className="detail-label">Special Requirements</span>
                          <p className="requirements-text">{reservation.specialRequirements}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Card Footer Actions */}
                  <div className="card-footer-actions">
                    <button
                      onClick={() => toggleCardExpansion(reservation.id)}
                      className={`btn-show-details ${isExpanded ? 'expanded' : ''}`}
                    >
                      {isExpanded ? 'Hide Details' : 'Show Details'}
                    </button>
                    
                    <div className="card-action-buttons">
                      <button
                        onClick={() => handleStatusUpdate(reservation)}
                        className="btn-action btn-update"
                        title="Update reservation status"
                      >
                        Update Status
                      </button>
                      <button
                        onClick={() => handleDeleteReservation(reservation)}
                        className="btn-action btn-delete"
                        title="Delete this reservation"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="reservations-summary">
          <p>Showing {filteredReservations.length} of {reservations.length} reservations</p>
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="modal-overlay" onClick={() => setShowStatusModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Update Reservation Status</h2>
              <button className="modal-close" onClick={() => setShowStatusModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Reservation ID: #{selectedReservation?.id}</label>
                <p className="info-text">Vendor: {selectedReservation?.vendorName}</p>
              </div>
              <div className="form-group">
                <label>New Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="status-select"
                >
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowStatusModal(false)} className="btn-cancel">
                Cancel
              </button>
              <button onClick={confirmStatusUpdate} className="btn-confirm">
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">⚠️ Confirm Deletion</h2>
            <p className="modal-message">
              Are you sure you want to delete reservation <strong>#{reservationToDelete?.id}</strong>?
            </p>
            <p className="modal-info">
              Vendor: <strong>{reservationToDelete?.vendorName}</strong>
            </p>
            <p className="modal-warning">
              This will free up the reserved stalls and cannot be undone.
            </p>
            <div className="modal-actions">
              <button onClick={confirmDelete} className="btn-confirm-delete">
                Yes, Delete
              </button>
              <button
                onClick={() => { setShowDeleteModal(false); setReservationToDelete(null); }}
                className="btn-cancel-modal"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-content success-modal">
            <button 
              className="modal-close-btn" 
              onClick={handleSuccessClose}
              aria-label="Close"
            >
              ×
            </button>
            <div className="success-icon">✓</div>
            <h2 className="modal-title">Success!</h2>
            <p className="modal-message">{successMessage}</p>
            <div className="modal-actions">
              <button onClick={handleSuccessClose} className="btn-primary">
                OK
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
