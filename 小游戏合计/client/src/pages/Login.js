import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Alert, Row, Col } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styled from 'styled-components';

const { Title } = Typography;

const StyledCard = styled(Card)`
  max-width: 450px;
  margin: 60px auto;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
`;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await login(values);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || '登录失败，请检查您的凭据');
      }
    } catch (err) {
      setError('登录时出现错误，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Row justify="center">
      <Col xs={22} sm={20} md={16} lg={12} xl={10}>
        <StyledCard>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <Title level={2}>登录账号</Title>
            <p>登录您的账户以访问所有游戏和功能</p>
          </div>
          
          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              closable
              style={{ marginBottom: '20px' }}
            />
          )}
          
          <Form
            name="login"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            size="large"
            layout="vertical"
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: '请输入您的用户名!' }]}
            >
              <Input 
                prefix={<UserOutlined />} 
                placeholder="用户名" 
              />
            </Form.Item>
            
            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入您的密码!' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="密码"
              />
            </Form.Item>
            
            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                block 
                loading={loading}
              >
                登录
              </Button>
            </Form.Item>
            
            <div style={{ textAlign: 'center' }}>
              <p>
                还没有账号？ <Link to="/register">立即注册</Link>
              </p>
            </div>
          </Form>
        </StyledCard>
      </Col>
    </Row>
  );
};

export default Login; 