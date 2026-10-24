import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getMeApi, loginApi, registerApi, logoutApi, updateProfileApi } from '../api/auth.api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const cached = localStorage.getItem('fixflow_user');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Check current session on application mount
  const checkAuth = useCallback(async () => {
    try {
      const response = await getMeApi();
      if (response?.data) {
        setUser(response.data);
        try {
          localStorage.setItem('fixflow_user', JSON.stringify(response.data));
        } catch {}
      } else {
        setUser(null);
        try {
          localStorage.removeItem('fixflow_token');
          localStorage.removeItem('fixflow_user');
        } catch {}
      }
    } catch (error) {
      setUser(null);
      try {
        localStorage.removeItem('fixflow_token');
        localStorage.removeItem('fixflow_user');
      } catch {}
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Listen for unauthorized events to smoothly reset state
  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  const login = async (credentialsOrEmail, maybePassword) => {
    const payload =
      typeof credentialsOrEmail === 'string'
        ? { email: credentialsOrEmail.trim(), password: maybePassword }
        : credentialsOrEmail;
    const response = await loginApi(payload);
    const { user: loggedUser, token } = response.data;
    if (token) {
      try {
        localStorage.setItem('fixflow_token', token);
      } catch {}
    }
    if (loggedUser) {
      try {
        localStorage.setItem('fixflow_user', JSON.stringify(loggedUser));
      } catch {}
    }
    setUser(loggedUser);
    return loggedUser;
  };

  const register = async (userData) => {
    const response = await registerApi(userData);
    const { user: registeredUser, token } = response.data;
    if (token) {
      try {
        localStorage.setItem('fixflow_token', token);
      } catch {}
    }
    if (registeredUser) {
      try {
        localStorage.setItem('fixflow_user', JSON.stringify(registeredUser));
      } catch {}
    }
    setUser(registeredUser);
    return registeredUser;
  };

  const updateProfile = async (profileData) => {
    const response = await updateProfileApi(profileData);
    const updatedUser = response.data;
    if (updatedUser) {
      try {
        localStorage.setItem('fixflow_user', JSON.stringify(updatedUser));
      } catch {}
    }
    setUser(updatedUser);
    return updatedUser;
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch (err) {
      console.warn('Logout API failed, clearing local session anyway:', err);
    } finally {
      try {
        localStorage.removeItem('fixflow_token');
        localStorage.removeItem('fixflow_user');
      } catch {}
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    register,
    updateProfile,
    logout,
    refreshUser: checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
