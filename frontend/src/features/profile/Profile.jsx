import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../shared/hooks/useAuth';
import './Profile.css';

const Profile = () => {
    const navigate = useNavigate();
    const { user, token, logout } = useAuth();
    const [loading, setLoading] = useState(true);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [activeNav, setActiveNav] = useState('profile');
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [formError, setFormError] = useState('');

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        avatar: null
    });

    const [originalFormData, setOriginalFormData] = useState({
        firstName: '',
        lastName: '',
        phoneNumber: ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                phoneNumber: user.phoneNumber || '',
                avatar: null
            });
            setOriginalFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                phoneNumber: user.phoneNumber || ''
            });
            setLoading(false);
        }
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
                setFormData(prev => ({
                    ...prev,
                    avatar: file
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveAvatar = () => {
        setAvatarPreview(null);
        setFormData(prev => ({
            ...prev,
            avatar: null
        }));
    };

    const handleSaveChanges = async () => {
        if (!token) {
            navigate('/');
            return;
        }

        try {
            setFormError('');
            setIsSaving(true);

            let response;

            // If user provided an avatar file, send multipart/form-data
            if (formData.avatar) {
                const data = new FormData();
                data.append('firstName', formData.firstName);
                data.append('lastName', formData.lastName);
                data.append('phoneNumber', formData.phoneNumber);
                data.append('avatar', formData.avatar);

                response = await axios.put('http://localhost:8080/api/auth/user/profile', data, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                });
            } else {
                // Send JSON when there's no file (some backends expect this)
                const payload = {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    phoneNumber: formData.phoneNumber,
                };
                response = await axios.put('http://localhost:8080/api/auth/user/profile', payload, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
            }

            setOriginalFormData({
                firstName: response.data.firstName || '',
                lastName: response.data.lastName || '',
                phoneNumber: response.data.phoneNumber || ''
            });

            if (response.data.avatarUrl) {
                setAvatarPreview(response.data.avatarUrl);
            }

            setIsEditing(false);
            setFormData(prev => ({
                ...prev,
                avatar: null
            }));
        } catch (error) {
            // Build a helpful error message for debugging
            console.error('Error saving profile:', error);
            const status = error.response?.status;
            const serverMessage = error.response?.data?.message || error.response?.data || error.message;
            const alertMsg = `Error saving profile${status ? ` (status ${status})` : ''}.\n${serverMessage}`;
            alert(alertMsg);
            setFormError(serverMessage?.toString() || 'Error saving profile.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            firstName: originalFormData.firstName,
            lastName: originalFormData.lastName,
            phoneNumber: originalFormData.phoneNumber,
            avatar: null
        });
        setAvatarPreview(user?.avatarUrl || null);
        setIsEditing(false);
    };

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
        setActiveNav(id);
        if (id === 'dashboard') {
            navigate('/dashboard', { replace: true });
        } else if (id === 'attendance') {
            navigate('/attendance', { replace: true });
        } else if (id === 'leave') {
            navigate('/leave', { replace: true });
        } else if (id === 'profile') {
            // Stay on profile page
        } else if (id === 'settings') {
            navigate('/settings', { replace: true });
        }
    };

    if (loading) {
        return <div className="profile-loading">Loading...</div>;
    }

    const NAV_ITEMS = [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'attendance', label: 'Attendance' },
        { id: 'leave', label: 'Leave' },
        { id: 'profile', label: 'Profile' },
        { id: 'settings', label: 'Settings' }
    ];

    return (
        <div className="shell profile-page">
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
                <div className="sidebar__brand">
                    <span className="logo">WorkForce Portal</span>
                </div>

                <div className="nav">
                    {NAV_ITEMS.map(({ id, label }) => (
                        <div
                            key={id}
                            className={`nav-item ${activeNav === id ? 'nav-item--active' : ''}`}
                            onClick={() => handleNavClick(id)}
                            role="button"
                            aria-current={activeNav === id ? 'page' : undefined}
                        >
                            {label}
                        </div>
                    ))}
                </div>

                <div className="sidebar__spacer" />

                <button className="sidebar__logout" type="button" onClick={handleLogoutClick}>
                    Logout
                </button>
            </aside>

            {/* Main Content */}
            <main className="main">
                <div className="content">
                    {/* Page Header */}
                    <div className="page-header">
                        <h1 className="page-title">Profile</h1>
                    </div>

                    {/* Profile Card */}
                    <div className="profile-card">
                        {/* Avatar Section */}
                        <div className="avatar-section">
                            <div className="avatar-container">
                                {avatarPreview ? (
                                    <img src={avatarPreview} alt="Profile Avatar" className="avatar-image" />
                                ) : (
                                    <div className="avatar-placeholder">👤</div>
                                )}
                            </div>

                            {isEditing && (
                                <div className="avatar-actions">
                                    <label className="btn btn-upload">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleAvatarChange}
                                            style={{ display: 'none' }}
                                        />
                                        Upload New
                                    </label>
                                    {avatarPreview && (
                                        <button
                                            className="btn btn-remove"
                                            onClick={handleRemoveAvatar}
                                        >
                                            Remove Avatar
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Profile Information Section */}
                        <div className="profile-info">
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="firstName">First Name</label>
                                    <input
                                        type="text"
                                        id="firstName"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className="form-input"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="lastName">Last Name</label>
                                    <input
                                        type="text"
                                        id="lastName"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className="form-input"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group full-width">
                                    <label htmlFor="phoneNumber">Phone Number</label>
                                    <input
                                        type="tel"
                                        id="phoneNumber"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className="form-input"
                                    />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="profile-actions">
                                {!isEditing ? (
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => setIsEditing(true)}
                                    >
                                        Edit Profile
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            className="btn btn-primary"
                                            onClick={handleSaveChanges}
                                            disabled={isSaving}
                                        >
                                            {isSaving ? 'Saving...' : 'Save Changes'}
                                        </button>
                                        <button
                                            className="btn btn-secondary"
                                            onClick={handleCancel}
                                            disabled={isSaving}
                                        >
                                            Cancel
                                        </button>
                                    </>
                                )}
                                {formError && (
                                    <div className="form-error" role="alert">{formError}</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Profile;
