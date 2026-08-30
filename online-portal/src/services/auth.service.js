import api from "./api";

// Simple mock-friendly auth helpers used by pages and AuthContext
const USE_MOCK = false;

export const loginUser = async (email, password) => {
  try {
    const res = await api.post("/auth/login", { email, password });
    const { token, type, ...userData } = res.data;
    if (token) {
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
    }
    return res.data;
  } catch (err) {
    console.error("loginUser error:", err);
    throw err?.response?.data?.message || "Login failed";
  }
};

export const registerUser = async (userData) => {
  try {
    const res = await api.post("/auth/register", {
      name: userData.name,
      username: userData.username,
      email: userData.email,
      contactNumber: userData.contact_number || userData.contactNumber,
      businessName: userData.business_name || userData.businessName,
      password: userData.password,
    });
    return res.data;
  } catch (err) {
    console.error("registerUser error:", err);
    throw err?.response?.data?.message || "Registration failed";
  }
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const getCurrentUser = async () => {
  try {
    const res = await api.get("/users/me");
    return res.data;
  } catch (err) {
    console.error("getCurrentUser error:", err);
    throw err?.response?.data?.message || "Failed to fetch user data";
  }
};
