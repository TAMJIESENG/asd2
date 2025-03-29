import React, { useState, useEffect } from 'react';
import { 
  Card, Avatar, Typography, Tabs, Form, Input, Button, 
  Upload, message, Descriptions, Spin, Alert, Statistic, Row, Col
} from 'antd';
import { 
  UserOutlined, LockOutlined, MailOutlined, 
  UploadOutlined, TrophyOutlined, FireOutlined, ClockCircleOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import styled from 'styled-components';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const ProfileCard = styled(Card)`
  max-width: 900px;
  margin: 0 auto 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const AvatarContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
`;

const StatsCard = styled(Card)`
  margin-bottom: 20px;
`;

const Profile = () => {
  const { user, updateUserProfile } = useAuth();
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [error, setError] = useState(null);

  // 当用户信息加载后填充表单
  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        username: user.username,
        email: user.email,
      });
      
      // 加载用户统计信息
      fetchUserStats();
    }
  }, [user, form]);

  // 获取用户统计信息
  const fetchUserStats = async () => {
    try {
      setLoadingStats(true);
      const response = await axios.get('/api/users/stats');
      setStats(response.data);
      setError(null);
    } catch (err) {
      console.error('获取用户统计信息错误:', err);
      setError('无法加载用户统计信息');
    } finally {
      setLoadingStats(false);
    }
  };

  // 处理个人资料更新
  const handleProfileUpdate = async (values) => {
    try {
      setLoading(true);
      await updateUserProfile(values);
      message.success('个人资料已更新');
    } catch (err) {
      console.error('更新个人资料错误:', err);
      message.error('无法更新个人资料: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // 处理密码修改
  const handlePasswordUpdate = async (values) => {
    try {
      setLoading(true);
      await axios.put('/api/users/password', {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword
      });
      passwordForm.resetFields();
      message.success('密码已更新');
    } catch (err) {
      console.error('更新密码错误:', err);
      message.error('无法更新密码: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // 处理头像上传
  const handleAvatarUpload = async (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('只能上传JPG/PNG文件!');
      return Upload.LIST_IGNORE;
    }
    
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('图片必须小于2MB!');
      return Upload.LIST_IGNORE;
    }
    
    const formData = new FormData();
    formData.append('avatar', file);
    
    try {
      setLoading(true);
      await axios.post('/api/users/avatar', formData);
      message.success('头像已更新');
      // 刷新用户信息
      if (updateUserProfile) {
        await updateUserProfile();
      }
      return false;
    } catch (err) {
      console.error('上传头像错误:', err);
      message.error('无法上传头像');
      return Upload.LIST_IGNORE;
    } finally {
      setLoading(false);
    }
  };

  // 游戏统计卡片
  const renderStatsCards = () => {
    if (loadingStats) {
      return <Spin size="large" tip="加载统计信息..." />;
    }
    
    if (error) {
      return <Alert message="错误" description={error} type="error" showIcon />;
    }
    
    if (!stats) {
      return <Alert message="信息" description="暂无游戏统计信息" type="info" showIcon />;
    }
    
    return (
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <StatsCard title="扫雷">
            <Statistic 
              title="最佳时间" 
              value={stats.minesweeper?.bestTime || '-'} 
              suffix="秒"
              valueStyle={{ color: '#3f8600' }}
              prefix={<ClockCircleOutlined />}
            />
            <Statistic 
              title="游戏次数" 
              value={stats.minesweeper?.gamesPlayed || 0} 
            />
            <Statistic 
              title="胜率" 
              value={stats.minesweeper?.gamesPlayed 
                ? Math.round((stats.minesweeper?.gamesWon / stats.minesweeper?.gamesPlayed) * 100) 
                : 0} 
              suffix="%" 
              valueStyle={{ color: '#cf1322' }}
              prefix={<TrophyOutlined />}
            />
          </StatsCard>
        </Col>
        
        <Col xs={24} sm={8}>
          <StatsCard title="贪吃蛇">
            <Statistic 
              title="最高分" 
              value={stats.snake?.highScore || 0} 
              valueStyle={{ color: '#3f8600' }}
              prefix={<FireOutlined />}
            />
            <Statistic 
              title="游戏次数" 
              value={stats.snake?.gamesPlayed || 0} 
            />
            <Statistic 
              title="平均分数" 
              value={stats.snake?.gamesPlayed 
                ? Math.round(stats.snake?.totalScore / stats.snake?.gamesPlayed) 
                : 0} 
            />
          </StatsCard>
        </Col>
        
        <Col xs={24} sm={8}>
          <StatsCard title="俄罗斯方块">
            <Statistic 
              title="最高分" 
              value={stats.tetris?.highScore || 0} 
              valueStyle={{ color: '#3f8600' }}
              prefix={<FireOutlined />}
            />
            <Statistic 
              title="游戏次数" 
              value={stats.tetris?.gamesPlayed || 0} 
            />
            <Statistic 
              title="平均消除行数" 
              value={stats.tetris?.gamesPlayed 
                ? Math.round(stats.tetris?.totalLinesCleared / stats.tetris?.gamesPlayed) 
                : 0}
            />
          </StatsCard>
        </Col>
      </Row>
    );
  };

  if (!user) {
    return (
      <div className="page-container">
        <Spin size="large" tip="加载用户信息..." />
      </div>
    );
  }

  return (
    <div className="page-container">
      <Title level={2}>个人资料</Title>
      
      <ProfileCard>
        <AvatarContainer>
          <Avatar 
            size={100} 
            src={user.avatar ? `/images/avatars/${user.avatar}` : null}
            icon={!user.avatar && <UserOutlined />}
          />
          <Title level={4} style={{ marginTop: 16, marginBottom: 0 }}>{user.username}</Title>
          <Text type="secondary">加入时间: {new Date(user.createdAt).toLocaleDateString()}</Text>
        </AvatarContainer>
        
        <Tabs defaultActiveKey="stats">
          <TabPane tab="游戏统计" key="stats">
            {renderStatsCards()}
          </TabPane>
          
          <TabPane tab="个人资料" key="profile">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleProfileUpdate}
              initialValues={{
                username: user.username,
                email: user.email
              }}
            >
              <Form.Item
                name="username"
                label="用户名"
                rules={[{ required: true, message: '请输入用户名!' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="用户名" />
              </Form.Item>
              
              <Form.Item
                name="email"
                label="电子邮箱"
                rules={[
                  { required: true, message: '请输入电子邮箱!' },
                  { type: 'email', message: '请输入有效的电子邮箱地址!' }
                ]}
              >
                <Input prefix={<MailOutlined />} placeholder="电子邮箱" />
              </Form.Item>
              
              <Form.Item
                label="头像"
                extra="支持 JPG/PNG 文件, 大小不超过 2MB"
              >
                <Upload
                  name="avatar"
                  listType="picture"
                  showUploadList={false}
                  beforeUpload={handleAvatarUpload}
                >
                  <Button icon={<UploadOutlined />}>上传头像</Button>
                </Upload>
              </Form.Item>
              
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                  更新资料
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
          
          <TabPane tab="修改密码" key="password">
            <Form
              form={passwordForm}
              layout="vertical"
              onFinish={handlePasswordUpdate}
            >
              <Form.Item
                name="currentPassword"
                label="当前密码"
                rules={[{ required: true, message: '请输入当前密码!' }]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="当前密码" />
              </Form.Item>
              
              <Form.Item
                name="newPassword"
                label="新密码"
                rules={[
                  { required: true, message: '请输入新密码!' },
                  { min: 6, message: '密码长度至少为6个字符!' }
                ]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="新密码" />
              </Form.Item>
              
              <Form.Item
                name="confirmPassword"
                label="确认新密码"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: '请确认新密码!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('两次输入的密码不匹配!'));
                    },
                  }),
                ]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="确认新密码" />
              </Form.Item>
              
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                  更新密码
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>
      </ProfileCard>
    </div>
  );
};

export default Profile; 