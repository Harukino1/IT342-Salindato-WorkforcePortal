import { useState, useEffect, useCallback } from "react";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../shared/hooks/useAuth';
import "./LeaveRequest.css";
import { formatDateTime, formatDate, getStatusBadgeClass, calcTotalDaysInclusive } from '../../shared/utils/utils';

// ── Static data ────────────────────────────────────────────────────────────
const NAV_ITEMS = [
    { id: "dashboard",  label: "Dashboard" },
    { id: "attendance", label: "Log Hours" },
    { id: "leave",      label: "Leave Application" },
    { id: "profile",    label: "Profile" },
    { id: "settings",   label: "Settings" },
];

// helpers moved to shared utils

// ── Component ──────────────────────────────────────────────────────────────
export default function Leave() {
    const navigate = useNavigate();
    const { token, logout } = useAuth();
    const [activeNav, setActiveNav]       = useState("leave");
    const [currentTime, setCurrentTime]   = useState(new Date());
    const [loading, setLoading]           = useState(true);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [recentLeaves, setRecentLeaves] = useState([]);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [isSubmittingLeave, setIsSubmittingLeave] = useState(false);
    const [leaveForm, setLeaveForm] = useState({
        subject: '',
        leaveType: 'Vacation',
        startDate: new Date().toISOString().slice(0,10),
        endDate: new Date().toISOString().slice(0,10),
        totalDays: 1,
        body: '',
    });
    const [formError, setFormError] = useState('');

    // Live clock — updates every second
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1_000);
        return () => clearInterval(timer);
    }, []);

    const fetchLeaveRequests = useCallback(async () => {

        if (!token) {
            navigate('/');
            return;
        }

        try {
            const response = await axios.get('http://localhost:8080/api/leave-requests/me', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const requests = Array.isArray(response.data) ? response.data : [];

            // Separate pending and recent leaves
            const pending = requests.filter(r => r.status === "PENDING");
            const recent = requests.filter(r => r.status !== "PENDING");

            setPendingRequests(pending);
            setRecentLeaves(recent);
        } catch (error) {
            console.error('Error fetching leave requests:', error);
            if (error.response?.status === 401) {
                navigate('/');
            }
        } finally {
            setLoading(false);
        }
    }, [navigate, token]);

    useEffect(() => {
        fetchLeaveRequests();
    }, [fetchLeaveRequests]);

    const handleNavClick = (id) => {
        setActiveNav(id);
        if (id === 'dashboard') navigate('/dashboard', { replace: true });
        else if (id === 'attendance') navigate('/attendance', { replace: true });
        else if (id === 'leave') navigate('/leave', { replace: true });
        else if (id === 'profile') navigate('/profile', { replace: true });
        else if (id === 'settings') navigate('/settings', { replace: true });
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

    const handleSubmitLeave = () => {
        setFormError('');
        // reset form to defaults
        setLeaveForm({
            subject: '',
            leaveType: 'Vacation',
            startDate: new Date().toISOString().slice(0,10),
            endDate: new Date().toISOString().slice(0,10),
            totalDays: 1,
            body: '',
        });
        setShowSubmitModal(true);
    };

    // calcTotalDaysInclusive moved to shared utils

    const handleLeaveFieldChange = (field, value) => {
        setLeaveForm((prev) => {
            const next = { ...prev, [field]: value };
            if (field === 'startDate' || field === 'endDate') {
                next.totalDays = calcTotalDaysInclusive(next.startDate, next.endDate);
            }
            return next;
        });
    };

    const handleLeaveCancel = () => {
        setShowSubmitModal(false);
        setFormError('');
    };

    const handleLeaveSubmit = async () => {
        setFormError('');
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }

        const { subject, leaveType, startDate, endDate, totalDays, body } = leaveForm;
        if (!startDate || !endDate) {
            setFormError('Please select both start and end dates.');
            return;
        }
        if (totalDays <= 0) {
            setFormError('End date must be the same or after the start date.');
            return;
        }

        const payload = {
            subject: subject || `${leaveType} Leave Request`,
            leaveType,
            startDate, // backend expects ISO date (yyyy-mm-dd)
            endDate,
            totalDays,
            body,
        };

        try {
            setIsSubmittingLeave(true);
            await axios.post('http://localhost:8080/api/leave-requests', payload, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setShowSubmitModal(false);
            // refresh list
            await fetchLeaveRequests();
        } catch (err) {
            console.error('Error submitting leave:', err);
            setFormError(err.response?.data?.message || 'Failed to submit leave request');
            if (err.response?.status === 401) {
                localStorage.removeItem('token');
                navigate('/');
            }
        } finally {
            setIsSubmittingLeave(false);
        }
    };

    // Do not block rendering with a full-page loader. Show a non-blocking banner inside the main area instead.

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

            {showSubmitModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Submit Leave Request</h3>
                        <div>
                            <div className="modal-form-group">
                                <label>Leave Type</label>
                                <select
                                    value={leaveForm.leaveType}
                                    onChange={(e) => handleLeaveFieldChange('leaveType', e.target.value)}
                                >
                                    <option>Vacation</option>
                                    <option>Sick</option>
                                    <option>Other</option>
                                </select>
                            </div>

                            <div className="modal-form-group">
                                <label>Start Date</label>
                                <input
                                    type="date"
                                    value={leaveForm.startDate}
                                    onChange={(e) => handleLeaveFieldChange('startDate', e.target.value)}
                                />
                            </div>

                            <div className="modal-form-group">
                                <label>End Date</label>
                                <input
                                    type="date"
                                    value={leaveForm.endDate}
                                    onChange={(e) => handleLeaveFieldChange('endDate', e.target.value)}
                                />
                            </div>

                            <div className="modal-total-days">
                                <span>Total Days:</span> <strong>{leaveForm.totalDays}</strong>
                            </div>

                            <div className="modal-form-group">
                                <label>Subject</label>
                                <input
                                    type="text"
                                    value={leaveForm.subject}
                                    onChange={(e) => handleLeaveFieldChange('subject', e.target.value)}
                                    placeholder="Brief subject (optional)"
                                />
                            </div>

                            <div className="modal-form-group">
                                <label>Message</label>
                                <textarea
                                    value={leaveForm.body}
                                    onChange={(e) => handleLeaveFieldChange('body', e.target.value)}
                                    placeholder="Explain your leave request..."
                                />
                            </div>

                            {formError && (
                                <div className="modal-error">{formError}</div>
                            )}

                            <div className="modal-buttons">
                                <button className="btn-cancel" type="button" onClick={handleLeaveCancel} disabled={isSubmittingLeave}>Cancel</button>
                                <button className="btn-confirm" type="button" onClick={handleLeaveSubmit} disabled={isSubmittingLeave}>
                                    {isSubmittingLeave ? 'Submitting...' : 'Submit Leave'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Sidebar ── */}
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

            {/* ── Main ── */}
            <main className="main">
                {/* Non-blocking loading banner */}
                {loading && (
                    <div className="page-loading" role="status" aria-live="polite" aria-busy="true" style={{ marginBottom: 12 }}>
                        <div className="page-loading__spinner" />
                        <span>Loading leave requests...</span>
                    </div>
                )}
                <div className="content">
                    {/* Page Header */}
                    <div className="page-header">
                        <h1 className="page-title">Leave Application</h1>
                        <span className="page-datetime">{formatDateTime(currentTime)}</span>
                    </div>

                    {/* ── Leave Balance ── */}
                    <div className="card leave-balance-section">
                        <div className="balance-header">
                            <span className="balance-title">Leave Balance</span>
                            <button className="btn-submit-leave" onClick={handleSubmitLeave}>
                                Submit a Leave
                            </button>
                        </div>
                        <div className="balance-cards">
                            {['Vacation', 'Sick', 'Other'].map((type) => {
                                const count = [...pendingRequests, ...recentLeaves].filter(r => r.leaveType === type).length;
                                return (
                                    <div key={type} className="balance-card">
                                        <div className="balance-card__type">{type}</div>
                                        <div className="balance-card__days">{count}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* ── Top Row: Pending Requests ── */}
                    <div className="top-row">
                        <div className="card">
                            <p className="card__title">Pending Request</p>
                            <div className="request-table-wrap">
                                <table className="request-table">
                                    <thead>
                                    <tr>
                                        <th>Type</th>
                                        <th>Dates</th>
                                        <th>Days</th>
                                        <th>Status</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {pendingRequests.length === 0 && (
                                        <tr>
                                            <td colSpan="4" style={{ textAlign: 'center', color: '#818cf8' }}>
                                                No pending requests.
                                            </td>
                                        </tr>
                                    )}
                                    {pendingRequests.map((request) => (
                                        <tr key={request.id}>
                                            <td>{request.leaveType || "-"}</td>
                                            <td>
                                                {formatDate(request.startDate)} - {formatDate(request.endDate)}
                                            </td>
                                            <td>{request.totalDays || "-"}</td>
                                            <td>
                          <span className={getStatusBadgeClass(request.status)}>
                            {request.status || "PENDING"}
                          </span>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* ── Bottom Row: Recent Leaves ── */}
                    <div className="bottom-row">
                        <div className="card">
                            <p className="card__title">Recent Leaves</p>
                            <div className="request-table-wrap">
                                <table className="request-table">
                                    <thead>
                                    <tr>
                                        <th>Type</th>
                                        <th>Dates</th>
                                        <th>Days</th>
                                        <th>Status</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {recentLeaves.filter(l => l.status === 'APPROVED').length === 0 && (
                                        <tr>
                                            <td colSpan="4" style={{ textAlign: 'center', color: '#818cf8' }}>
                                                No approved leaves.
                                            </td>
                                        </tr>
                                    )}
                                    {recentLeaves.filter(l => l.status === 'APPROVED').map((leave) => (
                                        <tr key={leave.id}>
                                            <td>{leave.leaveType || "-"}</td>
                                            <td>
                                                {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                                            </td>
                                            <td>{leave.totalDays || "-"}</td>
                                            <td>
                          <span className={getStatusBadgeClass(leave.status)}>
                            {leave.status || "APPROVED"}
                          </span>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="card">
                            <p className="card__title">Leave Statistics</p>
                            <div className="stats-grid">
                                <div className="stat-item">
                                    <span className="stat-label">Total Requests</span>
                                    <span className="stat-value stat-value--total">{pendingRequests.length + recentLeaves.length}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">Approved</span>
                                    <span className="stat-value stat-value--approved">{recentLeaves.filter(l => l.status === 'APPROVED').length}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">Pending</span>
                                    <span className="stat-value stat-value--pending">{pendingRequests.length}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">Rejected</span>
                                    <span className="stat-value stat-value--rejected">{recentLeaves.filter(l => l.status === 'REJECTED').length}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
