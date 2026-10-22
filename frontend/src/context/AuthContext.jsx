import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getMeApi, loginApi, registerApi, logoutApi, updateProfileApi } from '../api/auth.api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check current session on application mount
  const checkAuth = useCallback(async () => {
    try {
      const response = await getMeApi();
      if (response?.data) {
        setUser(response.data);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (credentialsOrEmail, maybePassword) => {
    const payload =
      typeof credentialsOrEmail === 'string'
        ? { email: credentialsOrEmail.trim(), password: maybePassword }
        : credentialsOrEmail;
    const response = await loginApi(payload);
    const loggedUser = response.data.user;
    setUser(loggedUser);
    return loggedUser;
  };

  const register = async (userData) => {
    const response = await registerApi(userData);
    const registeredUser = response.data.user;
    setUser(registeredUser);
    return registeredUser;
  };

  const updateProfile = async (profileData) => {
    const response = await updateProfileApi(profileData);
    const updatedUser = response.data;
    setUser(updatedUser);
    return updatedUser;
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch (err) {
      console.warn('Logout API failed, clearing local session anyway:', err);
    } finally {
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
