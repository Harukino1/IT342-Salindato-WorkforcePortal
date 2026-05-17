import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import Login from './features/auth/Login';
import Register from './features/auth/Register';
import Dashboard from './features/dashboard/Dashboard';
import Attendance from './features/attendance/Attendance';
import Leave from './features/leave/LeaveRequest';
import Settings from './features/settings/Setting';
import Profile from './features/profile/Profile';
import AdminDashboard from './features/admin_dashboard/AdminDashboard';
import AdminAttendance from './features/admin_attendance/AdminAttendance';
import AdminLeave from './features/admin_leave/AdminLeave';
import AdminProfile from './features/admin_profile/AdminProfile';
import AdminSettings from './features/admin_settings/AdminSettings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin-attendance" element={<AdminAttendance />} />
        <Route path="/admin-leave" element={<AdminLeave />} />
        <Route path="/admin-profile" element={<AdminProfile />} />
        <Route path="/admin-settings" element={<AdminSettings />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/leave" element={<Leave />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;