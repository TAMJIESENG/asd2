const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // 从请求头中获取token
  const token = req.header('x-auth-token');

  // 检查是否有token
  if (!token) {
    return res.status(401).json({ msg: '没有token，授权失败' });
  }

  // 验证token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 将用户数据添加到请求对象
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'token无效' });
  }
}; 