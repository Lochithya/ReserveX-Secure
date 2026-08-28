export const MOCK_MY_RESERVATIONS = {
  status: "success",
  data: [
    {
      reservation_id: 501,
      stall_name: "A-123",

      size: "medium",
      status: "Approved",
      genres: ["Fiction", "Science & Tech"],
    },
    {
      reservation_id: 502,
      stall_name: "B-05",

      size: "small",
      status: "Pending",
      genres: [],
    },
  ],
};

export const MOCK_NO_RESERVATIONS = {
  status: "success",
  message: "No reservations found",
  data: [], // The crucial part: An empty array
};
