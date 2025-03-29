import React from 'react';
import { Typography, Button, Row, Col, Card, Carousel } from 'antd';
import { 
  RocketOutlined, 
  TrophyOutlined,
  PlayCircleOutlined,
  UserOutlined
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';

const { Title, Paragraph } = Typography;

const HeroSection = styled.div`
  text-align: center;
  padding: 40px 20px;
  background: linear-gradient(135deg, #1890ff 0%, #722ed1 100%);
  color: white;
  border-radius: 8px;
  margin-bottom: 40px;
`;

const StyledCarousel = styled(Carousel)`
  margin-bottom: 40px;
  
  .slick-slide {
    text-align: center;
    height: 300px;
    line-height: 300px;
    background: #364d79;
    border-radius: 8px;
    overflow: hidden;
  }
  
  .slick-slide h3 {
    color: white;
  }
  
  .slick-dots li button {
    background: #1890ff;
  }
`;

const CarouselContent = styled.div`
  height: 100%;
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.5);
`;

const GameCard = styled(Card)`
  margin-bottom: 20px;
  transition: all 0.3s;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
`;

const IconWrapper = styled.div`
  font-size: 3rem;
  text-align: center;
  margin-bottom: 10px;
  color: #1890ff;
`;

const ButtonGroup = styled.div`
  margin-top: 20px;
  display: flex;
  gap: 10px;
  justify-content: center;
`;

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const games = [
    {
      title: '扫雷',
      description: '一个考验逻辑思维和计算能力的经典游戏，找出所有非雷区域而不触发地雷。',
      icon: <RocketOutlined />,
      path: '/games/minesweeper'
    },
    {
      title: '贪吃蛇',
      description: '控制蛇吃食物并成长，但要小心不要撞到自己或墙壁。简单但令人上瘾的游戏。',
      icon: <PlayCircleOutlined />,
      path: '/games/snake'
    },
    {
      title: '俄罗斯方块',
      description: '经典的方块堆叠游戏，通过旋转和移动不同形状的方块来消除行并获得分数。',
      icon: <TrophyOutlined />,
      path: '/games/tetris'
    }
  ];
  
  const handleGameClick = (path) => {
    if (user) {
      navigate(path);
    } else {
      navigate('/login', { state: { from: path } });
    }
  };
  
  return (
    <div>
      <HeroSection>
        <Title style={{ color: 'white' }}>欢迎来到小游戏合集</Title>
        <Paragraph style={{ color: 'white', fontSize: '18px' }}>
          体验多种经典小游戏，记录成就，挑战排行榜
        </Paragraph>
        
        <ButtonGroup>
          {user ? (
            <Button type="primary" size="large" onClick={() => navigate('/dashboard')}>
              进入控制台
            </Button>
          ) : (
            <>
              <Button type="primary" size="large" onClick={() => navigate('/register')}>
                立即注册
              </Button>
              <Button size="large" onClick={() => navigate('/login')}>
                用户登录
              </Button>
            </>
          )}
        </ButtonGroup>
      </HeroSection>
      
      <StyledCarousel autoplay>
        <div>
          <CarouselContent>
            <Title level={2} style={{ color: 'white', margin: 0 }}>扫雷</Title>
            <Paragraph style={{ color: 'white' }}>挑战你的逻辑思维，小心地雷！</Paragraph>
          </CarouselContent>
        </div>
        <div>
          <CarouselContent>
            <Title level={2} style={{ color: 'white', margin: 0 }}>贪吃蛇</Title>
            <Paragraph style={{ color: 'white' }}>控制贪吃蛇吃掉食物并成长！</Paragraph>
          </CarouselContent>
        </div>
        <div>
          <CarouselContent>
            <Title level={2} style={{ color: 'white', margin: 0 }}>俄罗斯方块</Title>
            <Paragraph style={{ color: 'white' }}>旋转并移动方块，消除行获得高分！</Paragraph>
          </CarouselContent>
        </div>
      </StyledCarousel>
      
      <Title level={2} style={{ textAlign: 'center', marginBottom: '30px' }}>
        我们的游戏
      </Title>
      
      <Row gutter={[16, 16]}>
        {games.map((game, index) => (
          <Col xs={24} sm={8} key={index}>
            <GameCard 
              hoverable 
              onClick={() => handleGameClick(game.path)}
            >
              <IconWrapper>{game.icon}</IconWrapper>
              <Title level={3} style={{ textAlign: 'center' }}>{game.title}</Title>
              <Paragraph>{game.description}</Paragraph>
              <div style={{ textAlign: 'center' }}>
                <Button type="primary" icon={<PlayCircleOutlined />}>
                  {user ? '开始游戏' : '登录后游戏'}
                </Button>
              </div>
            </GameCard>
          </Col>
        ))}
      </Row>
      
      <div style={{ textAlign: 'center', margin: '40px 0' }}>
        <Title level={3}>特色功能</Title>
        <Row gutter={[16, 16]} style={{ marginTop: '20px' }}>
          <Col xs={24} sm={8}>
            <Title level={4}>
              <TrophyOutlined /> 排行榜
            </Title>
            <Paragraph>
              与其他玩家比拼，查看您在每个游戏中的排名，争取登上榜首！
            </Paragraph>
            <Link to="/leaderboard">
              <Button>查看排行榜</Button>
            </Link>
          </Col>
          
          <Col xs={24} sm={8}>
            <Title level={4}>
              <UserOutlined /> 个人档案
            </Title>
            <Paragraph>
              创建个性化的个人档案，展示您的游戏成就和统计数据。
            </Paragraph>
            <Link to={user ? '/profile' : '/register'}>
              <Button>{user ? '查看个人档案' : '创建个人档案'}</Button>
            </Link>
          </Col>
          
          <Col xs={24} sm={8}>
            <Title level={4}>
              <RocketOutlined /> 持续更新
            </Title>
            <Paragraph>
              我们将持续添加新游戏和功能，敬请期待更多内容！
            </Paragraph>
            <Link to="/about">
              <Button>了解更多</Button>
            </Link>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Home; 