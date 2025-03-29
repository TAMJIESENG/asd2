import React, { useState, useEffect } from 'react';
import { Layout, Menu } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  GamepadOutlined,
  TrophyOutlined,
  UserOutlined,
  SettingOutlined,
  BulbOutlined
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';

const { Sider } = Layout;
const { SubMenu } = Menu;

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [openKeys, setOpenKeys] = useState([]);
  
  // 自动设置选中的菜单和展开的子菜单
  useEffect(() => {
    const path = location.pathname;
    let selected = [];
    let opened = [];
    
    if (path === '/dashboard') {
      selected = ['dashboard'];
    } else if (path === '/profile') {
      selected = ['profile'];
    } else if (path.includes('/games')) {
      selected = [path.split('/').pop()];
      opened = ['games'];
    } else if (path.includes('/leaderboard')) {
      selected = ['leaderboard'];
    } else if (path.includes('/admin')) {
      selected = [path.split('/').pop() || 'admin-dashboard'];
      opened = ['admin'];
    }
    
    setSelectedKeys(selected);
    setOpenKeys(opened);
  }, [location]);
  
  // 处理子菜单展开/收起
  const handleOpenChange = (keys) => {
    setOpenKeys(keys);
  };
  
  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={setCollapsed}
      width={200}
      style={{
        background: '#fff',
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        zIndex: 999
      }}
    >
      <Menu
        mode="inline"
        theme="light"
        selectedKeys={selectedKeys}
        openKeys={openKeys}
        onOpenChange={handleOpenChange}
        style={{ height: '100%', borderRight: 0, paddingTop: '20px' }}
      >
        <Menu.Item key="dashboard" icon={<DashboardOutlined />}>
          <Link to="/dashboard">仪表盘</Link>
        </Menu.Item>
        
        <Menu.Item key="profile" icon={<UserOutlined />}>
          <Link to="/profile">个人资料</Link>
        </Menu.Item>
        
        <SubMenu key="games" icon={<GamepadOutlined />} title="游戏中心">
          <Menu.Item key="minesweeper">
            <Link to="/games/minesweeper">扫雷</Link>
          </Menu.Item>
          <Menu.Item key="snake">
            <Link to="/games/snake">贪吃蛇</Link>
          </Menu.Item>
          <Menu.Item key="tetris">
            <Link to="/games/tetris">俄罗斯方块</Link>
          </Menu.Item>
        </SubMenu>
        
        <Menu.Item key="leaderboard" icon={<TrophyOutlined />}>
          <Link to="/leaderboard/minesweeper">排行榜</Link>
        </Menu.Item>
        
        {user && user.role === 'admin' && (
          <SubMenu key="admin" icon={<SettingOutlined />} title="管理后台">
            <Menu.Item key="admin-dashboard">
              <Link to="/admin">管理仪表盘</Link>
            </Menu.Item>
            <Menu.Item key="users">
              <Link to="/admin/users">用户管理</Link>
            </Menu.Item>
          </SubMenu>
        )}
      </Menu>
    </Sider>
  );
};

export default Sidebar; 