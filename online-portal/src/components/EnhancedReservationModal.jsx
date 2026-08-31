import React, { useState } from "react";
import {
  ShieldCheckIcon,
  CalendarDaysIcon,
  MapPinIcon,
  InformationCircleIcon,
  XMarkIcon,
  BuildingStorefrontIcon,
  TicketIcon,
  BriefcaseIcon
} from "@heroicons/react/24/outline";

const BUSINESS_CATEGORIES = [
  'Food & Beverage',
  'Clothing',
  'Electronics',
  'Handicrafts',
  'Services',
  'Education',
  'Sports'
];

const EnhancedReservationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  selectedStalls, 
  isLoading,
  exhibition 
}) => {
  // State for business categories (one per stall)
  const [stallBusinessCategories, setStallBusinessCategories] = useState({});
  
  // State for special requirements
  const [specialRequirements, setSpecialRequirements] = useState('');

  if (!isOpen) return null;

  // Calculate Total
  const totalPrice = selectedStalls.reduce((sum, stall) => sum + (stall.price || 0), 0);

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(`${dateStr}T00:00:00`).toLocaleDateString(undefined, { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  // Handle business category change for a stall
  const handleCategoryChange = (stallId, category) => {
    setStallBusinessCategories(prev => ({
      ...prev,
      [stallId]: category
    }));
  };

  // Handle confirm with validation
  const handleConfirmClick = () => {
    // Validate that all stalls have a business category
    const missingCategories = selectedStalls.filter(stall => !stallBusinessCategories[stall.id]);
    
    if (missingCategories.length > 0) {
      alert(`Please select business category for all stalls`);
      return;
    }

    // Pass data to parent component
    onConfirm({ stallBusinessCategories, specialRequirements });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-scale-up max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-5 right-5 z-10 text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full disabled:opacity-50"
          aria-label="Close modal"
        >
          <XMarkIcon className="w-6 h-6 font-bold" />
        </button>

        {/* Header Section with gradient */}
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 px-8 py-8 text-white">
          <div className="flex items-start gap-4">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl shrink-0">
              <ShieldCheckIcon className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-black mb-2">Review Your Reservation</h2>
              <p className="text-blue-100 text-sm leading-relaxed">
                Select business categories and verify details before confirming.
              </p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {/* Exhibition Details Card */}
          {exhibition && (
            <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl border border-slate-200 p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
                  <BuildingStorefrontIcon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-800 mb-1">{exhibition.name}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {exhibition.description || 'Exhibition event'}
                  </p>
                </div>
              </div>

              {/* Event Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 pt-5 border-t border-slate-200/60">
                {/* Dates */}
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shrink-0">
                    <CalendarDaysIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Event Duration</p>
                    <p className="text-sm font-bold text-slate-800">
                      {formatDate(exhibition.startDate)} – {formatDate(exhibition.endDate)}
                    </p>
                  </div>
                </div>

                {/* Venue */}
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shrink-0">
                    <MapPinIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Venue</p>
                    <p className="text-sm font-bold text-slate-800">{exhibition.venue?.name}</p>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {[exhibition.venue?.city, exhibition.venue?.country].filter(Boolean).join(', ')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Selected Stalls Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <TicketIcon className="w-4 h-4" />
                Selected Stalls ({selectedStalls.length})
              </h3>
            </div>

            <div className="space-y-4 mb-5">
              {selectedStalls.map((stall, index) => (
                <div 
                  key={stall.id} 
                  className="bg-white p-5 rounded-xl border-2 border-slate-200 hover:border-blue-300 transition-colors shadow-sm"
                >
                  <div className="flex items-start gap-4 mb-4">
                    {/* Index Badge */}
                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-sm shrink-0">
                      {index + 1}
                    </div>

                    {/* Stall ID Badge */}
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-700 font-black flex items-center justify-center text-lg shrink-0 border-2 border-blue-100">
                      {stall?.name}
                    </div>

                    {/* Stall Details */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <p className="font-bold text-slate-800 text-base">
                          {stall.name}
                        </p>
                        <span className="text-xs font-bold text-slate-400 uppercase">
                          ({stall.size})
                        </span>
                        {stall.type && stall.type !== 'Standard' && (
                          <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                            stall.type === 'Premium' 
                              ? 'bg-purple-100 text-purple-700' 
                              : 'bg-orange-100 text-orange-700'
                          }`}>
                            {stall.type}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed mb-3">
                        {stall?.description || "Standard exhibition space with essential amenities."}
                      </p>

                      {/* Business Category Dropdown */}
                      <div className="flex items-center gap-3">
                        <BriefcaseIcon className="w-5 h-5 text-indigo-600 shrink-0" />
                        <div className="flex-1">
                          <label className="block text-xs font-semibold text-slate-600 mb-1">
                            Business Category <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={stallBusinessCategories[stall.id] || ''}
                            onChange={(e) => handleCategoryChange(stall.id, e.target.value)}
                            className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg text-sm font-medium text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                            disabled={isLoading}
                          >
                            <option value="">Select a category...</option>
                            {BUSINESS_CATEGORIES.map(category => (
                              <option key={category} value={category}>
                                {category}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex flex-col items-end gap-1 ml-4">
                      <span className="font-black text-slate-900 text-lg">
                        Rs. {(stall.price || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Special Requirements */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200 p-5">
              <label className="block text-sm font-bold text-amber-900 mb-2 flex items-center gap-2">
                <InformationCircleIcon className="w-5 h-5" />
                Special Requirements (Optional)
              </label>
              <textarea
                value={specialRequirements}
                onChange={(e) => setSpecialRequirements(e.target.value)}
                placeholder="Any special requirements or notes for this reservation..."
                className="w-full px-4 py-3 border-2 border-amber-300 rounded-lg text-sm text-slate-700 placeholder-amber-500/50 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all resize-none"
                rows="3"
                disabled={isLoading}
              />
              <p className="text-xs text-amber-700 mt-2">
                Specify any special arrangements, setup requirements, or additional notes.
              </p>
            </div>

            {/* Total Section */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white mt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-blue-100 text-sm font-semibold mb-1">Total Investment</p>
                  <p className="text-xs text-blue-200">For {selectedStalls.length} stall{selectedStalls.length !== 1 ? 's' : ''}</p>
                </div>
                <div className="text-right">
                  <span className="font-black text-4xl">
                    Rs. {totalPrice.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="flex gap-3 text-sm text-slate-500 bg-blue-50 p-4 rounded-xl border border-blue-200">
            <InformationCircleIcon className="w-5 h-5 shrink-0 text-blue-600 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-900 mb-1">Important Information</p>
              <p className="text-xs leading-relaxed text-blue-800">
                By confirming this reservation, you agree to the Exhibitor Terms & Conditions. 
                An official invoice with QR code will be sent to your registered email address. 
                Payment must be completed within 48 hours to secure your stalls.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-2">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-4 border-2 border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Modify Selection
            </button>
            <button
              onClick={handleConfirmClick}
              disabled={isLoading}
              className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-200 flex justify-center items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <ShieldCheckIcon className="w-5 h-5" />
                  <span>Confirm & Reserve Stalls</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedReservationModal;
