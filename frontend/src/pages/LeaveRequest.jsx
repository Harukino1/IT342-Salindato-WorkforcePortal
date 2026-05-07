import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../components/LeaveRequest.css';

const LeaveRequest = () => {
  const navigate = useNavigate();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    leaveType: 'Vacation',
    startDate: '',
    endDate: '',
    body: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (formData.startDate && formData.endDate && formData.endDate < formData.startDate) {
      alert('End date cannot be earlier than start date.');
      return;
    }

    console.log("Submitting Leave Request:", formData);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/leaves', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const newRequest = await response.json();
        console.log("Leave created:", newRequest);
        // Reset form and close modal on success
        setIsModalOpen(false);
        setFormData({ subject: '', leaveType: 'Vacation', startDate: '', endDate: '', body: '' });
      } else {
        console.error("Failed to submit leave");
      }
    } catch (error) {
      console.error("Error submitting leave request:", error);
    }
  };

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
                <button className="submit-leave-btn" onClick={() => setIsModalOpen(true)}>Submit a Leave</button>
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

      {/* Leave Request Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Submit Leave Request</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleFormSubmit} className="leave-form">
              <div className="form-group">
                <label>Subject</label>
                <input 
                  type="text" 
                  name="subject" 
                  value={formData.subject} 
                  onChange={handleInputChange} 
                  required 
                  placeholder="e.g., Family Vacation"
                />
              </div>
              <div className="form-group">
                <label>Type of Leave</label>
                <select 
                  name="leaveType" 
                  value={formData.leaveType} 
                  onChange={handleInputChange} 
                  required
                >
                  <option value="Vacation">Vacation</option>
                  <option value="Sick">Sick</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="date-row">
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Body</label>
                <textarea 
                  name="body" 
                  value={formData.body} 
                  onChange={handleInputChange} 
                  required 
                  placeholder="Please provide details about your leave..."
                />
              </div>
              <button type="submit" className="submit-btn">Submit Request</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveRequest;
