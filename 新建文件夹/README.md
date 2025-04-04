# 方块冒险游戏官网

这是"方块冒险"HTML5游戏的官方网站源代码，包含游戏介绍、特点、玩法说明和在线体验入口。

## 项目结构

```
├── index.html              # 游戏主页面
├── style.css               # 游戏样式
├── script.js               # 游戏逻辑
├── index-official.html     # 游戏官网页面
├── official-style.css      # 官网样式
├── img/                    # 图片文件夹
│   ├── hero-bg.png         # 首页背景
│   ├── gameplay.jpg        # 游戏玩法示例图
│   ├── single-player.jpg   # 单人模式截图
│   ├── multi-player.jpg    # 多人模式截图
│   └── screenshot1-4.jpg   # 游戏截图示例
└── download/               # 下载文件夹
    └── BlockAdventure.zip  # 游戏打包文件
```

## 如何运行

1. 克隆或下载本仓库到本地
2. 使用浏览器打开 `index-official.html` 查看游戏官网
3. 点击"立即体验"按钮可以直接进入游戏

## 自定义修改

### 替换图片

所有图片文件都存放在 `img` 文件夹中，您可以替换这些文件为您自己的游戏截图。保持文件名不变，或者如果您更改了文件名，请相应地更新 `index-official.html` 中的引用。

### 修改样式

官网的样式定义在 `official-style.css` 文件中，您可以根据需要自定义颜色、布局和动画效果。

### 更新游戏文件

如果您对游戏进行了修改，请更新 `download/BlockAdventure.zip` 文件，确保下载按钮链接到最新版本的游戏。

## 浏览器兼容性

该官网兼容所有现代浏览器，包括：
- Chrome
- Firefox
- Safari
- Edge

## 游戏特点

- 单人和多人游戏模式
- 简单直观的控制
- 多种目标类型与障碍物
- 难度随分数增加而提高
- 本地最高分记录
- 触摸屏设备支持

## 部署到线上服务器

1. 将所有文件上传到您的网络服务器
2. 确保文件夹结构保持不变
3. 设置 `index-official.html` 为网站入口或根据需要重命名为 `index.html`

## 许可证

版权所有 © 2024 方块冒险。保留所有权利。 