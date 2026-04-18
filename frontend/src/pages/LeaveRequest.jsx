import React from 'react';
import '../components/LeaveRequest.css';

const LeaveRequest = () => {
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

  return (
    <div className="leave-container">
      {/* Sidebar - This might be a separate component in your actual app */}
      <aside className="sidebar">
        <h2>Workforce<br/>Portal</h2>
        <nav>
          <a href="/dashboard" className="nav-link">Dashboard</a>
          <a href="/attendance" className="nav-link">Attendance</a>
          <a href="/leave" className="nav-link active">Leave</a>
          <a href="/profile" className="nav-link">Profile</a>
          <a href="/settings" className="nav-link">Settings</a>
        </nav>
        <button className="logout-btn">Logout</button>
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
