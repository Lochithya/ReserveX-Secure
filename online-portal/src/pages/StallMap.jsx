import React, { useEffect, useState, useMemo, useContext } from "react";
import {
  MapPinIcon,
  CheckBadgeIcon,
  BookOpenIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  UserGroupIcon
} from "@heroicons/react/24/outline";
import BookingSummary from "../components/BookingSummary";
import StallTooltip from "../components/StallTooltip";
import StallGrid from "../components/StallGrid";
import { getExhibition, getExhibitionStalls } from "../services/exhibition.service";
import toast from "react-hot-toast";
import { AuthContext } from "../contexts/AuthContext";
import EnhancedReservationModal from "../components/EnhancedReservationModal";
import { createReservation } from "../services/reservation.service";
import { useNavigate, useParams } from "react-router-dom";

const StallMap = () => {

  const { user, login } = useContext(AuthContext);
  const [stalls, setStalls] = useState([]);
  const [selectedStalls, setSelectedStalls] = useState([]);
  const [hoveredStall, setHoveredStall] = useState(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReserving, setIsReserving] = useState(false);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [exhibition, setExhibition] = useState(null);
  const { exhibitionId } = useParams();
  const navigate = useNavigate();

  const existingBookings = user?.noOfCurrentBookings || 0;
  
  // Use exhibition's vendor limit or fallback to 3
  const MAX_STALLS_PER_VENDOR = exhibition?.maxStallsPerVendor || 3;
  const REMAINING_QUOTA = Math.max(0, MAX_STALLS_PER_VENDOR - existingBookings);

  const fetchStalls = async () => {
    try {
      setIsLoading(true);
      const [event, data] = await Promise.all([
        getExhibition(exhibitionId), 
        getExhibitionStalls(exhibitionId)
      ]);
      setExhibition(event);
      setStalls(data);
    } catch (errorMessage) {
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmReservation = async ({ stallBusinessCategories, specialRequirements }) => {
    setIsReserving(true);
    try {
      // Build payload with business categories per stall
      const response = await createReservation(
        selectedStalls, 
        parseInt(exhibitionId),
        stallBusinessCategories,
        specialRequirements
      );

      // Check for success response
      if (response && (response.message || response.reservations || response.reservation)) {
        toast.success(
          response.message || "Reservation Confirmed! QR Code sent to email.",
          { duration: 5000 }
        );

        setSelectedStalls([]);
        setIsModalOpen(false);
        fetchStalls();

        // Update user context
        const updatedUser = {
          ...user,
          noOfCurrentBookings: (user.noOfCurrentBookings || 0) + selectedStalls.length
        };
        login(updatedUser, localStorage.getItem("token"));
        
        // Redirect after success
        setTimeout(() => {
          navigate("/home");
        }, 1500);
      } else {
        throw new Error("Unexpected response format");
      }

    } catch (error) {
      console.error("Reservation error:", error);
      const errorMessage = typeof error === 'string' ? error : error?.message || "Reservation failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsReserving(false);
    }
  };

  useEffect(() => {
    fetchStalls();
  }, [exhibitionId]);

  const totalRows = useMemo(() => {
    if (stalls.length === 0) return 10;
    const maxY = Math.max(...stalls.map((s) => s.gridCol));
    return maxY + 1;
  }, [stalls]);

  const stats = useMemo(() => {
    const total = stalls.length;
    const reserved = stalls.filter(s => s.Confirmed === true).length;
    const available = total - reserved;
    return { total, available, reserved };
  }, [stalls]);

  // Enhanced selection logic with better feedback
  const handleStallClick = (stall) => {
    if (stall.Confirmed === true) {
      toast.error("This stall is already reserved by another vendor.");
      return;
    }

    const isSelected = selectedStalls.some((s) => s.id === stall.id);

    if (isSelected) {
      setSelectedStalls(selectedStalls.filter((s) => s.id !== stall.id));
      toast.success(`Stall ${stall.name} removed from selection`);
    } else {
      // Check vendor-specific limits
      if (selectedStalls.length >= MAX_STALLS_PER_VENDOR) {
        toast.error(
          `Maximum ${MAX_STALLS_PER_VENDOR} stalls allowed per vendor for this exhibition.`,
          { duration: 4000 }
        );
        return;
      }

      if (selectedStalls.length >= REMAINING_QUOTA) {
        if (REMAINING_QUOTA <= 0) {
          toast.error(
            `You have reached the maximum limit of ${MAX_STALLS_PER_VENDOR} active reservations.`,
            { duration: 4000 }
          );
        } else {
          toast.error(
            `You have ${existingBookings} active reservations. You can only select ${REMAINING_QUOTA} more stall${REMAINING_QUOTA !== 1 ? 's' : ''}.`,
            { duration: 4000 }
          );
        }
        return;
      }
      
      setSelectedStalls([...selectedStalls, stall]);
      toast.success(`Stall ${stall.name} added to selection (${selectedStalls.length + 1}/${MAX_STALLS_PER_VENDOR})`);
    }
  };

  // Desktop Mouse Handlers
  const handleMouseEnter = (stall, e) => {
    setHoveredStall(stall);
    moveCursor(e);
  };

  const handleMouseMove = (e) => { 
    if (hoveredStall) moveCursor(e); 
  };

  const handleMouseLeave = () => { 
    setHoveredStall(null); 
  };

  const moveCursor = (e) => {
    setCursorPos({ x: e.clientX + 15, y: e.clientY + 15 });
  };

  const handleReserve = () => {
    if (selectedStalls.length === 0) {
      toast.error("Please select at least one stall to proceed.");
      return;
    }
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    // Keep selection when modal is closed
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col item-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 lg:p-10 lg:py-5">

      {/* Enhanced Header with Exhibition Info */}
      <div className="w-full max-w-6xl mx-auto mb-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/60 p-5 md:p-7 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        
        <div className="flex-1">
          <h2 className="text-xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <MapPinIcon className="w-6 h-6 text-white" />
            </div>
            {exhibition?.name || "Exhibition Stalls"}
          </h2>
          <p className="text-sm text-slate-600 mt-2 font-medium">
            {exhibition ? (
              <>
                {exhibition.venue?.name} · {new Date(`${exhibition.startDate}T00:00:00`).toLocaleDateString()} – {new Date(`${exhibition.endDate}T00:00:00`).toLocaleDateString()}
              </>
            ) : (
              "Choose available stalls for this event."
            )}
          </p>
          
          {/* Vendor Limit Indicator */}
          {exhibition?.maxStallsPerVendor && (
            <div className="mt-3 inline-flex items-center gap-2 text-xs bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 px-4 py-2 rounded-full border border-indigo-200 shadow-sm">
              <UserGroupIcon className="w-4 h-4" />
              <span className="font-bold">
                Vendor Limit: {MAX_STALLS_PER_VENDOR} stalls maximum
              </span>
            </div>
          )}
        </div>

        {/* Stats Badges */}
        <div className="flex gap-3 md:gap-4 w-full md:w-auto">
          <div className="flex-1 md:flex-none flex flex-col items-center px-4 py-3 bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-300 rounded-xl shadow-md">
            <span className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Total</span>
            <span className="font-black text-2xl text-slate-700 leading-none mt-1.5">{stats.total}</span>
          </div>

          <div className="flex-1 md:flex-none flex flex-col items-center px-4 py-3 bg-gradient-to-br from-emerald-50 to-green-100 border-2 border-emerald-300 rounded-xl shadow-md">
            <span className="text-[10px] uppercase font-black text-emerald-700 tracking-widest">Available</span>
            <span className="font-black text-2xl text-emerald-600 leading-none mt-1.5">{stats.available}</span>
          </div>

          <div className="flex-1 md:flex-none flex flex-col items-center px-4 py-3 bg-gradient-to-br from-red-50 to-rose-100 border-2 border-red-300 rounded-xl shadow-md">
            <span className="text-[10px] uppercase font-black text-red-700 tracking-widest">Reserved</span>
            <span className="font-black text-2xl text-red-600 leading-none mt-1.5">{stats.reserved}</span>
          </div>
        </div>
      </div>

      {/* Selection Status Bar */}
      {selectedStalls.length > 0 && (
        <div className="w-full max-w-6xl mx-auto mb-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-2xl p-6 text-white animate-fade-in border-2 border-white/30">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/30 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                <CheckBadgeIcon className="w-8 h-8" />
              </div>
              <div>
                <p className="font-black text-lg">
                  {selectedStalls.length} Stall{selectedStalls.length !== 1 ? 's' : ''} Selected
                </p>
                <p className="text-sm text-blue-100 font-medium">
                  {REMAINING_QUOTA - selectedStalls.length} more available from your quota
                </p>
                <p className="text-xs text-white/70 mt-1">
                  💡 Click selected stalls to deselect them
                </p>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-4xl font-black leading-none">
                Rs. {selectedStalls.reduce((sum, s) => sum + (s.price || 0), 0).toLocaleString()}
              </p>
              <p className="text-sm text-blue-100 font-semibold mt-1">Total Investment</p>
            </div>
          </div>
        </div>
      )}



      {/* Stall Map Container with Legend on Right */}
      <div className="lg:flex lg:flex-col lg:justify-center items-center h-full">
        <div className="mb-6 max-w-7xl w-full border-2 border-white/60 rounded-2xl bg-white/90 backdrop-blur-sm shadow-2xl p-6">

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-6 p-4 bg-gradient-to-r from-slate-50 to-blue-50 border-2 border-slate-200 rounded-xl shadow-inner">
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center px-3 py-2 bg-white rounded-lg">
              🔍 Filter by:
            </span>
            <button 
              onClick={() => setActiveFilter("ALL")} 
              className={`px-4 py-2 text-xs font-black rounded-xl transition-all duration-200 ${activeFilter === "ALL" ? "bg-gradient-to-r from-slate-700 to-slate-900 text-white shadow-lg scale-105" : "bg-white text-slate-700 border-2 border-slate-300 hover:bg-slate-100 hover:scale-105"}`}
            >
              All Stalls
            </button>
            <button 
              onClick={() => setActiveFilter("AVAILABLE")} 
              className={`px-4 py-2 text-xs font-black rounded-xl transition-all duration-200 ${activeFilter === "AVAILABLE" ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-300 scale-105" : "bg-white text-emerald-700 border-2 border-emerald-300 hover:bg-emerald-50 hover:scale-105"}`}
            >
              ✓ Available
            </button>
            <button 
              onClick={() => setActiveFilter("SMALL")} 
              className={`px-4 py-2 text-xs font-black rounded-xl transition-all duration-200 ${activeFilter === "SMALL" ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-300 scale-105" : "bg-white text-blue-700 border-2 border-blue-300 hover:bg-blue-50 hover:scale-105"}`}
            >
              Small
            </button>
            <button 
              onClick={() => setActiveFilter("MEDIUM")} 
              className={`px-4 py-2 text-xs font-black rounded-xl transition-all duration-200 ${activeFilter === "MEDIUM" ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-300 scale-105" : "bg-white text-purple-700 border-2 border-purple-300 hover:bg-purple-50 hover:scale-105"}`}
            >
              Medium
            </button>
            <button 
              onClick={() => setActiveFilter("LARGE")} 
              className={`px-4 py-2 text-xs font-black rounded-xl transition-all duration-200 ${activeFilter === "LARGE" ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-300 scale-105" : "bg-white text-orange-700 border-2 border-orange-300 hover:bg-orange-50 hover:scale-105"}`}
            >
              Large
            </button>
          </div>

          {/* Grid and Legend Side by Side */}
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            
            {/* Stall Grid - Left Side */}
            <div className="flex-1 overflow-auto max-h-[65vh] border-2 border-slate-200 rounded-xl bg-gradient-to-br from-slate-50/50 to-blue-50/50 p-4">
              <StallGrid
                stalls={stalls}
                isLoading={isLoading}
                totalRows={totalRows}
                selectedStalls={selectedStalls}
                handleStallClick={handleStallClick}
                handleMouseEnter={handleMouseEnter}
                handleMouseMove={handleMouseMove}
                handleMouseLeave={handleMouseLeave}
                setHoveredStall={setHoveredStall}
                activeFilter={activeFilter}
              />
            </div>

            {/* Legend - Right Side */}
            <div className="lg:w-64 w-full p-5 bg-gradient-to-br from-white via-blue-50 to-indigo-50 rounded-xl border-2 border-indigo-200 shadow-lg shrink-0">
              <h3 className="text-center font-black text-slate-700 mb-4 text-sm uppercase tracking-wider flex items-center justify-center gap-2">
                <SparklesIcon className="w-4 h-4 text-indigo-600" />
                Stall Legend
              </h3>
              
              {/* Legend Items in Column */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border-2 border-emerald-300 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-100 to-green-200 border-2 border-emerald-400 shadow-sm shrink-0"></div>
                  <span className="text-slate-800 text-sm font-bold">Available</span>
                </div>

                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border-2 border-slate-300 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-200 to-slate-300 border-2 border-slate-400 shrink-0"></div>
                  <span className="text-slate-800 text-sm font-bold">Reserved</span>
                </div>

                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border-2 border-blue-400 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 border-2 border-blue-700 shadow-lg shrink-0"></div>
                  <span className="text-slate-800 text-sm font-bold">Your Selection</span>
                </div>

                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border-2 border-purple-300 shadow-sm hover:shadow-md transition-shadow">
                  <div className="relative w-10 h-10 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 border-2 border-purple-400 shrink-0">
                    <SparklesIcon className="w-5 h-5 text-purple-600 absolute -top-1 -right-1" />
                  </div>
                  <span className="text-slate-800 text-sm font-bold">Premium/Corner</span>
                </div>
              </div>

              {/* Tip Section */}
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs text-amber-900 font-semibold flex items-start gap-2">
                  <span className="text-base">💡</span>
                  <span>Click a selected stall again to deselect it</span>
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="max-w-5xl mx-auto w-full mb-8 bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-blue-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

        <h4 className="text-slate-800 font-extrabold text-lg text-center mb-8 relative z-10">
          How to Reserve Your Exhibition Space
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          <div className="flex flex-col items-center text-center relative group">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm">
              <MapPinIcon className="w-7 h-7" />
            </div>
            <h5 className="font-bold text-slate-800 mb-2">1. Select Your Stalls</h5>
            <p className="text-sm text-slate-500 leading-relaxed px-4">
              Click on <span className="text-emerald-600 font-semibold">green available stalls</span> on the map. 
              You can select up to {MAX_STALLS_PER_VENDOR} stalls based on the exhibition's vendor limit.
            </p>
            <div className="hidden md:block absolute top-7 left-[60%] w-[80%] h-[2px] border-t-2 border-dashed border-slate-200"></div>
          </div>

          <div className="flex flex-col items-center text-center relative group">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-sm">
              <CheckBadgeIcon className="w-7 h-7" />
            </div>
            <h5 className="font-bold text-slate-800 mb-2">2. Confirm Reservation</h5>
            <p className="text-sm text-slate-500 leading-relaxed px-4">
              Review your selection, total cost, and exhibition details. Click "Reserve Stalls" to confirm. 
              You'll receive a QR code via email.
            </p>
            <div className="hidden md:block absolute top-7 left-[60%] w-[80%] h-[2px] border-t-2 border-dashed border-slate-200"></div>
          </div>

          <div className="flex flex-col items-center text-center group">
            <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300 shadow-sm">
              <BookOpenIcon className="w-7 h-7" />
            </div>
            <h5 className="font-bold text-slate-800 mb-2">3. Manage Your Stalls</h5>
            <p className="text-sm text-slate-500 leading-relaxed px-4">
              Visit your <span className="text-blue-600 font-semibold">Home page</span> to assign genres, 
              view QR codes, and manage all your reservations.
            </p>
          </div>
        </div>
      </div>

      {/* Booking Summary */}
      <BookingSummary
        selectedStalls={selectedStalls}
        onReserve={handleReserve}
        quota={REMAINING_QUOTA}
      />

      {/* Hover Tooltip */}
      <StallTooltip stall={hoveredStall} position={cursorPos} />

      {/* Reservation Modal */}
      <EnhancedReservationModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onConfirm={handleConfirmReservation}
        selectedStalls={selectedStalls}
        isLoading={isReserving}
        exhibition={exhibition}
      />
    </div>
  );
};

export default StallMap;
