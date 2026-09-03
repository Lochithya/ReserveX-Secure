import React, { useContext, useState, memo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './NavBar.css';
import { AuthContext } from '../contexts/AuthContext';
import LogoutConfirmModal from './LogoutConfirmModal';

const NavBar = memo(() => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  const isDashboard = location.pathname === '/dashboard';
  const isExhibitions = location.pathname === '/exhibitions';
  const isStalls = location.pathname === '/stalls';
  const isReservations = location.pathname === '/reservations';
  const isVendors = location.pathname === '/vendors';
  const isStallMaps = location.pathname === '/stall-maps';
  const isAdminProfile = location.pathname === '/admin-profile';

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    logout();
    setShowLogoutModal(false);
    navigate('/');
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <nav className="admin-navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          <img src="/logo.jpeg" alt="Logo" className="navbar-logo" />
          <div className="navbar-brand">
            <h1 className="navbar-title reservex-title">ReserveX</h1>
            <div className="navbar-subtitle">ADMIN PORTAL</div>
          </div>
        </div>
        <div className="navbar-right">
          <Link
            to="/dashboard"
            className={`navbar-item ${isDashboard ? 'active-page' : ''}`}
          >
            <span className="navbar-text-two-lines">
              <span className="navbar-text-line1">Dashboard</span>
              <span className="navbar-text-line2">Overview</span>
            </span>
          </Link>
          <Link
            to="/exhibitions"
            className={`navbar-item ${isExhibitions ? 'active-page' : ''}`}
          >
            <span className="navbar-text-two-lines">
              <span className="navbar-text-line1">Manage</span>
              <span className="navbar-text-line2">Exhibitions</span>
            </span>
          </Link>
          <Link
            to="/stalls"
            className={`navbar-item ${isStalls ? 'active-page' : ''}`}
          >
            <span className="navbar-text-two-lines">
              <span className="navbar-text-line1">Manage</span>
              <span className="navbar-text-line2">Stalls</span>
            </span>
          </Link>
          <Link
            to="/reservations"
            className={`navbar-item ${isReservations ? 'active-page' : ''}`}
          >
            <span className="navbar-text-two-lines">
              <span className="navbar-text-line1">View</span>
              <span className="navbar-text-line2">Reservations</span>
            </span>
          </Link>
          <Link
            to="/vendors"
            className={`navbar-item ${isVendors ? 'active-page' : ''}`}
          >
            <span className="navbar-text-two-lines">
              <span className="navbar-text-line1">Manage</span>
              <span className="navbar-text-line2">Vendors</span>
            </span>
          </Link>
          <Link
            to="/stall-maps"
            className={`navbar-item ${isStallMaps ? 'active-page' : ''}`}
          >
            <span className="navbar-text-two-lines">
              <span className="navbar-text-line1">Stall</span>
              <span className="navbar-text-line2">Maps</span>
            </span>
          </Link>
          <Link
            to="/admin-profile"
            className={`navbar-item ${isAdminProfile ? 'active-page' : ''}`}
          >
            <span className="navbar-text-two-lines">
              <span className="navbar-text-line1">Admin</span>
              <span className="navbar-text-line2">Profile</span>
            </span>
          </Link>
          <div className="navbar-spacer" />
          <div className="navbar-user-and-logout">
          <div className="navbar-user-pill">
            <div className="navbar-user-avatar">
              {(user?.username || user?.sub || user?.email || 'A')
                .charAt(0)
                .toUpperCase()}
            </div>
            <div className="navbar-user-meta">
              <span className="navbar-user-label">Signed in as</span>
              <span className="navbar-user-name">
                {user?.username || user?.sub || user?.email || 'Admin'}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogoutClick}
            className="navbar-logout-btn"
            title="Sign Out"
          >
            <svg 
              style={{ width: '1.125rem', height: '1.125rem' }} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onCancel={handleCancelLogout}
        onConfirm={handleConfirmLogout}
      />
    </nav>
  );
});

NavBar.displayName = 'NavBar';

export default NavBar;