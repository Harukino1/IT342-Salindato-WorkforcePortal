import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "../components/Attendance.css";

// ── Types ──────────────────────────────────────────────────────────────────
/**
 * @typedef {{ id: number, date: string, clockIn: string, clockOut: string, hours: string }} ActivityEntry
 * @typedef {{ label: string, value: string, type: "present"|"absent"|"late" }} OverviewItem
 */

// ── Static data ────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "dashboard",  label: "Dashboard" },
  { id: "attendance", label: "Attendance" },
  { id: "leave",      label: "Leave" },
  { id: "profile",    label: "Profile" },
  { id: "settings",   label: "Settings" },
];

/** @type {OverviewItem[]} */
const MONTHLY_OVERVIEW = [
  { label: "Present", value: "18 days", type: "present" },
  { label: "Absent",  value: "2 days",  type: "absent"  },
  { label: "Late",    value: "6 days",  type: "late"    },
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

function parseBackendDate(value) {
  if (!value) return null;
  const dateValue = typeof value === "string" && !value.includes("T")
    ? `${value}T00:00:00`
    : value;
  const parsed = new Date(dateValue);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatTime(value) {
  const date = value instanceof Date ? value : parseBackendDate(value);
  if (!date) return "-";
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatShortDate(value) {
  const date = parseBackendDate(value);
  if (!date) return "-";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
  });
}

function formatDurationHM(totalMinutes) {
  if (!Number.isFinite(totalMinutes) || totalMinutes <= 0) return "-";
  const safeMinutes = Math.max(0, Math.floor(totalMinutes));
  const hours = Math.floor(safeMinutes / 60);
  const mins = safeMinutes % 60;
  return `${hours}h${String(mins).padStart(2, "0")}m`;
}

function decimalHoursToMinutes(totalHours) {
  const parsed = Number(totalHours);
  if (!Number.isFinite(parsed) || parsed <= 0) return 0;
  return Math.round(parsed * 60);
}

function sameLocalDay(dateA, dateB) {
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
}

// ── Component ──────────────────────────────────────────────────────────────
export default function Attendance() {
  const navigate = useNavigate();
  const [activeNav, setActiveNav]     = useState("attendance");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [recentActivity, setRecentActivity] = useState([]);
  const [todayRecord, setTodayRecord] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showClockOutConfirm, setShowClockOutConfirm] = useState(false);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const todayKey = new Date().toISOString().slice(0, 10);

  const fetchAttendance = async () => {
    const token = localStorage.getItem('token');

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
      const mappedRecords = records.map((record, index) => {
        const clockInDate = parseBackendDate(record.clockIn);
        const clockOutDate = parseBackendDate(record.clockOut);
        const minutesFromTimeRange =
          clockInDate && clockOutDate
            ? Math.max(0, Math.floor((clockOutDate.getTime() - clockInDate.getTime()) / 60000))
            : 0;
        const breakDurationMinutes = Number(record.breakDuration) || 0;
        const hasActiveBreak = Boolean(record.breakStartedAt && !record.clockOut);
        const liveBreakSeconds = hasActiveBreak
          ? Math.max(0, Math.floor((Date.now() - parseBackendDate(record.breakStartedAt).getTime()) / 1000))
          : 0;
        const totalBreakSeconds = (breakDurationMinutes * 60) + liveBreakSeconds;

        const workedSeconds = clockInDate
          ? Math.max(
              0,
              Math.floor(((clockOutDate || now).getTime() - clockInDate.getTime()) / 1000) - totalBreakSeconds
            )
          : 0;

        return {
          id: record.id || index + 1,
          date: formatShortDate(record.date || record.clockIn),
          clockIn: formatTime(record.clockIn),
          clockOut: formatTime(record.clockOut),
          workingHours: formatDurationHM(Math.floor(workedSeconds / 60)),
          breakDuration: formatDurationHM(Math.floor(totalBreakSeconds / 60)),
          raw: record,
        };
      });

      const today = records.find((record) => {
        if (record.date === todayKey) return true;
        const parsedClockIn = parseBackendDate(record.clockIn);
        return parsedClockIn ? sameLocalDay(parsedClockIn, now) : false;
      }) || null;

      setIsClockedIn(Boolean(response.data?.isClockedIn));
      setTodayRecord(today);
      setIsOnBreak(Boolean(today?.status === "ON_BREAK"));
      setRecentActivity(mappedRecords);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      localStorage.removeItem('token');
      navigate('/');
    }
  };

  // Live clock — updates every second for HH/MM/SS working hours display
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const handleNavClick = (id) => {
    setActiveNav(id);
    if (id === 'dashboard') {
      navigate('/dashboard', { replace: true });
    } else if (id === 'attendance') {
      // Stay on the same page, do nothing
      return;
    } else {
      // For other nav items, you can add navigation here
      // navigate(`/${id}`);
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

  const handleClockIn = async () => {
    const token = localStorage.getItem('token');
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
    const token = localStorage.getItem('token');
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
  const todayBreakStartDate = parseBackendDate(todayRecord?.breakStartedAt);

  const persistedBreakMinutes = Number(todayRecord?.breakDuration) || 0;
  const liveBreakSeconds = isOnBreak && todayBreakStartDate
    ? Math.max(0, Math.floor((currentTime.getTime() - todayBreakStartDate.getTime()) / 1000))
    : 0;
  const totalBreakSeconds = (persistedBreakMinutes * 60) + liveBreakSeconds;
  const todayBreakMinutes = Math.floor(totalBreakSeconds / 60);

  const workedSeconds = todayClockInDate
    ? Math.max(
        0,
        Math.floor(((todayClockOutDate || currentTime).getTime() - todayClockInDate.getTime()) / 1000) - totalBreakSeconds
      )
    : 0;

  const displayedWorkingHours = formatDurationHM(Math.floor(workedSeconds / 60));
  const currentStatusLabel = !isClockedIn ? 'Clocked Out' : isOnBreak ? 'On Break' : 'Clocked In';

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
          <span className="topbar__title">Attendance</span>
        </div>

        <div className="content">
          {/* Page Header */}
          <div className="page-header">
            <h1 className="page-title">Attendance</h1>
            <span className="page-datetime">{formatDateTime(currentTime)}</span>
          </div>

          {/* ── Top Row: Current Status + Today's Summary ── */}
          <div className="top-row">
            {/* Current Status */}
            <div className="card">
              <p className="card__title">Current Status</p>

              <div className="status-badge">
                <span className="status-badge__dot" />
                <span className="status-badge__label">{currentStatusLabel}</span>
              </div>

              <p className="status-detail">
                <strong>Clocked in:</strong> <span className="status-time-chip">{formatTime(todayClockInDate)}</span><br />
                <strong>Working Hours:</strong> {displayedWorkingHours}
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
                  <span className="summary-row__value">{formatDurationHM(todayBreakMinutes)}</span>
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
                  {recentActivity.map(({ id, date, clockIn, clockOut, workingHours, breakDuration }) => (
                    <tr key={id}>
                      <td>{date}</td>
                      <td>{clockIn}</td>
                      <td>{clockOut}</td>
                      <td>
                        <span className="hours-badge">{workingHours}</span>
                      </td>
                      <td>
                        <span className="hours-badge">{breakDuration}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Monthly Overview */}
            <div className="card">
              <p className="card__title">Monthly Overview</p>
              <div className="overview-list">
                {MONTHLY_OVERVIEW.map(({ label, value, type }) => (
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