import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContextObject';

const normalizeRole = (role) => {
  if (!role) return null;

  const value = String(role).trim().toLowerCase();
  if (value === 'admin' || value === 'manager') return value;
  if (value === 'member' || value === 'user') return 'member';

  return value;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');

      if (storedToken) {
        setToken(storedToken);
        try {
          const response = await axios.get('http://localhost:8080/api/auth/user/me', {
            headers: {
              Authorization: `Bearer ${storedToken}`
            }
          });
          setUser({
            ...response.data,
            role: normalizeRole(response.data?.role)
          });
        } catch (error) {
          console.error('Error fetching user data:', error);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (nextToken, userData) => {
    setToken(nextToken);
    setUser({
      ...userData,
      role: normalizeRole(userData?.role)
    });
    localStorage.setItem('token', nextToken);
  }, []);

  const logout = useCallback(async () => {
    try {
      if (token) {
        await axios.post('http://localhost:8080/api/auth/logout', {}, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem('token');
    }
  }, [token]);

  const isAuthenticated = !!token && !!user;
  const normalizedRole = normalizeRole(user?.role);
  const isAdmin = normalizedRole === 'admin' || normalizedRole === 'manager';
  const isMember = normalizedRole === 'member';

  return (
    <AuthContext.Provider value={{ user, token, loading, isAuthenticated, isAdmin, isMember, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
