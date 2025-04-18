# 奕天Cursor助手官网

这是一个具有实时聊天功能的网站项目，使用Node.js、Express和Socket.IO实现后台和前端的自动刷新功能。

## 功能特点

- 实时聊天功能，消息自动刷新
- 未读消息通知
- 聊天历史记录保存和加载
- 自动回复功能
- 移动端自适应界面

## 安装步骤

1. 确保您的系统已安装Node.js (建议v14.0.0以上版本)

2. 克隆或下载本项目到本地

3. 在项目根目录下安装依赖：

```bash
npm install
```

## 运行项目

开发模式运行（带有自动重启功能）：

```bash
npm run dev
```

生产模式运行：

```bash
npm start
```

启动后，服务器将运行在 http://localhost:3000

## 项目结构

- `server.js` - 服务器入口文件，包含API路由和Socket.IO服务
- `index.html` - 网站主页
- `js/chat.js` - 聊天功能的前端JavaScript代码
- `css/chat.css` - 聊天界面的样式文件
- `data/messages.json` - 自动创建的消息存储文件

## 聊天功能使用说明

1. 打开网站，点击右下角的聊天图标打开聊天窗口
2. 输入消息后按回车键或点击发送按钮发送消息
3. 系统会自动回复消息
4. 当收到新消息且聊天窗口未打开时，聊天图标会显示未读消息数量
5. 打开聊天窗口后，未读消息会自动标记为已读

## 自定义配置

如需修改服务器端口，可在 `server.js` 文件中修改：

```javascript
const PORT = process.env.PORT || 3000;
```

## 技术栈

- 前端：HTML, CSS, JavaScript, Socket.IO Client
- 后端：Node.js, Express, Socket.IO
- 数据存储：JSON文件存储（可扩展为数据库存储）

## 问题解决

如果聊天窗口无法滚动，可能是由于以下原因：

1. CSS样式问题 - 已通过 `css/chat.css` 优化聊天窗口样式
2. 滚动逻辑问题 - 已在 `js/chat.js` 中添加多重保障的滚动逻辑
3. DOM更新延迟 - 已添加setTimeout解决DOM更新和滚动时序问题

如果仍有问题，请尝试重新启动服务器或清除浏览器缓存。 