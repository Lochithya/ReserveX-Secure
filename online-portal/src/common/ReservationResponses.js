//RESERVATION SUCCESS
export const MOCK_RESERVATION_SUCCESS = {
  status: "success",
  message: "Reservation confirmed! QR Code sent to your email.",
  data: {
    reservation_ids: [501, 502], // IDs of the new bookings
    total_amount: 75000,
  },
};

//RESERVATION FAIL (Race Condition)
export const MOCK_RESERVATION_FAIL = {
  status: "error",
  message: "One or more stalls were just taken by another user.",
  data: null,
};
