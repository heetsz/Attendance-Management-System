import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for saved user on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('ams_user');
    const savedToken = localStorage.getItem('ams_token');
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
    }
    setLoading(false);
  }, []);

  const loginAdmin = async (username, password) => {
    const response = await api.post('/auth/admin/login', { username, password });
    const { token, user: userData } = response.data;
    localStorage.setItem('ams_token', token);
    localStorage.setItem('ams_user', JSON.stringify(userData));
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
    return userData;
  };

  const loginStudent = async (uid, password) => {
    const response = await api.post('/auth/student/login', { uid, password });
    const { token, user: userData } = response.data;
    localStorage.setItem('ams_token', token);
    localStorage.setItem('ams_user', JSON.stringify(userData));
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
    return userData;
  };

  const changePassword = async (currentPassword, newPassword) => {
    const response = await api.post('/auth/student/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // Ignore logout API errors
    }
    localStorage.removeItem('ams_token');
    localStorage.removeItem('ams_user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const value = {
    user,
    loading,
    loginAdmin,
    loginStudent,
    changePassword,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isStudent: user?.role === 'student',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
