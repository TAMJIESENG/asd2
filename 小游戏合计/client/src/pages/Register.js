import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Alert, Row, Col } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
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

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    if (values.password !== values.confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // 移除不需要发送到服务器的字段
      const { confirmPassword, ...formData } = values;
      
      const result = await register(formData);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || '注册失败，请稍后再试');
      }
    } catch (err) {
      setError('注册过程中出现错误，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Row justify="center">
      <Col xs={22} sm={20} md={16} lg={12} xl={10}>
        <StyledCard>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <Title level={2}>创建账号</Title>
            <p>注册账号来体验所有游戏和功能</p>
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
            form={form}
            name="register"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            size="large"
            layout="vertical"
          >
            <Form.Item
              name="username"
              rules={[
                { required: true, message: '请输入您的用户名!' },
                { min: 3, message: '用户名至少需要3个字符' },
                { max: 20, message: '用户名不能超过20个字符' }
              ]}
            >
              <Input 
                prefix={<UserOutlined />} 
                placeholder="用户名" 
              />
            </Form.Item>
            
            <Form.Item
              name="email"
              rules={[
                { required: true, message: '请输入您的电子邮件!' },
                { type: 'email', message: '请输入有效的电子邮件格式!' }
              ]}
            >
              <Input 
                prefix={<MailOutlined />} 
                placeholder="电子邮件" 
              />
            </Form.Item>
            
            <Form.Item
              name="password"
              rules={[
                { required: true, message: '请输入您的密码!' },
                { min: 6, message: '密码至少需要6个字符' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="密码"
              />
            </Form.Item>
            
            <Form.Item
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                { required: true, message: '请确认您的密码!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('两次输入的密码不一致!'));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="确认密码"
              />
            </Form.Item>
            
            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                block 
                loading={loading}
              >
                注册
              </Button>
            </Form.Item>
            
            <div style={{ textAlign: 'center' }}>
              <p>
                已有账号？ <Link to="/login">立即登录</Link>
              </p>
            </div>
          </Form>
        </StyledCard>
      </Col>
    </Row>
  );
};

export default Register; 