const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('./'));

// 存储消息的文件路径
const messagesFilePath = path.join(__dirname, 'data', 'messages.json');
// 存储系统信息的文件路径
const sysInfoFilePath = path.join(__dirname, 'data', 'system_info.json');

// 确保数据目录存在
async function ensureDataDir() {
  const dataDir = path.join(__dirname, 'data');
  try {
    await fs.mkdir(dataDir, { recursive: true });
  } catch (err) {
    console.error('创建数据目录失败:', err);
  }
}

// 获取消息
async function getMessages() {
  try {
    await ensureDataDir();
    const data = await fs.readFile(messagesFilePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    // 如果文件不存在，返回空数组
    return [];
  }
}

// 保存消息
async function saveMessage(message) {
  try {
    await ensureDataDir();
    const messages = await getMessages();
    messages.push(message);
    await fs.writeFile(messagesFilePath, JSON.stringify(messages, null, 2), 'utf8');
    return message;
  } catch (err) {
    console.error('保存消息失败:', err);
    throw err;
  }
}

// 系统信息数据 - 初始数据
const initialSystemInfo = {
  serverStatus: '运行中',
  lastUpdated: new Date().toISOString(),
  activeUsers: 0,
  systemLoad: {
    cpu: 0,
    memory: 0
  },
  latestNews: [
    {
      id: 1,
      title: '奕天Cursor助手v3.6版本即将发布',
      content: '带来更智能的代码补全和更快的响应速度',
      date: new Date().toISOString()
    }
  ],
  productUpdates: []
};

// 获取系统信息
async function getSystemInfo() {
  try {
    await ensureDataDir();
    const data = await fs.readFile(sysInfoFilePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    // 如果文件不存在，创建初始数据
    await fs.writeFile(sysInfoFilePath, JSON.stringify(initialSystemInfo, null, 2), 'utf8');
    return initialSystemInfo;
  }
}

// 更新系统信息
async function updateSystemInfo(newInfo) {
  try {
    await ensureDataDir();
    await fs.writeFile(sysInfoFilePath, JSON.stringify(newInfo, null, 2), 'utf8');
    return newInfo;
  } catch (err) {
    console.error('更新系统信息失败:', err);
    throw err;
  }
}

// API端点：获取所有消息
app.get('/api/messages', async (req, res) => {
  try {
    const messages = await getMessages();
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: '获取消息失败' });
  }
});

// API端点：获取系统信息
app.get('/api/system-info', async (req, res) => {
  try {
    const sysInfo = await getSystemInfo();
    res.json(sysInfo);
  } catch (err) {
    res.status(500).json({ error: '获取系统信息失败' });
  }
});

// API端点：发送新消息
app.post('/api/messages', async (req, res) => {
  try {
    const { userId, content, sender } = req.body;
    if (!userId || !content || !sender) {
      return res.status(400).json({ error: '缺少必要字段' });
    }

    const newMessage = {
      id: 'msg_' + Date.now(),
      userId,
      content,
      sender,
      timestamp: new Date().toISOString(),
      isRead: false
    };

    await saveMessage(newMessage);
    
    // 通过Socket.IO广播新消息
    io.emit('new-message', newMessage);
    
    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ error: '发送消息失败' });
  }
});

// API端点：标记消息为已读
app.put('/api/messages/:id/read', async (req, res) => {
  try {
    const messageId = req.params.id;
    const messages = await getMessages();
    
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1) {
      return res.status(404).json({ error: '消息不存在' });
    }
    
    messages[messageIndex].isRead = true;
    await fs.writeFile(messagesFilePath, JSON.stringify(messages, null, 2), 'utf8');
    
    res.json(messages[messageIndex]);
  } catch (err) {
    res.status(500).json({ error: '更新消息状态失败' });
  }
});

// Socket.IO连接处理
io.on('connection', (socket) => {
  console.log('新客户端连接:', socket.id);
  
  // 更新活跃用户数
  updateActiveUsers(1);
  
  // 客户端断开连接
  socket.on('disconnect', () => {
    console.log('客户端断开连接:', socket.id);
    updateActiveUsers(-1);
  });
  
  // 客户端发送消息
  socket.on('send-message', async (messageData) => {
    try {
      const { userId, content, sender } = messageData;
      
      const newMessage = {
        id: 'msg_' + Date.now(),
        userId,
        content,
        sender,
        timestamp: new Date().toISOString(),
        isRead: false
      };
      
      await saveMessage(newMessage);
      
      // 广播消息给所有连接的客户端
      io.emit('new-message', newMessage);
      
      // 模拟客服自动回复
      setTimeout(async () => {
        const autoReply = getAutoReply(content);
        const replyMessage = {
          id: 'reply_' + Date.now(),
          userId,
          content: autoReply,
          sender: 'admin',
          timestamp: new Date().toISOString(),
          isRead: true
        };
        
        await saveMessage(replyMessage);
        io.emit('new-message', replyMessage);
      }, 1000);
    } catch (err) {
      console.error('处理消息失败:', err);
    }
  });
});

// 更新活跃用户数
async function updateActiveUsers(change) {
  try {
    const sysInfo = await getSystemInfo();
    sysInfo.activeUsers = Math.max(0, sysInfo.activeUsers + change);
    sysInfo.lastUpdated = new Date().toISOString();
    await updateSystemInfo(sysInfo);
    
    // 广播系统信息更新
    io.emit('system-info-update', sysInfo);
  } catch (err) {
    console.error('更新活跃用户数失败:', err);
  }
}

// 获取自动回复内容
function getAutoReply(message) {
  const lowerMessage = message.toLowerCase();
  
  // 简单的关键词匹配回复逻辑
  if (lowerMessage.includes('价格') || lowerMessage.includes('多少钱')) {
    return '我们的产品有多种套餐：标准版¥199，专业版¥299，团队版¥999。您可以在购买页面查看详细介绍。';
  } else if (lowerMessage.includes('激活码') || lowerMessage.includes('激活')) {
    return '购买后您将立即收到激活码，您可以在软件的"激活"选项中输入激活码进行激活。如有问题，我们的客服会很快联系您。';
  } else if (lowerMessage.includes('下载') || lowerMessage.includes('安装')) {
    return '您可以在我们网站的"软件下载"部分找到最新版本的下载链接，支持Windows和macOS系统。';
  } else if (lowerMessage.includes('你好') || lowerMessage.includes('您好') || lowerMessage.includes('hi') || lowerMessage.includes('hello')) {
    return '您好！很高兴为您服务，有什么可以帮到您的吗？';
  } else {
    return '感谢您的咨询！我们的客服人员将会尽快回复您的问题。您也可以通过电话400-123-4567或邮箱support@ytcursor.com联系我们。';
  }
}

// 系统信息自动更新 - 每30秒更新一次
setInterval(async () => {
  try {
    // 获取当前系统信息
    const sysInfo = await getSystemInfo();
    
    // 更新时间
    sysInfo.lastUpdated = new Date().toISOString();
    
    // 更新系统负载 (模拟数据)
    sysInfo.systemLoad = {
      cpu: Math.floor(Math.random() * 100),
      memory: Math.floor(Math.random() * 100)
    };
    
    // 随机添加新闻或产品更新 (约10%概率)
    if (Math.random() < 0.1) {
      const newsId = sysInfo.latestNews.length > 0 
        ? Math.max(...sysInfo.latestNews.map(n => n.id)) + 1 
        : 1;
      
      const newNews = {
        id: newsId,
        title: `奕天Cursor助手最新动态 #${newsId}`,
        content: `这是一条自动生成的系统新闻，更新时间：${new Date().toLocaleString('zh-CN')}`,
        date: new Date().toISOString()
      };
      
      // 限制新闻条数为最新的5条
      sysInfo.latestNews.push(newNews);
      if (sysInfo.latestNews.length > 5) {
        sysInfo.latestNews = sysInfo.latestNews.slice(-5);
      }
    }
    
    // 随机添加产品更新 (约5%概率)
    if (Math.random() < 0.05) {
      const updateId = sysInfo.productUpdates.length > 0
        ? Math.max(...sysInfo.productUpdates.map(p => p.id)) + 1
        : 1;
      
      const newUpdate = {
        id: updateId,
        version: `3.${5 + Math.floor(Math.random() * 5)}.${Math.floor(Math.random() * 10)}`,
        features: [
          "性能优化",
          "Bug修复",
          "新增智能功能"
        ],
        releaseDate: new Date().toISOString()
      };
      
      // 限制产品更新为最新的3条
      sysInfo.productUpdates.push(newUpdate);
      if (sysInfo.productUpdates.length > 3) {
        sysInfo.productUpdates = sysInfo.productUpdates.slice(-3);
      }
    }
    
    // 保存更新后的系统信息
    await updateSystemInfo(sysInfo);
    
    // 广播系统信息更新
    io.emit('system-info-update', sysInfo);
    
    console.log('系统信息已更新:', new Date().toLocaleString('zh-CN'));
  } catch (err) {
    console.error('自动更新系统信息失败:', err);
  }
}, 30000); // 30秒更新一次

// 启动服务器
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
}); 