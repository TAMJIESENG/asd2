const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route   POST api/auth/register
// @desc    注册用户
// @access  Public
router.post(
  '/register',
  [
    check('username', '用户名必须包含3-20个字符').isLength({ min: 3, max: 20 }),
    check('email', '请提供有效的电子邮件').isEmail(),
    check('password', '密码必须至少包含6个字符').isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    try {
      // 检查用户是否已存在
      let user = await User.findOne({ $or: [{ email }, { username }] });

      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: '用户已存在' }] });
      }

      // 创建新用户
      user = new User({
        username,
        email,
        password
      });

      // 加密密码
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      // 保存用户到数据库
      await user.save();

      // 返回JWT令牌
      const payload = {
        user: {
          id: user.id
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
    } catch (err) {
      console.error(err.message);
      res.status(500).send('服务器错误');
    }
  }
);

// @route   POST api/auth/login
// @desc    登录用户
// @access  Public
router.post(
  '/login',
  [
    check('username', '请输入用户名').exists(),
    check('password', '请输入密码').exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    try {
      // 查找用户
      const user = await User.findOne({ username });

      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: '无效的凭据' }] });
      }

      // 验证密码
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: '无效的凭据' }] });
      }

      // 返回JWT令牌
      const payload = {
        user: {
          id: user.id
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
    } catch (err) {
      console.error(err.message);
      res.status(500).send('服务器错误');
    }
  }
);

// @route   GET api/auth/user
// @desc    获取当前用户信息
// @access  Private
router.get('/user', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
});

module.exports = router; 