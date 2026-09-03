import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import './App.css'

// Lazy load all pages for better performance
const Login = lazy(() => import('./pages/login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AdminProfile = lazy(() => import('./pages/AdminProfile'));
const ManageExhibitions = lazy(() => import('./pages/ManageExhibitions'));
const ManageStalls = lazy(() => import('./pages/ManageStalls'));
const ViewReservations = lazy(() => import('./pages/ViewReservations'));
const ManageVendors = lazy(() => import('./pages/ManageVendors'));
const StallMaps = lazy(() => import('./pages/StallMaps'));

// Loading component
const PageLoader = () => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: '#f5f7fa',
    color: '#374151'
  }}>
    <div style={{
      fontSize: '3rem',
      animation: 'spin 1s linear infinite'
    }}>
      ⏳
    </div>
    <p style={{ marginTop: '1rem', fontSize: '1.1rem', fontWeight: 600 }}>Loading...</p>
    <style>{`
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<PageLoader />}>
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
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;


