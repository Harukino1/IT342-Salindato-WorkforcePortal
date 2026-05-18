import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../shared/hooks/useAuth';
import { formatDateTime } from '../../shared/utils/utils';
import '../dashboard/Dashboard.css'; // reuse base dashboard styles
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1_000);
    return () => clearInterval(timer);
  }, []);

  const NAV_ITEMS = [
    { id: 'dashboard', label: 'Team Overview' },
    { id: 'attendance', label: 'Attendance Log' },
    { id: 'leave', label: 'Leave Approvals' },
    { id: 'profile', label: 'Profile' },
    { id: 'settings', label: 'Settings' },
  ];

  const location = useLocation();

  const getActiveId = () => {
    const p = location.pathname;
    if (p.startsWith('/admin-attendance')) return 'attendance';
    if (p.startsWith('/admin-leave')) return 'leave';
    if (p.startsWith('/admin-profile')) return 'profile';
    if (p.startsWith('/admin-settings')) return 'settings';
    return 'dashboard';
  };

  const [enter, setEnter] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setEnter(true), 10);
    return () => {
      clearTimeout(t);
      setEnter(false);
    };
  }, [location.pathname]);

  const handleNavClick = (id) => {
    if (id === 'dashboard') navigate('/admin-dashboard', { replace: true });
    else if (id === 'attendance') navigate('/admin-attendance', { replace: true });
    else if (id === 'leave') navigate('/admin-leave', { replace: true });
    else if (id === 'profile') navigate('/admin-profile', { replace: true });
    else if (id === 'settings') navigate('/admin-settings', { replace: true });
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = async () => {
    await logout();
    navigate('/');
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <div className="dashboard admin-page">
      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to logout?</p>
            <div className="modal-buttons">
              <button className="btn-cancel" onClick={handleLogoutCancel}>Cancel</button>
              <button className="btn-confirm" onClick={handleLogoutConfirm}>Logout</button>
            </div>
          </div>
        </div>
      )}

      <aside className="sidebar">
        <div className="sidebar__brand">
          <span className="logo">WorkForce<br />Portal</span>
        </div>

        <nav className="nav">
          {NAV_ITEMS.map(({ id, label }) => (
            <button
              key={id}
              className={`nav-item ${id === getActiveId() ? 'nav-item--active' : ''}`}
              onClick={() => handleNavClick(id)}
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="sidebar__spacer" />
        <button className="sidebar__logout" onClick={handleLogoutClick}>Logout</button>
      </aside>

      <main className={`main ${enter ? 'enter' : ''}`}>
        <section className="admin-page-header">
          <h1 className="admin-page-title">Team Overview</h1>
          <div className="admin-header-meta">
            <span className="admin-header-tag">ADMIN</span>
            <span className="admin-page-datetime">{formatDateTime(currentTime)}</span>
          </div>
        </section>

        <section className="welcome-container admin-profile-card">
          <div className="avatar">👤</div>
          <div className="welcome-content">
            <h1>
              Welcome,
              <br />
              <span>{user?.lastName}, {user?.firstName}</span>
            </h1>
            <div className="admin-badge">ADMIN</div>
          </div>
        </section>

        <section className="content-stack admin-stats-stack">
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-title">Total Employees</div>
              <div className="stat-value">123</div>
            </div>
            <div className="stat-card">
              <div className="stat-title">Present Today</div>
              <div className="stat-value">99</div>
            </div>
            <div className="stat-card">
              <div className="stat-title">Leave Approvals</div>
              <div className="stat-value">4 pending</div>
            </div>
            <div className="stat-card">
              <div className="stat-title">Late Employees</div>
              <div className="stat-value">7 late this month</div>
            </div>
          </div>

          <div className="content-row bottom-row">
            <div className="card announcement admin-announcement">
              <h3>Announcement</h3>
              <div className="card-box">
                <textarea readOnly placeholder="No announcements yet." />
                <div style={{ textAlign: 'center', marginTop: '12px' }}>
                  <button className="dashboard-clock-in">Announce</button>
                </div>
              </div>
            </div>

            <div className="card recent-leave">
              <h3>Recent Leave Request</h3>
              <div className="card-box">
                <ul>
                  <li>John Smith — 2 days (Pending)</li>
                  <li>Mary Johnson — 1 day (Approved)</li>
                  <li>Alex Lee — 3 days (Pending)</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;

