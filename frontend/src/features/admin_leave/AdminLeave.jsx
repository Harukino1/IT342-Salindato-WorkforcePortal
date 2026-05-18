import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../shared/hooks/useAuth';
import { formatDateTime } from '../../shared/utils/utils';
import '../dashboard/Dashboard.css';
import '../admin_dashboard/AdminDashboard.css';
import './AdminLeave.css';

const sampleRequests = new Array(6).fill(0).map((_, i) => ({
  id: i + 1,
  employee: ['John Doe', 'Mary Smith', 'Alex Lee', 'Nina Patel', 'Carlos M.', 'Sophia Z.'][i % 6],
  timestamp: 'February 26, 2026 | 10:56 PM',
  type: ['Sick', 'Vacation', 'Other'][i % 3],
  body: 'I would like to request leave for personal reasons. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras eget.',
}));

export default function AdminLeave() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [selectedId, setSelectedId] = useState(sampleRequests[0].id);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1_000);
    return () => clearInterval(timer);
  }, []);

  const selected = sampleRequests.find(r => r.id === selectedId) || sampleRequests[0];

  const NAV_ITEMS = [
    { id: 'dashboard', label: 'Team Overview' },
    { id: 'attendance', label: 'Attendance Log' },
    { id: 'leave', label: 'Leave Approvals' },
    { id: 'profile', label: 'Profile' },
    { id: 'settings', label: 'Settings' },
  ];

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
    return () => { clearTimeout(t); setEnter(false); };
  }, [location.pathname]);

  const handleNavClick = (id) => {
    if (id === 'dashboard') navigate('/admin-dashboard');
    else if (id === 'attendance') navigate('/admin-attendance');
    else if (id === 'leave') navigate('/admin-leave');
    else if (id === 'profile') navigate('/admin-profile');
    else if (id === 'settings') navigate('/admin-settings');
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
            <button key={id} className={`nav-item ${id === getActiveId() ? 'nav-item--active' : ''}`} onClick={() => handleNavClick(id)}>
              {label}
            </button>
          ))}
        </nav>

        <div className="sidebar__spacer" />
        <button className="sidebar__logout" onClick={handleLogoutClick}>Logout</button>
      </aside>

      <main className={`main ${enter ? 'enter' : ''}`}>
        <section className="admin-page-header">
          <h1 className="admin-page-title">Leave Approvals</h1>
          <div className="admin-header-meta">
            <span className="admin-header-tag">ADMIN</span>
            <span className="admin-page-datetime">{formatDateTime(currentTime)}</span>
          </div>
        </section>

        <section className="content-stack admin-leave-layout">
          <div className="requests-column">
            <div className="card">
              <h3>Requests</h3>
              <div className="card-box requests-list">
                {sampleRequests.map(r => (
                  <div key={r.id} className={`request-item ${r.id === selectedId ? 'request-item--active' : ''}`} onClick={() => setSelectedId(r.id)}>
                    <div className="request-item__title">{r.employee}</div>
                    <div className="request-item__meta">{r.type}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="detail-column">
            <div className="card">
              <h3>Employee</h3>
              <div className="card-box detail-box">
                <div className="detail-header">
                  <div>
                    <strong>{selected.employee}</strong>
                    <div className="detail-timestamp">{selected.timestamp}</div>
                  </div>
                  <div className="detail-type">Type: {selected.type}</div>
                </div>

                <div className="detail-body">
                  <textarea readOnly value={selected.body} />
                </div>

                <div className="detail-actions">
                  <button className="btn btn--reject">Reject</button>
                  <button className="btn btn--approve">Approve</button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

