import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  TicketIcon,
  BuildingStorefrontIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  PlusIcon,
  UserIcon,
  PencilSquareIcon,
  BriefcaseIcon
} from "@heroicons/react/24/outline";
import { AuthContext } from "../contexts/AuthContext";
import { getMyReservations, updateStallDetails } from "../services/reservation.service"
import toast from "react-hot-toast";
import EditStallModal from "../components/EditStallModal";

const HomePage = () => {
  const navigate = useNavigate();

  const { user, refreshUser, loading: authLoading } = useContext(AuthContext);
  const [reservations, setReservations] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  const [isModalOpen, setModalOpen] = useState(false);
  const [editingStall, setEditingStall] = useState(null);
  const [editingReservationId, setEditingReservationId] = useState(null);
  const [saving, setSaving] = useState(false);



  useEffect(() => {
    // Wait for auth to be ready AND token to exist before loading dashboard
    const token = localStorage.getItem("token");
    
    if (!authLoading) {
      if (user && token) {
        console.log("Auth ready, user exists, token exists - loading dashboard");
        loadDashboard();
      } else {
        console.log("Auth ready but no user or no token");
        setLoadingData(false);
      }
    } else {
      console.log("Auth still loading...");
    }
  }, [authLoading, user])

  const loadDashboard = async () => {
    try {
      // Check if token exists
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found in localStorage");
        setReservations([]);
        setLoadingData(false);
        return;
      }

      console.log("Token found, fetching reservations...");
      console.log("Token preview:", token.substring(0, 20) + "...");
      
      // Refresh user data to get latest booking count
      try {
        await refreshUser();
      } catch (err) {
        console.warn("Could not refresh user, continuing...", err);
      }
      
      const data = await getMyReservations();
      setReservations(data || []);
      console.log("Reservations data:", data)
    } catch (error) {
      console.error("loadDashboard error:", error);
      
      // Check if it's an authentication error
      if (error?.includes?.("authentication") || error?.includes?.("401")) {
        console.error("Authentication error - clearing localStorage");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        toast.error("Session expired. Please login again.");
        navigate("/login");
      } else {
        // Just show empty state, don't error for no reservations
        console.log("Setting empty reservations");
        setReservations([]);
      }
    } finally {
      setLoadingData(false);
    }
  };

  const handleEditClick = (reservation, stall) => {
    setEditingStall(stall);
    setEditingReservationId(reservation.id);
    setModalOpen(true);
  };

  const handleSaveStallDetails = async ({ stallId, reservationId, businessCategory, genres }) => {
    setSaving(true);
    try {
      const response = await updateStallDetails(stallId, reservationId, businessCategory, genres);

      // Update local state
      setReservations(prev => prev.map(res =>
        res.id === reservationId
          ? {
            ...res,
            stalls: res.stalls.map(s => 
              s.id === stallId
                ? { ...s, businessCategory, genres }
                : s
            )
          }
          : res
      ));

      toast.success(response.message || "Stall details updated successfully!");
      setModalOpen(false);

    } catch (error) {
      console.error(error);
      toast.error(error || "Failed to save stall details");
    } finally {
      setSaving(false);
    }
  };


  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      {/* HERO SECTION START */}
      <div className="relative bg-slate-900 text-white overflow-hidden">

        <div
          className="absolute inset-0 z-0 opacity-100 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=2070&auto=format&fit=crop')" }}
        ></div>
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-slate-900 via-slate-900/60 to-blue-900/80"></div>


        <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 lg:py-16">


          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 border-b border-slate-700/50 pb-8">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-bold uppercase tracking-wider mb-2 border border-blue-500/30">
                Official Vendor Portal
              </span>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">
                Your exhibitor home
              </h1>
              <p className="text-slate-400 text-sm md:text-base max-w-2xl">
                Manage your reservations across current and upcoming exhibitions.
                Explore an event to choose the right venue and stall for your business.
              </p>
            </div>
          </div>


          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="text-slate-400 text-sm mb-1">Signed in as</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-lg">
                  <UserIcon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white leading-none">{user?.businessName}</h2>
                  <p className="text-xs text-blue-300 mt-1 flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></span>
                    Account Active
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate("/exhibitions")}
              className="group flex items-center gap-3 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold text-lg shadow-lg shadow-blue-900/50 transition-all hover:scale-105 active:scale-95"
            >
              <PlusIcon className="w-6 h-6 group-hover:rotate-90 transition-transform" />
              Explore Exhibitions
            </button>
          </div>

        </div>
      </div>

      {/* 2. DASHBOARD CONTENT */}
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Stats Grid - Updated for multi-exhibition system */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Reservations */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl shadow-sm border border-blue-100 hover:shadow-lg transition-all">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-semibold text-blue-600 mb-1">Total Reservations</p>
                <h3 className="text-4xl font-black text-blue-900">
                  {reservations.length}
                </h3>
                <p className="text-xs text-blue-600 mt-1">Across all exhibitions</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-600 shadow-md">
                <TicketIcon className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          {/* Total Stalls Booked */}
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-xl shadow-sm border border-emerald-100 hover:shadow-lg transition-all">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-semibold text-emerald-600 mb-1">Total Stalls Booked</p>
                <h3 className="text-4xl font-black text-emerald-900">
                  {reservations.reduce((total, res) => total + (res.stalls?.length || 0), 0)}
                </h3>
                <p className="text-xs text-emerald-600 mt-1">Active across events</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-600 shadow-md">
                <BuildingStorefrontIcon className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          {/* Approved Reservations */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl shadow-sm border border-purple-100 hover:shadow-lg transition-all">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-semibold text-purple-600 mb-1">Approved Reservations</p>
                <h3 className="text-4xl font-black text-purple-900">
                  {reservations.filter(res => res.status?.toUpperCase() === "APPROVED").length}
                </h3>
                <p className="text-xs text-purple-600 mt-1">Confirmed bookings</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-600 shadow-md">
                <BookOpenIcon className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>
        </div>



        <div className="max-w-[1600px] mx-auto px-6 py-8 -mt-8 relative z-20">

          {/* Reservation Table Card */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden mt-6">
            <div className="px-8 py-5 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-semibold text-slate-800 text-lg">Your Reservations & Stall Details</h3>
              <p className="text-sm text-slate-500 mt-1">Complete reservation details with exhibition information</p>
            </div>

            {reservations.length === 0 && !loadingData ? (
              //EMPTY STATE UI
              <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4">
                  <TicketIcon className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900">No reservations yet</h3>
                <p className="text-slate-500 max-w-sm mx-auto mb-6">
                  You haven't booked any stalls yet. Secure your spot now!
                </p>
                <button
                  onClick={() => navigate("/exhibitions")}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <PlusIcon className="w-5 h-5" />
                  Explore Exhibitions
                </button>
              </div>
            ) : (
              <div className="space-y-6 p-6">
                {reservations.map((reservation, index) => (
                  <div key={reservation.id} className="group border-2 border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-300">
                    {/* Reservation Header with Exhibition Info */}
                    <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-6 relative overflow-hidden">
                      {/* Decorative background pattern */}
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -mr-32 -mt-32"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full -ml-24 -mb-24"></div>
                      </div>
                      
                      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <span className={`px-4 py-1.5 rounded-full font-bold text-xs uppercase shadow-lg ${
                              reservation.status?.toUpperCase() === 'APPROVED'
                                ? 'bg-emerald-400 text-emerald-900'
                                : reservation.status?.toUpperCase() === 'REJECTED'
                                ? 'bg-red-400 text-red-900'
                                : 'bg-amber-400 text-amber-900'
                            }`}>
                              ✓ {reservation.status}
                            </span>
                            <span className="text-xs font-medium bg-white/20 px-3 py-1 rounded-full">
                              {reservation.stalls?.length || 0} Stall{reservation.stalls?.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <h3 className="text-2xl md:text-3xl font-black mb-2 leading-tight">{reservation.exhibitionName || 'Exhibition'}</h3>
                          <p className="text-blue-100 text-sm mb-4 leading-relaxed max-w-2xl">{reservation.exhibitionDescription}</p>
                          <div className="flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                              <BuildingStorefrontIcon className="w-4 h-4" />
                              <span className="font-medium">{reservation.exhibitionVenue}, {reservation.exhibitionCity}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                              <CalendarDaysIcon className="w-4 h-4" />
                              <span className="font-medium">{reservation.exhibitionStartDate} to {reservation.exhibitionEndDate}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Special Requirements */}
                    {reservation.specialRequirements && (
                      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 p-5">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center shrink-0">
                            <span className="text-xl">📝</span>
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-amber-900 text-sm mb-1 flex items-center gap-2">
                              Special Requirements
                              <span className="text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">Custom</span>
                            </p>
                            <p className="text-amber-800 text-sm leading-relaxed">{reservation.specialRequirements}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Stalls Table */}
                    <div className="overflow-x-auto bg-white">
                      <table className="w-full text-left text-sm table-fixed">
                        <colgroup>
                          <col className="w-[30%]" />
                          <col className="w-[12%]" />
                          <col className="w-[15%]" />
                          <col className="w-[12%]" />
                          <col className="w-[18%]" />
                          <col className="w-[13%]" />
                        </colgroup>
                        <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b-2 border-slate-200">
                          <tr>
                            <th className="px-6 py-4 text-xs font-black text-slate-700 uppercase tracking-wide">Stall Details</th>
                            <th className="px-6 py-4 text-xs font-black text-slate-700 uppercase tracking-wide">Type & Size</th>
                            <th className="px-6 py-4 text-xs font-black text-slate-700 uppercase tracking-wide">Business Category</th>
                            <th className="px-6 py-4 text-xs font-black text-slate-700 uppercase tracking-wide">Price</th>
                            <th className="px-6 py-4 text-xs font-black text-slate-700 uppercase tracking-wide">Genres</th>
                            <th className="px-6 py-4 text-xs font-black text-slate-700 uppercase tracking-wide text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {reservation.stalls
                            ?.sort((a, b) => {
                              // Sort by stall ID to maintain consistent order
                              return (a.id || 0) - (b.id || 0);
                            })
                            ?.map((stall, stallIndex) => (
                            <tr key={stall.id} className="h-32 hover:bg-blue-50/50 transition-colors group/row">
                              <td className="px-6 py-5 align-top">
                                <div className="h-20 overflow-hidden">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 font-bold text-xs flex items-center justify-center shrink-0">
                                      {stallIndex + 1}
                                    </span>
                                    <p className="font-bold text-slate-900 truncate">{stall.name}</p>
                                  </div>
                                  <p className="text-xs text-slate-500 ml-10 leading-relaxed line-clamp-2">
                                    {stall.description || 'Standard exhibition space'}
                                  </p>
                                  {stall.gridRow !== undefined && stall.gridCol !== undefined && (
                                    <p className="text-xs text-slate-400 ml-10 font-mono truncate">
                                      Position: Row {stall.gridRow}, Col {stall.gridCol}
                                    </p>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-5 align-top">
                                <div className="h-20">
                                  <span className="font-bold text-slate-900 text-base block">{stall.size}</span>
                                  {stall.type && (
                                    <span className={`mt-2 text-xs font-bold px-3 py-1.5 rounded-lg inline-block shadow-sm ${
                                      stall.type === 'Premium' 
                                        ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                                        : stall.type === 'Corner Stall'
                                        ? 'bg-orange-100 text-orange-700 border border-orange-200'
                                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                                    }`}>
                                      {stall.type}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-5 align-top">
                                <div className="h-20 flex items-start">
                                  <span className="inline-flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-200 shadow-sm">
                                    <BriefcaseIcon className="w-3.5 h-3.5 shrink-0" />
                                    <span className="truncate">{stall.businessCategory || 'General'}</span>
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-5 align-top">
                                <div className="h-20 flex items-start">
                                  <span className="text-xl font-black text-emerald-600 whitespace-nowrap">
                                    Rs. {(stall.price || 0).toLocaleString()}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-5 align-top">
                                <div className="h-20 overflow-hidden">
                                  <div className="flex flex-wrap gap-1.5">
                                    {stall.genres && stall.genres.length > 0 ? (
                                      <>
                                        {[...stall.genres]
                                          .sort((a, b) => a.localeCompare(b))
                                          .slice(0, 3)
                                          .map((g, idx) => (
                                            <span key={idx} className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-md border border-blue-100 truncate max-w-[120px]">
                                              {g}
                                            </span>
                                          ))}
                                        {stall.genres.length > 3 && (
                                          <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-md whitespace-nowrap">
                                            +{stall.genres.length - 3} more
                                          </span>
                                        )}
                                      </>
                                    ) : (
                                      <span className="text-slate-400 italic text-xs bg-slate-50 px-3 py-1 rounded-md">Not set</span>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-5 align-top">
                                <div className="h-20 flex items-start justify-end">
                                  <button
                                    onClick={() => handleEditClick(reservation, stall)}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-slate-200 text-slate-700 text-xs font-bold rounded-lg hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300 transition-all shadow-sm hover:shadow-md group-hover/row:border-indigo-200 whitespace-nowrap"
                                  >
                                    <PencilSquareIcon className="w-4 h-4" />
                                    Edit Details
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      <EditStallModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveStallDetails}
        stall={editingStall}
        reservationId={editingReservationId}
        isLoading={saving}
      />

    </div>
  );
};

//SUB-COMPONENTS

const StatCard = ({ title, value, icon, bg }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-start justify-between hover:shadow-md transition-shadow">
    <div>
      <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
    </div>
    <div className={`p-3 rounded-lg ${bg} bg-opacity-50`}>
      {icon}
    </div>
  </div>
);




export default HomePage;
