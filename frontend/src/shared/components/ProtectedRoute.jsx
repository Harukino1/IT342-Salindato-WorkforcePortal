import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * ProtectedRoute component that enforces role-based access control.
 */
export const ProtectedRoute = ({ element, requiredRole }) => {
  const { isAuthenticated, loading, isAdmin, isMember } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole === 'admin' && !isAdmin) {
    // If user is a member, send to member dashboard; otherwise send to login/home
    return isMember ? <Navigate to="/dashboard" replace /> : <Navigate to="/" replace />;
  }

  if (requiredRole === 'member' && !isMember) {
    // If user is an admin, send to admin dashboard; otherwise send to login/home
    return isAdmin ? <Navigate to="/admin-dashboard" replace /> : <Navigate to="/" replace />;
  }

  return element;
};
