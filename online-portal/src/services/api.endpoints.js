export const ENDPOINTS = {
  GET_ALL_STALLS: "/stalls", // GET: /api/v1/stalls
  GET_BY_ID: "/stalls/", // GET: /api/v1/stalls/:id
  RESERVE: "/stalls/reserve", // POST: /api/v1/stalls/reserve
  LOGIN: "/auth/login", //POST : /api/v1/auth/login
  REGISTER: "/auth/register", //POST : api/v1/auth/register
  RESERVE: "/reserve",
  DASHBOARD: "/reservations/my-history",
  GET_ALL_GENRES: "/genres",
  UPDATE_GENRES: (id) => `/reservations/${id}/genres`,
};
