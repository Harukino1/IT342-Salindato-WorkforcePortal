import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../components/LeaveRequest.css';

const LeaveRequest = () => {
  const navigate = useNavigate();

  // Format current date similar to the mockup
  const currentDate = new Date().toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="leave-page shell">
      <aside className="sidebar">
        <div className="sidebar__brand">
          <span className="logo">WorkForce<br />Portal</span>
        </div>

        <div className="nav">
          <div className="nav-item" onClick={() => navigate('/dashboard')} role="button">Dashboard</div>
          <div className="nav-item" onClick={() => navigate('/attendance')} role="button">Attendance</div>
          <div className="nav-item nav-item--active" role="button" aria-current="page">Leave</div>
          <div className="nav-item" onClick={() => navigate('/profile')} role="button">Profile</div>
          <div className="nav-item" onClick={() => navigate('/settings')} role="button">Settings</div>
        </div>

        <div className="sidebar__spacer" />

        <button className="sidebar__logout" onClick={handleLogout}>Logout</button>
      </aside>

      <main className="main">
        <div className="content">
          <div className="page-header">
            <h1 className="page-title">Leave Request</h1>
            <span className="page-datetime">{currentDate}</span>
          </div>

          <div className="top-row">
            <section className="card">
              <div className="balance-header">
                <h3 className="card__title">Leave Balance</h3>
                <button className="submit-leave-btn">Submit a Leave</button>
              </div>
              <div className="balance-cards">
                <div className="balance-card">
                  <h4>Vacation</h4>
                  <p>5 days</p>
                </div>
                <div className="balance-card">
                  <h4>Sick</h4>
                  <p>5 days</p>
                </div>
                <div className="balance-card">
                  <h4>Other</h4>
                  <p>5 days</p>
                </div>
              </div>
            </section>
          </div>

          <div className="bottom-row">
            <section className="card">
              <div className="table-header">
                <h3 className="card__title">Pending Request</h3>
              </div>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Dates</th>
                    <th>Days</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="table-row">
                    <td><div className="placeholder-pill"></div></td>
                    <td><div className="placeholder-pill"></div></td>
                    <td><div className="placeholder-pill"></div></td>
                    <td><div className="placeholder-pill"></div></td>
                  </tr>
                </tbody>
              </table>
            </section>

            <section className="card">
              <div className="table-header">
                <h3 className="card__title">Recent Leaves</h3>
              </div>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Dates</th>
                    <th>Days</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="table-row">
                    <td><div className="placeholder-pill"></div></td>
                    <td><div className="placeholder-pill"></div></td>
                    <td><div className="placeholder-pill"></div></td>
                    <td><div className="placeholder-pill"></div></td>
                  </tr>
                </tbody>
              </table>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LeaveRequest;
