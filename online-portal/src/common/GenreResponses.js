// AVAILABLE GENRES ---
export const MOCK_ALL_GENRES = {
  status: "success",
  data: [
    { id: 1, name: "Fiction" },
    { id: 2, name: "Non-Fiction" },
    { id: 3, name: "Science & Tech" },
    { id: 4, name: "Children's Books" },
    { id: 5, name: "Religious" },
    { id: 6, name: "History" },
    { id: 7, name: "Comics & Graphic Novels" },
    { id: 8, name: "Educational / Academic" },
  ],
};

export const MOCK_NO_GENRES = {
  status: "error",
  data: [],
};

//UPDATE SUCCESS
export const MOCK_UPDATE_GENRES_SUCCESS = {
  status: "success",
  message: "Genres updated successfully for this stall.",
};

export const MOCK_UPDATE_GENRES_FAILED = {
  status: "error",
  message: "Failed to update Genres for this stall.",
};
