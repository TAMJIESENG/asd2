import React, { useState, useEffect, useCallback } from 'react';
import { Button, Card, Space, Select, Typography, Row, Col, Modal, message } from 'antd';
import { FlagOutlined, BombOutlined, SmileOutlined, MehOutlined, FrownOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;
const { Option } = Select;

// 游戏难度设置
const DIFFICULTY = {
  easy: { rows: 9, cols: 9, mines: 10 },
  medium: { rows: 16, cols: 16, mines: 40 },
  hard: { rows: 16, cols: 30, mines: 99 }
};

// 单元格大小
const CELL_SIZE = 30;

const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 auto;
  max-width: 100%;
  overflow-x: auto;
`;

const GameBoard = styled.div`
  display: grid;
  grid-template-columns: repeat(${props => props.cols}, ${CELL_SIZE}px);
  grid-template-rows: repeat(${props => props.rows}, ${CELL_SIZE}px);
  gap: 1px;
  margin: 20px 0;
  border: 2px solid #d9d9d9;
  background-color: #d9d9d9;
`;

const Cell = styled.div`
  width: ${CELL_SIZE}px;
  height: ${CELL_SIZE}px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  cursor: pointer;
  background-color: ${props => (props.revealed ? '#f0f0f0' : '#e0e0e0')};
  box-shadow: ${props => (!props.revealed ? 'inset 2px 2px 2px rgba(255, 255, 255, 0.5), inset -2px -2px 2px rgba(0, 0, 0, 0.2)' : 'none')};
  border: 1px solid ${props => props.revealed ? '#d9d9d9' : '#bfbfbf'};
  
  &:hover {
    background-color: ${props => props.revealed ? '#f0f0f0' : '#d4d4d4'};
  }
`;

const InfoBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
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
`;

// 不同数字对应的颜色
const numberColors = [
  '', // 空白单元格没有数字
  '#0000FF', // 1
  '#008000', // 2
  '#FF0000', // 3
  '#000080', // 4
  '#800000', // 5
  '#008080', // 6
  '#000000', // 7
  '#808080'  // 8
];

const Minesweeper = () => {
  const { user } = useAuth();
  const [difficulty, setDifficulty] = useState('medium');
  const [board, setBoard] = useState([]);
  const [gameState, setGameState] = useState('waiting'); // waiting, playing, won, lost
  const [minesLeft, setMinesLeft] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [flagMode, setFlagMode] = useState(false);
  
  // 初始化游戏
  const initializeGame = useCallback(() => {
    const { rows, cols, mines } = DIFFICULTY[difficulty];
    const newBoard = Array(rows).fill().map(() => 
      Array(cols).fill().map(() => ({
        hasMine: false,
        revealed: false,
        flagged: false,
        neighborMines: 0
      }))
    );
    
    setBoard(newBoard);
    setGameState('waiting');
    setMinesLeft(mines);
    setStartTime(null);
    setCurrentTime(0);
  }, [difficulty]);
  
  // 首次渲染或难度变化时初始化游戏
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);
  
  // 计时器
  useEffect(() => {
    let timer;
    if (gameState === 'playing' && startTime) {
      timer = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setCurrentTime(elapsed);
      }, 1000);
    }
    
    return () => clearInterval(timer);
  }, [gameState, startTime]);
  
  // 放置地雷
  const placeMines = (firstClickRow, firstClickCol) => {
    const { rows, cols, mines } = DIFFICULTY[difficulty];
    const newBoard = [...board];
    let minesPlaced = 0;
    
    while (minesPlaced < mines) {
      const randomRow = Math.floor(Math.random() * rows);
      const randomCol = Math.floor(Math.random() * cols);
      
      // 确保不会在第一次点击的位置及其周围8个格放置地雷
      const isTooCloseToFirstClick = 
        Math.abs(randomRow - firstClickRow) <= 1 && 
        Math.abs(randomCol - firstClickCol) <= 1;
      
      if (!newBoard[randomRow][randomCol].hasMine && !isTooCloseToFirstClick) {
        newBoard[randomRow][randomCol].hasMine = true;
        minesPlaced++;
      }
    }
    
    // 计算每个单元格周围的地雷数
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (!newBoard[row][col].hasMine) {
          let count = 0;
          
          // 检查周围8个方向
          for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
              const newRow = row + i;
              const newCol = col + j;
              
              if (
                newRow >= 0 && newRow < rows &&
                newCol >= 0 && newCol < cols &&
                newBoard[newRow][newCol].hasMine
              ) {
                count++;
              }
            }
          }
          
          newBoard[row][col].neighborMines = count;
        }
      }
    }
    
    setBoard(newBoard);
  };
  
  // 揭示单元格
  const revealCell = (row, col) => {
    if (
      gameState === 'won' || 
      gameState === 'lost' || 
      board[row][col].flagged || 
      board[row][col].revealed
    ) {
      return;
    }
    
    // 第一次点击
    if (gameState === 'waiting') {
      setGameState('playing');
      setStartTime(Date.now());
      placeMines(row, col);
    }
    
    const newBoard = [...board];
    const cell = newBoard[row][col];
    
    // 如果点到地雷，游戏结束
    if (cell.hasMine) {
      revealAllMines();
      setGameState('lost');
      message.error('游戏结束，你踩到地雷了!');
      saveGameRecord(false);
      return;
    }
    
    // 揭示当前单元格
    cell.revealed = true;
    
    // 如果当前单元格周围没有地雷，自动揭示周围单元格
    if (cell.neighborMines === 0) {
      const { rows, cols } = DIFFICULTY[difficulty];
      
      // 递归地揭示周围单元格
      const revealSurrounding = (r, c) => {
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            const newRow = r + i;
            const newCol = c + j;
            
            if (
              newRow >= 0 && newRow < rows &&
              newCol >= 0 && newCol < cols &&
              !newBoard[newRow][newCol].revealed &&
              !newBoard[newRow][newCol].flagged
            ) {
              newBoard[newRow][newCol].revealed = true;
              
              if (newBoard[newRow][newCol].neighborMines === 0) {
                revealSurrounding(newRow, newCol);
              }
            }
          }
        }
      };
      
      revealSurrounding(row, col);
    }
    
    setBoard(newBoard);
    
    // 检查是否获胜
    checkWinCondition();
  };
  
  // 标记/取消标记单元格
  const toggleFlag = (row, col) => {
    if (gameState !== 'playing' && gameState !== 'waiting') {
      return;
    }
    
    if (board[row][col].revealed) {
      return;
    }
    
    // 如果是第一次操作，开始游戏
    if (gameState === 'waiting') {
      setGameState('playing');
      setStartTime(Date.now());
    }
    
    const newBoard = [...board];
    const cell = newBoard[row][col];
    
    if (cell.flagged) {
      cell.flagged = false;
      setMinesLeft(minesLeft + 1);
    } else {
      cell.flagged = true;
      setMinesLeft(minesLeft - 1);
    }
    
    setBoard(newBoard);
  };
  
  // 检查是否获胜
  const checkWinCondition = () => {
    const { rows, cols, mines } = DIFFICULTY[difficulty];
    let revealedCount = 0;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (board[row][col].revealed) {
          revealedCount++;
        }
      }
    }
    
    // 如果已揭示的单元格数加上地雷数等于总单元格数，则获胜
    if (revealedCount + mines === rows * cols) {
      setGameState('won');
      message.success('恭喜你，你赢了!');
      saveGameRecord(true);
    }
  };
  
  // 揭示所有地雷
  const revealAllMines = () => {
    const newBoard = [...board];
    const { rows, cols } = DIFFICULTY[difficulty];
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (newBoard[row][col].hasMine) {
          newBoard[row][col].revealed = true;
        }
      }
    }
    
    setBoard(newBoard);
  };
  
  // 保存游戏记录
  const saveGameRecord = async (completed) => {
    try {
      await axios.post('/api/games/record', {
        gameType: 'minesweeper',
        score: calculateScore(completed),
        time: currentTime,
        completed,
        difficulty
      });
    } catch (err) {
      console.error('保存游戏记录错误:', err);
    }
  };
  
  // 计算分数
  const calculateScore = (completed) => {
    if (!completed) return 0;
    
    const { mines } = DIFFICULTY[difficulty];
    let difficultyMultiplier;
    
    switch (difficulty) {
      case 'easy': difficultyMultiplier = 1; break;
      case 'medium': difficultyMultiplier = 2; break;
      case 'hard': difficultyMultiplier = 3; break;
      default: difficultyMultiplier = 1;
    }
    
    // 分数 = 地雷数 * 难度系数 * (1000 / 时间)
    return Math.round(mines * difficultyMultiplier * (1000 / (currentTime || 1)));
  };
  
  // 处理单元格点击
  const handleCellClick = (row, col) => {
    if (flagMode) {
      toggleFlag(row, col);
    } else {
      revealCell(row, col);
    }
  };
  
  // 处理单元格右键点击 (标记旗子)
  const handleCellRightClick = (e, row, col) => {
    e.preventDefault();
    toggleFlag(row, col);
  };
  
  // 重新开始游戏
  const restartGame = () => {
    initializeGame();
  };
  
  // 显示单元格内容
  const renderCell = (cell) => {
    if (cell.revealed) {
      if (cell.hasMine) {
        return <BombOutlined style={{ color: 'black', fontSize: '16px' }} />;
      } else if (cell.neighborMines > 0) {
        return (
          <span style={{ color: numberColors[cell.neighborMines] }}>
            {cell.neighborMines}
          </span>
        );
      }
      return null;
    } else if (cell.flagged) {
      return <FlagOutlined style={{ color: 'red', fontSize: '16px' }} />;
    }
    return null;
  };
  
  // 显示表情图标
  const renderStatusIcon = () => {
    switch (gameState) {
      case 'won': return <SmileOutlined style={{ fontSize: '28px', color: 'green' }} />;
      case 'lost': return <FrownOutlined style={{ fontSize: '28px', color: 'red' }} />;
      case 'playing': return <MehOutlined style={{ fontSize: '28px', color: 'blue' }} />;
      default: return <SmileOutlined style={{ fontSize: '28px', color: 'black' }} />;
    }
  };

  const { rows, cols } = DIFFICULTY[difficulty];
  
  return (
    <div className="page-container">
      <Title level={2}>扫雷</Title>
      
      <ControlPanel>
        <Space>
          <Text strong>难度:</Text>
          <Select 
            value={difficulty} 
            onChange={setDifficulty}
            disabled={gameState === 'playing'}
            style={{ width: 100 }}
          >
            <Option value="easy">简单</Option>
            <Option value="medium">中等</Option>
            <Option value="hard">困难</Option>
          </Select>
        </Space>
        
        <Button 
          type="primary" 
          onClick={restartGame}
        >
          新游戏
        </Button>
        
        <Button 
          type={flagMode ? 'primary' : 'default'}
          icon={<FlagOutlined />}
          onClick={() => setFlagMode(!flagMode)}
        >
          标记模式 {flagMode ? '(开启)' : '(关闭)'}
        </Button>
      </ControlPanel>
      
      <InfoBar>
        <Card size="small" title="剩余地雷" style={{ width: 120 }}>
          <Text strong>{minesLeft}</Text>
        </Card>
        
        <div style={{ textAlign: 'center' }}>
          {renderStatusIcon()}
        </div>
        
        <Card size="small" title="用时" style={{ width: 120 }}>
          <Text strong>{currentTime}秒</Text>
        </Card>
      </InfoBar>
      
      <GameContainer>
        <GameBoard rows={rows} cols={cols}>
          {board.map((row, rowIndex) => 
            row.map((cell, colIndex) => (
              <Cell
                key={`${rowIndex}-${colIndex}`}
                revealed={cell.revealed}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                onContextMenu={(e) => handleCellRightClick(e, rowIndex, colIndex)}
              >
                {renderCell(cell)}
              </Cell>
            ))
          )}
        </GameBoard>
      </GameContainer>
      
      <Row justify="center" style={{ marginTop: '20px' }}>
        <Col xs={24} md={16}>
          <Card title="游戏规则" size="small">
            <p>1. 点击格子揭示内容，数字表示周围8格的地雷数量。</p>
            <p>2. 标记你认为有地雷的位置，避免踩地雷。</p>
            <p>3. 揭示所有安全的格子即可获胜。</p>
            <p>小提示: 使用标记模式或右键点击可以标记可疑位置。</p>
          </Card>
        </Col>
      </Row>
      
      {gameState === 'won' && (
        <Modal 
          title="恭喜!" 
          open={true}
          onOk={restartGame}
          onCancel={() => {}}
          cancelButtonProps={{ style: { display: 'none' } }}
          okText="再来一局"
        >
          <p>你成功排除了所有地雷!</p>
          <p>用时: {currentTime}秒</p>
          <p>分数: {calculateScore(true)}</p>
          {user?.gameStats.minesweeper.bestTime === null || currentTime < user.gameStats.minesweeper.bestTime ? (
            <p style={{ color: 'green' }}>恭喜，这是你的最佳成绩!</p>
          ) : null}
        </Modal>
      )}
      
      {gameState === 'lost' && (
        <Modal 
          title="游戏结束" 
          open={true}
          onOk={restartGame}
          onCancel={() => {}}
          cancelButtonProps={{ style: { display: 'none' } }}
          okText="再来一局"
        >
          <p>你踩到了地雷!</p>
          <p>用时: {currentTime}秒</p>
          <p>再接再厉!</p>
        </Modal>
      )}
    </div>
  );
};

export default Minesweeper; 