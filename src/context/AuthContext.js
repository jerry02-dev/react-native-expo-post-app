import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(null);
  const [loading, setLoading] = useState(true);

  // Load token on app start
  useEffect(() => {
  const loadToken = async () => {
    try {
      const savedToken = await SecureStore.getItemAsync('token');

      // ✅ Wait minimum 3 seconds before hiding splash
      const [_, token] = await Promise.all([
        new Promise(resolve => setTimeout(resolve, 3000)), // 3 second delay
        Promise.resolve(savedToken),
      ]);

      if (token) {
        setToken(token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        await fetchUser();
      }
    } catch (e) {
      console.log('Load token error:', e);
    } finally {
      setLoading(false);  // ✅ splash hides after 3 seconds minimum
    }
  };
  loadToken();
}, []);

  // Update profile
  const updateProfile = async (name, email) => {
    const response = await api.put('/auth/profile', { name, email });
    setUser(response.data.data);
    return response.data;
  };

  // Change password
  const changePassword = async (current_password, new_password, new_password_confirmation) => {
    const response = await api.put('/auth/change-password', {
      current_password,
      new_password,
      new_password_confirmation,
    });
    return response.data;
  };

  // Delete account
  const deleteAccount = async () => {
    await api.delete('/auth/delete-account');
    await SecureStore.deleteItemAsync('token');
    delete api.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  // Get current logged in user
  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data.data);
    } catch (e) {
      await logout();
    }
  };

  // Register
  const register = async (name, email, password, password_confirmation) => {
    const response = await api.post('/auth/register', {
      name,
      email,
      password,
      password_confirmation,
    });
    const { token, user } = response.data.data;
    await saveToken(token);
    setUser(user);
  };

  // Login
  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token, user } = response.data.data;
    await saveToken(token);
    setUser(user);
  };

  // Logout
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {}
    await SecureStore.deleteItemAsync('token');
    delete api.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  // Save token to secure storage
  const saveToken = async (newToken) => {
    await SecureStore.setItemAsync('token', newToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    setToken(newToken);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateProfile, changePassword, deleteAccount
     }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);