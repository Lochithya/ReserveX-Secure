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
      toast.error('Failed to load data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.venueId || !formData.name || !formData.startDate || !formData.endDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      toast.error('End date must be after start date');
      return;
    }

    try {
      if (editingExhibition) {
        await updateExhibition(editingExhibition.id, formData);
        toast.success('Exhibition updated successfully');
      } else {
        await createExhibition(formData);
        toast.success('Exhibition created successfully');
      }
      
      await fetchData();
      resetForm();
      setActiveTab('manage');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
      console.error(error);
    }
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
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteExhibition(exhibitionToDelete.id);
      toast.success('Exhibition deleted successfully');
      await fetchData();
      setShowDeleteModal(false);
      setExhibitionToDelete(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete exhibition');
      console.error(error);
    }
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

  return (
    <div className="manage-exhibitions-page">
      <NavBar />
      
      <div className="manage-exhibitions-container">
        <div className="page-header">
          <h1 className="page-title">Exhibition Management</h1>
          <p className="page-subtitle">Create and manage exhibitions across multiple venues</p>
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
                        <div>
                          <h3 className="card-title">{exhibition.name}</h3>
                          <p className="card-venue">📍 {exhibition.venueName}</p>
                        </div>
                        <span className={`status-badge ${getStatusBadgeClass(exhibition.status)}`}>
                          {exhibition.status}
                        </span>
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
                          ✏️ Edit
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
                  <div className="form-grid">
                    <div className="form-group full-width">
                      <label className="form-label required">Exhibition Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="e.g., Colombo International Book Fair 2026"
                        required
                      />
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
                        className="form-input"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label required">End Date</label>
                      <input
                        type="date"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleInputChange}
                        className="form-input"
                        required
                      />
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
                    </div>
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn-submit">
                      {editingExhibition ? '💾 Update Exhibition' : '✨ Create Exhibition'}
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
            <p className="modal-warning">
              This action cannot be undone. All stalls associated with this exhibition must be deleted first.
            </p>
            <div className="modal-actions">
              <button onClick={confirmDelete} className="btn-confirm-delete">
                Yes, Delete
              </button>
              <button
                onClick={() => { setShowDeleteModal(false); setExhibitionToDelete(null); }}
                className="btn-cancel-modal"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageExhibitions;
