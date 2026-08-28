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
