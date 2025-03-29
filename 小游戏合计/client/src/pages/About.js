import React from 'react';
import { Typography, Card, Avatar, Row, Col, Divider, Timeline } from 'antd';
import { 
  SmileOutlined, 
  RocketOutlined, 
  TrophyOutlined, 
  TeamOutlined, 
  SafetyOutlined,
  CodeOutlined
} from '@ant-design/icons';
import styled from 'styled-components';

const { Title, Paragraph, Text } = Typography;

const PageContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
`;

const StyledCard = styled(Card)`
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const FeatureCard = styled(Card)`
  text-align: center;
  height: 100%;
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
`;

const IconWrapper = styled.div`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #1890ff;
`;

const About = () => {
  const features = [
    {
      title: '多种经典游戏',
      icon: <RocketOutlined />,
      description: '收录扫雷、贪吃蛇和俄罗斯方块等经典小游戏，随时随地享受游戏乐趣。'
    },
    {
      title: '记录与排行榜',
      icon: <TrophyOutlined />,
      description: '追踪您的游戏进度，查看历史记录，争夺排行榜顶端位置。'
    },
    {
      title: '用户档案',
      icon: <TeamOutlined />,
      description: '创建个人档案，自定义头像，展示您的游戏成就和统计数据。'
    },
    {
      title: '安全可靠',
      icon: <SafetyOutlined />,
      description: '使用现代安全标准保护您的账户和数据安全。'
    }
  ];

  return (
    <PageContainer>
      <Title level={2}>关于小游戏合集</Title>
      
      <StyledCard>
        <Paragraph>
          <Text strong>小游戏合集</Text>是一个集合了多种经典小游戏的平台，旨在为用户提供一个简单、有趣且怀旧的游戏体验。无论您是想短暂放松，还是想挑战自我提高游戏技巧，我们的平台都能满足您的需求。
        </Paragraph>
        
        <Paragraph>
          我们精心选择并重新实现了多款经典游戏，包括扫雷、贪吃蛇和俄罗斯方块等。这些游戏不仅保留了原版的乐趣，还加入了现代的功能，如记分系统、排行榜和个人统计等，让您的游戏体验更加丰富和有意义。
        </Paragraph>
      </StyledCard>
      
      <Title level={3}>平台特色</Title>
      <Row gutter={[16, 16]} style={{ marginBottom: '30px' }}>
        {features.map((feature, index) => (
          <Col xs={24} sm={12} md={6} key={index}>
            <FeatureCard>
              <IconWrapper>{feature.icon}</IconWrapper>
              <Title level={4}>{feature.title}</Title>
              <Paragraph>{feature.description}</Paragraph>
            </FeatureCard>
          </Col>
        ))}
      </Row>
      
      <Title level={3}>我们的使命</Title>
      <StyledCard>
        <Paragraph>
          在当今快节奏的数字世界中，我们相信简单而经典的游戏仍然具有独特的魅力。我们的使命是：
        </Paragraph>
        
        <ul>
          <li>保存和传承经典游戏的精髓，让更多人体验这些简单而又充满乐趣的游戏</li>
          <li>为用户提供高质量、无广告的游戏体验</li>
          <li>创建一个友好的社区，让玩家可以分享技巧、比较成绩，一起成长</li>
          <li>不断改进和添加新功能，使平台更加完善</li>
        </ul>
      </StyledCard>
      
      <Title level={3}>开发历程</Title>
      <StyledCard>
        <Timeline>
          <Timeline.Item dot={<CodeOutlined style={{ fontSize: '16px' }} />}>
            <Text strong>项目启动</Text> - 确定平台概念和技术栈
          </Timeline.Item>
          <Timeline.Item dot={<CodeOutlined style={{ fontSize: '16px' }} />}>
            <Text strong>用户界面设计</Text> - 创建响应式和用户友好的界面
          </Timeline.Item>
          <Timeline.Item dot={<CodeOutlined style={{ fontSize: '16px' }} />}>
            <Text strong>游戏实现</Text> - 使用React实现各个经典游戏
          </Timeline.Item>
          <Timeline.Item dot={<CodeOutlined style={{ fontSize: '16px' }} />}>
            <Text strong>用户系统</Text> - 添加用户注册、登录和个人资料功能
          </Timeline.Item>
          <Timeline.Item dot={<CodeOutlined style={{ fontSize: '16px' }} />}>
            <Text strong>数据持久化</Text> - 实现游戏记录和统计功能
          </Timeline.Item>
          <Timeline.Item dot={<SmileOutlined style={{ fontSize: '16px' }} />}>
            <Text strong>平台上线</Text> - 向用户开放访问
          </Timeline.Item>
        </Timeline>
      </StyledCard>
      
      <Title level={3}>技术栈</Title>
      <StyledCard>
        <Paragraph>
          我们的平台使用了现代化的Web技术栈：
        </Paragraph>
        
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Title level={4}>前端</Title>
            <ul>
              <li>React - 用户界面库</li>
              <li>Ant Design - UI组件库</li>
              <li>Styled-components - CSS样式解决方案</li>
              <li>Axios - HTTP客户端</li>
              <li>React Router - 页面路由</li>
            </ul>
          </Col>
          
          <Col xs={24} md={12}>
            <Title level={4}>后端</Title>
            <ul>
              <li>Node.js - JavaScript运行时</li>
              <li>Express - Web框架</li>
              <li>MongoDB - 数据库</li>
              <li>JWT - 用户认证</li>
              <li>RESTful API - 前后端通信</li>
            </ul>
          </Col>
        </Row>
      </StyledCard>
      
      <Divider />
      
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <Paragraph>
          <Text type="secondary">
            © {new Date().getFullYear()} 小游戏合集 - 一个充满乐趣的游戏平台
          </Text>
        </Paragraph>
      </div>
    </PageContainer>
  );
};

export default About; 