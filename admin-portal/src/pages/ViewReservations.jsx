import React, { useEffect, useState, useMemo } from 'react';
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
      
      alert('Reservation status updated successfully');
    } catch (err) {
      console.error('Error updating status:', err);
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDeleteReservation = async (reservationId) => {
    if (!window.confirm('Are you sure you want to delete this reservation? This will free up the reserved stalls.')) {
      return;
    }

    try {
      await deleteReservation(reservationId);
      
      // Refresh data
      if (selectedExhibition === 'all') {
        fetchData();
      } else {
        handleExhibitionChange(selectedExhibition);
      }
      
      alert('Reservation deleted successfully');
    } catch (err) {
      console.error('Error deleting reservation:', err);
      alert(err.response?.data?.message || 'Failed to delete reservation');
    }
  };

  const clearFilters = () => {
    setSearchVendor('');
    setSearchStall('');
    setStatusFilter('all');
    setFromDate('');
    setToDate('');
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
    <div className="view-reservations-page">
      <div className="reservations-header">
        <h1>View Reservations</h1>
        <p className="reservations-subtitle">Manage and monitor all vendor reservations</p>
      </div>

      {/* Filters Section */}
      <div className="reservations-filters">
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
        </div>

        <div className="filter-row">
          <div className="filter-group">
            <label>From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
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

      {/* Reservations Table */}
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
          <div className="table-container">
            <table className="reservations-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Vendor</th>
                  <th>Exhibition</th>
                  <th>Stalls</th>
                  <th>Business Categories</th>
                  <th>Date</th>
                  <th>Total Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReservations.map(reservation => (
                  <tr key={reservation.id}>
                    <td>#{reservation.id}</td>
                    <td>
                      <div className="vendor-cell">
                        <div className="vendor-name">{reservation.vendorName}</div>
                        <div className="vendor-email">{reservation.vendorEmail}</div>
                      </div>
                    </td>
                    <td>
                      <div className="exhibition-cell">
                        <div className="exhibition-name">{reservation.exhibitionName}</div>
                        <div className="venue-name">{reservation.venueName}</div>
                      </div>
                    </td>
                    <td>
                      <div className="stalls-list">
                        {reservation.stallNames?.map((stallName, idx) => (
                          <span key={idx} className="stall-tag">{stallName}</span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div className="categories-list">
                        {reservation.businessCategories?.map((cat, idx) => (
                          <span key={idx} className="category-tag">{cat}</span>
                        ))}
                      </div>
                    </td>
                    <td>{new Date(reservation.reservationDate).toLocaleDateString()}</td>
                    <td className="price-cell">${reservation.totalPrice?.toFixed(2)}</td>
                    <td>
                      <span className={getStatusBadgeClass(reservation.status)}>
                        {reservation.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleStatusUpdate(reservation)}
                          className="btn-action btn-update"
                          title="Update Status"
                        >
                          Update
                        </button>
                        <button
                          onClick={() => handleDeleteReservation(reservation.id)}
                          className="btn-action btn-delete"
                          title="Delete Reservation"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
    </div>
  );
}
