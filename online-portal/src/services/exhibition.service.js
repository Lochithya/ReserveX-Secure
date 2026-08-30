import api from "./api";

export const getExhibitions = async (filters = {}) => {
  try {
    const { data } = await api.get("/exhibitions", { params: filters });
    return Array.isArray(data) ? data : [];
  } catch (error) {
    throw error?.response?.data?.message || "Unable to load exhibitions";
  }
};

export const getExhibition = async (id) => {
  try {
    const { data } = await api.get(`/exhibitions/${id}`);
    return data;
  } catch (error) {
    throw error?.response?.data?.message || "Unable to load the exhibition";
  }
};

export const getExhibitionStalls = async (id) => {
  try {
    const { data } = await api.get(`/exhibitions/${id}/stalls`);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    throw error?.response?.data?.message || "Unable to load exhibition stalls";
  }
};
