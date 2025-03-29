import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { message } from 'antd';

// 创建上下文
const AuthContext = createContext();

// 使用认证上下文的自定义钩子
export const useAuth = () => {
  return useContext(AuthContext);
};

// 认证提供者组件
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 检查是否已登录（在组件挂载时）
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (token) {
      // 设置默认请求头包含token
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUserProfile();
    } else {
      setLoading(false);
    }
    
    // 清理函数
    return () => {
      delete axios.defaults.headers.common['Authorization'];
    };
  }, []);
  
  // 获取用户资料
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/users/me');
      setUser(response.data);
      setError(null);
    } catch (err) {
      console.error('获取用户资料错误:', err);
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setError('获取用户资料失败，请重新登录');
    } finally {
      setLoading(false);
    }
  };
  
  // 登录
  const login = async (username, password) => {
    try {
      setLoading(true);
      const response = await axios.post('/api/auth/login', { username, password });
      const { token, user: userData } = response.data;
      
      // 保存令牌到本地存储
      localStorage.setItem('token', token);
      
      // 设置默认请求头
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // 设置用户数据
      setUser(userData);
      setError(null);
      
      message.success('登录成功！');
      return true;
    } catch (err) {
      console.error('登录错误:', err);
      setError(err.response?.data?.message || '登录失败，请检查用户名和密码');
      message.error('登录失败: ' + (err.response?.data?.message || '请检查用户名和密码'));
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // 注册
  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await axios.post('/api/auth/register', userData);
      const { token, user: newUser } = response.data;
      
      // 保存令牌到本地存储
      localStorage.setItem('token', token);
      
      // 设置默认请求头
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // 设置用户数据
      setUser(newUser);
      setError(null);
      
      message.success('注册成功！');
      return true;
    } catch (err) {
      console.error('注册错误:', err);
      setError(err.response?.data?.message || '注册失败，请稍后再试');
      message.error('注册失败: ' + (err.response?.data?.message || '请稍后再试'));
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // 登出
  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    message.success('已成功登出！');
  };
  
  // 更新用户资料
  const updateUserProfile = async (profileData) => {
    try {
      setLoading(true);
      const response = await axios.put('/api/users/profile', profileData);
      setUser(response.data);
      setError(null);
      return true;
    } catch (err) {
      console.error('更新用户资料错误:', err);
      setError(err.response?.data?.message || '更新用户资料失败');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // 上下文值
  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateUserProfile,
    isAuthenticated: !!user
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 