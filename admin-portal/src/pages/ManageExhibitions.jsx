import React, { useState, useEffect } from 'react';
import NavBar from '../components/NavBar';
import {
  getAllExhibitions,
  getAllVenues,
  createExhibition,
  updateExhibition,
  deleteExhibition
} from '../services/admin.service';
import './ManageExhibitions.css';

const ManageExhibitions = () => {
  const [activeTab, setActiveTab] = useState('manage');
  const [exhibitions, setExhibitions] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingExhibition, setEditingExhibition] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [exhibitionToDelete, setExhibitionToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [deletedExhibitionName, setDeletedExhibitionName] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingSubmitData, setPendingSubmitData] = useState(null);
  const [confirmAction, setConfirmAction] = useState(''); // 'create' or 'update'
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    venueId: '',
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'DRAFT',
    maxStallsPerVendor: 3
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [exhibitionsData, venuesData] = await Promise.all([
        getAllExhibitions(),
        getAllVenues()
      ]);
      setExhibitions(exhibitionsData);
      setVenues(venuesData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Real-time validation for exhibition name
    if (name === 'name') {
      validateExhibitionName(value);
    }
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateExhibitionName = (name) => {
    const errors = {};
    
    // Check minimum length
    if (name.length < 5) {
      errors.name = 'Exhibition name must be at least 5 characters long';
    }
    
    // Check for invalid characters
    if (name && !/^[a-zA-Z0-9\s\-&,.'()]+$/.test(name)) {
      errors.name = 'Exhibition name contains invalid characters';
    }
    
    // Check for duplicate name (case-insensitive)
    if (name.length >= 5) {
      const isDuplicate = exhibitions.some(exhibition => {
        // Skip the current exhibition when editing
        if (editingExhibition && exhibition.id === editingExhibition.id) {
          return false;
        }
        return exhibition.name.toLowerCase() === name.toLowerCase();
      });
      
      if (isDuplicate) {
        errors.name = 'An exhibition with this name already exists';
      }
    }
    
    setValidationErrors(prev => ({ ...prev, ...errors }));
    return Object.keys(errors).length === 0;
  };

  const validateDates = (startDate, endDate) => {
    const errors = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Check if start date is at least 7 days from now
    if (start < sevenDaysFromNow) {
      errors.startDate = 'Start date must be at least 7 days from today';
    }
    
    // Check if end date is after or equal to start date
    if (end < start) {
      errors.endDate = 'End date must be on or after the start date';
    }
    
    setValidationErrors(prev => ({ ...prev, ...errors }));
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      venueId: '',
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      status: 'DRAFT',
      maxStallsPerVendor: 3
    });
    setEditingExhibition(null);
    setValidationErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate exhibition name
    if (!validateExhibitionName(formData.name)) {
      return;
    }
    
    // Validate dates
    if (!validateDates(formData.startDate, formData.endDate)) {
      return;
    }
    
    // Check all required fields
    if (!formData.venueId || !formData.name || !formData.startDate || !formData.endDate) {
      setValidationErrors(prev => ({ ...prev, form: 'Please fill in all required fields' }));
      return;
    }

    // Store data and show confirmation modal
    setPendingSubmitData(formData);
    setConfirmAction(editingExhibition ? 'update' : 'create');
    setShowConfirmModal(true);
  };

  const confirmSubmit = async () => {
    try {
      if (confirmAction === 'update') {
        await updateExhibition(editingExhibition.id, pendingSubmitData);
        setSuccessMessage(`Exhibition "${pendingSubmitData.name}" has been successfully updated!`);
      } else {
        await createExhibition(pendingSubmitData);
        setSuccessMessage(`Exhibition "${pendingSubmitData.name}" has been successfully created!`);
      }
      
      await fetchData();
      resetForm();
      setShowConfirmModal(false);
      setPendingSubmitData(null);
      setDeletedExhibitionName(''); // Clear any old deletion success
      setShowSuccessModal(true);
    } catch (error) {
      setValidationErrors(prev => ({ 
        ...prev, 
        form: error.response?.data?.message || 'Operation failed. Please try again.' 
      }));
      setShowConfirmModal(false);
      console.error(error);
    }
  };

  const cancelSubmit = () => {
    setShowConfirmModal(false);
    setPendingSubmitData(null);
    setConfirmAction('');
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    setSuccessMessage('');
    setDeletedExhibitionName('');
    setActiveTab('manage');
  };

  const handleEdit = (exhibition) => {
    setEditingExhibition(exhibition);
    setFormData({
      venueId: exhibition.venueId,
      name: exhibition.name,
      description: exhibition.description || '',
      startDate: exhibition.startDate,
      endDate: exhibition.endDate,
      status: exhibition.status,
      maxStallsPerVendor: exhibition.maxStallsPerVendor
    });
    setActiveTab('add');
  };

  const handleDeleteClick = (exhibition) => {
    setExhibitionToDelete(exhibition);
    setDeleteError(null); // Clear any previous errors
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      setDeleteError(null);
      const exhibitionName = exhibitionToDelete.name;
      await deleteExhibition(exhibitionToDelete.id);
      
      // Close delete modal
      setShowDeleteModal(false);
      setExhibitionToDelete(null);
      
      // Show success modal with exhibition name
      setDeletedExhibitionName(exhibitionName);
      setShowSuccessModal(true);
    } catch (error) {
      // Extract the error message from the backend response
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Failed to delete exhibition';
      setDeleteError(errorMessage);
      console.error('Delete error:', error);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    setDeletedExhibitionName('');
    setSuccessMessage('');
    // Always reload for real-time updates
    window.location.reload();
  };

  const getStatusBadgeClass = (status) => {
    const classes = {
      DRAFT: 'status-draft',
      PUBLISHED: 'status-published',
      CLOSED: 'status-closed',
      CANCELLED: 'status-cancelled'
    };
    return classes[status] || 'status-draft';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const publishedCount = exhibitions.filter((exhibition) => exhibition.status === 'PUBLISHED').length;
  const draftCount = exhibitions.filter((exhibition) => exhibition.status === 'DRAFT').length;
  const totalStalls = exhibitions.reduce((sum, exhibition) => sum + (exhibition.totalStalls || 0), 0);

  return (
    <div className="manage-exhibitions-page">
      <NavBar />

      <div className="manage-exhibitions-container">
        <div className="page-shell">
          <div className="page-topbar">
            <div className="page-intro">
              <span className="eyebrow">Operations overview</span>
              <h1 className="page-title">Exhibition Management</h1>
            </div>

            <button
              type="button"
              className="primary-action"
              onClick={() => setActiveTab('add')}
            >
              <span className="action-icon">＋</span>
              Add Exhibition
            </button>
          </div>

          <div className="metrics-strip">
            <div className="metric-box">
              <span className="metric-value">{exhibitions.length}</span>
              <span className="metric-label">Total</span>
            </div>
            <div className="metric-box metric-box-blue">
              <span className="metric-value">{publishedCount}</span>
              <span className="metric-label">Published</span>
            </div>
            <div className="metric-box metric-box-amber">
              <span className="metric-value">{draftCount}</span>
              <span className="metric-label">Drafts</span>
            </div>
            <div className="metric-box metric-box-green">
              <span className="metric-value">{totalStalls}</span>
              <span className="metric-label">Stalls</span>
            </div>
          </div>
        </div>

        <div className="tabs-container">
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'manage' ? 'active' : ''}`}
              onClick={() => { setActiveTab('manage'); resetForm(); }}
            >
              <span className="tab-icon">📋</span>
              Manage Exhibitions
            </button>
            <button
              className={`tab ${activeTab === 'add' ? 'active' : ''}`}
              onClick={() => setActiveTab('add')}
            >
              <span className="tab-icon">➕</span>
              {editingExhibition ? 'Edit Exhibition' : 'Add Exhibition'}
            </button>
          </div>
        </div>

        <div className="tab-content">
          {activeTab === 'manage' && (
            <div className="manage-tab">
              {loading ? (
                <div className="loading-spinner">Loading exhibitions...</div>
              ) : exhibitions.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🏛️</div>
                  <h3>No Exhibitions Yet</h3>
                  <p>Create your first exhibition to get started</p>
                  <button onClick={() => setActiveTab('add')} className="btn-primary">
                    Create Exhibition
                  </button>
                </div>
              ) : (
                <div className="exhibitions-grid">
                  {exhibitions.map(exhibition => (
                    <div key={exhibition.id} className="exhibition-card">
                      <div className="card-header">
                        <div className="card-header-top">
                          <div>
                            <h3 className="card-title">{exhibition.name}</h3>
                            <p className="card-venue">📍 {exhibition.venueName}</p>
                          </div>
                          <span className={`status-badge ${getStatusBadgeClass(exhibition.status)}`}>
                            {exhibition.status}
                          </span>
                        </div>
                      </div>
                      
                      <div className="card-body">
                        {exhibition.description && (
                          <p className="card-description">{exhibition.description}</p>
                        )}
                        
                        <div className="card-dates">
                          <div className="date-item">
                            <span className="date-label">Start:</span>
                            <span className="date-value">{formatDate(exhibition.startDate)}</span>
                          </div>
                          <div className="date-item">
                            <span className="date-label">End:</span>
                            <span className="date-value">{formatDate(exhibition.endDate)}</span>
                          </div>
                        </div>

                        <div className="card-stats">
                          <div className="stat-item">
                            <span className="stat-value">{exhibition.totalStalls}</span>
                            <span className="stat-label">Total Stalls</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-value">{exhibition.reservedStalls}</span>
                            <span className="stat-label">Reserved</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-value">{exhibition.availableStalls}</span>
                            <span className="stat-label">Available</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-value">{exhibition.maxStallsPerVendor}</span>
                            <span className="stat-label">Max/Vendor</span>
                          </div>
                        </div>
                      </div>

                      <div className="card-actions">
                        <button
                          onClick={() => handleEdit(exhibition)}
                          className="btn-edit"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(exhibition)}
                          className="btn-delete"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'add' && (
            <div className="add-tab">
              <div className="form-container">
                <h2 className="form-title">
                  {editingExhibition ? 'Edit Exhibition' : 'Create New Exhibition'}
                </h2>
                
                <form onSubmit={handleSubmit} className="exhibition-form">
                  {validationErrors.form && (
                    <div className="form-error-message">
                      ⚠️ {validationErrors.form}
                    </div>
                  )}
                  
                  <div className="form-grid">
                    <div className="form-group full-width">
                      <label className="form-label required">Exhibition Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`form-input ${validationErrors.name ? 'error' : ''}`}
                        placeholder="e.g., Colombo International Book Fair 2026"
                        required
                        minLength="5"
                      />
                      {validationErrors.name && (
                        <span className="field-error">{validationErrors.name}</span>
                      )}
                      <span className="field-hint">
                        {formData.name.length}/5 characters minimum
                      </span>
                    </div>

                    <div className="form-group full-width">
                      <label className="form-label required">Venue</label>
                      <select
                        name="venueId"
                        value={formData.venueId}
                        onChange={handleInputChange}
                        className="form-select"
                        required
                      >
                        <option value="">Select a venue</option>
                        {venues.map(venue => (
                          <option key={venue.id} value={venue.id}>
                            {venue.name} - {venue.city}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group full-width">
                      <label className="form-label">Description</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        className="form-textarea"
                        placeholder="Brief description of the exhibition..."
                        rows="3"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label required">Start Date</label>
                      <input
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleInputChange}
                        className={`form-input ${validationErrors.startDate ? 'error' : ''}`}
                        required
                      />
                      {validationErrors.startDate && (
                        <span className="field-error">{validationErrors.startDate}</span>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label required">End Date</label>
                      <input
                        type="date"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleInputChange}
                        className={`form-input ${validationErrors.endDate ? 'error' : ''}`}
                        required
                      />
                      {validationErrors.endDate && (
                        <span className="field-error">{validationErrors.endDate}</span>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label required">Status</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="form-select"
                        required
                      >
                        <option value="DRAFT">Draft</option>
                        <option value="PUBLISHED">Published</option>
                        <option value="CLOSED">Closed</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label required">Max Stalls Per Vendor</label>
                      <input
                        type="number"
                        name="maxStallsPerVendor"
                        value={formData.maxStallsPerVendor}
                        onChange={handleInputChange}
                        className="form-input"
                        min="1"
                        max="10"
                        required
                      />
                      <span className="field-hint">Between 1-10 stalls</span>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn-submit">
                      {editingExhibition ? 'Update Exhibition' : 'Create Exhibition'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { resetForm(); setActiveTab('manage'); }}
                      className="btn-cancel"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">⚠️ Confirm Deletion</h2>
            <p className="modal-message">
              Are you sure you want to delete <strong>{exhibitionToDelete?.name}</strong>?
            </p>
            
            {exhibitionToDelete?.reservedStalls > 0 && (
              <div className="modal-alert modal-alert-warning">
                <span className="alert-icon">⚠️</span>
                <div>
                  <strong>Warning: This exhibition has {exhibitionToDelete.reservedStalls} reserved stalls</strong>
                  <p>You must first change the status to CANCELLED to notify vendors and clean up reservations.</p>
                </div>
              </div>
            )}
            
            {deleteError && (
              <div className="modal-alert modal-alert-error">
                <span className="alert-icon">❌</span>
                <div>
                  <strong>Cannot Delete Exhibition</strong>
                  <p>{deleteError}</p>
                  <p style={{marginTop: '8px', fontSize: '0.9rem', color: '#666'}}>
                    <strong>Solution:</strong> First change the exhibition status to "CANCELLED" to notify vendors and clean up all reservations automatically.
                  </p>
                </div>
              </div>
            )}
            
            {!exhibitionToDelete?.reservedStalls && !deleteError && (
              <p className="modal-warning">
                This action cannot be undone.
              </p>
            )}
            
            <div className="modal-actions">
              <button 
                onClick={confirmDelete} 
                className="btn-confirm-delete"
                disabled={exhibitionToDelete?.reservedStalls > 0}
              >
                Yes, Delete
              </button>
              <button
                onClick={() => { 
                  setShowDeleteModal(false); 
                  setExhibitionToDelete(null); 
                  setDeleteError(null);
                }}
                className="btn-cancel-modal"
              >
                {deleteError ? 'Close' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content confirm-modal">
            <h2 className="modal-title">
              {confirmAction === 'create' ? '✨ Confirm Exhibition Creation' : '✏️ Confirm Exhibition Update'}
            </h2>
            <p className="modal-message">
              {confirmAction === 'create' ? (
                <>
                  Are you sure you want to create exhibition <strong>{pendingSubmitData?.name}</strong>?
                </>
              ) : (
                <>
                  Are you sure you want to update exhibition <strong>{pendingSubmitData?.name}</strong>?
                </>
              )}
            </p>
            
            <div className="confirm-details">
              <div className="confirm-detail-row">
                <span className="detail-label">Venue:</span>
                <span className="detail-value">
                  {venues.find(v => v.id.toString() === pendingSubmitData?.venueId?.toString())?.name || 'N/A'}
                </span>
              </div>
              <div className="confirm-detail-row">
                <span className="detail-label">Start Date:</span>
                <span className="detail-value">{pendingSubmitData?.startDate}</span>
              </div>
              <div className="confirm-detail-row">
                <span className="detail-label">End Date:</span>
                <span className="detail-value">{pendingSubmitData?.endDate}</span>
              </div>
              <div className="confirm-detail-row">
                <span className="detail-label">Status:</span>
                <span className="detail-value">{pendingSubmitData?.status}</span>
              </div>
              <div className="confirm-detail-row">
                <span className="detail-label">Max Stalls/Vendor:</span>
                <span className="detail-value">{pendingSubmitData?.maxStallsPerVendor}</span>
              </div>
            </div>

            <p className="modal-warning">
              {confirmAction === 'create' 
                ? 'This will create a new exhibition that can be published to vendors.' 
                : 'This will update the exhibition details immediately.'}
            </p>
            
            <div className="modal-actions">
              <button onClick={confirmSubmit} className="btn-confirm-action">
                {confirmAction === 'create' ? 'Yes, Create Exhibition' : 'Yes, Update Exhibition'}
              </button>
              <button onClick={cancelSubmit} className="btn-cancel-modal">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="modal-overlay success-overlay">
          <div className="modal-content success-modal">
            <button 
              className="modal-close-btn" 
              onClick={handleSuccessClose}
              aria-label="Close"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M13 7L7 13M7 7L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
            
            <div className="success-icon">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="28" fill="#10b981" opacity="0.1"/>
                <circle cx="32" cy="32" r="24" fill="#10b981" opacity="0.2"/>
                <path d="M20 32L28 40L44 24" stroke="#10b981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            
            {deletedExhibitionName ? (
              <>
                <h2 className="success-title">Exhibition Deleted Successfully!</h2>
                <p className="success-message">
                  <strong>{deletedExhibitionName}</strong> has been permanently removed from the system.
                </p>
                <div className="success-details">
                  <div className="success-detail-item">
                    <span className="detail-icon">🗑️</span>
                    <span className="detail-text">Exhibition deleted</span>
                  </div>
                  <div className="success-detail-item">
                    <span className="detail-icon">📦</span>
                    <span className="detail-text">All stalls removed</span>
                  </div>
                  <div className="success-detail-item">
                    <span className="detail-icon">✅</span>
                    <span className="detail-text">Database cleaned</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h2 className="success-title">Success!</h2>
                <p className="success-message">{successMessage}</p>
              </>
            )}
            
            <button 
              onClick={handleSuccessClose} 
              className="btn-success-close"
            >
              Close & Refresh
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageExhibitions;
