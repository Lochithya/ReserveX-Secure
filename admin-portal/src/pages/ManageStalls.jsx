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
  const [validationErrors, setValidationErrors] = useState({});
  const [priceRange, setPriceRange] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingSubmitData, setPendingSubmitData] = useState(null);
  const [confirmAction, setConfirmAction] = useState(''); // 'create' or 'update'
  const [formData, setFormData] = useState({
    exhibitionId: '',
    name: '',
    size: 'small',
    type: 'Standard',
    price: '',
    gridRow: '',
    gridCol: '',
    description: '',
    isActive: true
  });

  // Price ranges based on size and type (non-overlapping)
  const PRICE_RANGES = {
    small: {
      'Corner Stall': { min: 15000, max: 19999 },
      'Standard': { min: 20000, max: 24999 },
      'Premium': { min: 25000, max: 29999 }
    },
    medium: {
      'Corner Stall': { min: 30000, max: 34999 },
      'Standard': { min: 35000, max: 39999 },
      'Premium': { min: 40000, max: 44999 }
    },
    large: {
      'Corner Stall': { min: 45000, max: 49999 },
      'Standard': { min: 50000, max: 54999 },
      'Premium': { min: 55000, max: 59999 }
    }
  };

  useEffect(() => {
    fetchExhibitions();
  }, []);

  useEffect(() => {
    if (selectedExhibition) {
      fetchStalls();
    }
  }, [selectedExhibition]);

  useEffect(() => {
    // Update price range when form data changes
    updatePriceRange(formData.size, formData.type);
  }, [formData.size, formData.type]);

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
    if (!selectedExhibition && !formData.exhibitionId) return;
    
    const exhibitionId = formData.exhibitionId || selectedExhibition;
    
    try {
      setLoading(true);
      const data = await getStallsByExhibition(exhibitionId);
      setStalls(data);
    } catch (error) {
      console.error('Failed to load stalls:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExhibitionChange = (e) => {
    setSelectedExhibition(e.target.value);
    resetForm();
    setActiveTab('manage');
  };

  // Validate stall name format: Letter-NN (e.g., A-01, B-23)
  const validateStallName = (name) => {
    const errors = {};
    
    // Check format: single letter, dash, two digits
    const namePattern = /^[A-Z]-\d{2}$/;
    if (!namePattern.test(name)) {
      errors.name = 'Name must be in format: Letter-NN (e.g., A-01, B-12)';
      return errors;
    }
    
    // Check for duplicates (case-insensitive, across all stalls)
    const isDuplicate = stalls.some(stall => {
      // Skip current stall when editing
      if (editingStall && stall.id === editingStall.id) {
        return false;
      }
      return stall.name.toUpperCase() === name.toUpperCase();
    });
    
    if (isDuplicate) {
      errors.name = 'This stall name already exists in this exhibition';
    }
    
    return errors;
  };

  // Validate grid position uniqueness
  const validateGridPosition = (row, col) => {
    const errors = {};
    
    if (!row || !col) return errors;
    
    const isDuplicate = stalls.some(stall => {
      // Skip current stall when editing
      if (editingStall && stall.id === editingStall.id) {
        return false;
      }
      return parseInt(stall.gridRow) === parseInt(row) && parseInt(stall.gridCol) === parseInt(col);
    });
    
    if (isDuplicate) {
      errors.grid = `Position (Row ${row}, Col ${col}) is already occupied`;
    }
    
    return errors;
  };

  // Validate price based on size and type
  const validatePrice = (price, size, type) => {
    const errors = {};
    
    if (!price || !size || !type) return errors;
    
    const range = PRICE_RANGES[size]?.[type];
    if (!range) return errors;
    
    const priceNum = parseFloat(price);
    if (priceNum < range.min || priceNum > range.max) {
      errors.price = `Price must be between LKR ${range.min.toLocaleString()} and LKR ${range.max.toLocaleString()}`;
    }
    
    return errors;
  };

  // Update price range hint when size/type changes
  const updatePriceRange = (size, type) => {
    const range = PRICE_RANGES[size]?.[type];
    if (range) {
      setPriceRange(`(LKR ${range.min.toLocaleString()} - LKR ${range.max.toLocaleString()})`);
    } else {
      setPriceRange('');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Clear error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // Real-time validation for stall name
    if (name === 'name') {
      const uppercaseName = value.toUpperCase();
      setFormData(prev => ({ ...prev, name: uppercaseName }));
      
      if (value.length > 0) {
        const nameErrors = validateStallName(uppercaseName);
        if (Object.keys(nameErrors).length > 0) {
          setValidationErrors(prev => ({ ...prev, ...nameErrors }));
        }
      }
    }

    // Update price range when size or type changes
    if (name === 'size' || name === 'type') {
      const size = name === 'size' ? value : formData.size;
      const type = name === 'type' ? value : formData.type;
      updatePriceRange(size, type);
      
      // Re-validate price if it exists
      if (formData.price) {
        const priceErrors = validatePrice(formData.price, size, type);
        if (Object.keys(priceErrors).length > 0) {
          setValidationErrors(prev => ({ ...prev, ...priceErrors }));
        }
      }
    }

    // Validate price on change
    if (name === 'price') {
      const priceErrors = validatePrice(value, formData.size, formData.type);
      if (Object.keys(priceErrors).length > 0) {
        setValidationErrors(prev => ({ ...prev, ...priceErrors }));
      }
    }

    // Validate grid position when both row and col exist
    if (name === 'gridRow' || name === 'gridCol') {
      const row = name === 'gridRow' ? value : formData.gridRow;
      const col = name === 'gridCol' ? value : formData.gridCol;
      
      if (row && col) {
        const gridErrors = validateGridPosition(row, col);
        if (Object.keys(gridErrors).length > 0) {
          setValidationErrors(prev => ({ ...prev, ...gridErrors }));
        } else {
          setValidationErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.grid;
            return newErrors;
          });
        }
      }
    }
  };

  // Handle exhibition change in form
  const handleFormExhibitionChange = async (e) => {
    const exhibitionId = e.target.value;
    setFormData(prev => ({ ...prev, exhibitionId }));
    
    // Fetch stalls for the selected exhibition to validate against
    if (exhibitionId) {
      try {
        const data = await getStallsByExhibition(exhibitionId);
        setStalls(data);
      } catch (error) {
        console.error('Failed to load stalls:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      exhibitionId: selectedExhibition || '',
      name: '',
      size: 'small',
      type: 'Standard',
      price: '',
      gridRow: '',
      gridCol: '',
      description: '',
      isActive: true
    });
    setEditingStall(null);
    setValidationErrors({});
    setPriceRange('(LKR 20,000 - LKR 24,999)'); // Default for small/Standard
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Final validation before submit
    const nameErrors = validateStallName(formData.name);
    const gridErrors = validateGridPosition(formData.gridRow, formData.gridCol);
    const priceErrors = validatePrice(formData.price, formData.size, formData.type);
    
    const allErrors = { ...nameErrors, ...gridErrors, ...priceErrors };
    
    if (Object.keys(allErrors).length > 0) {
      setValidationErrors(allErrors);
      return;
    }

    if (!formData.exhibitionId) {
      setValidationErrors(prev => ({ ...prev, exhibitionId: 'Please select an exhibition' }));
      return;
    }

    const submitData = {
      ...formData,
      exhibitionId: parseInt(formData.exhibitionId),
      price: parseFloat(formData.price),
      gridRow: parseInt(formData.gridRow),
      gridCol: parseInt(formData.gridCol)
    };

    // Store data and show confirmation modal
    setPendingSubmitData(submitData);
    setConfirmAction(editingStall ? 'update' : 'create');
    setShowConfirmModal(true);
  };

  const confirmSubmit = async () => {
    try {
      if (confirmAction === 'update') {
        await updateStall(editingStall.id, pendingSubmitData);
        setSuccessMessage(`Stall "${formData.name}" has been successfully updated!`);
      } else {
        await createStall(pendingSubmitData);
        setSuccessMessage(`Stall "${formData.name}" has been successfully created!`);
      }

      await fetchStalls();
      resetForm();
      setShowConfirmModal(false);
      setPendingSubmitData(null);
      setShowSuccessModal(true);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Operation failed';
      setValidationErrors(prev => ({ ...prev, form: errorMsg }));
      setShowConfirmModal(false);
      console.error(error);
    }
  };

  const cancelSubmit = () => {
    setShowConfirmModal(false);
    setPendingSubmitData(null);
    setConfirmAction('');
  };

  const handleEdit = async (stall) => {
    setEditingStall(stall);
    setFormData({
      exhibitionId: stall.exhibitionId.toString(),
      name: stall.name,
      size: stall.size.toLowerCase(),
      type: stall.type,
      price: stall.price.toString(),
      gridRow: stall.gridRow.toString(),
      gridCol: stall.gridCol.toString(),
      description: stall.description || '',
      isActive: stall.isActive
    });
    
    // Update price range for editing
    updatePriceRange(stall.size.toLowerCase(), stall.type);
    
    // Fetch stalls for the exhibition to validate against
    try {
      const data = await getStallsByExhibition(stall.exhibitionId);
      setStalls(data);
    } catch (error) {
      console.error('Failed to load stalls:', error);
    }
    
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

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    setActiveTab('manage');
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
        <div className="page-shell">
          <div className="page-topbar">
            <div className="page-intro">
              <span className="eyebrow">Stall Operations</span>
              <h1 className="page-title">Stall Management</h1>
            </div>

            {selectedExhibition && (
              <button
                type="button"
                className="primary-action"
                onClick={() => setActiveTab('add')}
              >
                <span className="action-icon">＋</span>
                Add Stall
              </button>
            )}
          </div>
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
                              Edit
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
                      {validationErrors.form && (
                        <div className="form-error-message">
                          ⚠️ {validationErrors.form}
                        </div>
                      )}

                      <div className="form-grid">
                        {/* Exhibition Selection - Top Field */}
                        <div className="form-group full-width">
                          <label className="form-label required">Exhibition</label>
                          <select
                            name="exhibitionId"
                            value={formData.exhibitionId}
                            onChange={handleFormExhibitionChange}
                            className={`form-select ${validationErrors.exhibitionId ? 'error' : ''}`}
                            required
                            disabled={editingStall}
                          >
                            <option value="">Select Exhibition</option>
                            {exhibitions.map(exhibition => (
                              <option key={exhibition.id} value={exhibition.id}>
                                {exhibition.name} - {exhibition.venueName}
                              </option>
                            ))}
                          </select>
                          {validationErrors.exhibitionId && (
                            <span className="field-error">{validationErrors.exhibitionId}</span>
                          )}
                          {editingStall && (
                            <span className="field-hint">Exhibition cannot be changed when editing</span>
                          )}
                        </div>

                        {/* Stall Name with validation */}
                        <div className="form-group">
                          <label className="form-label required">Stall Name</label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className={`form-input ${validationErrors.name ? 'error' : ''}`}
                            placeholder="e.g., A-01, B-23"
                            required
                            maxLength="4"
                          />
                          {validationErrors.name && (
                            <span className="field-error">{validationErrors.name}</span>
                          )}
                          <span className="field-hint">Format: Letter-NN (e.g., A-01)</span>
                        </div>

                        {/* Size Dropdown */}
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

                        {/* Type Dropdown */}
                        <div className="form-group">
                          <label className="form-label required">Type</label>
                          <select
                            name="type"
                            value={formData.type}
                            onChange={handleInputChange}
                            className="form-select"
                            required
                          >
                            <option value="Corner Stall">Corner Stall</option>
                            <option value="Standard">Standard</option>
                            <option value="Premium">Premium</option>
                          </select>
                        </div>

                        {/* Price with dynamic range hint */}
                        <div className="form-group">
                          <label className="form-label required">Price (LKR)</label>
                          <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleInputChange}
                            className={`form-input ${validationErrors.price ? 'error' : ''}`}
                            placeholder="Enter price"
                            min="0"
                            step="1"
                            required
                          />
                          {priceRange && (
                            <span className="price-range-hint">
                              <em>{priceRange}</em>
                            </span>
                          )}
                          {validationErrors.price && (
                            <span className="field-error">{validationErrors.price}</span>
                          )}
                        </div>

                        {/* Grid Row */}
                        <div className="form-group">
                          <label className="form-label required">Grid Row</label>
                          <input
                            type="number"
                            name="gridRow"
                            value={formData.gridRow}
                            onChange={handleInputChange}
                            className={`form-input ${validationErrors.grid ? 'error' : ''}`}
                            placeholder="e.g., 1"
                            min="1"
                            required
                          />
                        </div>

                        {/* Grid Column */}
                        <div className="form-group">
                          <label className="form-label required">Grid Column</label>
                          <input
                            type="number"
                            name="gridCol"
                            value={formData.gridCol}
                            onChange={handleInputChange}
                            className={`form-input ${validationErrors.grid ? 'error' : ''}`}
                            placeholder="e.g., 1"
                            min="1"
                            required
                          />
                          {validationErrors.grid && (
                            <span className="field-error full-width-error">{validationErrors.grid}</span>
                          )}
                        </div>

                        {/* Description */}
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

                        {/* Active Checkbox */}
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
                        <button 
                          type="submit" 
                          className="btn-submit"
                          disabled={Object.keys(validationErrors).length > 0}
                        >
                          {editingStall ? 'Update Stall' : 'Create Stall'}
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

      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content confirm-modal">
            <h2 className="modal-title">
              {confirmAction === 'create' ? '✨ Confirm Stall Creation' : '✏️ Confirm Stall Update'}
            </h2>
            <p className="modal-message">
              {confirmAction === 'create' ? (
                <>
                  Are you sure you want to create stall <strong>{formData.name}</strong>?
                </>
              ) : (
                <>
                  Are you sure you want to update stall <strong>{formData.name}</strong>?
                </>
              )}
            </p>
            
            <div className="confirm-details">
              <div className="confirm-detail-row">
                <span className="detail-label">Exhibition:</span>
                <span className="detail-value">
                  {exhibitions.find(e => e.id.toString() === formData.exhibitionId)?.name}
                </span>
              </div>
              <div className="confirm-detail-row">
                <span className="detail-label">Size:</span>
                <span className="detail-value">{formData.size}</span>
              </div>
              <div className="confirm-detail-row">
                <span className="detail-label">Type:</span>
                <span className="detail-value">{formData.type}</span>
              </div>
              <div className="confirm-detail-row">
                <span className="detail-label">Price:</span>
                <span className="detail-value">LKR {parseFloat(formData.price).toLocaleString()}</span>
              </div>
              <div className="confirm-detail-row">
                <span className="detail-label">Position:</span>
                <span className="detail-value">Row {formData.gridRow}, Col {formData.gridCol}</span>
              </div>
            </div>

            <p className="modal-warning">
              {confirmAction === 'create' 
                ? 'This will create a new stall that vendors can book.' 
                : 'This will update the stall details immediately.'}
            </p>
            
            <div className="modal-actions">
              <button onClick={confirmSubmit} className="btn-confirm-action">
                {confirmAction === 'create' ? 'Yes, Create Stall' : 'Yes, Update Stall'}
              </button>
              <button onClick={cancelSubmit} className="btn-cancel-modal">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-content success-modal">
            <button 
              className="modal-close-btn" 
              onClick={handleSuccessModalClose}
              aria-label="Close"
            >
              ×
            </button>
            <div className="success-icon">✓</div>
            <h2 className="modal-title">Success!</h2>
            <p className="modal-message">{successMessage}</p>
            <div className="modal-actions">
              <button onClick={handleSuccessModalClose} className="btn-primary">
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageStalls;
