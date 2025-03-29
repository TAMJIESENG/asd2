import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button, Card, Space, Select, Typography, Row, Col, Modal, message, Slider } from 'antd';
import { PauseOutlined, CaretRightOutlined, ReloadOutlined, TrophyOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;
const { Option } = Select;

// 游戏设置
const CELL_SIZE = 20;
const GRID_WIDTH = 20;
const GRID_HEIGHT = 20;
const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 }
};

// 游戏区域样式
const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 auto;
  max-width: 100%;
`;

const GameBoard = styled.div`
  width: ${GRID_WIDTH * CELL_SIZE}px;
  height: ${GRID_HEIGHT * CELL_SIZE}px;
  border: 2px solid #1890ff;
  background-color: #f9f9f9;
  position: relative;
  margin-bottom: 20px;
`;

const Cell = styled.div`
  width: ${CELL_SIZE}px;
  height: ${CELL_SIZE}px;
  position: absolute;
  left: ${props => props.x * CELL_SIZE}px;
  top: ${props => props.y * CELL_SIZE}px;
  background-color: ${props => props.type === 'snake' 
    ? (props.isHead ? '#389e0d' : '#52c41a') 
    : props.type === 'food' 
      ? '#f5222d' 
      : 'transparent'};
  border-radius: ${props => props.type === 'snake' && props.isHead ? '50%' : props.type === 'food' ? '50%' : '0'};
  border: ${props => props.type === 'snake' ? '1px solid #237804' : props.type === 'food' ? '1px solid #a8071a' : 'none'};
`;

const InfoBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: ${GRID_WIDTH * CELL_SIZE}px;
  margin-bottom: 20px;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ControlPanel = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
  width: 100%;
  max-width: ${GRID_WIDTH * CELL_SIZE}px;
`;

// 游戏难度设置
const DIFFICULTY = {
  easy: { speed: 150, points: 1 },
  medium: { speed: 100, points: 2 },
  hard: { speed: 60, points: 3 }
};

const Snake = () => {
  const { user } = useAuth();
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [direction, setDirection] = useState(DIRECTIONS.RIGHT);
  const [gameOver, setGameOver] = useState(false);
  const [gameActive, setGameActive] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(user?.gameStats.snake.highScore || 0);
  const [difficulty, setDifficulty] = useState('medium');
  const [speed, setSpeed] = useState(DIFFICULTY.medium.speed);
  
  // 使用ref保存当前方向，避免闭包问题
  const directionRef = useRef(direction);
  const gameActiveRef = useRef(gameActive);
  const speedRef = useRef(speed);
  
  // 生成随机食物位置
  const generateFood = useCallback(() => {
    let newFood;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_WIDTH),
        y: Math.floor(Math.random() * GRID_HEIGHT)
      };
      // 确保食物不会出现在蛇身上
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    
    return newFood;
  }, [snake]);
  
  // 检查是否与墙壁或自身碰撞
  const checkCollision = useCallback((head) => {
    // 检查墙壁碰撞
    if (
      head.x < 0 || 
      head.x >= GRID_WIDTH || 
      head.y < 0 || 
      head.y >= GRID_HEIGHT
    ) {
      return true;
    }
    
    // 检查自身碰撞 (除了头部)
    for (let i = 1; i < snake.length; i++) {
      if (snake[i].x === head.x && snake[i].y === head.y) {
        return true;
      }
    }
    
    return false;
  }, [snake]);
  
  // 移动蛇
  const moveSnake = useCallback(() => {
    if (!gameActiveRef.current) return;
    
    const head = { ...snake[0] };
    const newDirection = directionRef.current;
    
    // 根据当前方向移动蛇头
    head.x += newDirection.x;
    head.y += newDirection.y;
    
    // 检查碰撞
    if (checkCollision(head)) {
      setGameOver(true);
      setGameActive(false);
      gameActiveRef.current = false;
      message.error('游戏结束!');
      saveGameRecord();
      return;
    }
    
    const newSnake = [head, ...snake];
    
    // 检查是否吃到食物
    if (head.x === food.x && head.y === food.y) {
      // 吃到食物，增加分数
      const points = DIFFICULTY[difficulty].points;
      setScore(prevScore => prevScore + points);
      
      // 生成新的食物
      setFood(generateFood());
    } else {
      // 没吃到食物，移除尾部
      newSnake.pop();
    }
    
    setSnake(newSnake);
  }, [snake, food, checkCollision, generateFood, difficulty]);
  
  // 改变方向
  const changeDirection = useCallback((newDirection) => {
    // 防止180度转向
    const currentDirection = directionRef.current;
    if (
      (newDirection === DIRECTIONS.UP && currentDirection !== DIRECTIONS.DOWN) ||
      (newDirection === DIRECTIONS.DOWN && currentDirection !== DIRECTIONS.UP) ||
      (newDirection === DIRECTIONS.LEFT && currentDirection !== DIRECTIONS.RIGHT) ||
      (newDirection === DIRECTIONS.RIGHT && currentDirection !== DIRECTIONS.LEFT)
    ) {
      directionRef.current = newDirection;
      setDirection(newDirection);
    }
  }, []);
  
  // 键盘控制
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!gameActiveRef.current && e.key !== ' ') return;
      
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          changeDirection(DIRECTIONS.UP);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          changeDirection(DIRECTIONS.DOWN);
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          changeDirection(DIRECTIONS.LEFT);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          changeDirection(DIRECTIONS.RIGHT);
          break;
        case ' ':
          toggleGame();
          break;
        default:
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [changeDirection]);
  
  // 游戏循环
  useEffect(() => {
    if (!gameActive) return;
    
    const interval = setInterval(() => {
      moveSnake();
    }, speedRef.current);
    
    return () => clearInterval(interval);
  }, [gameActive, moveSnake, speed]);
  
  // 更新refs
  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);
  
  useEffect(() => {
    gameActiveRef.current = gameActive;
  }, [gameActive]);
  
  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);
  
  // 更新高分
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
    }
  }, [score, highScore]);
  
  // 难度改变时更新速度
  useEffect(() => {
    setSpeed(DIFFICULTY[difficulty].speed);
  }, [difficulty]);
  
  // 保存游戏记录
  const saveGameRecord = async () => {
    try {
      await axios.post('/api/games/record', {
        gameType: 'snake',
        score,
        difficulty
      });
    } catch (err) {
      console.error('保存游戏记录错误:', err);
    }
  };
  
  // 开始/暂停游戏
  const toggleGame = () => {
    if (gameOver) {
      restartGame();
    } else {
      setGameActive(!gameActive);
    }
  };
  
  // 重新开始游戏
  const restartGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setDirection(DIRECTIONS.RIGHT);
    directionRef.current = DIRECTIONS.RIGHT;
    setFood(generateFood());
    setGameOver(false);
    setGameActive(true);
    gameActiveRef.current = true;
    setScore(0);
  };
  
  // 改变难度
  const handleDifficultyChange = (value) => {
    if (gameActive) {
      message.warning('请在游戏暂停或结束时更改难度');
      return;
    }
    setDifficulty(value);
  };
  
  // 触屏控制按钮
  const handleDirectionButton = (dir) => {
    if (!gameActiveRef.current) return;
    changeDirection(dir);
  };
  
  return (
    <div className="page-container">
      <Title level={2}>贪吃蛇</Title>
      
      <ControlPanel>
        <Space>
          <Text strong>难度:</Text>
          <Select 
            value={difficulty} 
            onChange={handleDifficultyChange}
            disabled={gameActive}
            style={{ width: 100 }}
          >
            <Option value="easy">简单</Option>
            <Option value="medium">中等</Option>
            <Option value="hard">困难</Option>
          </Select>
        </Space>
        
        <Button 
          type="primary" 
          icon={gameActive ? <PauseOutlined /> : <CaretRightOutlined />}
          onClick={toggleGame}
        >
          {gameActive ? '暂停' : gameOver ? '新游戏' : '开始'}
        </Button>
        
        <Button 
          icon={<ReloadOutlined />}
          onClick={() => {
            if (gameActive) {
              setGameActive(false);
              gameActiveRef.current = false;
            }
            setTimeout(restartGame, 100);
          }}
        >
          重新开始
        </Button>
      </ControlPanel>
      
      <InfoBar>
        <Card size="small" title="当前分数" style={{ width: 120 }}>
          <Text strong>{score}</Text>
        </Card>
        
        <div>
          <Text>蛇长度: {snake.length}</Text>
        </div>
        
        <Card size="small" title="最高分" style={{ width: 120 }}>
          <Text strong>{highScore}</Text>
        </Card>
      </InfoBar>
      
      <GameContainer>
        <GameBoard>
          {/* 渲染蛇 */}
          {snake.map((segment, index) => (
            <Cell 
              key={`snake-${index}`} 
              x={segment.x} 
              y={segment.y} 
              type="snake"
              isHead={index === 0}
            />
          ))}
          
          {/* 渲染食物 */}
          <Cell 
            key={`food-${food.x}-${food.y}`} 
            x={food.x} 
            y={food.y} 
            type="food" 
          />
        </GameBoard>
        
        {/* 触屏方向控制 */}
        <Row gutter={[8, 8]} style={{ maxWidth: '200px', marginBottom: '20px' }}>
          <Col span={8}></Col>
          <Col span={8}>
            <Button 
              block 
              onClick={() => handleDirectionButton(DIRECTIONS.UP)}
              disabled={!gameActive}
            >
              ↑
            </Button>
          </Col>
          <Col span={8}></Col>
          
          <Col span={8}>
            <Button 
              block 
              onClick={() => handleDirectionButton(DIRECTIONS.LEFT)}
              disabled={!gameActive}
            >
              ←
            </Button>
          </Col>
          <Col span={8}></Col>
          <Col span={8}>
            <Button 
              block 
              onClick={() => handleDirectionButton(DIRECTIONS.RIGHT)}
              disabled={!gameActive}
            >
              →
            </Button>
          </Col>
          
          <Col span={8}></Col>
          <Col span={8}>
            <Button 
              block 
              onClick={() => handleDirectionButton(DIRECTIONS.DOWN)}
              disabled={!gameActive}
            >
              ↓
            </Button>
          </Col>
          <Col span={8}></Col>
        </Row>
      </GameContainer>
      
      <Row justify="center" style={{ marginTop: '20px' }}>
        <Col xs={24} md={16}>
          <Card title="游戏规则" size="small">
            <p>1. 使用方向键或WASD键控制蛇的移动。</p>
            <p>2. 吃掉红色食物让蛇变长，增加分数。</p>
            <p>3. 避免撞到墙壁或自己的身体。</p>
            <p>4. 按空格键可以暂停/继续游戏。</p>
          </Card>
        </Col>
      </Row>
      
      {gameOver && (
        <Modal 
          title="游戏结束" 
          open={true}
          onOk={restartGame}
          onCancel={() => {}}
          cancelButtonProps={{ style: { display: 'none' } }}
          okText="再来一局"
        >
          <div style={{ textAlign: 'center' }}>
            <p>你的蛇撞到了障碍物!</p>
            <p>最终分数: {score}</p>
            <p>蛇长度: {snake.length}</p>
            {score > (user?.gameStats.snake.highScore || 0) && (
              <p style={{ color: 'green' }}>
                <TrophyOutlined /> 恭喜，你创造了新的最高分!
              </p>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Snake; 