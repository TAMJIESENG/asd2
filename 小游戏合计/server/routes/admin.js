const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const adminAuth = require('../middleware/adminAuth');
const User = require('../models/User');
const GameRecord = require('../models/GameRecord');
const Game = require('../models/Game');

// 存储临时管理员密码
let tempAdminPassword = null;
let tempPasswordExpiry = null;

// 设置固定密码
const FIXED_ADMIN_PASSWORD = '663372**';

// @route   POST api/admin/update-password
// @desc    更新临时管理员密码
// @access  Public
router.post('/update-password', (req, res) => {
  const { password } = req.body;
  
  if (!password) {
    return res.status(400).json({ msg: '密码不能为空' });
  }
  
  // 设置临时密码和过期时间（5分钟后）
  tempAdminPassword = password;
  tempPasswordExpiry = Date.now() + (5 * 60 * 1000);
  
  res.json({ msg: '密码已更新' });
});

// @route   POST api/admin/login-with-temp
// @desc    使用临时密码或固定密码登录
// @access  Public
router.post('/login-with-temp', (req, res) => {
  const { password } = req.body;
  
  // 验证是否为固定密码
  if (password === FIXED_ADMIN_PASSWORD) {
    // 创建管理员JWT令牌
    const payload = {
      user: {
        id: 'fixed-admin',
        role: 'admin'
      }
    };
    
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
    return;
  }
  
  // 如果不是固定密码，验证临时密码
  if (!tempAdminPassword || !tempPasswordExpiry) {
    return res.status(400).json({ msg: '临时密码未设置或已过期' });
  }
  
  if (Date.now() > tempPasswordExpiry) {
    return res.status(400).json({ msg: '临时密码已过期' });
  }
  
  if (password !== tempAdminPassword) {
    return res.status(400).json({ msg: '密码无效' });
  }
  
  // 创建特殊的管理员JWT令牌
  const payload = {
    user: {
      id: 'temp-admin',
      role: 'admin'
    }
  };
  
  jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: '1h' },
    (err, token) => {
      if (err) throw err;
      res.json({ token });
    }
  );
});

// @route   GET api/admin/users
// @desc    获取所有用户列表（分页）
// @access  Admin
router.get('/users', adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
      
    const total = await User.countDocuments();
    
    res.json({
      users,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
});

// @route   GET api/admin/users/search
// @desc    搜索用户
// @access  Admin
router.get('/users/search', adminAuth, async (req, res) => {
  const searchTerm = req.query.term;
  
  if (!searchTerm) {
    return res.status(400).json({ msg: '请提供搜索词' });
  }
  
  try {
    const users = await User.find({
      $or: [
        { username: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } }
      ]
    }).select('-password');
    
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
});

// @route   POST api/admin/users
// @desc    创建新用户（管理员）
// @access  Admin
router.post(
  '/users',
  [
    adminAuth,
    [
      check('username', '用户名不能为空').not().isEmpty(),
      check('username', '用户名长度应在3-20个字符之间').isLength({ min: 3, max: 20 }),
      check('email', '请提供有效的邮箱').isEmail(),
      check('password', '密码至少需要6个字符').isLength({ min: 6 }),
      check('role', '角色必须是用户或管理员').isIn(['user', 'admin'])
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { username, email, password, role } = req.body;
    
    try {
      // 检查用户是否已存在
      let user = await User.findOne({ $or: [{ email }, { username }] });
      
      if (user) {
        return res.status(400).json({ msg: '用户已存在' });
      }
      
      user = new User({
        username,
        email,
        password,
        role
      });
      
      // 加密密码
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      
      await user.save();
      
      res.json({ msg: '用户创建成功' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('服务器错误');
    }
  }
);

// @route   PUT api/admin/users/:id
// @desc    更新用户
// @access  Admin
router.put('/users/:id', adminAuth, async (req, res) => {
  const { username, email, password, role } = req.body;
  
  // 构建用户对象
  const userFields = {};
  if (username) userFields.username = username;
  if (email) userFields.email = email;
  if (role) userFields.role = role;
  
  try {
    let user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ msg: '用户不存在' });
    }
    
    // 如果提供了新密码，则更新密码
    if (password) {
      const salt = await bcrypt.genSalt(10);
      userFields.password = await bcrypt.hash(password, salt);
    }
    
    // 更新用户
    user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: userFields },
      { new: true }
    ).select('-password');
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: '用户不存在' });
    }
    res.status(500).send('服务器错误');
  }
});

// @route   DELETE api/admin/users/:id
// @desc    删除用户
// @access  Admin
router.delete('/users/:id', adminAuth, async (req, res) => {
  try {
    // 确保不能删除自己
    if (req.params.id === req.user.id) {
      return res.status(400).json({ msg: '不能删除当前登录的管理员账户' });
    }
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ msg: '用户不存在' });
    }
    
    // 删除用户的所有游戏记录
    await GameRecord.deleteMany({ user: req.params.id });
    
    // 删除用户
    await user.remove();
    
    res.json({ msg: '用户已删除' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: '用户不存在' });
    }
    res.status(500).send('服务器错误');
  }
});

// @route   GET api/admin/statistics
// @desc    获取管理员统计数据
// @access  Admin
router.get('/statistics', adminAuth, async (req, res) => {
  try {
    // 获取总用户数
    const totalUsers = await User.countDocuments();
    
    // 获取今日游戏次数
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayGames = await GameRecord.countDocuments({
      date: { $gte: today }
    });
    
    // 获取7天内活跃用户数
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const activeUsersIds = await GameRecord.distinct('user', {
      date: { $gte: lastWeek }
    });
    const activeUsers = activeUsersIds.length;
    
    // 游戏类型统计
    const gameTypeStats = await GameRecord.aggregate([
      {
        $group: {
          _id: '$gameType',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    // 用户注册增长趋势（最近6个月）
    const monthlyRegistrations = [];
    for (let i = 5; i >= 0; i--) {
      const month = new Date();
      month.setMonth(month.getMonth() - i);
      const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
      const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);
      
      const count = await User.countDocuments({
        createdAt: { $gte: startOfMonth, $lte: endOfMonth }
      });
      
      monthlyRegistrations.push({
        month: `${month.getFullYear()}-${month.getMonth() + 1}`,
        count
      });
    }
    
    res.json({
      totalUsers,
      todayGames,
      activeUsers,
      gameTypeStats,
      monthlyRegistrations
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
});

// @route   POST api/admin/games
// @desc    添加新游戏
// @access  Admin
router.post(
  '/games',
  [
    adminAuth,
    [
      check('name', '游戏名称不能为空').not().isEmpty(),
      check('type', '游戏类型不能为空').not().isEmpty(),
      check('status', '状态必须是启用或禁用').isIn(['active', 'inactive'])
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { name, type, description, status } = req.body;
    
    try {
      // 检查游戏是否已存在
      let game = await Game.findOne({ name });
      
      if (game) {
        return res.status(400).json({ msg: '游戏已存在' });
      }
      
      // 创建新游戏
      game = new Game({
        name,
        type,
        description,
        status
      });
      
      await game.save();
      
      res.json(game);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('服务器错误');
    }
  }
);

// @route   GET api/admin/games
// @desc    获取所有游戏
// @access  Admin
router.get('/games', adminAuth, async (req, res) => {
  try {
    const games = await Game.find().sort({ name: 1 });
    res.json(games);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
});

// @route   PUT api/admin/games/:id
// @desc    更新游戏
// @access  Admin
router.put('/games/:id', adminAuth, async (req, res) => {
  const { name, type, description, status } = req.body;
  
  // 构建游戏对象
  const gameFields = {};
  if (name) gameFields.name = name;
  if (type) gameFields.type = type;
  if (description) gameFields.description = description;
  if (status) gameFields.status = status;
  
  try {
    let game = await Game.findById(req.params.id);
    
    if (!game) {
      return res.status(404).json({ msg: '游戏不存在' });
    }
    
    // 更新游戏
    game = await Game.findByIdAndUpdate(
      req.params.id,
      { $set: gameFields },
      { new: true }
    );
    
    res.json(game);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: '游戏不存在' });
    }
    res.status(500).send('服务器错误');
  }
});

// @route   DELETE api/admin/games/:id
// @desc    删除游戏
// @access  Admin
router.delete('/games/:id', adminAuth, async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    
    if (!game) {
      return res.status(404).json({ msg: '游戏不存在' });
    }
    
    await game.remove();
    
    res.json({ msg: '游戏已删除' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: '游戏不存在' });
    }
    res.status(500).send('服务器错误');
  }
});

// @route   GET api/admin/records
// @desc    获取所有游戏记录（分页）
// @access  Admin
router.get('/records', adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const gameType = req.query.gameType !== 'all' ? req.query.gameType : null;
    
    // 构建查询条件
    const query = {};
    if (gameType) {
      query.gameType = gameType;
    }
    
    const records = await GameRecord.find(query)
      .populate('user', 'username')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);
      
    const total = await GameRecord.countDocuments(query);
    
    res.json({
      records,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
});

// @route   DELETE api/admin/records/:id
// @desc    删除游戏记录
// @access  Admin
router.delete('/records/:id', adminAuth, async (req, res) => {
  try {
    const record = await GameRecord.findById(req.params.id);
    
    if (!record) {
      return res.status(404).json({ msg: '记录不存在' });
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