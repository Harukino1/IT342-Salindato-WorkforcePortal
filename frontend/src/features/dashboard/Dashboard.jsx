import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../shared/hooks/useAuth';
import './Dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const { user, token, logout } = useAuth();
    const [loading, setLoading] = useState(true);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [isClockedIn, setIsClockedIn] = useState(false);
    const [isClockingIn, setIsClockingIn] = useState(false);

    const location = useLocation();
    // derive active tab from current pathname
    const getActiveId = () => {
        const p = location.pathname;
        if (p.startsWith('/attendance')) return 'attendance';
        if (p.startsWith('/leave')) return 'leave';
        if (p.startsWith('/profile')) return 'profile';
        if (p.startsWith('/settings')) return 'settings';
        return 'dashboard';
    };

    const [enter, setEnter] = useState(false);
    useEffect(() => {
        const t = setTimeout(() => setEnter(true), 10);
        return () => clearTimeout(t);
    }, [location.pathname]);

    useEffect(() => {
        const fetchAttendanceData = async () => {
            if (!token) {
                // no token -> go back to login and stop the loading state so the page doesn't hang
                navigate('/');
                setLoading(false);
                return;
            }

            try {
                const attendanceResponse = await axios.get('http://localhost:8080/api/attendance/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setIsClockedIn(Boolean(attendanceResponse.data?.isClockedIn));
            } catch (error) {
                console.error('Error fetching attendance data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAttendanceData();
    }, [token, navigate]);

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

    const handleDashboardClockIn = async () => {
        if (!token) {
            navigate('/');
            return;
        }

        try {
            setIsClockingIn(true);
            await axios.post('http://localhost:8080/api/attendance/clock-in', {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setIsClockedIn(true);
            navigate('/attendance');
        } catch (error) {
            console.error('Error clocking in from dashboard:', error);
            if (error.response?.status === 400) {
                setIsClockedIn(true);
                navigate('/attendance');
            }
        } finally {
            setIsClockingIn(false);
        }
    };



const NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'attendance', label: 'Log Hours' },
    { id: 'leave', label: 'Leave Application' },
    { id: 'profile', label: 'Profile' },
    { id: 'settings', label: 'Settings' },
];


    const handleNavClick = (id) => {
        if (id === 'dashboard') navigate('/dashboard', { replace: true });
        else if (id === 'attendance') navigate('/attendance', { replace: true });
        else if (id === 'leave') navigate('/leave', { replace: true });
        else if (id === 'profile') navigate('/profile', { replace: true });
        else if (id === 'settings') navigate('/settings', { replace: true });
    };

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
                <div className="sidebar__brand">
                    <span className="logo">WorkForce<br />Portal</span>
                </div>

                <nav className="nav">
                    {NAV_ITEMS.map(({ id, label }) => (
                        <button
                            key={id}
                            className={`nav-item ${id === getActiveId() ? 'nav-item--active' : ''}`}
                            onClick={() => handleNavClick(id)}
                        >
                            {label}
                        </button>
                    ))}
                </nav>

                <button className="sidebar__logout" onClick={handleLogoutClick}>Logout</button>
            </aside>

            {/* Main */}
            <main className={`main ${enter ? 'enter' : ''}`}>
                {/* Welcome Header Container */}
                <section className="welcome-container">
                    <div className="avatar">👤</div>
                    <div className="welcome-content">
                        <h1>
                            Welcome,<br />
                            <span>{user?.lastName}, {user?.firstName}</span>
                        </h1>
                        <button
                            className="dashboard-clock-in"
                            onClick={handleDashboardClockIn}
                            disabled={isClockedIn || isClockingIn}
                        >
                            {isClockedIn ? 'Already Clocked In' : isClockingIn ? 'Clocking In...' : 'Clock In'}
                        </button>
                    </div>
                </section>

                {/* Content */}
                <section className="content-stack">
                    <div className="content-row announcement-row">
                        {/* Announcement Board */}
                        <div className="card announcement">
                            <h3>Announcement Board</h3>
                            <div className="card-box">
                                <p>No announcements yet.</p>
                                <p>Solomon 4:7</p>
                                <p>"You are altogether beautiful, my love; there is no flaw in you</p>
                            </div>
                        </div>
                    </div>

                    <div className="content-row activity-row">
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
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Dashboard;