const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const User = require('../models/User');

// @route   GET api/users
// @desc    获取所有用户（仅限管理员）
// @access  Private/Admin
router.get('/', [auth, adminAuth], async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
});

// @route   GET api/users/:id
// @desc    根据ID获取用户
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ msg: '用户不存在' });
    }

    // 检查是否是当前用户或管理员
    if (req.user.id !== user.id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: '权限不足' });
    }

    res.json(user);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: '用户不存在' });
    }
    res.status(500).send('服务器错误');
  }
});

// @route   PUT api/users/profile
// @desc    更新用户个人资料
// @access  Private
router.put(
  '/profile',
  [
    auth,
    [
      check('username', '用户名必须包含3-20个字符').optional().isLength({ min: 3, max: 20 }),
      check('email', '请提供有效的电子邮件').optional().isEmail()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, avatar } = req.body;

    try {
      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({ msg: '用户不存在' });
      }

      // 检查用户名是否已被占用
      if (username && username !== user.username) {
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
          return res.status(400).json({ errors: [{ msg: '用户名已被占用' }] });
        }
        user.username = username;
      }

      // 检查电子邮件是否已被占用
      if (email && email !== user.email) {
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
          return res.status(400).json({ errors: [{ msg: '电子邮件已被占用' }] });
        }
        user.email = email;
      }

      if (avatar) {
        user.avatar = avatar;
      }

      await user.save();
      res.json(user);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('服务器错误');
    }
  }
);

// @route   PUT api/users/password
// @desc    更改密码
// @access  Private
router.put(
  '/password',
  [
    auth,
    [
      check('currentPassword', '请输入当前密码').exists(),
      check('newPassword', '新密码必须至少包含6个字符').isLength({ min: 6 })
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    try {
      const user = await User.findById(req.user.id);

      // 验证当前密码
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ errors: [{ msg: '当前密码不正确' }] });
      }

      // 加密新密码
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);

      await user.save();
      res.json({ msg: '密码已更新' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('服务器错误');
    }
  }
);

// @route   DELETE api/users/:id
// @desc    删除用户
// @access  Private/Admin
router.delete('/:id', [auth, adminAuth], async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ msg: '用户不存在' });
    }

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

module.exports = router; 