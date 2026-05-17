import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../dashboard/Dashboard.css';
import '../admin_dashboard/AdminDashboard.css';
import './AdminLeave.css';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'attendance', label: 'Attendance' },
  { id: 'leave', label: 'Leave Request' },
  { id: 'profile', label: 'Profile' },
  { id: 'settings', label: 'Settings' },
];

const sampleRequests = new Array(6).fill(0).map((_, i) => ({
  id: i + 1,
  employee: ['John Doe', 'Mary Smith', 'Alex Lee', 'Nina Patel', 'Carlos M.', 'Sophia Z.'][i % 6],
  timestamp: 'February 26, 2026 | 10:56 PM',
  type: ['Sick', 'Vacation', 'Other'][i % 3],
  body: 'I would like to request leave for personal reasons. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras eget.',
}));

export default function AdminLeave() {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState(sampleRequests[0].id);

  const selected = sampleRequests.find(r => r.id === selectedId) || sampleRequests[0];

  const handleNavClick = (id) => {
    if (id === 'dashboard') navigate('/dashboard');
    else if (id === 'attendance') navigate('/admin-attendance');
    else if (id === 'leave') navigate('/admin-leave');
    else if (id === 'profile') navigate('/profile');
    else if (id === 'settings') navigate('/settings');
  };

  return (
    <div className="dashboard admin-page">
      <aside className="sidebar">
        <h2 className="logo">Workforce Portal</h2>

        <nav className="nav">
          {NAV_ITEMS.map(({ id, label }) => (
            <button key={id} className={`nav-item ${id === 'leave' ? 'active' : ''}`} onClick={() => handleNavClick(id)}>
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
            <h1>Leave Requests</h1>
            <div className="admin-badge">ADMIN</div>
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

