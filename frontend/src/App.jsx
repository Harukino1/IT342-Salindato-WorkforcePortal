import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';

import Login from './features/auth/Login';
import Register from './features/auth/Register';
import Dashboard from './features/dashboard/Dashboard';
import Attendance from './features/attendance/Attendance';
import Leave from './features/leave/LeaveRequest';
import Settings from './features/settings/setting';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/leave" element={<Leave />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;