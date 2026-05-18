import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../shared/hooks/useAuth';
import './Setting.css';
import { formatDateTime } from '../../shared/utils/utils';

const NAV_ITEMS = [
	{ id: 'dashboard', label: 'Dashboard' },
	{ id: 'attendance', label: 'Log Hours' },
	{ id: 'leave', label: 'Leave Application' },
	{ id: 'profile', label: 'Profile' },
	{ id: 'settings', label: 'Settings' },
];

// formatDateTime moved to shared utils

export default function Settings() {
	const navigate = useNavigate();
	const { token, logout } = useAuth();
	const [activeNav, setActiveNav] = useState('settings');
	const [currentTime, setCurrentTime] = useState(new Date());
	const [loading, setLoading] = useState(true);
	const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

	const [oldPassword, setOldPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [isSaving, setIsSaving] = useState(false);
	const [message, setMessage] = useState('');
	const [error, setError] = useState('');

	useEffect(() => {
		const timer = setInterval(() => setCurrentTime(new Date()), 1000);
		setLoading(false);
		return () => clearInterval(timer);
	}, []);

	const handleNavClick = (id) => {
		setActiveNav(id);
		if (id === 'dashboard') navigate('/dashboard', { replace: true });
		else if (id === 'attendance') navigate('/attendance', { replace: true });
		else if (id === 'leave') navigate('/leave', { replace: true });
		else if (id === 'profile') navigate('/profile', { replace: true });
		else if (id === 'settings') navigate('/settings', { replace: true });
	};

	const handleLogoutClick = () => setShowLogoutConfirm(true);
	const handleLogoutCancel = () => setShowLogoutConfirm(false);

	const handleLogoutConfirm = async () => {
		await logout();
		navigate('/');
	};

	const handleSave = useCallback(async () => {
		setMessage('');
		setError('');
		if (!oldPassword || !newPassword) {
			setError('Please fill both fields.');
			return;
		}
		if (newPassword.length < 8) {
			setError('New password must be at least 8 characters long.');
			return;
		}
		if (!token) {
			navigate('/');
			return;
		}

		try {
			setIsSaving(true);
			// Attempt to change password (backend endpoint assumed)
			await axios.post('http://localhost:8080/api/auth/change-password', {
				oldPassword,
				newPassword,
			}, {
				headers: { Authorization: `Bearer ${token}` },
			});
			setMessage('Password updated successfully.');
			setOldPassword('');
			setNewPassword('');
		} catch (err) {
			console.error('Error changing password', err);
			setError(err.response?.data?.message || 'Failed to update password');
			if (err.response?.status === 401) {
				navigate('/');
			}
		} finally {
			setIsSaving(false);
		}
	}, [oldPassword, newPassword, navigate, token]);

	if (loading) {
		return (
			<div className="page-loading" role="status" aria-live="polite" aria-busy="true">
				<div className="page-loading__spinner" />
				<span>Loading settings...</span>
			</div>
		);
	}

	return (
		<div className="shell">
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
						<button
							key={id}
							className={`nav-item ${activeNav === id ? 'nav-item--active' : ''}`}
							onClick={() => handleNavClick(id)}
						>
							{label}
						</button>
					))}
				</nav>

				<div className="sidebar__spacer" />

				<button className="sidebar__logout" type="button" onClick={handleLogoutClick}>
					Logout
				</button>
			</aside>

			<main className="main">
				<div className="content">
					<div className="page-header">
						<h1 className="page-title">Settings</h1>
						<span className="page-datetime">{formatDateTime(currentTime)}</span>
					</div>

					<div className="card settings-card">
						<div className="settings-card__inner">
							<div className="form-row">
								<div className="form-group">
									<label>Old Password</label>
									<input
										type="password"
										value={oldPassword}
										onChange={(e) => setOldPassword(e.target.value)}
										placeholder="Enter old password"
									/>
								</div>

								<div className="form-group">
									<label>New Password</label>
									<input
										type="password"
										value={newPassword}
										onChange={(e) => setNewPassword(e.target.value)}
										placeholder="Enter new password"
									/>
								</div>
							</div>

							{error && <div className="form-error">{error}</div>}
							{message && <div className="form-message">{message}</div>}

							<div className="settings-actions">
								<button className="btn-confirm" onClick={handleSave} disabled={isSaving}>
									{isSaving ? 'Saving...' : 'Save Changes'}
								</button>
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}


