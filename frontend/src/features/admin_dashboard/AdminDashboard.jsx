import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../dashboard/Dashboard.css'; // reuse base dashboard styles
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'attendance', label: 'Attendance' },
    { id: 'leave', label: 'Leave Request' },
    { id: 'profile', label: 'Profile' },
    { id: 'settings', label: 'Settings' },
  ];

  const handleNavClick = (id) => {
    if (id === 'dashboard') navigate('/admin-dashboard', { replace: true });
    else if (id === 'attendance') navigate('/attendance', { replace: true });
    else if (id === 'leave') navigate('/leave', { replace: true });
    else if (id === 'profile') navigate('/profile', { replace: true });
    else if (id === 'settings') navigate('/settings', { replace: true });
  };

  // Sample static values for UI only
  const stats = {
    totalEmployees: 123,
    presentToday: 99,
    leavePending: 4,
    lateThisMonth: 7,
  };

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <h2 className="logo">Workforce Portal</h2>

        <nav className="nav">
          {NAV_ITEMS.map(({ id, label }) => (
            <button
              key={id}
              className={`nav-item ${id === 'dashboard' ? 'active' : ''}`}
              onClick={() => handleNavClick(id)}
            >
              {label}
            </button>
          ))}
        </nav>

        <button className="logout">Logout</button>
      </aside>

      <main className="main">
        <section className="welcome-container admin-profile-card">
          <div className="avatar">👤</div>
          <div className="welcome-content">
            <h1>
              Welcome,
              <br />
              <span>Doe, Jane</span>
            </h1>
            <div className="admin-badge">ADMIN</div>
          </div>
        </section>

        <section className="content-stack admin-stats-stack">
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-title">Total Employees</div>
              <div className="stat-value">{stats.totalEmployees}</div>
            </div>
            <div className="stat-card">
              <div className="stat-title">Present Today</div>
              <div className="stat-value">{stats.presentToday}</div>
            </div>
            <div className="stat-card">
              <div className="stat-title">Leave Request</div>
              <div className="stat-value">{stats.leavePending} pending</div>
            </div>
            <div className="stat-card">
              <div className="stat-title">Late Employees</div>
              <div className="stat-value">{stats.lateThisMonth} late this month</div>
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

