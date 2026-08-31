import API from "./api";

/**
 * Get all stalls with availability (for employee portal).
 */
export const getAllStalls = async () => {
  const { data } = await API.get("/admin/stalls");
  return data;
};

/**
 * Get all reservations (for employee portal).
 */
export const getAllReservations = async () => {
  const { data } = await API.get("/admin/reservations");
  return data;
};

// ============ Dashboard APIs ============
export const getDashboardStats = async () => {
  const { data } = await API.get("/admin/dashboard/stats");
  return data;
};

// ============ Exhibition APIs ============
export const getAllExhibitions = async () => {
  const { data } = await API.get("/admin/exhibitions");
  return data;
};

export const getExhibitionById = async (id) => {
  const { data } = await API.get(`/admin/exhibitions/${id}`);
  return data;
};

export const createExhibition = async (exhibitionData) => {
  const { data } = await API.post("/admin/exhibitions", exhibitionData);
  return data;
};

export const updateExhibition = async (id, exhibitionData) => {
  const { data } = await API.put(`/admin/exhibitions/${id}`, exhibitionData);
  return data;
};

export const deleteExhibition = async (id) => {
  const { data } = await API.delete(`/admin/exhibitions/${id}`);
  return data;
};

export const getAllVenues = async () => {
  const { data } = await API.get("/admin/venues");
  return data;
};

// ============ Stall APIs ============
export const getAllStallsAdmin = async () => {
  const { data } = await API.get("/admin/stalls/all");
  return data;
};

export const getStallsByExhibition = async (exhibitionId) => {
  const { data } = await API.get(`/admin/stalls/exhibition/${exhibitionId}`);
  return data;
};

export const getStallById = async (id) => {
  const { data } = await API.get(`/admin/stalls/${id}`);
  return data;
};

export const createStall = async (stallData) => {
  const { data } = await API.post("/admin/stalls", stallData);
  return data;
};

export const updateStall = async (id, stallData) => {
  const { data } = await API.put(`/admin/stalls/${id}`, stallData);
  return data;
};

export const deleteStall = async (id) => {
  const { data } = await API.delete(`/admin/stalls/${id}`);
  return data;
};

// ============ Reservation APIs ============
export const getAllReservationsAdmin = async () => {
  const { data } = await API.get("/admin/reservations/all");
  return data;
};

export const getReservationsByExhibition = async (exhibitionId) => {
  const { data } = await API.get(`/admin/reservations/exhibition/${exhibitionId}`);
  return data;
};

export const getReservationById = async (id) => {
  const { data } = await API.get(`/admin/reservations/${id}`);
  return data;
};

export const updateReservationStatus = async (id, status) => {
  const { data } = await API.patch(`/admin/reservations/${id}/status`, { status });
  return data;
};

export const deleteReservation = async (id) => {
  const { data } = await API.delete(`/admin/reservations/${id}`);
  return data;
};

// ============ Vendor APIs ============
export const getAllVendors = async () => {
  const { data } = await API.get("/admin/vendors");
  return data;
};

export const getVendorById = async (id) => {
  const { data } = await API.get(`/admin/vendors/${id}`);
  return data;
};

export const getVendorReservations = async (id) => {
  const { data } = await API.get(`/admin/vendors/${id}/reservations`);
  return data;
};
