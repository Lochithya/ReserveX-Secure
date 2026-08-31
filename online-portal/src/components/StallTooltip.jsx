import React from "react";
import { 
  MapPinIcon, 
  CubeIcon, 
  SparklesIcon, 
  CheckCircleIcon,
  XCircleIcon
} from "@heroicons/react/24/outline";

const StallTooltip = ({ stall, position }) => {
  if (!stall) return null;

  // Get stall type badge styling
  const getTypeBadge = (type) => {
    const badges = {
      'Standard': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: <CubeIcon className="w-3 h-3" /> },
      'Premium': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', icon: <SparklesIcon className="w-3 h-3" /> },
      'Corner Stall': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', icon: <MapPinIcon className="w-3 h-3" /> },
    };
    return badges[type] || badges['Standard'];
  };

  const typeBadge = getTypeBadge(stall.type);

  // Get grid position label
  const getGridLabel = () => {
    const rowLetter = String.fromCharCode(65 + (stall.gridCol || 0));
    return `${rowLetter}${stall.gridRow || 0}`;
  };

  return (
    <div
      className="fixed z-50 animate-fade-in pointer-events-none"
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      <div className="
        fixed top-24 left-4 right-4 md:static md:w-80
        bg-white/98 backdrop-blur-lg text-slate-800 rounded-2xl shadow-[0_20px_60px_rgb(0,0,0,0.15)] border border-slate-200
        overflow-hidden
      ">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 px-5 py-4 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-black text-xl mb-1 flex items-center gap-2">
                {stall.name}
              </h4>
              <div className="flex items-center gap-2 text-blue-100 text-xs">
                <MapPinIcon className="w-3.5 h-3.5" />
                <span className="font-semibold">Location: {getGridLabel()}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="block font-black text-2xl leading-none">
                Rs. {(stall.price || 0).toLocaleString()}
              </span>
              <span className="text-xs text-blue-200 font-medium">per stall</span>
            </div>
          </div>
        </div>

        {/* Body Section */}
        <div className="p-5 space-y-4">
          {/* Status & Type Badges */}
          <div className="flex gap-2 flex-wrap">
            {/* Availability Badge */}
            {stall.Confirmed === true ? (
              <span className="inline-flex items-center gap-1.5 text-xs bg-red-50 text-red-700 px-3 py-1.5 rounded-lg font-bold border border-red-200">
                <XCircleIcon className="w-3.5 h-3.5" />
                RESERVED
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg font-bold border border-emerald-200">
                <CheckCircleIcon className="w-3.5 h-3.5" />
                AVAILABLE
              </span>
            )}

            {/* Type Badge */}
            <span className={`inline-flex items-center gap-1.5 text-xs ${typeBadge.bg} ${typeBadge.text} px-3 py-1.5 rounded-lg font-bold border ${typeBadge.border}`}>
              {typeBadge.icon}
              {stall.type || 'Standard'}
            </span>

            {/* Size Badge */}
            <span className="inline-flex items-center gap-1.5 text-xs bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg font-bold border border-slate-200 uppercase">
              {stall.size} Size
            </span>
          </div>

          {/* Description */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <p className="text-sm leading-relaxed text-slate-700">
              {stall?.description || "Standard exhibition stall space with essential amenities for showcasing your products and services."}
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-lg border border-slate-200 p-3">
              <p className="text-xs text-slate-500 font-semibold mb-1">Dimensions</p>
              <p className="text-sm font-bold text-slate-800">
                {stall.size === 'small' ? '3m × 3m' : stall.size === 'medium' ? '4m × 4m' : '5m × 5m'}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-3">
              <p className="text-xs text-slate-500 font-semibold mb-1">Area</p>
              <p className="text-sm font-bold text-slate-800">
                {stall.size === 'small' ? '9 m²' : stall.size === 'medium' ? '16 m²' : '25 m²'}
              </p>
            </div>
          </div>

          {/* Amenities */}
          {stall.type && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Included Amenities</p>
              <div className="flex flex-wrap gap-1.5">
                {stall.type === 'Premium' && (
                  <>
                    <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded border border-purple-100">✓ Premium Location</span>
                    <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded border border-purple-100">✓ Extra Lighting</span>
                    <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded border border-purple-100">✓ Power Outlets</span>
                  </>
                )}
                {stall.type === 'Corner Stall' && (
                  <>
                    <span className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded border border-orange-100">✓ Corner Visibility</span>
                    <span className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded border border-orange-100">✓ 2-Side Access</span>
                    <span className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded border border-orange-100">✓ Extra Space</span>
                  </>
                )}
                {(!stall.type || stall.type === 'Standard') && (
                  <>
                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100">✓ Basic Setup</span>
                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100">✓ Standard Access</span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer (Mobile Hint) */}
        <div className="md:hidden px-5 py-3 bg-gradient-to-r from-slate-50 to-slate-100 border-t border-slate-200">
          <p className="text-xs text-slate-600 text-center font-semibold flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
            {stall.Confirmed ? "This stall is already reserved" : "Tap to select this stall"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StallTooltip;