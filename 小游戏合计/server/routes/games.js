const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const GameRecord = require('../models/GameRecord');
const User = require('../models/User');

// @route   POST api/games/record
// @desc    记录新的游戏成绩
// @access  Private
router.post(
  '/record',
  [
    auth,
    [
      check('gameType', '游戏类型不能为空').not().isEmpty(),
      check('gameType', '无效的游戏类型').isIn(['minesweeper', 'snake', 'tetris']),
      check('score', '分数不能为空').not().isEmpty(),
      check('score', '分数必须是数字').isNumeric()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { gameType, score, time, completed, difficulty } = req.body;

    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ msg: '用户不存在' });
      }

      // 创建新的游戏记录
      const newRecord = new GameRecord({
        user: req.user.id,
        gameType,
        score,
        time,
        completed,
        difficulty
      });

      await newRecord.save();

      // 更新用户游戏统计数据
      if (gameType === 'minesweeper') {
        user.gameStats.minesweeper.played += 1;
        if (completed) {
          user.gameStats.minesweeper.won += 1;
        }
        if (time && (user.gameStats.minesweeper.bestTime === null || time < user.gameStats.minesweeper.bestTime)) {
          user.gameStats.minesweeper.bestTime = time;
        }
      } else if (gameType === 'snake') {
        user.gameStats.snake.played += 1;
        if (score > user.gameStats.snake.highScore) {
          user.gameStats.snake.highScore = score;
        }
      } else if (gameType === 'tetris') {
        user.gameStats.tetris.played += 1;
        if (score > user.gameStats.tetris.highScore) {
          user.gameStats.tetris.highScore = score;
        }
      }

      await user.save();
      res.json(newRecord);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('服务器错误');
    }
  }
);

// @route   GET api/games/records
// @desc    获取当前用户的游戏记录
// @access  Private
router.get('/records', auth, async (req, res) => {
  try {
    const records = await GameRecord.find({ user: req.user.id })
      .sort({ date: -1 });
    res.json(records);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
});

// @route   GET api/games/records/:gameType
// @desc    获取特定游戏类型的用户记录
// @access  Private
router.get('/records/:gameType', auth, async (req, res) => {
  try {
    const records = await GameRecord.find({
      user: req.user.id,
      gameType: req.params.gameType
    }).sort({ date: -1 });
    res.json(records);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
});

// @route   GET api/games/leaderboard/:gameType
// @desc    获取特定游戏的排行榜
// @access  Public
router.get('/leaderboard/:gameType', async (req, res) => {
  const { gameType } = req.params;
  
  if (!['minesweeper', 'snake', 'tetris'].includes(gameType)) {
    return res.status(400).json({ msg: '无效的游戏类型' });
  }

  try {
    let leaderboard = [];
    
    if (gameType === 'minesweeper') {
      // 获取扫雷游戏的最佳时间排行
      const users = await User.find({
        'gameStats.minesweeper.bestTime': { $ne: null }
      })
        .select('username avatar gameStats.minesweeper')
        .sort({ 'gameStats.minesweeper.bestTime': 1 })
        .limit(10);
      
      leaderboard = users.map(user => ({
        username: user.username,
        avatar: user.avatar,
        bestTime: user.gameStats.minesweeper.bestTime,
        gamesWon: user.gameStats.minesweeper.won
      }));
    } else if (gameType === 'snake' || gameType === 'tetris') {
      // 获取贪吃蛇或俄罗斯方块的最高分排行
      const sortKey = `gameStats.${gameType}.highScore`;
      const users = await User.find({
        [sortKey]: { $gt: 0 }
      })
        .select(`username avatar gameStats.${gameType}`)
        .sort({ [sortKey]: -1 })
        .limit(10);
      
      leaderboard = users.map(user => ({
        username: user.username,
        avatar: user.avatar,
        highScore: user.gameStats[gameType].highScore,
        gamesPlayed: user.gameStats[gameType].played
      }));
    }
    
    res.json(leaderboard);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
});

// @route   DELETE api/games/record/:id
// @desc    删除游戏记录
// @access  Private
router.delete('/record/:id', auth, async (req, res) => {
  try {
    const record = await GameRecord.findById(req.params.id);
    
    if (!record) {
      return res.status(404).json({ msg: '记录不存在' });
    }
    
    // 确保用户只能删除自己的记录，或者是管理员
    const user = await User.findById(req.user.id);
    if (record.user.toString() !== req.user.id && user.role !== 'admin') {
      return res.status(401).json({ msg: '用户未授权' });
    }
    
    await record.remove();
    res.json({ msg: '记录已删除' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: '记录不存在' });
    }
    res.status(500).send('服务器错误');
  }
});

module.exports = router; 