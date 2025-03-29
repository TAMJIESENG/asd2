const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async function(req, res, next) {
  // 获取请求头中的令牌
  const token = req.header('x-auth-token');

  // 检查是否有令牌
  if (!token) {
    return res.status(401).json({ msg: '没有令牌，授权被拒绝' });
  }

  try {
    // 验证令牌
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 将用户信息添加到请求对象
    req.user = decoded.user;
    
    // 处理临时管理员令牌
    if (req.user.id === 'temp-admin' && req.user.role === 'admin') {
      // 允许临时管理员访问
      return next();
    }
    
    // 验证常规用户是否是管理员
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ msg: '用户不存在' });
    }
    
    if (user.role !== 'admin') {
      return res.status(403).json({ msg: '需要管理员权限' });
    }
    
    next();
  } catch (err) {
    console.error('令牌无效:', err.message);
    res.status(401).json({ msg: '令牌无效' });
  }
}; 