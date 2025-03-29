import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

const AdminRoute = ({ element }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin indicator={antIcon} />
      </div>
    );
  }

  // 检查用户是否已登录且是否为管理员
  if (!isAuthenticated || !user || user.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }

  return element;
};

export default AdminRoute; 