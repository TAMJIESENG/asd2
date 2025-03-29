import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Typography, Table, Button, Tabs, Empty } from 'antd';
import { Link } from 'react-router-dom';
import { 
  TrophyOutlined, 
  ClockCircleOutlined, 
  FireOutlined,
  PlayCircleOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import styled from 'styled-components';

const { Title } = Typography;
const { TabPane } = Tabs;

const StyledCard = styled(Card)`
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
  margin-bottom: 20px;
  height: 100%;
`;

const GameButton = styled(Button)`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 30px 0;
  border-radius: 8px;
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
  
  .anticon {
    font-size: 36px;
    margin-bottom: 10px;
  }
  
  .game-name {
    font-size: 16px;
    font-weight: 500;
  }
`;

const Dashboard = () => {
  const { user } = useAuth();
  const [gameRecords, setGameRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 加载用户游戏记录
  useEffect(() => {
    const fetchGameRecords = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/games/records');
        setGameRecords(response.data);
        setError(null);
      } catch (err) {
        setError('无法加载游戏记录，请稍后再试');
        console.error('获取游戏记录错误:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGameRecords();
  }, []);

  // 游戏入口
  const games = [
    {
      id: 'minesweeper',
      name: '扫雷',
      icon: <ClockCircleOutlined />,
      path: '/games/minesweeper',
      color: '#1890ff'
    },
    {
      id: 'snake',
      name: '贪吃蛇',
      icon: <FireOutlined />,
      path: '/games/snake',
      color: '#52c41a'
    },
    {
      id: 'tetris',
      name: '俄罗斯方块',
      icon: <PlayCircleOutlined />,
      path: '/games/tetris',
      color: '#722ed1'
    }
  ];

  // 统计数据卡片
  const statsCards = [
    {
      title: '总游戏局数',
      value: user ? 
        user.gameStats.minesweeper.played + 
        user.gameStats.snake.played + 
        user.gameStats.tetris.played : 0,
      icon: <FireOutlined style={{ color: '#ff4d4f' }} />,
      color: '#fff2f0',
      borderColor: '#ffccc7'
    },
    {
      title: '扫雷最佳时间',
      value: user?.gameStats.minesweeper.bestTime ? 
        `${user.gameStats.minesweeper.bestTime}秒` : '暂无记录',
      icon: <ClockCircleOutlined style={{ color: '#1890ff' }} />,
      color: '#e6f7ff',
      borderColor: '#91d5ff'
    },
    {
      title: '贪吃蛇最高分',
      value: user?.gameStats.snake.highScore || 0,
      icon: <TrophyOutlined style={{ color: '#52c41a' }} />,
      color: '#f6ffed',
      borderColor: '#b7eb8f'
    },
    {
      title: '俄罗斯方块最高分',
      value: user?.gameStats.tetris.highScore || 0,
      icon: <TrophyOutlined style={{ color: '#722ed1' }} />,
      color: '#f9f0ff',
      borderColor: '#d3adf7'
    }
  ];

  // 处理记录表格
  const getColumnsByGameType = (gameType) => {
    const baseColumns = [
      {
        title: '日期',
        dataIndex: 'date',
        key: 'date',
        render: text => new Date(text).toLocaleString()
      },
      {
        title: '难度',
        dataIndex: 'difficulty',
        key: 'difficulty',
        render: text => text.charAt(0).toUpperCase() + text.slice(1)
      }
    ];
    
    if (gameType === 'minesweeper') {
      return [
        ...baseColumns,
        {
          title: '分数',
          dataIndex: 'score',
          key: 'score'
        },
        {
          title: '用时 (秒)',
          dataIndex: 'time',
          key: 'time'
        },
        {
          title: '结果',
          dataIndex: 'completed',
          key: 'completed',
          render: completed => completed ? '胜利' : '失败'
        }
      ];
    } else {
      return [
        ...baseColumns,
        {
          title: '分数',
          dataIndex: 'score',
          key: 'score'
        }
      ];
    }
  };

  const getFilteredRecords = (gameType) => {
    return gameRecords.filter(record => record.gameType === gameType);
  };

  return (
    <div className="page-container">
      <Title level={2}>个人仪表盘</Title>
      <Title level={4}>欢迎回来，{user?.username}！</Title>

      {/* 游戏统计数据 */}
      <Row gutter={[20, 20]} style={{ marginTop: '30px', marginBottom: '40px' }}>
        {statsCards.map((stat, index) => (
          <Col xs={24} sm={12} md={6} key={index}>
            <StyledCard 
              style={{ 
                background: stat.color, 
                borderColor: stat.borderColor 
              }}
            >
              <Statistic
                title={stat.title}
                value={stat.value}
                valueStyle={{ color: '#333' }}
                prefix={stat.icon}
              />
            </StyledCard>
          </Col>
        ))}
      </Row>

      {/* 游戏入口 */}
      <Title level={4} style={{ marginTop: '30px' }}>选择游戏</Title>
      <Row gutter={[20, 20]} style={{ marginTop: '20px', marginBottom: '40px' }}>
        {games.map(game => (
          <Col xs={24} sm={8} key={game.id}>
            <Link to={game.path}>
              <GameButton 
                type="default" 
                block
                style={{ color: game.color, borderColor: game.color }}
              >
                {game.icon}
                <span className="game-name">{game.name}</span>
              </GameButton>
            </Link>
          </Col>
        ))}
      </Row>

      {/* 游戏记录 */}
      <Title level={4}>游戏记录</Title>
      <Tabs defaultActiveKey="minesweeper">
        <TabPane tab="扫雷" key="minesweeper">
          {loading ? (
            <div className="loading-container">加载中...</div>
          ) : getFilteredRecords('minesweeper').length > 0 ? (
            <Table 
              dataSource={getFilteredRecords('minesweeper')} 
              columns={getColumnsByGameType('minesweeper')}
              rowKey="_id"
              pagination={{ pageSize: 5 }}
            />
          ) : (
            <Empty description="暂无扫雷游戏记录" />
          )}
        </TabPane>
        <TabPane tab="贪吃蛇" key="snake">
          {loading ? (
            <div className="loading-container">加载中...</div>
          ) : getFilteredRecords('snake').length > 0 ? (
            <Table 
              dataSource={getFilteredRecords('snake')} 
              columns={getColumnsByGameType('snake')}
              rowKey="_id"
              pagination={{ pageSize: 5 }}
            />
          ) : (
            <Empty description="暂无贪吃蛇游戏记录" />
          )}
        </TabPane>
        <TabPane tab="俄罗斯方块" key="tetris">
          {loading ? (
            <div className="loading-container">加载中...</div>
          ) : getFilteredRecords('tetris').length > 0 ? (
            <Table 
              dataSource={getFilteredRecords('tetris')} 
              columns={getColumnsByGameType('tetris')}
              rowKey="_id"
              pagination={{ pageSize: 5 }}
            />
          ) : (
            <Empty description="暂无俄罗斯方块游戏记录" />
          )}
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Dashboard; 