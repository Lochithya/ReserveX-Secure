export const MOCK_LOGIN_SUCCESS = {
  status: "success",
  message: "Login successful",
  data: {
    token: "eyJhbGciOiJIUzI1Ni...", // Fake JWT
    user: {
      user_id: 101,
      business_name: "Saman Publishers", // Matches your DB
      email: "saman@example.com",
      roles: "VENDOR",
      no_of_current_bookings: 1,
    },
  },
};

export const MOCK_LOGIN_FAIL = {
  status: "error",
  message: "Invalid email or password",
  data: null,
};
