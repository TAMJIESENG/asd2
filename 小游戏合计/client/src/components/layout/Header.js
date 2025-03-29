import React from 'react';
import { Layout, Menu, Button, Dropdown } from 'antd';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  UserOutlined,
  LogoutOutlined,
  LoginOutlined,
  UserAddOutlined,
  DashboardOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import styled from 'styled-components';

const { Header: AntHeader } = Layout;

const StyledHeader = styled(AntHeader)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  background: #001529;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  position: sticky;
  top: 0;
  z-index: 1000;
`;

const Logo = styled(Link)`
  color: white;
  font-size: 20px;
  font-weight: bold;
  margin-right: 30px;
  
  &:hover {
    color: #1890ff;
    opacity: 1;
  }
`;

const RightMenu = styled.div`
  display: flex;
  align-items: center;
`;

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        <Link to="/profile">个人资料</Link>
      </Menu.Item>
      <Menu.Item key="dashboard" icon={<DashboardOutlined />}>
        <Link to="/dashboard">仪表盘</Link>
      </Menu.Item>
      {user && user.role === 'admin' && (
        <Menu.Item key="admin" icon={<DashboardOutlined />}>
          <Link to="/admin">管理后台</Link>
        </Menu.Item>
      )}
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        登出
      </Menu.Item>
    </Menu>
  );

  const getSelectedKey = () => {
    const path = location.pathname;
    if (path === '/') return ['home'];
    if (path.includes('/games/minesweeper')) return ['minesweeper'];
    if (path.includes('/games/snake')) return ['snake'];
    if (path.includes('/games/tetris')) return ['tetris'];
    if (path.includes('/leaderboard')) return ['leaderboard'];
    
    return [];
  };

  return (
    <StyledHeader>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Logo to="/">小游戏合集</Logo>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={getSelectedKey()}
          style={{ lineHeight: '64px', flex: 1 }}
        >
          <Menu.Item key="home">
            <Link to="/">首页</Link>
          </Menu.Item>
          {isAuthenticated && (
            <>
              <Menu.Item key="minesweeper">
                <Link to="/games/minesweeper">扫雷</Link>
              </Menu.Item>
              <Menu.Item key="snake">
                <Link to="/games/snake">贪吃蛇</Link>
              </Menu.Item>
              <Menu.Item key="tetris">
                <Link to="/games/tetris">俄罗斯方块</Link>
              </Menu.Item>
            </>
          )}
          <Menu.Item key="leaderboard">
            <Link to="/leaderboard/minesweeper">排行榜</Link>
          </Menu.Item>
        </Menu>
      </div>
      
      <RightMenu>
        {isAuthenticated ? (
          <Dropdown overlay={userMenu} trigger={['click']}>
            <Button type="text" icon={<UserOutlined />} style={{ color: 'white' }}>
              {user && user.username}
            </Button>
          </Dropdown>
        ) : (
          <>
            <Button 
              type="text" 
              icon={<LoginOutlined />}
              style={{ color: 'white', marginRight: '10px' }}
              onClick={() => navigate('/login')}
            >
              登录
            </Button>
            <Button 
              type="primary"
              icon={<UserAddOutlined />}
              onClick={() => navigate('/register')}
            >
              注册
            </Button>
          </>
        )}
      </RightMenu>
    </StyledHeader>
  );
};

export default Header; 