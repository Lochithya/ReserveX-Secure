import React, { useState, useEffect } from "react";
import {
  XMarkIcon,
  TagIcon,
  BriefcaseIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";

// Business Categories and their corresponding genre options
const BUSINESS_CATEGORY_GENRES = {
  'Food & Beverage': [
    'Fast Food', 'Fine Dining', 'Beverages', 'Desserts', 'Bakery',
    'Organic Food', 'Vegan', 'Street Food', 'International Cuisine', 'Local Cuisine'
  ],
  'Clothing': [
    'Men\'s Wear', 'Women\'s Wear', 'Kids Wear', 'Traditional Wear', 'Western Wear',
    'Sportswear', 'Accessories', 'Footwear', 'Designer Wear', 'Casual Wear'
  ],
  'Electronics': [
    'Mobile Devices', 'Computers', 'Home Appliances', 'Audio Systems', 'Cameras',
    'Gaming', 'Smart Home', 'Wearables', 'Accessories', 'Components'
  ],
  'Handicrafts': [
    'Pottery', 'Woodwork', 'Textiles', 'Jewelry', 'Paintings',
    'Sculptures', 'Home Decor', 'Traditional Crafts', 'Modern Art', 'Handmade Gifts'
  ],
  'Services': [
    'Consulting', 'Financial Services', 'Legal Services', 'IT Services', 'Marketing',
    'Education', 'Healthcare', 'Travel', 'Event Planning', 'Business Solutions'
  ],
  'Education': [
    'Books', 'E-Learning', 'Training', 'Courses', 'Workshops',
    'Tutoring', 'Study Materials', 'Career Counseling', 'Skill Development', 'Online Education'
  ],
  'Sports': [
    'Equipment', 'Apparel', 'Fitness', 'Outdoor Sports', 'Indoor Sports',
    'Yoga', 'Gym', 'Accessories', 'Nutrition', 'Sports Gear'
  ]
};

const BUSINESS_CATEGORIES = Object.keys(BUSINESS_CATEGORY_GENRES);

const EditStallModal = ({ isOpen, onClose, onSave, stall, reservationId, isLoading }) => {
  const [businessCategory, setBusinessCategory] = useState(stall?.businessCategory || 'General');
  const [selectedGenres, setSelectedGenres] = useState(stall?.genres || []);
  const [availableGenres, setAvailableGenres] = useState([]);

  useEffect(() => {
    if (stall) {
      setBusinessCategory(stall.businessCategory || 'General');
      setSelectedGenres(stall.genres || []);
    }
  }, [stall]);

  useEffect(() => {
    // Update available genres when business category changes
    setAvailableGenres(BUSINESS_CATEGORY_GENRES[businessCategory] || []);
    // Clear genres if category changed and genres don't match
    if (businessCategory !== stall?.businessCategory) {
      setSelectedGenres([]);
    }
  }, [businessCategory, stall?.businessCategory]);

  if (!isOpen || !stall) return null;

  const handleGenreToggle = (genre) => {
    setSelectedGenres(prev =>
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  const handleSave = () => {
    onSave({
      stallId: stall.id,
      reservationId,
      businessCategory,
      genres: selectedGenres
    });
  };

  const hasChanges = 
    businessCategory !== stall.businessCategory || 
    JSON.stringify(selectedGenres.sort()) !== JSON.stringify((stall.genres || []).sort());

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-5 right-5 z-10 text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full disabled:opacity-50"
          aria-label="Close modal"
        >
          <XMarkIcon className="w-6 h-6 font-bold" />
        </button>

        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 px-8 py-8 text-white">
          <div className="flex items-start gap-4">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl shrink-0">
              <BriefcaseIcon className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-black mb-2">Edit Stall Details</h2>
              <p className="text-blue-100 text-sm leading-relaxed">
                {stall.name} - Update business category and select relevant genres
              </p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {/* Stall Info */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <p className="text-sm text-slate-600"><span className="font-bold">Stall:</span> {stall.name}</p>
            <p className="text-sm text-slate-600"><span className="font-bold">Size:</span> {stall.size}</p>
            {stall.type && (
              <p className="text-sm text-slate-600"><span className="font-bold">Type:</span> {stall.type}</p>
            )}
          </div>

          {/* Business Category Selection */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3">
              <BriefcaseIcon className="w-4 h-4" />
              Business Category
            </label>
            <select
              value={businessCategory}
              onChange={(e) => setBusinessCategory(e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition-all text-slate-700 font-medium disabled:opacity-50"
            >
              <option value="General">General</option>
              {BUSINESS_CATEGORIES.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            {businessCategory !== stall.businessCategory && (
              <p className="text-xs text-amber-600 mt-2">
                ⚠️ Changing category will reset your genre selections
              </p>
            )}
          </div>

          {/* Genres Selection */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3">
              <TagIcon className="w-4 h-4" />
              Select Genres {selectedGenres.length > 0 && `(${selectedGenres.length} selected)`}
            </label>
            
            {availableGenres.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto p-4 bg-slate-50 rounded-xl border-2 border-slate-200">
                {availableGenres.map(genre => (
                  <button
                    key={genre}
                    type="button"
                    onClick={() => handleGenreToggle(genre)}
                    disabled={isLoading}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedGenres.includes(genre)
                        ? 'bg-indigo-600 text-white shadow-md scale-105'
                        : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                    } disabled:opacity-50`}
                  >
                    {selectedGenres.includes(genre) && (
                      <CheckCircleIcon className="w-4 h-4 inline mr-1" />
                    )}
                    {genre}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300">
                <p className="text-slate-500 text-sm">
                  Select a business category to see available genres
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-2">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-4 border-2 border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading || !hasChanges}
              className="flex-1 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-200 flex justify-center items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircleIcon className="w-5 h-5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditStallModal;
