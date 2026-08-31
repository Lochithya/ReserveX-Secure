import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/login';
import Dashboard from "./pages/Dashboard";
import AdminProfile from "./pages/AdminProfile";
import ManageExhibitions from "./pages/ManageExhibitions";
import ManageStalls from "./pages/ManageStalls";
import ViewReservations from "./pages/ViewReservations";
import ManageVendors from "./pages/ManageVendors";
import StallMaps from "./pages/StallMaps";
import './App.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin-profile" element={<AdminProfile />} />
          <Route path="/exhibitions" element={<ManageExhibitions />} />
          <Route path="/stalls" element={<ManageStalls />} />
          <Route path="/reservations" element={<ViewReservations />} />
          <Route path="/vendors" element={<ManageVendors />} />
          <Route path="/stall-maps" element={<StallMaps />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;


