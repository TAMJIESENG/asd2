import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 加载用户
  const loadUser = async () => {
    // 检查token是否存在
    if (localStorage.token) {
      setAuthToken(localStorage.token);
    } else {
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get('/api/auth/user');
      setUser(res.data);
      setIsAuthenticated(true);
    } catch (err) {
      console.error(err);
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
      setError('授权已过期，请重新登录');
    }
    setLoading(false);
  };

  // 设置认证token
  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common['x-auth-token'] = token;
    } else {
      delete axios.defaults.headers.common['x-auth-token'];
    }
  };

  // 注册用户
  const register = async (formData) => {
    try {
      const res = await axios.post('/api/auth/register', formData);
      localStorage.setItem('token', res.data.token);
      setAuthToken(res.data.token);
      await loadUser();
      return { success: true };
    } catch (err) {
      setError(
        err.response?.data?.errors?.[0]?.msg || 
        '注册失败，请稍后再试'
      );
      return { success: false, error: err.response?.data?.errors?.[0]?.msg };
    }
  };

  // 登录用户
  const login = async (formData) => {
    try {
      const res = await axios.post('/api/auth/login', formData);
      localStorage.setItem('token', res.data.token);
      setAuthToken(res.data.token);
      await loadUser();
      return { success: true };
    } catch (err) {
      setError(
        err.response?.data?.errors?.[0]?.msg || 
        '登录失败，请检查您的凭据'
      );
      return { success: false, error: err.response?.data?.errors?.[0]?.msg };
    }
  };

  // 登出用户
  const logout = () => {
    localStorage.removeItem('token');
    setAuthToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  // 清除错误
  const clearError = () => {
    setError(null);
  };

  // 在组件挂载时加载用户
  useEffect(() => {
    loadUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        error,
        register,
        login,
        logout,
        loadUser,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// 创建钩子以便在其他组件中使用
export const useAuth = () => useContext(AuthContext); 