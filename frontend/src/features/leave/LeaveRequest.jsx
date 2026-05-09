import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "./LeaveRequest.css";

// ── Static data ────────────────────────────────────────────────────────────
const NAV_ITEMS = [
    { id: "dashboard",  label: "Dashboard" },
    { id: "attendance", label: "Attendance" },
    { id: "leave",      label: "Leave" },
    { id: "profile",    label: "Profile" },
    { id: "settings",   label: "Settings" },
];

const LEAVE_TYPES = [
    { type: "Vacation", days: 5 },
    { type: "Sick", days: 5 },
    { type: "Other", days: 5 },
];

// ── Helpers ────────────────────────────────────────────────────────────────
function formatDateTime(date) {
    return date.toLocaleDateString("en-US", {
        weekday: "long",
        year:    "numeric",
        month:   "long",
        day:     "numeric",
    }) + " | " + date.toLocaleTimeString("en-US", {
        hour:   "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
}

function formatDate(date) {
    if (!date) return "-";
    if (typeof date === "string") {
        return new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
        });
    }
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
    });
}

function getStatusBadgeClass(status) {
    switch (status?.toUpperCase()) {
        case "APPROVED":
            return "status-badge__approved";
        case "REJECTED":
            return "status-badge__rejected";
        case "PENDING":
        default:
            return "status-badge__pending";
    }
}

// ── Component ──────────────────────────────────────────────────────────────
export default function Leave() {
    const navigate = useNavigate();
    const [activeNav, setActiveNav]       = useState("leave");
    const [currentTime, setCurrentTime]   = useState(new Date());
    const [pendingRequests, setPendingRequests] = useState([]);
    const [recentLeaves, setRecentLeaves] = useState([]);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    // Live clock — updates every second
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1_000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        fetchLeaveRequests();
    }, []);

    const fetchLeaveRequests = async () => {
        const token = localStorage.getItem('token');

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
                localStorage.removeItem('token');
                navigate('/');
            }
        }
    };

    const handleNavClick = (id) => {
        setActiveNav(id);
        if (id === 'dashboard') {
            navigate('/dashboard', { replace: true });
        } else if (id === 'attendance') {
            navigate('/attendance', { replace: true });
        } else if (id === 'leave') {
            // Stay on the same page
            return;
        }
    };

    const handleLogoutClick = () => {
        setShowLogoutConfirm(true);
    };

    const handleLogoutConfirm = async () => {
        const token = localStorage.getItem('token');

        try {
            await axios.post('http://localhost:8080/api/auth/logout', {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
        } catch (error) {
            console.error('Error during logout:', error);
        } finally {
            localStorage.removeItem('token');
            navigate('/');
        }
    };

    const handleLogoutCancel = () => {
        setShowLogoutConfirm(false);
    };

    const handleSubmitLeave = () => {
        // TODO: Open modal or navigate to submit leave page
        console.log('Submit leave clicked');
    };

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

            {/* ── Sidebar ── */}
            <aside className="sidebar">
                <div className="sidebar__brand">
                    <span className="logo">WorkForce<br />Portal</span>
                </div>

                <div className="nav">
                    {NAV_ITEMS.map(({ id, label }) => (
                        <div
                            key={id}
                            className={`nav-item ${activeNav === id ? "nav-item--active" : ""}`}
                            onClick={() => handleNavClick(id)}
                            role="button"
                            aria-current={activeNav === id ? "page" : undefined}
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

            {/* ── Main ── */}
            <main className="main">
                <div className="content">
                    {/* Page Header */}
                    <div className="page-header">
                        <h1 className="page-title">Leaves</h1>
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
                            {LEAVE_TYPES.map(({ type, days }) => (
                                <div key={type} className="balance-card">
                                    <div className="balance-card__type">{type}</div>
                                    <div className="balance-card__days">{days} days</div>
                                </div>
                            ))}
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
                                    {recentLeaves.length === 0 && (
                                        <tr>
                                            <td colSpan="4" style={{ textAlign: 'center', color: '#818cf8' }}>
                                                No recent leaves.
                                            </td>
                                        </tr>
                                    )}
                                    {recentLeaves.map((leave) => (
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
                            <div style={{ color: '#818cf8', textAlign: 'center', marginTop: '20px' }}>
                                <p>Total Leave Requests: <span style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '20px' }}>{pendingRequests.length + recentLeaves.length}</span></p>
                                <p style={{ marginTop: '15px' }}>Approved: <span style={{ color: '#34d399', fontWeight: 'bold', fontSize: '20px' }}>{recentLeaves.filter(l => l.status === 'APPROVED').length}</span></p>
                                <p style={{ marginTop: '15px' }}>Pending: <span style={{ color: '#fbbf24', fontWeight: 'bold', fontSize: '20px' }}>{pendingRequests.length}</span></p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

