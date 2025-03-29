import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from 'antd';
import { AuthProvider } from './contexts/AuthContext';

// 布局组件
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';

// 页面组件
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import About from './pages/About';
import NotFound from './pages/NotFound';
import Leaderboard from './pages/Leaderboard';

// 游戏组件
import Minesweeper from './games/Minesweeper';
import Snake from './games/Snake';
import Tetris from './games/Tetris';

// 受保护路由组件
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token') !== null;
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

const { Content } = Layout;

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Layout style={{ minHeight: '100vh' }}>
          <Header />
          <Layout>
            <Sidebar />
            <Layout style={{ padding: '0 24px 24px' }}>
              <Content
                className="site-layout-background"
                style={{
                  padding: 24,
                  margin: '16px 0',
                  minHeight: 280,
                }}
              >
                <Routes>
                  {/* 公共路由 */}
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/leaderboard" element={<Leaderboard />} />
                  <Route path="/leaderboard/:gameType" element={<Leaderboard />} />
                  
                  {/* 受保护路由 */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/games/minesweeper" element={
                    <ProtectedRoute>
                      <Minesweeper />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/games/snake" element={
                    <ProtectedRoute>
                      <Snake />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/games/tetris" element={
                    <ProtectedRoute>
                      <Tetris />
                    </ProtectedRoute>
                  } />
                  
                  {/* 404页面 */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Content>
              <Footer />
            </Layout>
          </Layout>
        </Layout>
      </Router>
    </AuthProvider>
  );
};

export default App; 