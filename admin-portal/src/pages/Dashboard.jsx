import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import { getDashboardStats, getAllExhibitions, getAllReservationsAdmin } from '../services/admin.service';
import { clearCache } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentExhibitions, setRecentExhibitions] = useState([]);
  const [recentReservations, setRecentReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
        // Clear cache to force fresh data
        clearCache();
      } else {
        setLoading(true);
      }
      
      const [statsData, exhibitionsData, reservationsData] = await Promise.all([
        getDashboardStats(),
        getAllExhibitions(),
        getAllReservationsAdmin()
      ]);

      setStats(statsData);
      setRecentExhibitions(exhibitionsData.slice(0, 5));
      setRecentReservations(reservationsData.slice(0, 8));
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }, []);

  const formatDate = useCallback((dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }, []);

  const getStatusColor = useCallback((status) => {
    const colors = {
      DRAFT: '#f59e0b',
      PUBLISHED: '#10b981',
      CLOSED: '#6b7280',
      CANCELLED: '#ef4444',
      PENDING: '#f59e0b',
      APPROVED: '#10b981',
      REJECTED: '#ef4444'
    };
    return colors[status] || '#6b7280';
  }, []);

  const occupancyRate = useMemo(() => {
    if (!stats || stats.totalStalls === 0) return 0;
    return Math.round((stats.reservedStalls / stats.totalStalls) * 100);
  }, [stats]);

  if (loading) {
    return (
      <div className="dashboard-page">
        <NavBar />
        <div className="dashboard-loading">
          <div className="loading-spinner-large">⏳</div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <NavBar />
      
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Admin Dashboard</h1>
            <p className="dashboard-subtitle">Welcome back! Here's what's happening across all exhibitions</p>
          </div>
          <button 
            onClick={() => fetchDashboardData(true)} 
            className={`refresh-btn ${refreshing ? 'loading' : ''}`}
            disabled={refreshing}
            title="Refresh"
          >
            <span className="refresh-icon">🔄</span>
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card purple">
            <div className="stat-content">
              <div className="stat-label">Total Exhibitions</div>
              <div className="stat-value">{stats?.totalExhibitions || 0}</div>
              <div className="stat-meta">
                {stats?.publishedExhibitions || 0} Published · {stats?.draftExhibitions || 0} Draft
              </div>
            </div>
            <div className="stat-icon">🏛️</div>
          </div>

          <div className="stat-card blue">
            <div className="stat-content">
              <div className="stat-label">Total Stalls</div>
              <div className="stat-value">{stats?.totalStalls || 0}</div>
              <div className="stat-meta">
                {stats?.availableStalls || 0} Available · {stats?.reservedStalls || 0} Reserved
              </div>
            </div>
            <div className="stat-icon">🏪</div>
          </div>

          <div className="stat-card green">
            <div className="stat-content">
              <div className="stat-label">Total Reservations</div>
              <div className="stat-value">{stats?.totalReservations || 0}</div>
              <div className="stat-meta">
                {stats?.reservedStalls || 0} stalls booked
              </div>
            </div>
            <div className="stat-icon">📋</div>
          </div>

          <div className="stat-card orange">
            <div className="stat-content">
              <div className="stat-label">Registered Vendors</div>
              <div className="stat-value">{stats?.totalVendors || 0}</div>
              <div className="stat-meta">
                Active users in system
              </div>
            </div>
            <div className="stat-icon">👥</div>
          </div>

          <div className="stat-card revenue">
            <div className="stat-content">
              <div className="stat-label">Total Revenue</div>
              <div className="stat-value">{formatCurrency(stats?.totalRevenue || 0)}</div>
              <div className="stat-meta">
                From all reservations
              </div>
            </div>
            <div className="stat-icon">💰</div>
          </div>

          <div className="stat-card teal">
            <div className="stat-content">
              <div className="stat-label">Occupancy Rate</div>
              <div className="stat-value">{occupancyRate}%</div>
              <div className="stat-meta">
                Overall booking rate
              </div>
            </div>
            <div className="stat-icon">📊</div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="content-grid">
          {/* Recent Exhibitions */}
          <div className="content-card">
            <div className="card-header-dash">
              <h2 className="card-title-dash">📅 Recent Exhibitions</h2>
              <button onClick={() => navigate('/exhibitions')} className="view-all-btn">
                View All →
              </button>
            </div>
            <div className="card-body-dash">
              {recentExhibitions.length === 0 ? (
                <div className="empty-message">No exhibitions yet</div>
              ) : (
                <div className="exhibitions-list">
                  {recentExhibitions.map(exhibition => (
                    <div key={exhibition.id} className="exhibition-item">
                      <div className="exhibition-info">
                        <div className="exhibition-name">{exhibition.name}</div>
                        <div className="exhibition-venue">📍 {exhibition.venueName}</div>
                        <div className="exhibition-dates">
                          {formatDate(exhibition.startDate)} - {formatDate(exhibition.endDate)}
                        </div>
                      </div>
                      <div className="exhibition-stats-mini">
                        <div 
                          className="status-dot" 
                          style={{ background: getStatusColor(exhibition.status) }}
                          title={exhibition.status}
                        />
                        <span className="mini-stat">{exhibition.totalStalls} stalls</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Reservations */}
          <div className="content-card">
            <div className="card-header-dash">
              <h2 className="card-title-dash">🎫 Recent Reservations</h2>
              <button onClick={() => navigate('/reservations')} className="view-all-btn">
                View All →
              </button>
            </div>
            <div className="card-body-dash">
              {recentReservations.length === 0 ? (
                <div className="empty-message">No reservations yet</div>
              ) : (
                <div className="reservations-list">
                  {recentReservations.map(reservation => (
                    <div key={reservation.id} className="reservation-item">
                      <div className="reservation-info">
                        <div className="reservation-vendor">{reservation.vendorName}</div>
                        <div className="reservation-details">
                          {reservation.exhibitionName} · {reservation.noOfStalls} stall(s)
                        </div>
                        <div className="reservation-date">
                          {formatDate(reservation.reservationDate)}
                        </div>
                      </div>
                      <div
                        className="reservation-status"
                        style={{ 
                          background: getStatusColor(reservation.status),
                          color: 'white'
                        }}
                      >
                        {reservation.status}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h2 className="section-title">⚡ Quick Actions</h2>
          <div className="actions-grid">
            <button onClick={() => navigate('/exhibitions')} className="action-btn">
              <span className="action-icon">➕</span>
              <span className="action-text">Create Exhibition</span>
            </button>
            <button onClick={() => navigate('/stalls')} className="action-btn">
              <span className="action-icon">🏪</span>
              <span className="action-text">Manage Stalls</span>
            </button>
            <button onClick={() => navigate('/reservations')} className="action-btn">
              <span className="action-icon">📋</span>
              <span className="action-text">View Reservations</span>
            </button>
            <button onClick={() => navigate('/vendors')} className="action-btn">
              <span className="action-icon">👥</span>
              <span className="action-text">Manage Vendors</span>
            </button>
            <button onClick={() => navigate('/stall-maps')} className="action-btn">
              <span className="action-icon">🗺️</span>
              <span className="action-text">View Stall Maps</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
