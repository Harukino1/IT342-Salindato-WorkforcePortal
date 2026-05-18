import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/hooks/useAuth';
import '../dashboard/Dashboard.css';
import '../admin_dashboard/AdminDashboard.css';
import '../../features/settings/Setting.css';

export default function AdminSettings() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'attendance', label: 'Attendance' },
    { id: 'leave', label: 'Leave' },
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

  const handleNavClick = (id) => {
    if (id === 'dashboard') navigate('/admin-dashboard');
    else if (id === 'attendance') navigate('/admin-attendance');
    else if (id === 'leave') navigate('/admin-leave');
    else if (id === 'profile') navigate('/admin-profile');
    else if (id === 'settings') navigate('/admin-settings');
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 800);
  };

  return (
    <div className="shell admin-page">
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
        <div className="sidebar__brand"><span className="logo">WorkForce Portal</span></div>
        <div className="nav">
          {NAV_ITEMS.map(({ id, label }) => (
            <div key={id} className={`nav-item ${id === 'settings' ? 'nav-item--active' : ''}`} onClick={() => handleNavClick(id)}>{label}</div>
          ))}
        </div>
        <div className="sidebar__spacer" />
        <button className="sidebar__logout" onClick={handleLogoutClick}>Logout</button>
      </aside>

      <main className="main">
        <div className="content">
          <div className="page-header"><h1 className="page-title">Settings</h1></div>

          <div className="card settings-card">
            <div className="settings-card__inner">
              <div className="form-row">
                <div className="form-group">
                  <label>Old Password</label>
                  <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} placeholder="Enter old password" />
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Enter new password" />
                </div>
              </div>

              <div className="settings-actions">
                <button className="btn-confirm" onClick={handleSave} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

