import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  TicketIcon,
  BuildingStorefrontIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  PlusIcon,
  UserIcon,
  PencilSquareIcon
} from "@heroicons/react/24/outline";
import { AuthContext } from "../contexts/AuthContext";
import { getMyReservations, updateReservationGenres } from "../services/reservation.service"
import toast from "react-hot-toast";
import GenreModal from "../components/GenreModal";

const HomePage = () => {
  const navigate = useNavigate();

  const { user, refreshUser, loading: authLoading } = useContext(AuthContext);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  const [isModalOpen, setModalOpen] = useState(false);
  const [editingRes, setEditingRes] = useState(null); // Which reservation are we editing?
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
    setEditingRes({ ...reservation, currentStall: stall });
    setModalOpen(true);
  };

  const handleSaveGenres = async (reservationId, payloadArray) => {
    setSaving(true);
    try {
      // Send the structured array to the backend
      const response = await updateReservationGenres(payloadArray);


      const flatGenres = [...new Set(payloadArray.flatMap(p => p.genres))];

      setReservations(prev => prev.map(res =>
        res.id === reservationId
          ? {
            ...res,
            stalls: res.stalls.map(s => ({
              ...s,
              genres: payloadArray.find(p => p.stallId === s.id)?.genres || []
            }))
          }
          : res
      ));

      toast.success(response.message || "Genres updated successfully!");
      setModalOpen(false);

    } catch (error) {
      console.error(error);
      toast.error(error || "Failed to save genres");
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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Stalls Booked</p>
                <h3 className="text-3xl font-bold text-slate-800">
                  {user?.noOfCurrentBookings ?? 0} <span className="text-lg text-slate-400 font-medium">/ 3</span>
                </h3>
              </div>
              <div className="p-3 rounded-lg bg-blue-50">
                <TicketIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-2.5 mt-2 overflow-hidden border border-slate-200/50">
              <div
                className={`h-2.5 rounded-full transition-all duration-700 ${(user?.noOfCurrentBookings ?? 0) >= 3 ? 'bg-amber-500' : 'bg-blue-600'}`}
                style={{ width: `${Math.min(((user?.noOfCurrentBookings ?? 0) / 3) * 100, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-slate-400 mt-2 font-medium">
              {(user?.noOfCurrentBookings ?? 0) >= 3
                ? <span className="text-amber-600">Maximum quota reached</span>
                : `${3 - (user?.noOfCurrentBookings ?? 0)} more slots available`}
            </p>
          </div>
          <StatCard
            title="Total Stalls (Lifetime)"
            value="3"
            icon={<BuildingStorefrontIcon className="w-6 h-6 text-emerald-600" />}
            bg="bg-emerald-50"
          />
          <StatCard
            title="Approved Reservations"
            value={reservations.filter(res => res.status?.toUpperCase() === "APPROVED").length}
            icon={<BookOpenIcon className="w-6 h-6 text-purple-600" />}
            bg="bg-purple-50"
          />
        </div>



        <div className="max-w-7xl mx-auto px-6 py-8 -mt-8 relative z-20">

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
                {reservations.map((reservation) => (
                  <div key={reservation.id} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    {/* Reservation Header with Exhibition Info */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
                      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-mono text-sm bg-white/20 px-3 py-1 rounded-full">
                              Reservation #{reservation.id}
                            </span>
                            <span className={`px-3 py-1 rounded-full font-bold text-xs uppercase ${
                              reservation.status?.toUpperCase() === 'APPROVED'
                                ? 'bg-emerald-400 text-emerald-900'
                                : reservation.status?.toUpperCase() === 'REJECTED'
                                ? 'bg-red-400 text-red-900'
                                : 'bg-amber-400 text-amber-900'
                            }`}>
                              {reservation.status}
                            </span>
                          </div>
                          <h3 className="text-2xl font-bold mb-2">{reservation.exhibitionName || 'Exhibition'}</h3>
                          <p className="text-blue-100 text-sm mb-3">{reservation.exhibitionDescription}</p>
                          <div className="flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <BuildingStorefrontIcon className="w-4 h-4" />
                              <span>{reservation.exhibitionVenue}, {reservation.exhibitionCity}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CalendarDaysIcon className="w-4 h-4" />
                              <span>{reservation.exhibitionStartDate} to {reservation.exhibitionEndDate}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-blue-100 text-xs mb-1">QR Code Token</p>
                          <p className="font-mono font-bold text-sm bg-white/20 px-3 py-2 rounded-lg break-all">
                            {reservation.qrCodeToken?.substring(0, 16)}...
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Special Requirements */}
                    {reservation.specialRequirements && (
                      <div className="bg-amber-50 border-b border-amber-200 p-4">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">📝</span>
                          <div>
                            <p className="font-bold text-amber-900 text-sm mb-1">Special Requirements</p>
                            <p className="text-amber-800 text-sm">{reservation.specialRequirements}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Stalls Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                            <th className="px-6 py-3 text-xs font-bold text-slate-600 uppercase">Stall Details</th>
                            <th className="px-6 py-3 text-xs font-bold text-slate-600 uppercase">Type & Size</th>
                            <th className="px-6 py-3 text-xs font-bold text-slate-600 uppercase">Business Category</th>
                            <th className="px-6 py-3 text-xs font-bold text-slate-600 uppercase">Price</th>
                            <th className="px-6 py-3 text-xs font-bold text-slate-600 uppercase">Genres</th>
                            <th className="px-6 py-3 text-xs font-bold text-slate-600 uppercase text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {reservation.stalls?.map((stall) => (
                            <tr key={stall.id} className="hover:bg-blue-50/30 transition-colors">
                              <td className="px-6 py-4">
                                <div>
                                  <p className="font-bold text-slate-900">{stall.name}</p>
                                  <p className="text-xs text-slate-500 mt-1">
                                    {stall.description || 'Standard exhibition space'}
                                  </p>
                                  {stall.gridRow !== undefined && stall.gridCol !== undefined && (
                                    <p className="text-xs text-slate-400 mt-1">
                                      Position: Row {stall.gridRow}, Col {stall.gridCol}
                                    </p>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div>
                                  <span className="font-semibold text-slate-800">{stall.size}</span>
                                  {stall.type && (
                                    <span className={`block mt-1 text-xs font-bold px-2 py-1 rounded inline-block ${
                                      stall.type === 'Premium' 
                                        ? 'bg-purple-100 text-purple-700' 
                                        : stall.type === 'Corner Stall'
                                        ? 'bg-orange-100 text-orange-700'
                                        : 'bg-slate-100 text-slate-700'
                                    }`}>
                                      {stall.type}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full">
                                  {stall.businessCategory || 'General'}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="font-bold text-slate-900">
                                  Rs. {(stall.price || 0).toLocaleString()}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex flex-wrap gap-1.5">
                                  {stall.genres && stall.genres.length > 0 ? (
                                    <>
                                      {stall.genres.slice(0, 2).map(g => (
                                        <span key={g} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded border border-blue-100">
                                          {g}
                                        </span>
                                      ))}
                                      {stall.genres.length > 2 && (
                                        <span className="text-slate-400 text-xs">+{stall.genres.length - 2}</span>
                                      )}
                                    </>
                                  ) : (
                                    <span className="text-slate-400 italic text-xs">Not set</span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button
                                  onClick={() => handleEditClick(reservation, stall)}
                                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 transition-all"
                                >
                                  <PencilSquareIcon className="w-3.5 h-3.5" />
                                  Edit Genres
                                </button>
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

      <GenreModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveGenres}
        reservation={editingRes}
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
