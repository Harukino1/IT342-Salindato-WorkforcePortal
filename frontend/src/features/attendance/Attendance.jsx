import { useState, useEffect, useCallback } from "react";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../shared/hooks/useAuth';
import "./Attendance.css";
import {
    formatDateTime,
    parseBackendDate,
    formatTime,
    formatShortDate,
    formatDurationHM,
    formatDurationHMS,
    sameLocalDay,
    calculateAttendanceDurations,
    getRecentActivityDurations,
} from '../../shared/utils/utils';

// ── Types ──────────────────────────────────────────────────────────────────
/**
 * @typedef {{ id: number, date: string, clockIn: string, clockOut: string, hours: string }} ActivityEntry
 * @typedef {{ label: string, value: string, type: "present"|"absent"|"late" }} OverviewItem
 */

// ── Static data ────────────────────────────────────────────────────────────
const NAV_ITEMS = [
    { id: "dashboard",  label: "Dashboard" },
    { id: "attendance", label: "Time Clock" },
    { id: "leave",      label: "Leave Application" },
    { id: "profile",    label: "Profile" },
    { id: "settings",   label: "Settings" },
];

// Helper: Determine if a clock-in time qualifies as present/late/absent (pure function)
const getAttendanceStatus = (clockInTime) => {
    if (!clockInTime) return "absent";
    const clockInDate = parseBackendDate(clockInTime);
    if (!clockInDate) return "absent";
    const hour = clockInDate.getHours();
    const minute = clockInDate.getMinutes();
    const timeInMinutes = hour * 60 + minute;
    const nineAm = 9 * 60;      // 9:00 AM
    const tenAm = 10 * 60;      // 10:00 AM
    if (timeInMinutes >= nineAm && timeInMinutes < tenAm) {
        return "present";
    } else if (timeInMinutes >= tenAm) {
        return "late";
    }
    return "present"; // Early clock-in is also considered present
};

// Helper: Calculate monthly overview from records (pure function)
const calculateMonthlyOverview = (records) => {
    if (!records || records.length === 0) {
        return [
            { label: "Present", value: "0 days", type: "present" },
            { label: "Absent",  value: "0 days",  type: "absent"  },
            { label: "Late",    value: "0 days",  type: "late"    },
        ];
    }

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    // Only count records from the current month up to today, and collapse duplicates per day.
    const dailyRecords = new Map();

    records.forEach((record) => {
        const clockInDate = parseBackendDate(record.clockIn);
        if (!clockInDate) return;

        const recordYear = clockInDate.getFullYear();
        const recordMonth = clockInDate.getMonth();
        const recordDay = clockInDate.getDate();

        if (recordYear !== year || recordMonth !== month) return;
        if (recordDay > today.getDate()) return;

        const dayKey = `${recordYear}-${String(recordMonth + 1).padStart(2, "0")}-${String(recordDay).padStart(2, "0")}`;
        const existing = dailyRecords.get(dayKey);

        // Keep the earliest clock-in for the day so the day-level status is deterministic.
        if (!existing || clockInDate < existing.clockInDate) {
            dailyRecords.set(dayKey, { ...record, clockInDate });
        }
    });

    const workedDays = dailyRecords.size;
    const lateDays = Array.from(dailyRecords.values()).reduce((count, record) => {
        return count + (getAttendanceStatus(record.clockInDate) === "late" ? 1 : 0);
    }, 0);

    // Present = total unique days you clocked in.
    // Absent = elapsed days this month minus unique worked days.
    const elapsedDays = today.getDate();
    const absentCount = Math.max(0, elapsedDays - workedDays);

    return [
        { label: "Present", value: `${workedDays} days`, type: "present" },
        { label: "Absent",  value: `${absentCount} days`,  type: "absent"  },
        { label: "Late",    value: `${lateDays} days`,  type: "late"    },
    ];
};

// ── Component ──────────────────────────────────────────────────────────────
export default function Attendance() {
    const navigate = useNavigate();
    const { token, logout } = useAuth();
    const [activeNav, setActiveNav]     = useState("attendance");
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isClockedIn, setIsClockedIn] = useState(false);
    const [recentActivity, setRecentActivity] = useState([]);
    const [todayRecord, setTodayRecord] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [showClockOutConfirm, setShowClockOutConfirm] = useState(false);
    const [isOnBreak, setIsOnBreak] = useState(false);
    const [monthlyOverview, setMonthlyOverview] = useState([
        { label: "Present", value: "0 days", type: "present" },
        { label: "Absent",  value: "0 days",  type: "absent"  },
        { label: "Late",    value: "0 days",  type: "late"    },
    ]);

    const todayKey = new Date().toISOString().slice(0, 10);

    const fetchAttendance = useCallback(async () => {
        if (!token) {
            navigate('/');
            return;
        }

        try {
            const response = await axios.get('http://localhost:8080/api/attendance/me', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const records = Array.isArray(response.data?.records) ? response.data.records : [];
            const now = new Date();
            const mappedRecords = records.map((record, index) => ({
                id: record.id || index + 1,
                date: formatShortDate(record.date || record.clockIn),
                clockIn: formatTime(record.clockIn),
                clockOut: formatTime(record.clockOut),
                raw: record,
            }));

            // Filter to ONLY today's record, strictly
            const today = records.find((record) => {
                const parsedClockIn = parseBackendDate(record.clockIn);
                if (!parsedClockIn) return false;
                return sameLocalDay(parsedClockIn, now);
            }) || null;

            // Calculate monthly overview from all records
            const overview = calculateMonthlyOverview(records);

            setIsClockedIn(Boolean(response.data?.isClockedIn));
            setTodayRecord(today);
            setIsOnBreak(Boolean(today?.status === "ON_BREAK"));
            setRecentActivity(mappedRecords);
            setMonthlyOverview(overview);
        } catch (error) {
            console.error('Error fetching attendance:', error);
            navigate('/');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navigate, token, todayKey]);

    // Live clock — updates every second for HH/MM/SS working hours display
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1_000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        fetchAttendance();
    }, [fetchAttendance]);

    const handleNavClick = (id) => {
        setActiveNav(id);
        if (id === 'dashboard') navigate('/dashboard', { replace: true });
        else if (id === 'attendance') {/* stay */}
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

    const handleClockIn = async () => {
        if (!token) {
            navigate('/');
            return;
        }

        try {
            setIsSubmitting(true);
            await axios.post('http://localhost:8080/api/attendance/clock-in', {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setIsOnBreak(false);
            await fetchAttendance();
        } catch (error) {
            console.error('Error clocking in:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClockOut = async () => {
        if (!token) {
            navigate('/');
            return;
        }

        try {
            setIsSubmitting(true);
            await axios.post('http://localhost:8080/api/attendance/clock-out', {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            await fetchAttendance();
        } catch (error) {
            console.error('Error clocking out:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClockOutClick = () => {
        setShowClockOutConfirm(true);
    };

    const handleClockOutConfirm = async () => {
        setShowClockOutConfirm(false);
        await handleClockOut();
    };

    const handleClockOutCancel = () => {
        setShowClockOutConfirm(false);
    };

    const handleBreakToggle = async () => {
        if (!isClockedIn || isSubmitting) return;

        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }

        const breakEndpoint = isOnBreak ? 'http://localhost:8080/api/attendance/break/end' : 'http://localhost:8080/api/attendance/break/start';

        try {
            setIsSubmitting(true);
            await axios.post(breakEndpoint, {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            await fetchAttendance();
        } catch (error) {
            console.error('Error toggling break:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const todayClockInDate = parseBackendDate(todayRecord?.clockIn);
    const todayClockOutDate = parseBackendDate(todayRecord?.clockOut);
    const todayDurations = calculateAttendanceDurations(todayRecord, currentTime);
    const displayedWorkingHours = formatDurationHMS(todayDurations.workedSeconds);
    const displayedBreakDuration = formatDurationHMS(todayDurations.totalBreakSeconds);
    const currentStatusLabel = !isClockedIn ? 'Clocked Out' : isOnBreak ? 'On Break' : 'Clocked In';

    return (
        <div className="shell attendance-page">
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

            {showClockOutConfirm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Confirm Clock Out</h3>
                        <p>Do you want to clock out now?</p>
                        <div className="modal-buttons">
                            <button className="btn-cancel" onClick={handleClockOutCancel}>Cancel</button>
                            <button className="btn-confirm" onClick={handleClockOutConfirm}>Clock Out</button>
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
                {/* Fake window chrome */}
                <div className="topbar">
                    <div className="topbar__dot topbar__dot--red" />
                    <div className="topbar__dot topbar__dot--amber" />
                    <div className="topbar__dot topbar__dot--green" />
                    <span className="topbar__title">Time Clock</span>
                </div>

                <div className="content">
                    {/* Page Header */}
                    <div className="page-header">
                        <h1 className="page-title">Time Clock</h1>
                        <span className="page-datetime">{formatDateTime(currentTime)}</span>
                    </div>

                    {/* ── Top Row: Current Status + Today's Summary ── */}
                    <div className="top-row">
                        {/* Current Status */}
                        <div className="card">
                            <p className="card__title">Current Status</p>

                            <div className={`status-badge ${isOnBreak ? "status-badge--break" : ""}`}>
                                <span className="status-badge__dot" />
                                <span className="status-badge__label">{currentStatusLabel}</span>
                            </div>

                            <p className="status-detail">
                <span className="status-detail__row">
                  <strong>Clocked in:</strong>
                  <span className="status-time-chip">{formatTime(todayClockInDate)}</span>
                </span>
                                <span className="status-detail__row">
                  <strong>Working Hours:</strong>
                  <span className="status-time-chip">{displayedWorkingHours}</span>
                </span>
                                <span className="status-detail__row">
                  <strong>Break Duration:</strong>
                  <span className="status-time-chip">{displayedBreakDuration}</span>
                </span>
                            </p>
                        </div>

                        {/* Today's Summary */}
                        <div className="card">
                            <p className="card__title">Today's Summary</p>
                            <div className="summary-grid">
                                <div className="summary-row">
                                    <span className="summary-row__label">Time In</span>
                                    <span className="summary-row__value">{formatTime(todayClockInDate)}</span>
                                </div>
                                <div className="summary-row">
                                    <span className="summary-row__label">Time Out</span>
                                    <span className="summary-row__value summary-row__value--muted">
                    {formatTime(todayClockOutDate)}
                  </span>
                                </div>
                                <div className="summary-row">
                                    <span className="summary-row__label">Break</span>
                                    <span className="summary-row__value">{formatDurationHM(Math.floor(todayDurations.totalBreakSeconds / 60))}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Clock Buttons ── */}
                    <div className="clock-row">
                        <button
                            className="btn btn--clock-in"
                            type="button"
                            onClick={handleClockIn}
                            disabled={isClockedIn || isSubmitting}
                            style={{ opacity: isClockedIn ? 0.5 : 1, cursor: isClockedIn ? "not-allowed" : "pointer" }}
                        >
                            Clock In
                        </button>
                        <button
                            className="btn btn--clock-out"
                            type="button"
                            onClick={handleClockOutClick}
                            disabled={!isClockedIn || isSubmitting}
                            style={{ opacity: !isClockedIn ? 0.4 : 1, cursor: !isClockedIn ? "not-allowed" : "pointer" }}
                        >
                            Clock Out
                        </button>
                        <button
                            className="btn btn--break"
                            type="button"
                            onClick={handleBreakToggle}
                            disabled={!isClockedIn || isSubmitting}
                            style={{ opacity: !isClockedIn ? 0.4 : 1, cursor: !isClockedIn ? "not-allowed" : "pointer" }}
                        >
                            {isOnBreak ? "Resume Work" : "Take a Break"}
                        </button>
                    </div>

                    {/* ── Bottom Row: Recent Activity + Monthly Overview ── */}
                    <div className="bottom-row">
                        {/* Recent Activity */}
                        <div className="card">
                            <p className="card__title">Recent Activity</p>
                            <div className="activity-table-wrap">
                                <table className="activity-table">
                                    <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Clock In</th>
                                        <th>Clock Out</th>
                                        <th>Working Hours</th>
                                        <th>Break Duration</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {recentActivity.length === 0 && (
                                        <tr>
                                            <td colSpan="5">No attendance records yet.</td>
                                        </tr>
                                    )}
                                    {recentActivity.map(({ id, date, clockIn, clockOut, raw }) => {
                                        const rowDurations = getRecentActivityDurations(raw, currentTime);

                                        return (
                                            <tr key={id}>
                                                <td>{date}</td>
                                                <td>{clockIn}</td>
                                                <td>{clockOut}</td>
                                                <td>
                                                    <span className="hours-badge">{rowDurations.workingHours}</span>
                                                </td>
                                                <td>
                                                    <span className="hours-badge">{rowDurations.breakDuration}</span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Monthly Overview */}
                        <div className="card">
                            <p className="card__title">Monthly Overview</p>
                            <div className="overview-list">
                                {monthlyOverview.map(({ label, value, type }) => (
                                    <div key={type} className={`overview-item overview-item--${type}`}>
                                        <span className="overview-item__label">{label}</span>
                                        <span className="overview-item__value">{value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}