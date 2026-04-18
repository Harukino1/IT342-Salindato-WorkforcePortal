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
    <div className="leave-container">
      {/* Sidebar - This might be a separate component in your actual app */}
      <aside className="sidebar">
        <h2>Workforce<br/>Portal</h2>
        <nav>
          <button className="nav-link" onClick={() => navigate('/dashboard')}>Dashboard</button>
          <button className="nav-link" onClick={() => navigate('/attendance')}>Attendance</button>
          <button className="nav-link active">Leave</button>
          <button className="nav-link" onClick={() => navigate('/profile')}>Profile</button>
          <button className="nav-link" onClick={() => navigate('/settings')}>Settings</button>
        </nav>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {/* Header */}
        <header className="page-header">
          <h1>Leaves</h1>
          <span className="date-time">{currentDate}</span>
        </header>

        {/* Leave Balance Section */}
        <section className="section-container">
          <div className="balance-header">
            <h3>Leave Balance</h3>
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

        {/* Pending Request Section */}
        <section className="section-container">
          <div className="table-header">
            <h3>Pending Request</h3>
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
              {/* Placeholder row matching the mockup */}
              <tr className="table-row">
                <td><div className="placeholder-pill"></div></td>
                <td><div className="placeholder-pill"></div></td>
                <td><div className="placeholder-pill"></div></td>
                <td><div className="placeholder-pill"></div></td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Recent Leaves Section */}
        <section className="section-container">
          <div className="table-header">
            <h3>Recent Leaves</h3>
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
              {/* Placeholder row matching the mockup */}
              <tr className="table-row">
                <td><div className="placeholder-pill"></div></td>
                <td><div className="placeholder-pill"></div></td>
                <td><div className="placeholder-pill"></div></td>
                <td><div className="placeholder-pill"></div></td>
              </tr>
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
};

export default LeaveRequest;
