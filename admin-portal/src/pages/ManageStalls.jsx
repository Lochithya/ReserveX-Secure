import React, { useState, useEffect } from 'react';
import NavBar from '../components/NavBar';
import {
  getAllExhibitions,
  getStallsByExhibition,
  createStall,
  updateStall,
  deleteStall
} from '../services/admin.service';
import './ManageStalls.css';

const ManageStalls = () => {
  const [selectedExhibition, setSelectedExhibition] = useState('');
  const [exhibitions, setExhibitions] = useState([]);
  const [stalls, setStalls] = useState([]);
  const [activeTab, setActiveTab] = useState('manage');
  const [loading, setLoading] = useState(false);
  const [editingStall, setEditingStall] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [stallToDelete, setStallToDelete] = useState(null);
  const [formData, setFormData] = useState({
    exhibitionId: '',
    name: '',
    size: 'medium',
    type: 'Standard',
    price: '',
    gridRow: '',
    gridCol: '',
    description: '',
    isActive: true
  });

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
      if (data.length > 0 && !selectedExhibition) {
        setSelectedExhibition(data[0].id.toString());
      }
    } catch (error) {
      toast.error('Failed to load exhibitions');
      console.error(error);
    }
  };

  const fetchStalls = async () => {
    if (!selectedExhibition) return;
    
    try {
      setLoading(true);
      const data = await getStallsByExhibition(selectedExhibition);
      setStalls(data);
    } catch (error) {
      toast.error('Failed to load stalls');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleExhibitionChange = (e) => {
    setSelectedExhibition(e.target.value);
    resetForm();
    setActiveTab('manage');
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const resetForm = () => {
    setFormData({
      exhibitionId: selectedExhibition,
      name: '',
      size: 'medium',
      type: 'Standard',
      price: '',
      gridRow: '',
      gridCol: '',
      description: '',
      isActive: true
    });
    setEditingStall(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedExhibition) {
      toast.error('Please select an exhibition');
      return;
    }

    const submitData = {
      ...formData,
      exhibitionId: parseInt(selectedExhibition),
      price: parseFloat(formData.price),
      gridRow: parseInt(formData.gridRow),
      gridCol: parseInt(formData.gridCol)
    };

    try {
      if (editingStall) {
        await updateStall(editingStall.id, submitData);
        toast.success('Stall updated successfully');
      } else {
        await createStall(submitData);
        toast.success('Stall created successfully');
      }

      await fetchStalls();
      resetForm();
      setActiveTab('manage');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
      console.error(error);
    }
  };

  const handleEdit = (stall) => {
    setEditingStall(stall);
    setFormData({
      exhibitionId: stall.exhibitionId,
      name: stall.name,
      size: stall.size.toLowerCase(),
      type: stall.type,
      price: stall.price.toString(),
      gridRow: stall.gridRow.toString(),
      gridCol: stall.gridCol.toString(),
      description: stall.description || '',
      isActive: stall.isActive
    });
    setActiveTab('add');
  };

  const handleDeleteClick = (stall) => {
    setStallToDelete(stall);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteStall(stallToDelete.id);
      toast.success('Stall deleted successfully');
      await fetchStalls();
      setShowDeleteModal(false);
      setStallToDelete(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete stall');
      console.error(error);
    }
  };

  const getSizeColor = (size) => {
    const colors = {
      small: '#3b82f6',
      medium: '#f59e0b',
      large: '#8b5cf6'
    };
    return colors[size.toLowerCase()] || '#6b7280';
  };

  const selectedExhibitionData = exhibitions.find(
    e => e.id.toString() === selectedExhibition
  );

  return (
    <div className="manage-stalls-page">
      <NavBar />

      <div className="manage-stalls-container">
        <div className="page-header">
          <h1 className="page-title">Stall Management</h1>
          <p className="page-subtitle">Manage stalls for each exhibition</p>
        </div>

        {/* Exhibition Selector */}
        <div className="exhibition-selector-card">
          <label className="selector-label">
            <span className="label-icon">🏛️</span>
            Select Exhibition
          </label>
          <select
            value={selectedExhibition}
            onChange={handleExhibitionChange}
            className="exhibition-select"
          >
            {exhibitions.length === 0 ? (
              <option value="">No exhibitions available</option>
            ) : (
              exhibitions.map(exhibition => (
                <option key={exhibition.id} value={exhibition.id}>
                  {exhibition.name} - {exhibition.venueName}
                </option>
              ))
            )}
          </select>
          {selectedExhibitionData && (
            <div className="exhibition-info">
              <span className="info-item">
                📅 {new Date(selectedExhibitionData.startDate).toLocaleDateString()} - 
                {new Date(selectedExhibitionData.endDate).toLocaleDateString()}
              </span>
              <span className="info-item">
                📊 {selectedExhibitionData.totalStalls} stalls · 
                {selectedExhibitionData.availableStalls} available
              </span>
            </div>
          )}
        </div>

        {selectedExhibition && (
          <>
            <div className="tabs-container">
              <div className="tabs">
                <button
                  className={`tab ${activeTab === 'manage' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('manage'); resetForm(); }}
                >
                  <span className="tab-icon">📋</span>
                  Manage Stalls ({stalls.length})
                </button>
                <button
                  className={`tab ${activeTab === 'add' ? 'active' : ''}`}
                  onClick={() => setActiveTab('add')}
                >
                  <span className="tab-icon">➕</span>
                  {editingStall ? 'Edit Stall' : 'Add Stall'}
                </button>
              </div>
            </div>

            <div className="tab-content">
              {activeTab === 'manage' && (
                <div className="manage-tab">
                  {loading ? (
                    <div className="loading-spinner">Loading stalls...</div>
                  ) : stalls.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">🏪</div>
                      <h3>No Stalls Yet</h3>
                      <p>Add stalls to this exhibition to get started</p>
                      <button onClick={() => setActiveTab('add')} className="btn-primary">
                        Add First Stall
                      </button>
                    </div>
                  ) : (
                    <div className="stalls-grid">
                      {stalls.map(stall => (
                        <div key={stall.id} className="stall-card">
                          <div className="stall-header">
                            <div className="stall-name-wrapper">
                              <h3 className="stall-name">{stall.name}</h3>
                              <span
                                className="size-badge"
                                style={{ background: getSizeColor(stall.size) }}
                              >
                                {stall.size.toUpperCase()}
                              </span>
                            </div>
                            <span className={`status-indicator ${stall.isActive ? 'active' : 'inactive'}`}>
                              {stall.isActive ? '● Active' : '○ Inactive'}
                            </span>
                          </div>

                          <div className="stall-body">
                            <div className="stall-detail">
                              <span className="detail-label">Type:</span>
                              <span className="detail-value">{stall.type}</span>
                            </div>
                            <div className="stall-detail">
                              <span className="detail-label">Price:</span>
                              <span className="detail-value price">
                                LKR {stall.price?.toLocaleString()}
                              </span>
                            </div>
                            <div className="stall-detail">
                              <span className="detail-label">Position:</span>
                              <span className="detail-value">
                                Row {stall.gridRow}, Col {stall.gridCol}
                              </span>
                            </div>
                            {stall.reservedBy && (
                              <div className="stall-detail reserved">
                                <span className="detail-label">Reserved by:</span>
                                <span className="detail-value">{stall.reservedBy}</span>
                              </div>
                            )}
                            {stall.description && (
                              <div className="stall-description">
                                {stall.description}
                              </div>
                            )}
                          </div>

                          <div className="stall-actions">
                            <button
                              onClick={() => handleEdit(stall)}
                              className="btn-edit-stall"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => handleDeleteClick(stall)}
                              className="btn-delete-stall"
                              disabled={stall.reservedBy}
                              title={stall.reservedBy ? 'Cannot delete reserved stall' : 'Delete stall'}
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
                      {editingStall ? 'Edit Stall' : 'Create New Stall'}
                    </h2>

                    <form onSubmit={handleSubmit} className="stall-form">
                      <div className="form-grid">
                        <div className="form-group">
                          <label className="form-label required">Stall Name</label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="form-input"
                            placeholder="e.g., A-01"
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label required">Size</label>
                          <select
                            name="size"
                            value={formData.size}
                            onChange={handleInputChange}
                            className="form-select"
                            required
                          >
                            <option value="small">Small</option>
                            <option value="medium">Medium</option>
                            <option value="large">Large</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label className="form-label required">Type</label>
                          <input
                            type="text"
                            name="type"
                            value={formData.type}
                            onChange={handleInputChange}
                            className="form-input"
                            placeholder="e.g., Standard, Premium, Corner Stall"
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label required">Price (LKR)</label>
                          <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleInputChange}
                            className="form-input"
                            placeholder="e.g., 25000"
                            min="0"
                            step="0.01"
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label required">Grid Row</label>
                          <input
                            type="number"
                            name="gridRow"
                            value={formData.gridRow}
                            onChange={handleInputChange}
                            className="form-input"
                            placeholder="e.g., 1"
                            min="1"
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label required">Grid Column</label>
                          <input
                            type="number"
                            name="gridCol"
                            value={formData.gridCol}
                            onChange={handleInputChange}
                            className="form-input"
                            placeholder="e.g., 1"
                            min="1"
                            required
                          />
                        </div>

                        <div className="form-group full-width">
                          <label className="form-label">Description</label>
                          <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            className="form-textarea"
                            placeholder="Brief description of the stall..."
                            rows="3"
                          />
                        </div>

                        <div className="form-group checkbox-group">
                          <label className="checkbox-label">
                            <input
                              type="checkbox"
                              name="isActive"
                              checked={formData.isActive}
                              onChange={handleInputChange}
                              className="form-checkbox"
                            />
                            <span>Active (available for booking)</span>
                          </label>
                        </div>
                      </div>

                      <div className="form-actions">
                        <button type="submit" className="btn-submit">
                          {editingStall ? '💾 Update Stall' : '✨ Create Stall'}
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
          </>
        )}

        {!selectedExhibition && exhibitions.length === 0 && (
          <div className="no-exhibition-message">
            <div className="message-icon">🏛️</div>
            <h3>No Exhibitions Available</h3>
            <p>Create an exhibition first before adding stalls</p>
            <button
              onClick={() => window.location.href = '/exhibitions'}
              className="btn-primary"
            >
              Create Exhibition
            </button>
          </div>
        )}
      </div>

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">⚠️ Confirm Deletion</h2>
            <p className="modal-message">
              Are you sure you want to delete stall <strong>{stallToDelete?.name}</strong>?
            </p>
            <p className="modal-warning">
              This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button onClick={confirmDelete} className="btn-confirm-delete">
                Yes, Delete
              </button>
              <button
                onClick={() => { setShowDeleteModal(false); setStallToDelete(null); }}
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

export default ManageStalls;
