// --- 1. SUCCESS SCENARIO  ---
// Use this to test the Map Grid, Selection, and Tooltips
export const MOCK_SUCCESS = {
  status: "success",
  message: "Stalls fetched successfully",
  data: [
    // --- LARGE STALLS ---
    {
      id: "L1",
      size: "Large",
      gridRow: 2,
      gridCol: 2,
      price: 25000,
      isConfirmed: 0, // Available
      description: "Premium corner spot with high visibility.",
    },
    {
      id: "L2",
      size: "Large",
      gridRow: 2,
      gridCol: 14,
      price: 25000,
      isConfirmed: 1, // Reserved (Gray)
      description: "Large space near the main entrance.",
    },

    // --- MEDIUM STALLS ---
    {
      id: "M1",
      size: "Medium",
      gridRow: 5,
      gridCol: 5,
      price: 15000,
      isConfirmed: 0,
      description: "Standard booth near the food court.",
    },
    {
      id: "M2",
      size: "Medium",
      gridRow: 5,
      gridCol: 10,
      price: 15000,
      isConfirmed: 0,
      description: "Central aisle location.",
    },

    // --- SMALL STALLS ---
    {
      id: "S1",
      size: "Small",
      gridRow: 8,
      gridCol: 3,
      price: 5000,
      isConfirmed: 0,
      description: "Budget-friendly start-up stall.",
    },
    {
      id: "S2",
      size: "Small",
      gridRow: 8,
      gridCol: 4,
      price: 5000,
      isConfirmed: 1,
      description: "Compact space for quick sales.",
    },
  ],
};

// --- 2. EMPTY SCENARIO (No Stalls Found) ---
// Use this to test the "No Stalls Found" UI (🛖 icon)
export const MOCK_EMPTY = {
  status: "success",
  message: "No active stalls found for this event",
  data: [], // Empty Array
};

// --- 3. ERROR SCENARIO (Backend Crash) ---
// Use this to test your 'catch' block and Error Alert
export const MOCK_ERROR = {
  status: "error",
  code: 500,
  message: "Database connection failed: Timeout connecting to MySQL",
  data: null,
};

// --- 4. NETWORK ERROR (Server Offline) ---
// Use this to simulate when the backend is completely down
export const MOCK_NETWORK_FAIL = null; // Represents a failed fetch request
