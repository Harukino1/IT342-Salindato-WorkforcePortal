import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../dashboard/Dashboard.css';
import '../admin_dashboard/AdminDashboard.css';
import './AdminAttendance.css';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'attendance', label: 'Attendance' },
  { id: 'leave', label: 'Leave Request' },
  { id: 'profile', label: 'Profile' },
  { id: 'settings', label: 'Settings' },
];

const AdminAttendance = () => {
  const navigate = useNavigate();

  const stats = [
    { title: 'Present', value: 93 },
    { title: 'Absent', value: 12 },
    { title: 'Late', value: 7 },
    { title: 'Clocked-in', value: '102 of 123' },
  ];

  const rows = new Array(20).fill(0).map((_, i) => ({
    id: i + 1,
    name: `Employee ${i + 1}`,
    date: '2026-02-26',
    clockIn: '08:45',
    clockOut: '17:05',
    hours: '8:20',
    status: i % 6 === 0 ? 'Late' : 'Present',
  }));

  const handleNavClick = (id) => {
    if (id === 'dashboard') navigate('/dashboard');
    else if (id === 'attendance') navigate('/admin-attendance');
    else if (id === 'leave') navigate('/leave');
    else if (id === 'profile') navigate('/profile');
    else if (id === 'settings') navigate('/settings');
  };

  return (
    <div className="dashboard admin-page">
      <aside className="sidebar">
        <h2 className="logo">Workforce Portal</h2>

        <nav className="nav">
          {NAV_ITEMS.map(({ id, label }) => (
            <button key={id} className={`nav-item ${id === 'attendance' ? 'active' : ''}`} onClick={() => handleNavClick(id)}>
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
              Attendance
            </h1>
            <div className="admin-badge">ADMIN</div>
          </div>
        </section>

        <section className="content-stack admin-stats-stack">
          <div className="stats-row">
            {stats.map((s, idx) => (
              <div key={idx} className="stat-card">
                <div className="stat-title">{s.title}</div>
                <div className="stat-value">{s.value}</div>
              </div>
            ))}
          </div>

          <div className="bottom-row">
            <div className="card">
              <h3>Employee Attendance</h3>
              <div className="card-box attendance-table-wrap">
                <table className="attendance-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Date</th>
                      <th>Clocked in</th>
                      <th>Clocked Out</th>
                      <th>Hours</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(r => (
                      <tr key={r.id}>
                        <td>{r.name}</td>
                        <td>{r.date}</td>
                        <td>{r.clockIn}</td>
                        <td>{r.clockOut}</td>
                        <td>{r.hours}</td>
                        <td>{r.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card">
              <h3>Summary</h3>
              <div className="card-box">
                <p>Placeholder for admin controls or summary charts.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminAttendance;

