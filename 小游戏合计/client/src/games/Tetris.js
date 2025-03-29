import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button, Card, Space, Select, Typography, Row, Col, Modal, message } from 'antd';
import { PauseOutlined, CaretRightOutlined, ReloadOutlined, TrophyOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;
const { Option } = Select;

// 游戏设置
const CELL_SIZE = 30;
const GRID_WIDTH = 10;
const GRID_HEIGHT = 20;

// 方块形状和颜色
const TETROMINOES = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    color: '#00BFFF',
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: '#0000CD',
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: '#FFA500',
  },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: '#FFFF00',
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    color: '#7FFF00',
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: '#9400D3',
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    color: '#FF0000',
  },
};

// 游戏区域样式
const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 auto;
  max-width: 100%;
`;

const GameArea = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
`;

const GameBoard = styled.div`
  width: ${GRID_WIDTH * CELL_SIZE}px;
  height: ${GRID_HEIGHT * CELL_SIZE}px;
  display: grid;
  grid-template-rows: repeat(${GRID_HEIGHT}, ${CELL_SIZE}px);
  grid-template-columns: repeat(${GRID_WIDTH}, ${CELL_SIZE}px);
  background-color: #111;
  border: 2px solid #333;
  gap: 1px;
`;

const Cell = styled.div`
  width: ${CELL_SIZE}px;
  height: ${CELL_SIZE}px;
  background-color: ${props => (props.color ? props.color : '#222')};
  border: ${props => (props.color ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid #333')};
`;

const NextPiecePreview = styled.div`
  width: ${4 * CELL_SIZE}px;
  height: ${4 * CELL_SIZE}px;
  display: grid;
  grid-template-rows: repeat(4, ${CELL_SIZE}px);
  grid-template-columns: repeat(4, ${CELL_SIZE}px);
  background-color: #222;
  border: 2px solid #333;
  gap: 1px;
`;

const InfoBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: ${GRID_WIDTH * CELL_SIZE + 4 * CELL_SIZE + 20}px;
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
  max-width: ${GRID_WIDTH * CELL_SIZE + 4 * CELL_SIZE + 20}px;
`;

const SidePanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

// 游戏难度设置
const DIFFICULTY = {
  easy: { speed: 800, points: 1 },
  medium: { speed: 500, points: 2 },
  hard: { speed: 300, points: 3 }
};

const Tetris = () => {
  const { user } = useAuth();
  const [tetromino, setTetromino] = useState(null);
  const [nextTetromino, setNextTetromino] = useState(null);
  const [grid, setGrid] = useState(createEmptyGrid());
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [gameActive, setGameActive] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [linesCleared, setLinesCleared] = useState(0);
  const [difficulty, setDifficulty] = useState('medium');
  const [speed, setSpeed] = useState(DIFFICULTY.medium.speed);
  const [highScore, setHighScore] = useState(user?.gameStats.tetris.highScore || 0);
  
  // refs to avoid closure problems
  const gameActiveRef = useRef(gameActive);
  const speedRef = useRef(speed);
  
  // 创建空棋盘
  function createEmptyGrid() {
    return Array(GRID_HEIGHT).fill().map(() => Array(GRID_WIDTH).fill(0));
  }
  
  // 随机生成俄罗斯方块
  const randomTetromino = () => {
    const shapes = Object.keys(TETROMINOES);
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    return {
      shape: TETROMINOES[shape].shape,
      color: TETROMINOES[shape].color,
      name: shape
    };
  };
  
  // 初始化游戏
  const initializeGame = useCallback(() => {
    setGrid(createEmptyGrid());
    setTetromino(randomTetromino());
    setNextTetromino(randomTetromino());
    setPosition({ x: Math.floor(GRID_WIDTH / 2) - 1, y: 0 });
    setGameOver(false);
    setScore(0);
    setLevel(1);
    setLinesCleared(0);
  }, []);
  
  // 游戏开始时初始化
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);
  
  // 更新refs
  useEffect(() => {
    gameActiveRef.current = gameActive;
  }, [gameActive]);
  
  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);
  
  // 检查碰撞
  const checkCollision = useCallback((newPosition, currentTetromino = tetromino) => {
    if (!currentTetromino) return false;
    
    for (let y = 0; y < currentTetromino.shape.length; y++) {
      for (let x = 0; x < currentTetromino.shape[y].length; x++) {
        // 只检查实际方块部分
        if (currentTetromino.shape[y][x] !== 0) {
          const newX = newPosition.x + x;
          const newY = newPosition.y + y;
          
          // 检查边界
          if (
            newX < 0 || 
            newX >= GRID_WIDTH || 
            newY >= GRID_HEIGHT
          ) {
            return true;
          }
          
          // 检查已有方块
          if (newY >= 0 && grid[newY][newX] !== 0) {
            return true;
          }
        }
      }
    }
    
    return false;
  }, [grid, tetromino]);
  
  // 合并方块到棋盘
  const mergeTetromino = useCallback(() => {
    if (!tetromino) return;
    
    const newGrid = [...grid];
    
    for (let y = 0; y < tetromino.shape.length; y++) {
      for (let x = 0; x < tetromino.shape[y].length; x++) {
        if (tetromino.shape[y][x] !== 0) {
          const newY = position.y + y;
          const newX = position.x + x;
          
          // 确保不超出边界
          if (newY >= 0 && newY < GRID_HEIGHT && newX >= 0 && newX < GRID_WIDTH) {
            newGrid[newY][newX] = tetromino.color;
          }
        }
      }
    }
    
    setGrid(newGrid);
    
    // 生成新方块
    setTetromino(nextTetromino);
    setNextTetromino(randomTetromino());
    setPosition({ x: Math.floor(GRID_WIDTH / 2) - 1, y: 0 });
    
    // 检查游戏结束
    if (checkCollision({ x: Math.floor(GRID_WIDTH / 2) - 1, y: 0 }, nextTetromino)) {
      setGameOver(true);
      setGameActive(false);
      gameActiveRef.current = false;
      message.error('游戏结束!');
      saveGameRecord();
    }
  }, [grid, tetromino, nextTetromino, position, checkCollision]);
  
  // 检查并清除完整的行
  const clearRows = useCallback(() => {
    const newGrid = [...grid];
    let clearedRows = 0;
    
    for (let y = GRID_HEIGHT - 1; y >= 0; y--) {
      // 检查当前行是否已满
      if (newGrid[y].every(cell => cell !== 0)) {
        // 移除满行
        newGrid.splice(y, 1);
        // 在顶部添加新空行
        newGrid.unshift(Array(GRID_WIDTH).fill(0));
        clearedRows++;
        // 调整y指针以重新检查当前位置（现在已经是新行了）
        y++;
      }
    }
    
    if (clearedRows > 0) {
      // 计算得分 (基于难度和一次清除的行数)
      const pointsPerLine = DIFFICULTY[difficulty].points;
      const basePoints = [0, 40, 100, 300, 1200]; // 0, 1, 2, 3, 4行的基础分
      const pointsGained = basePoints[clearedRows] * pointsPerLine * level;
      
      setScore(prev => prev + pointsGained);
      setLinesCleared(prev => {
        const newLines = prev + clearedRows;
        
        // 每10行升一级，最高10级
        const newLevel = Math.min(10, Math.floor(newLines / 10) + 1);
        if (newLevel > level) {
          setLevel(newLevel);
          // 提高游戏速度
          const newSpeed = Math.max(DIFFICULTY[difficulty].speed - (newLevel - 1) * 50, 100);
          setSpeed(newSpeed);
          speedRef.current = newSpeed;
        }
        
        return newLines;
      });
      
      setGrid(newGrid);
    }
  }, [grid, level, difficulty]);
  
  // 移动方块
  const moveTetromino = useCallback((dx, dy) => {
    if (!gameActiveRef.current || !tetromino) return;
    
    const newPosition = { x: position.x + dx, y: position.y + dy };
    
    if (!checkCollision(newPosition)) {
      setPosition(newPosition);
    } else if (dy > 0) {
      // 如果向下移动被阻止，则合并方块
      mergeTetromino();
      clearRows();
    }
  }, [position, tetromino, checkCollision, mergeTetromino, clearRows]);
  
  // 旋转方块
  const rotateTetromino = useCallback(() => {
    if (!gameActiveRef.current || !tetromino) return;
    
    // 创建旋转后的矩阵
    const rotate = (matrix) => {
      const rotated = [];
      for (let i = 0; i < matrix[0].length; i++) {
        const row = [];
        for (let j = matrix.length - 1; j >= 0; j--) {
          row.push(matrix[j][i]);
        }
        rotated.push(row);
      }
      return rotated;
    };
    
    const rotatedShape = rotate(tetromino.shape);
    const newTetromino = {
      ...tetromino,
      shape: rotatedShape
    };
    
    // 检查旋转后是否有碰撞
    if (!checkCollision(position, newTetromino)) {
      setTetromino(newTetromino);
    } else {
      // 尝试调整位置
      const wallKickTests = [
        { x: 1, y: 0 },
        { x: -1, y: 0 },
        { x: 0, y: -1 },
        { x: 2, y: 0 },
        { x: -2, y: 0 }
      ];
      
      for (const test of wallKickTests) {
        const testPosition = {
          x: position.x + test.x,
          y: position.y + test.y
        };
        
        if (!checkCollision(testPosition, newTetromino)) {
          setTetromino(newTetromino);
          setPosition(testPosition);
          break;
        }
      }
    }
  }, [tetromino, position, checkCollision]);
  
  // 快速下降
  const dropTetromino = useCallback(() => {
    if (!gameActiveRef.current || !tetromino) return;
    
    let newY = position.y;
    while (!checkCollision({ x: position.x, y: newY + 1 })) {
      newY++;
    }
    
    setPosition({ ...position, y: newY });
    mergeTetromino();
    clearRows();
  }, [position, tetromino, checkCollision, mergeTetromino, clearRows]);
  
  // 键盘控制
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!gameActiveRef.current) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          moveTetromino(-1, 0);
          break;
        case 'ArrowRight':
          moveTetromino(1, 0);
          break;
        case 'ArrowDown':
          moveTetromino(0, 1);
          break;
        case 'ArrowUp':
          rotateTetromino();
          break;
        case ' ':
          dropTetromino();
          break;
        case 'p':
        case 'P':
          toggleGame();
          break;
        default:
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [moveTetromino, rotateTetromino, dropTetromino]);
  
  // 游戏循环
  useEffect(() => {
    if (!gameActive) return;
    
    const interval = setInterval(() => {
      moveTetromino(0, 1);
    }, speedRef.current);
    
    return () => clearInterval(interval);
  }, [gameActive, moveTetromino]);
  
  // 更新高分
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
    }
  }, [score, highScore]);
  
  // 难度改变时更新速度
  useEffect(() => {
    setSpeed(DIFFICULTY[difficulty].speed);
    speedRef.current = DIFFICULTY[difficulty].speed;
  }, [difficulty]);
  
  // 保存游戏记录
  const saveGameRecord = async () => {
    try {
      await axios.post('/api/games/record', {
        gameType: 'tetris',
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
      gameActiveRef.current = !gameActiveRef.current;
    }
  };
  
  // 重新开始游戏
  const restartGame = () => {
    initializeGame();
    setGameActive(true);
    gameActiveRef.current = true;
  };
  
  // 处理难度变更
  const handleDifficultyChange = (value) => {
    if (gameActive) {
      message.warning('请在游戏暂停或结束时更改难度');
      return;
    }
    setDifficulty(value);
  };
  
  // 渲染游戏棋盘
  const renderBoard = () => {
    // 创建临时棋盘副本
    const boardWithTetromino = [...grid.map(row => [...row])];
    
    // 添加当前方块到临时棋盘
    if (tetromino) {
      for (let y = 0; y < tetromino.shape.length; y++) {
        for (let x = 0; x < tetromino.shape[y].length; x++) {
          if (tetromino.shape[y][x] !== 0) {
            const boardY = position.y + y;
            const boardX = position.x + x;
            
            if (boardY >= 0 && boardY < GRID_HEIGHT && boardX >= 0 && boardX < GRID_WIDTH) {
              boardWithTetromino[boardY][boardX] = tetromino.color;
            }
          }
        }
      }
    }
    
    // 渲染棋盘
    return boardWithTetromino.map((row, y) => 
      row.map((cell, x) => (
        <Cell key={`${y}-${x}`} color={cell} />
      ))
    );
  };
  
  // 渲染下一个方块预览
  const renderNextPiece = () => {
    const cells = [];
    
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        let color = null;
        
        if (nextTetromino && 
            y < nextTetromino.shape.length && 
            x < nextTetromino.shape[y].length && 
            nextTetromino.shape[y][x] !== 0) {
          color = nextTetromino.color;
        }
        
        cells.push(<Cell key={`next-${y}-${x}`} color={color} />);
      }
    }
    
    return cells;
  };
  
  return (
    <div className="page-container">
      <Title level={2}>俄罗斯方块</Title>
      
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
        <Card size="small" title="分数" style={{ width: 120 }}>
          <Text strong>{score}</Text>
        </Card>
        
        <div>
          <Text>等级: {level}</Text>
          <div>已消除: {linesCleared} 行</div>
        </div>
        
        <Card size="small" title="最高分" style={{ width: 120 }}>
          <Text strong>{highScore}</Text>
        </Card>
      </InfoBar>
      
      <GameContainer>
        <GameArea>
          <GameBoard>
            {renderBoard()}
          </GameBoard>
          
          <SidePanel>
            <Card title="下一个方块" size="small">
              <NextPiecePreview>
                {renderNextPiece()}
              </NextPiecePreview>
            </Card>
            
            <Card title="控制" size="small">
              <p>←→: 左右移动</p>
              <p>↓: 加速下落</p>
              <p>↑: 旋转</p>
              <p>空格: 直接落下</p>
              <p>P: 暂停/继续</p>
            </Card>
          </SidePanel>
        </GameArea>
        
        <Row gutter={[8, 8]} justify="center" style={{ maxWidth: '300px', marginBottom: '20px' }}>
          <Col span={8}>
            <Button 
              block 
              onClick={() => gameActiveRef.current && moveTetromino(-1, 0)}
              disabled={!gameActive}
            >
              ←
            </Button>
          </Col>
          <Col span={8}>
            <Button 
              block 
              onClick={() => gameActiveRef.current && rotateTetromino()}
              disabled={!gameActive}
            >
              ↑
            </Button>
          </Col>
          <Col span={8}>
            <Button 
              block 
              onClick={() => gameActiveRef.current && moveTetromino(1, 0)}
              disabled={!gameActive}
            >
              →
            </Button>
          </Col>
          <Col span={12}>
            <Button 
              block 
              onClick={() => gameActiveRef.current && moveTetromino(0, 1)}
              disabled={!gameActive}
            >
              ↓
            </Button>
          </Col>
          <Col span={12}>
            <Button 
              block 
              onClick={() => gameActiveRef.current && dropTetromino()}
              disabled={!gameActive}
            >
              落下
            </Button>
          </Col>
        </Row>
      </GameContainer>
      
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
            <p>方块堆积到顶部，游戏结束!</p>
            <p>最终分数: {score}</p>
            <p>等级: {level}</p>
            <p>已消除: {linesCleared} 行</p>
            {score > (user?.gameStats.tetris.highScore || 0) && (
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

export default Tetris; 