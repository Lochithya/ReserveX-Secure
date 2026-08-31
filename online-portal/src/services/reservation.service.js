import api from "./api";

/**
 * Create reservations for selected stalls within an exhibition.
 * @param {Array} selectedStalls - Array of stall objects or IDs
 * @param {number} exhibitionId - The exhibition ID for context
 * @param {Object} stallBusinessCategories - Map of stallId -> businessCategory
 * @param {string} specialRequirements - Special requirements text
 */
export const createReservation = async (
  selectedStalls, 
  exhibitionId, 
  stallBusinessCategories = {}, 
  specialRequirements = ''
) => {
  const stallIds = (selectedStalls || []).map((s) => s?.id ?? s?.stall_id ?? s);

  if (stallIds.length === 0) {
    throw new Error("No stalls selected for reservation");
  }

  try {
    const payload = {
      stall_ids: stallIds,
      exhibition_id: exhibitionId,
      stall_business_categories: stallBusinessCategories,
      special_requirements: specialRequirements || null
    };

    console.log("Creating reservation with payload:", payload);

    const res = await api.post("/reservations", payload);
    
    console.log("Reservation response:", res.data);
    
    return res.data;
  } catch (err) {
    console.error("createReservation error:", err);
    console.error("Error response:", err?.response?.data);
    throw err?.response?.data?.message || err.message || "Failed to create reservation";
  }
};

export const getMyReservations = async () => {
  try {
    console.log("Calling /reservations/my endpoint...");
    const res = await api.get("/reservations/my");
    console.log("getMyReservations response:", res.data);
    return res.data || [];
  } catch (err) {
    console.error("getMyReservations error:", err);
    console.error("Error response:", err?.response);
    
    // If it's a 401 or authentication error, throw that specifically
    if (err?.response?.status === 401 || err?.response?.data?.message?.includes?.("authentication")) {
      throw "Full authentication is required. Please login again.";
    }
    
    throw err?.response?.data?.message || err.message || "Failed to fetch reservations";
  }
};

export const updateReservationGenres = async (genrePayload) => {
  try {
    const { data } = await api.put(`/genres`, genrePayload);
    return data;
  } catch (err) {
    throw err?.response?.data?.message || "Failed to update genres";
  }
};

export const updateStallDetails = async (stallId, reservationId, businessCategory, genres) => {
  try {
    const { data } = await api.put(`/reservations/${reservationId}/stall/${stallId}`, {
      businessCategory,
      genres
    });
    return data;
  } catch (err) {
    throw err?.response?.data?.message || "Failed to update stall details";
  }
};