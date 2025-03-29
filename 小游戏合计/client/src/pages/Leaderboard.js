import React, { useState, useEffect } from 'react';
import { Table, Typography, Card, Radio, Avatar, Spin, Empty, Alert } from 'antd';
import { TrophyOutlined, UserOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';

const { Title } = Typography;

const StyledCard = styled(Card)`
  margin-bottom: 20px;
`;

const RadioGroup = styled(Radio.Group)`
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
`;

const Leaderboard = () => {
  const { gameType = 'minesweeper' } = useParams();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // 加载排行榜数据
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/games/leaderboard/${gameType}`);
        setLeaderboard(response.data);
        setError(null);
      } catch (err) {
        console.error('获取排行榜错误:', err);
        setError('无法加载排行榜数据，请稍后再试');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [gameType]);

  // 切换游戏类型
  const handleGameTypeChange = (e) => {
    navigate(`/leaderboard/${e.target.value}`);
  };

  // 根据游戏类型设置表格列
  const getColumns = () => {
    const baseColumns = [
      {
        title: '排名',
        dataIndex: 'rank',
        key: 'rank',
        width: 80,
        render: (_, record, index) => {
          const icons = [
            <TrophyOutlined style={{ color: '#FFD700', fontSize: '20px' }} />,
            <TrophyOutlined style={{ color: '#C0C0C0', fontSize: '18px' }} />,
            <TrophyOutlined style={{ color: '#CD7F32', fontSize: '16px' }} />
          ];
          return index < 3 ? (
            <div style={{ textAlign: 'center' }}>
              {icons[index]}
              <div>{index + 1}</div>
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>{index + 1}</div>
          );
        }
      },
      {
        title: '玩家',
        dataIndex: 'username',
        key: 'username',
        render: (text, record) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Avatar
              size="small"
              icon={<UserOutlined />}
              src={record.avatar ? `/images/avatars/${record.avatar}` : null}
            />
            <span>{text}</span>
          </div>
        )
      }
    ];

    if (gameType === 'minesweeper') {
      return [
        ...baseColumns,
        {
          title: '最佳时间 (秒)',
          dataIndex: 'bestTime',
          key: 'bestTime',
          sorter: (a, b) => a.bestTime - b.bestTime,
          render: (time) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <ClockCircleOutlined />
              <span>{time}</span>
            </div>
          )
        },
        {
          title: '胜利次数',
          dataIndex: 'gamesWon',
          key: 'gamesWon'
        }
      ];
    } else {
      return [
        ...baseColumns,
        {
          title: '最高分',
          dataIndex: 'highScore',
          key: 'highScore',
          sorter: (a, b) => b.highScore - a.highScore,
          render: (score) => (
            <div style={{ fontWeight: 'bold', color: '#1890ff' }}>
              {score}
            </div>
          )
        },
        {
          title: '游戏次数',
          dataIndex: 'gamesPlayed',
          key: 'gamesPlayed'
        }
      ];
    }
  };

  // 获取游戏标题
  const getGameTitle = () => {
    switch (gameType) {
      case 'minesweeper': return '扫雷';
      case 'snake': return '贪吃蛇';
      case 'tetris': return '俄罗斯方块';
      default: return '未知游戏';
    }
  };

  return (
    <div className="page-container">
      <Title level={2}>游戏排行榜</Title>

      <StyledCard>
        <RadioGroup value={gameType} onChange={handleGameTypeChange}>
          <Radio.Button value="minesweeper">扫雷</Radio.Button>
          <Radio.Button value="snake">贪吃蛇</Radio.Button>
          <Radio.Button value="tetris">俄罗斯方块</Radio.Button>
        </RadioGroup>

        <Title level={4}>{getGameTitle()}排行榜</Title>

        {loading ? (
          <div className="loading-container">
            <Spin size="large" tip="加载中..." />
          </div>
        ) : error ? (
          <Alert
            message="加载错误"
            description={error}
            type="error"
            showIcon
          />
        ) : leaderboard.length === 0 ? (
          <Empty description="暂无排行榜数据" />
        ) : (
          <Table
            dataSource={leaderboard}
            columns={getColumns()}
            rowKey="username"
            pagination={false}
            className="leaderboard-table"
          />
        )}
      </StyledCard>
    </div>
  );
};

export default Leaderboard; 