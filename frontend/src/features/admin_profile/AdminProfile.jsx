import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../shared/hooks/useAuth';
import '../dashboard/Dashboard.css';
import '../admin_dashboard/AdminDashboard.css';
import '../../features/profile/Profile.css';

export default function AdminProfile() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Static placeholder user (UI-only)
  const [formData, setFormData] = useState({
    firstName: 'Doe',
    lastName: 'Jane',
    phoneNumber: '+1 (555) 123-4567'
  });

  const NAV_ITEMS = [
    { id: 'dashboard', label: 'Team Overview' },
    { id: 'attendance', label: 'Attendance Log' },
    { id: 'leave', label: 'Leave Approvals' },
    { id: 'profile', label: 'Profile' },
    { id: 'settings', label: 'Settings' }
  ];

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="shell profile-page admin-page">
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
            <button key={id} className={`nav-item ${id === getActiveId() ? 'nav-item--active' : ''}`} onClick={() => handleNavClick(id)}>{label}</button>
          ))}
        </nav>
        <div className="sidebar__spacer" />
        <button className="sidebar__logout" onClick={handleLogoutClick}>Logout</button>
      </aside>

      <main className={`main ${enter ? 'enter' : ''}`}>
        <div className="content">
          <div className="page-header"><h1 className="page-title">Profile</h1></div>

          <div className="profile-card">
            <div className="avatar-section">
              {isEditing && (
                <div className="avatar-actions">
                  <label className="btn btn-upload">Upload New<input type="file" style={{display:'none'}} /></label>
                  <button className="btn btn-remove">Remove Avatar</button>
                </div>
              )}
            </div>

            <div className="profile-info">
              <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input name="firstName" value={formData.firstName} onChange={handleInputChange} disabled={!isEditing} className="form-input" />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input name="lastName" value={formData.lastName} onChange={handleInputChange} disabled={!isEditing} className="form-input" />
                </div>
              </div>

              <div className="form-row full-width">
                <div className="form-group full-width">
                  <label>Phone Number</label>
                  <input name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} disabled={!isEditing} className="form-input" />
                </div>
              </div>

              <div className="profile-actions">
                {!isEditing ? (
                  <button className="btn btn-primary" onClick={() => setIsEditing(true)}>Edit Profile</button>
                ) : (
                  <>
                    <button className="btn btn-primary" onClick={() => { setIsSaving(true); setTimeout(()=>setIsSaving(false),800); setIsEditing(false); }}>{isSaving ? 'Saving...' : 'Save Changes'}</button>
                    <button className="btn btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
