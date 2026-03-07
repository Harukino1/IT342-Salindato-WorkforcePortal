import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../components/Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/');
        return;
      }

      try{
        const response = await axios.get('http://localhost:8080/api/auth/user/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
        localStorage.removeItem('token');
        navigate('/');
      }finally{
        setLoading(false);
      }
    };
    fetchUserData();
  }, [navigate]);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = async () => {
    const token = localStorage.getItem('token');
    
    try{
      await axios.post('http://localhost:8080/api/auth/logout', {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    }catch (error) {
      console.error('Error during logout:', error);
    }finally {
      localStorage.removeItem('token');
      navigate('/');
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard">
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

      {/* Sidebar */}
      <aside className="sidebar">
        <h2 className="logo">WorkForce Portal</h2>

        <nav className="nav">
          <button className="nav-item active">Dashboard</button>
          <button className="nav-item">Attendance</button>
          <button className="nav-item">Schedule</button>
          <button className="nav-item">Leave</button>
          <button className="nav-item">Settings</button>
        </nav>

        <button className="logout" onClick={handleLogoutClick}>Logout</button>
      </aside>

      {/* Main */}
      <main className="main">
        {/* Welcome Header Container */}
        <section className="welcome-container">
          <div className="avatar">👤</div>
          <h1>
            Welcome,<br />
            <span>{user?.lastName}, {user?.firstName}</span>
          </h1>
        </section>

        {/* Content */}
        <section className="content">
          {/* Announcement Board */}
          <div className="card announcement">
            <h3>Announcement Board</h3>
            <div className="card-box">
              <p>No announcements yet.</p>
              <p>Solomon 4:7</p>
              <p>"You are altogether beautiful, my love; there is no flaw in you</p>
            </div>
          </div>

          {/* Activity Log */}
          <div className="card activity">
            <h3>Activity Log</h3>
            <div className="card-box">
              <ul>
                <li>Wakey Wakey</li>
                <li>It's time for school</li>
                <li>C'mon wake up!</li>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;