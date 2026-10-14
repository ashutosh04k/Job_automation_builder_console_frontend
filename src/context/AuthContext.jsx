import React, { createContext, useContext, useState, useEffect } from 'react';
import { authFetch } from '../config/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('autoresume_token'));
  const [loading, setLoading] = useState(true);

  // Validate existing token on initial load
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('autoresume_token');
      if (!savedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await authFetch('/api/auth/me');
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
        } else {
          // Token invalid or expired
          logout();
        }
      } catch (err) {
        console.warn('Auth check error:', err.message);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await authFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (data.success && data.token) {
        localStorage.setItem('autoresume_token', data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true, message: data.message };
      } else {
        return { success: false, error: data.error || 'Login failed.' };
      }
    } catch (err) {
      return { success: false, error: 'Could not connect to authentication server.' };
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await authFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();

      if (data.success && data.token) {
        localStorage.setItem('autoresume_token', data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true, message: data.message };
      } else {
        return { success: false, error: data.error || 'Registration failed.' };
      }
    } catch (err) {
      return { success: false, error: 'Could not connect to authentication server.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('autoresume_token');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const res = await authFetch('/api/auth/me');
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
      }
    } catch (e) {
      console.warn('Failed to refresh user profile:', e.message);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
