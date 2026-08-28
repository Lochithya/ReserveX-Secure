// REGISTER SUCCESS
export const MOCK_REGISTER_SUCCESS = {
  status: "success",
  message: "Registration successful! Please login to continue.",
  data: { user_id: 102 }, // Backend usually returns the new ID
};

//REGISTER FAILURE (Email exists)
export const MOCK_REGISTER_FAIL = {
  status: "error",
  message: "This email is already registered.",
  data: null,
};
