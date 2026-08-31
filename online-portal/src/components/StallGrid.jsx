import React from "react";

const StallGrid = ({
  stalls,
  isLoading,
  totalRows,
  selectedStalls,
  handleStallClick,
  handleMouseEnter,
  handleMouseMove,
  handleMouseLeave,
  setHoveredStall,
  activeFilter
}) => {

  // Get stall type styling
  const getStallTypeStyle = (type, size) => {
    const sizeColors = {
      'small': 'border-blue-400',
      'medium': 'border-purple-400',
      'large': 'border-orange-400'
    };

    const typeIndicator = {
      'Premium': '✦',
      'Corner Stall': '◆',
      'Standard': '●'
    };

    return {
      borderClass: sizeColors[size?.toLowerCase()] || 'border-blue-400',
      indicator: typeIndicator[type] || typeIndicator['Standard']
    };
  };

  //LOADING STATE
  if (isLoading) {
    return (
      <div className="h-full min-h-100 flex flex-col items-center justify-center gap-3 animate-pulse">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-slate-400 text-sm font-medium">Loading stall map...</p>
      </div>
    );
  }

  //EMPTY STATE
  if (!stalls || stalls.length === 0) {
    return (
      <div className="h-full min-h-100 flex flex-col items-center justify-center text-center">
        <p className="text-4xl mb-2">🛖</p>
        <h3 className="text-slate-600 font-bold text-lg">No Stalls Found</h3>
        <p className="text-slate-400 text-sm">Please check back later.</p>
      </div>
    );
  }

  return (
    <div 
      className="inline-grid"
      style={{
        gridTemplateColumns: `auto repeat(${Math.max(...stalls.map(s => s.gridRow)) + 1}, 60px)`,
        gridTemplateRows: `repeat(${totalRows}, 60px)`,
        gap: '8px',
        padding: '8px'
      }}
    >
      {/* ROW LABELS */}
      {Array.from({ length: totalRows }).map((_, index) => {
        const rowLetter = String.fromCharCode(65 + index);
        return (
          <div
            key={`row-label-${index}`}
            style={{
              gridColumn: 1,
              gridRow: index + 1,
            }}
            className="flex items-center justify-center font-bold text-indigo-600 text-lg drop-shadow-sm"
          >
            {rowLetter}
          </div>
        );
      })}

      {/* STALL CARDS */}
      {stalls.map((stall) => {
        const isReserved = stall?.Confirmed === true;
        const isSelected = selectedStalls.some((s) => s.id === stall.id);
        const stallStyle = getStallTypeStyle(stall.type, stall.size);

        let isDimmed = false;
        if (activeFilter === "AVAILABLE" && isReserved) isDimmed = true;
        if (activeFilter === "SMALL" && stall.size?.toUpperCase() !== "SMALL") isDimmed = true;
        if (activeFilter === "MEDIUM" && stall.size?.toUpperCase() !== "MEDIUM") isDimmed = true;
        if (activeFilter === "LARGE" && stall.size?.toUpperCase() !== "LARGE") isDimmed = true;

        // Get premium/corner indicator
        const isPremium = stall.type === 'Premium';
        const isCorner = stall.type === 'Corner Stall';

        return (
          <div
            key={stall.id}
            onClick={() => handleStallClick(stall)}
            onMouseEnter={(e) => handleMouseEnter(stall, e)}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onTouchStart={() => setHoveredStall(stall)}
            style={{
              gridColumn: stall?.gridRow + 2,
              gridRow: stall?.gridCol
            }}
            className={`
              relative group
              ${isReserved
                ? "bg-gradient-to-br from-slate-200 to-slate-300 text-slate-500 border-slate-400 shadow-inner"
                : isSelected
                  ? "bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 text-white border-blue-400 shadow-xl shadow-blue-500/50 scale-105 z-10 ring-2 ring-blue-300"
                  : `bg-gradient-to-br from-emerald-100 via-green-100 to-teal-100 text-emerald-800 ${stallStyle.borderClass} hover:from-emerald-400 hover:via-green-500 hover:to-teal-500 hover:text-white cursor-pointer hover:shadow-lg hover:shadow-green-500/30 hover:scale-105`
              }
              ${isDimmed && !isSelected ? "opacity-20 grayscale pointer-events-none" : "opacity-100"}
              rounded-xl border-3
              flex flex-col items-center justify-center text-xs font-bold transition-all duration-200 ease-out`
            }
          >
            {/* Type indicator badge - Enhanced */}
            {(isPremium || isCorner) && !isReserved && !isSelected && (
              <div className={`absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] shadow-lg border-2 border-white
                ${isPremium ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white' : 'bg-gradient-to-br from-orange-500 to-red-500 text-white'}`}>
                {stallStyle.indicator}
              </div>
            )}

            {/* Selection checkmark */}
            {isSelected && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-blue-500">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            
            <span className="font-bold text-sm leading-none mb-1 drop-shadow-sm">{stall.name}</span>
            <span className="opacity-80 uppercase text-[10px] font-semibold tracking-wide">{stall.size}</span>
            
            {/* Price indicator for available stalls - Enhanced */}
            {!isReserved && !isSelected && (
              <span className="text-[9px] font-bold mt-0.5 px-1.5 py-0.5 bg-white/80 rounded-full shadow-sm">₨{(stall.price || 0).toLocaleString()}</span>
            )}

            {/* Hover glow effect */}
            {!isReserved && !isSelected && (
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/0 to-white/0 group-hover:from-white/20 group-hover:to-transparent transition-all duration-200 pointer-events-none"></div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StallGrid;