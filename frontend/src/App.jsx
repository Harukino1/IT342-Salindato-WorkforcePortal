import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import { AuthProvider } from './shared/context/AuthContext';
import { ProtectedRoute } from './shared/components/ProtectedRoute';

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
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} requiredRole="member" />} />
          <Route path="/attendance" element={<ProtectedRoute element={<Attendance />} requiredRole="member" />} />
          <Route path="/leave" element={<ProtectedRoute element={<Leave />} requiredRole="member" />} />
          <Route path="/profile" element={<ProtectedRoute element={<Profile />} requiredRole="member" />} />
          <Route path="/settings" element={<ProtectedRoute element={<Settings />} requiredRole="member" />} />

          <Route path="/admin-dashboard" element={<ProtectedRoute element={<AdminDashboard />} requiredRole="admin" />} />
          <Route path="/admin-attendance" element={<ProtectedRoute element={<AdminAttendance />} requiredRole="admin" />} />
          <Route path="/admin-leave" element={<ProtectedRoute element={<AdminLeave />} requiredRole="admin" />} />
          <Route path="/admin-profile" element={<ProtectedRoute element={<AdminProfile />} requiredRole="admin" />} />
          <Route path="/admin-settings" element={<ProtectedRoute element={<AdminSettings />} requiredRole="admin" />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;