// 获取DOM元素
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreValueElement = document.getElementById('scoreValue');
const levelValueElement = document.getElementById('levelValue');
const scoreValueElement2 = document.getElementById('scoreValue2');
const levelValueElement2 = document.getElementById('levelValue2');
const highscoreValueElement = document.getElementById('highscoreValue');
const startButton = document.getElementById('startButton');
const pauseButton = document.getElementById('pauseButton');
const resetButton = document.getElementById('resetButton');
const singlePlayerButton = document.getElementById('singlePlayerButton');
const multiPlayerButton = document.getElementById('multiPlayerButton');
const player1Info = document.getElementById('player1Info');
const player2Info = document.getElementById('player2Info');
const player1TouchControls = document.getElementById('player1TouchControls');
const player2TouchControls = document.getElementById('player2TouchControls');
const multiplayerInstructions = document.getElementById('multiplayerInstructions');

// 触摸控制按钮
const upButton = document.getElementById('upButton');
const downButton = document.getElementById('downButton');
const leftButton = document.getElementById('leftButton');
const rightButton = document.getElementById('rightButton');
const upButton2 = document.getElementById('upButton2');
const downButton2 = document.getElementById('downButton2');
const leftButton2 = document.getElementById('leftButton2');
const rightButton2 = document.getElementById('rightButton2');

// 游戏配置
const config = {
    canvasWidth: 480,
    canvasHeight: 320,
    playerSize: 40,
    goalSize: 30,
    obstacleSize: 35,
    baseSpeed: 4,
    minGoals: 1,
    maxGoals: 10,
    minObstacles: 0,
    maxObstacles: 6,
    goalTypes: [
        { color: '#e74c3c', points: 10, probability: 0.6 },   // 红色 - 普通
        { color: '#f39c12', points: 20, probability: 0.3 },   // 黄色 - 稀有
        { color: '#2ecc71', points: 30, probability: 0.1 }    // 绿色 - 非常稀有
    ],
    isMultiplayer: false,
    winnerDisplayTime: 3000 // 3秒
};

// 游戏状态
const game = {
    isRunning: false,
    isPaused: false,
    score: 0,
    score2: 0,
    highScore: localStorage.getItem('blockAdventureHighScore') || 0,
    level: 1,
    level2: 1,
    goals: [],
    obstacles: [],
    speedMultiplier: 1,
    winner: null // 胜利者
};

// 玩家1
const player = {
    x: config.canvasWidth / 3,
    y: config.canvasHeight / 2,
    width: config.playerSize,
    height: config.playerSize,
    speed: config.baseSpeed,
    color: '#3498db'
};

// 玩家2
const player2 = {
    x: config.canvasWidth * 2 / 3,
    y: config.canvasHeight / 2,
    width: config.playerSize,
    height: config.playerSize,
    speed: config.baseSpeed,
    color: '#2ecc71'
};

// 按键状态
const keys = {
    arrowup: false,
    arrowdown: false,
    arrowleft: false,
    arrowright: false,
    w: false, // 玩家2上
    s: false, // 玩家2下
    a: false, // 玩家2左
    d: false  // 玩家2右
};

// 加载高分
function loadHighScore() {
    game.highScore = localStorage.getItem('blockAdventureHighScore') || 0;
    highscoreValueElement.textContent = game.highScore;
}

// 保存高分
function saveHighScore() {
    // 单人模式或者多人模式下的最高分
    const currentHighScore = config.isMultiplayer ? 
        Math.max(game.score, game.score2) : game.score;
        
    if (currentHighScore > game.highScore) {
        game.highScore = currentHighScore;
        localStorage.setItem('blockAdventureHighScore', game.highScore);
        highscoreValueElement.textContent = game.highScore;
    }
}

// 游戏初始化
function initGame() {
    // 重置游戏状态
    game.isRunning = false;
    game.isPaused = false;
    game.score = 0;
    game.score2 = 0;
    game.level = 1;
    game.level2 = 1;
    game.goals = [];
    game.obstacles = [];
    game.speedMultiplier = 1;
    game.winner = null;
    
    // 重置玩家1位置
    player.x = config.canvasWidth / 3;
    player.y = config.canvasHeight / 2;
    player.color = '#3498db';
    player.speed = config.baseSpeed;
    
    // 重置玩家2位置（仅在多人模式下使用）
    player2.x = config.canvasWidth * 2 / 3;
    player2.y = config.canvasHeight / 2;
    player2.color = '#2ecc71';
    player2.speed = config.baseSpeed;
    
    // 更新UI
    updateScore();
    updateLevel();
    updateScore2();
    updateLevel2();
    loadHighScore();
    
    // 更新按钮状态
    startButton.disabled = false;
    pauseButton.disabled = true;
    pauseButton.textContent = '暂停';
    pauseButton.classList.remove('resumed');
    
    // 绘制初始状态
    draw();
}

// 开始游戏
function startGame() {
    if (!game.isRunning) {
        game.isRunning = true;
        createGoals();
        createObstacles();
        
        // 更新按钮状态
        startButton.disabled = true;
        pauseButton.disabled = false;
        
        gameLoop();
    }
}

// 暂停/继续游戏
function togglePause() {
    if (!game.isRunning) return;
    
    game.isPaused = !game.isPaused;
    
    if (game.isPaused) {
        pauseButton.textContent = '继续';
        pauseButton.classList.add('resumed');
        draw(); // 重绘以显示暂停信息
    } else {
        pauseButton.textContent = '暂停';
        pauseButton.classList.remove('resumed');
        gameLoop(); // 继续游戏循环
    }
}

// 重置游戏
function resetGame() {
    // 保存高分
    saveHighScore();
    initGame();
}

// 创建随机类型的目标
function createRandomGoal(x, y) {
    // 使用概率随机选择目标类型
    const random = Math.random();
    let cumulativeProbability = 0;
    let selectedType = config.goalTypes[0]; // 默认为第一个类型（普通）
    
    for (const type of config.goalTypes) {
        cumulativeProbability += type.probability;
        if (random <= cumulativeProbability) {
            selectedType = type;
            break;
        }
    }
    
    return {
        x: x,
        y: y,
        width: config.goalSize,
        height: config.goalSize,
        color: selectedType.color,
        points: selectedType.points
    };
}

// 创建目标
function createGoals() {
    game.goals = [];
    
    // 根据关卡确定目标数量
    const goalCount = Math.min(game.level + config.minGoals - 1, config.maxGoals);
    
    for (let i = 0; i < goalCount; i++) {
        // 确保目标不会与玩家或其他目标重叠
        let goalX, goalY;
        let validPosition = false;
        
        while (!validPosition) {
            goalX = Math.random() * (config.canvasWidth - config.goalSize);
            goalY = Math.random() * (config.canvasHeight - config.goalSize);
            
            // 检查与玩家的距离
            const distX = Math.abs(goalX - player.x);
            const distY = Math.abs(goalY - player.y);
            
            if (distX > config.playerSize * 2 || distY > config.playerSize * 2) {
                // 检查与其他目标的距离
                validPosition = true;
                for (const goal of game.goals) {
                    if (
                        Math.abs(goalX - goal.x) < config.goalSize &&
                        Math.abs(goalY - goal.y) < config.goalSize
                    ) {
                        validPosition = false;
                        break;
                    }
                }
            }
        }
        
        // 创建随机类型的目标
        game.goals.push(createRandomGoal(goalX, goalY));
    }
}

// 创建障碍物
function createObstacles() {
    game.obstacles = [];
    
    // 根据关卡确定障碍物数量，从第2关开始有障碍物
    if (game.level < 2) return;
    
    const obstacleCount = Math.min(
        Math.floor(game.level / 2) + config.minObstacles,
        config.maxObstacles
    );
    
    for (let i = 0; i < obstacleCount; i++) {
        // 确保障碍物不会与玩家、目标或其他障碍物重叠
        let obstacleX, obstacleY;
        let validPosition = false;
        
        while (!validPosition) {
            obstacleX = Math.random() * (config.canvasWidth - config.obstacleSize);
            obstacleY = Math.random() * (config.canvasHeight - config.obstacleSize);
            
            // 检查与玩家的距离
            const distX = Math.abs(obstacleX - player.x);
            const distY = Math.abs(obstacleY - player.y);
            
            if (distX > config.playerSize * 2 || distY > config.playerSize * 2) {
                // 检查与其他目标和障碍物的距离
                validPosition = true;
                
                // 检查与目标的重叠
                for (const goal of game.goals) {
                    if (
                        Math.abs(obstacleX - goal.x) < config.goalSize + config.obstacleSize / 2 &&
                        Math.abs(obstacleY - goal.y) < config.goalSize + config.obstacleSize / 2
                    ) {
                        validPosition = false;
                        break;
                    }
                }
                
                // 检查与其他障碍物的重叠
                if (validPosition) {
                    for (const obstacle of game.obstacles) {
                        if (
                            Math.abs(obstacleX - obstacle.x) < config.obstacleSize &&
                            Math.abs(obstacleY - obstacle.y) < config.obstacleSize
                        ) {
                            validPosition = false;
                            break;
                        }
                    }
                }
            }
        }
        
        game.obstacles.push({
            x: obstacleX,
            y: obstacleY,
            width: config.obstacleSize,
            height: config.obstacleSize,
            color: '#7f8c8d' // 灰色
        });
    }
}

// 更新游戏
function update() {
    if (!game.isRunning || game.isPaused) return;
    
    // 根据按键更新玩家位置
    updatePlayerPosition();
    
    // 如果是多人模式，更新玩家2位置
    if (config.isMultiplayer) {
        updatePlayer2Position();
    }
    
    // 检查与目标的碰撞
    checkGoalCollisions();
    
    // 检查与障碍物的碰撞
    checkObstacleCollisions();
    
    // 如果是多人模式，检查玩家之间的碰撞
    if (config.isMultiplayer) {
        checkPlayerCollision();
    }
    
    // 检查是否完成关卡
    if (game.goals.length === 0) {
        levelUp();
    }
}

// 更新玩家位置
function updatePlayerPosition() {
    const currentSpeed = player.speed * game.speedMultiplier;
    
    if (keys.arrowup && player.y > 0) {
        player.y -= currentSpeed;
    }
    if (keys.arrowdown && player.y < config.canvasHeight - player.height) {
        player.y += currentSpeed;
    }
    if (keys.arrowleft && player.x > 0) {
        player.x -= currentSpeed;
    }
    if (keys.arrowright && player.x < config.canvasWidth - player.width) {
        player.x += currentSpeed;
    }
}

// 更新玩家2位置
function updatePlayer2Position() {
    const currentSpeed = player2.speed * game.speedMultiplier;
    
    if (keys.w && player2.y > 0) {
        player2.y -= currentSpeed;
    }
    if (keys.s && player2.y < config.canvasHeight - player2.height) {
        player2.y += currentSpeed;
    }
    if (keys.a && player2.x > 0) {
        player2.x -= currentSpeed;
    }
    if (keys.d && player2.x < config.canvasWidth - player2.width) {
        player2.x += currentSpeed;
    }
}

// 检查玩家之间的碰撞
function checkPlayerCollision() {
    if (isColliding(player, player2)) {
        // 玩家相撞时轻微反弹
        const overlapX = (player.x + player.width / 2) - (player2.x + player2.width / 2);
        const overlapY = (player.y + player.height / 2) - (player2.y + player2.height / 2);
        
        if (Math.abs(overlapX) > Math.abs(overlapY)) {
            // X轴碰撞更明显，水平分离
            if (overlapX > 0) {
                player.x += 2;
                player2.x -= 2;
            } else {
                player.x -= 2;
                player2.x += 2;
            }
        } else {
            // Y轴碰撞更明显，垂直分离
            if (overlapY > 0) {
                player.y += 2;
                player2.y -= 2;
            } else {
                player.y -= 2;
                player2.y += 2;
            }
        }
    }
}

// 检查与目标的碰撞
function checkGoalCollisions() {
    for (let i = game.goals.length - 1; i >= 0; i--) {
        const goal = game.goals[i];
        let collided = false;
        let player1Collected = false;
        
        // 检查玩家1与目标的碰撞
        if (isColliding(player, goal)) {
            collided = true;
            player1Collected = true;
        }
        
        // 检查玩家2与目标的碰撞（多人模式）
        if (config.isMultiplayer && isColliding(player2, goal)) {
            collided = true;
            player1Collected = false;
        }
        
        if (collided) {
            // 移除目标
            game.goals.splice(i, 1);
            
            if (player1Collected) {
                // 玩家1得分
                game.score += goal.points * game.level;
                updateScore();
                playCollectSound(goal.points);
            } else {
                // 玩家2得分
                game.score2 += goal.points * game.level2;
                updateScore2();
                playCollectSound(goal.points + 50); // 玩家2收集音效略有不同
            }
        }
    }
}

// 检查与障碍物的碰撞
function checkObstacleCollisions() {
    for (const obstacle of game.obstacles) {
        // 玩家1碰撞
        if (isColliding(player, obstacle)) {
            if (config.isMultiplayer) {
                // 多人模式下，一个玩家碰到障碍物，另一个玩家获胜
                game.winner = 2; // 玩家2胜利
                endMultiplayerGame();
            } else {
                // 单人模式，游戏结束
                gameOver();
            }
            return;
        }
        
        // 多人模式下，检查玩家2碰撞
        if (config.isMultiplayer && isColliding(player2, obstacle)) {
            game.winner = 1; // 玩家1胜利
            endMultiplayerGame();
            return;
        }
    }
}

// 结束多人游戏
function endMultiplayerGame() {
    // 保存高分
    saveHighScore();
    
    // 停止游戏
    game.isRunning = false;
    
    // 更新按钮状态
    startButton.disabled = false;
    pauseButton.disabled = true;
    
    // 绘制胜利者画面
    drawWinner();
    
    // 播放游戏结束音效
    playGameOverSound();
}

// 检查两个矩形是否碰撞
function isColliding(rect1, rect2) {
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    );
}

// 升级
function levelUp() {
    game.level++;
    game.speedMultiplier += 0.2;
    updateLevel();
    createGoals();
    createObstacles();
    
    // 播放升级音效
    playLevelUpSound();
}

// 绘制游戏
function draw() {
    // 清除画布
    ctx.clearRect(0, 0, config.canvasWidth, config.canvasHeight);
    
    // 绘制背景网格
    drawGrid();
    
    // 绘制所有障碍物
    drawObstacles();
    
    // 绘制所有目标
    drawGoals();
    
    // 绘制玩家1
    drawPlayer();
    
    // 如果是多人模式，绘制玩家2
    if (config.isMultiplayer) {
        drawPlayer2();
    }
    
    // 如果游戏未运行，显示开始提示
    if (!game.isRunning && game.winner === null) {
        drawStartPrompt();
    }
    
    // 如果游戏暂停，显示暂停提示
    if (game.isPaused) {
        drawPausePrompt();
    }
}

// 绘制背景网格
function drawGrid() {
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 1;
    
    const gridSize = 20;
    
    for (let x = 0; x <= config.canvasWidth; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, config.canvasHeight);
        ctx.stroke();
    }
    
    for (let y = 0; y <= config.canvasHeight; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(config.canvasWidth, y);
        ctx.stroke();
    }
}

// 绘制所有目标
function drawGoals() {
    game.goals.forEach(goal => {
        ctx.fillStyle = goal.color;
        
        // 添加光晕效果
        ctx.shadowBlur = 10;
        ctx.shadowColor = goal.color.replace(')', ', 0.5)').replace('rgb', 'rgba');
        ctx.fillRect(goal.x, goal.y, goal.width, goal.height);
        ctx.shadowBlur = 0;
        
        // 为不同类型的目标添加标识
        if (goal.points >= 30) {
            // 绿色高价值目标 - 添加星星标记
            ctx.fillStyle = '#fff';
            const centerX = goal.x + goal.width / 2;
            const centerY = goal.y + goal.height / 2;
            drawStar(centerX, centerY, 5, 8, 4);
        } else if (goal.points >= 20) {
            // 黄色中价值目标 - 添加加号标记
            ctx.fillStyle = '#fff';
            const plusSize = 8;
            ctx.fillRect(goal.x + goal.width / 2 - plusSize / 2, goal.y + goal.height / 2 - 2, plusSize, 4);
            ctx.fillRect(goal.x + goal.width / 2 - 2, goal.y + goal.height / 2 - plusSize / 2, 4, plusSize);
        }
    });
}

// 绘制星星
function drawStar(cx, cy, spikes, outerRadius, innerRadius) {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    let step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    
    for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
    }
    
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fill();
}

// 绘制所有障碍物
function drawObstacles() {
    game.obstacles.forEach(obstacle => {
        ctx.fillStyle = obstacle.color;
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        
        // 添加障碍物图案
        ctx.strokeStyle = '#34495e';
        ctx.lineWidth = 2;
        
        // 画一个X
        ctx.beginPath();
        ctx.moveTo(obstacle.x + 10, obstacle.y + 10);
        ctx.lineTo(obstacle.x + obstacle.width - 10, obstacle.y + obstacle.height - 10);
        ctx.moveTo(obstacle.x + obstacle.width - 10, obstacle.y + 10);
        ctx.lineTo(obstacle.x + 10, obstacle.y + obstacle.height - 10);
        ctx.stroke();
    });
}

// 绘制玩家
function drawPlayer() {
    // 绘制玩家边框
    ctx.strokeStyle = '#2980b9';
    ctx.lineWidth = 2;
    ctx.strokeRect(player.x, player.y, player.width, player.height);
    
    // 绘制玩家填充
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // 添加细节
    ctx.fillStyle = '#fff';
    ctx.fillRect(player.x + player.width * 0.2, player.y + player.height * 0.2, 
                 player.width * 0.2, player.height * 0.2);
}

// 绘制玩家2
function drawPlayer2() {
    // 绘制玩家边框
    ctx.strokeStyle = '#27ae60';
    ctx.lineWidth = 2;
    ctx.strokeRect(player2.x, player2.y, player2.width, player2.height);
    
    // 绘制玩家填充
    ctx.fillStyle = player2.color;
    ctx.fillRect(player2.x, player2.y, player2.width, player2.height);
    
    // 添加细节
    ctx.fillStyle = '#fff';
    ctx.fillRect(player2.x + player2.width * 0.2, player2.y + player2.height * 0.2, 
                 player2.width * 0.2, player2.height * 0.2);
                 
    // 添加玩家编号
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('2', player2.x + player2.width / 2, player2.y + player2.height / 2 + 6);
}

// 绘制开始提示
function drawStartPrompt() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, config.canvasWidth, config.canvasHeight);
    
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('按开始按钮开始游戏', config.canvasWidth / 2, config.canvasHeight / 2);
}

// 绘制暂停提示
function drawPausePrompt() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, config.canvasWidth, config.canvasHeight);
    
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('游戏暂停', config.canvasWidth / 2, config.canvasHeight / 2);
    ctx.font = '16px Arial';
    ctx.fillText('按继续按钮恢复游戏', config.canvasWidth / 2, config.canvasHeight / 2 + 30);
}

// 绘制胜利者画面
function drawWinner() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, config.canvasWidth, config.canvasHeight);
    
    ctx.fillStyle = game.winner === 1 ? '#3498db' : '#2ecc71';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`玩家${game.winner}获胜！`, config.canvasWidth / 2, config.canvasHeight / 2 - 40);
    
    ctx.fillStyle = '#fff';
    ctx.font = '20px Arial';
    ctx.fillText(`玩家1分数: ${game.score}`, config.canvasWidth / 2, config.canvasHeight / 2);
    ctx.fillText(`玩家2分数: ${game.score2}`, config.canvasWidth / 2, config.canvasHeight / 2 + 30);
    
    ctx.font = '16px Arial';
    ctx.fillText('按重新开始按钮再次挑战', config.canvasWidth / 2, config.canvasHeight / 2 + 70);
}

// 更新分数显示（玩家1）
function updateScore() {
    scoreValueElement.textContent = game.score;
}

// 更新等级显示（玩家1）
function updateLevel() {
    levelValueElement.textContent = game.level;
}

// 更新分数显示（玩家2）
function updateScore2() {
    scoreValueElement2.textContent = game.score2;
}

// 更新等级显示（玩家2）
function updateLevel2() {
    levelValueElement2.textContent = game.level2;
}

// 播放收集音效
function playCollectSound(points) {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        
        // 根据点数调整音高
        const frequency = 700 + (points * 10);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        
        const gainNode = audioContext.createGain();
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
        console.log('音频API不可用');
    }
}

// 播放升级音效
function playLevelUpSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // 创建上升音符序列
        const notes = [330, 392, 494, 660];
        
        notes.forEach((freq, index) => {
            const oscillator = audioContext.createOscillator();
            oscillator.type = 'sine';
            oscillator.frequency.value = freq;
            
            const gainNode = audioContext.createGain();
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.start(audioContext.currentTime + index * 0.1);
            oscillator.stop(audioContext.currentTime + index * 0.1 + 0.3);
        });
    } catch (e) {
        console.log('音频API不可用');
    }
}

// 播放游戏结束音效
function playGameOverSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // 创建下降音符序列
        const notes = [660, 494, 392, 330, 220];
        
        notes.forEach((freq, index) => {
            const oscillator = audioContext.createOscillator();
            oscillator.type = 'sawtooth';
            oscillator.frequency.value = freq;
            
            const gainNode = audioContext.createGain();
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.start(audioContext.currentTime + index * 0.15);
            oscillator.stop(audioContext.currentTime + index * 0.15 + 0.4);
        });
    } catch (e) {
        console.log('音频API不可用');
    }
}

// 游戏循环
function gameLoop() {
    update();
    draw();
    
    if (game.isRunning && !game.isPaused) {
        requestAnimationFrame(gameLoop);
    }
}

// 键盘事件监听器
document.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    
    // 将ArrowUp等转换为我们需要的键名
    if (key === 'arrowup') {
        keys.arrowup = true;
        event.preventDefault();
    } 
    else if (key === 'arrowdown') {
        keys.arrowdown = true;
        event.preventDefault();
    }
    else if (key === 'arrowleft') {
        keys.arrowleft = true;
        event.preventDefault();
    }
    else if (key === 'arrowright') {
        keys.arrowright = true;
        event.preventDefault();
    }
    // 玩家2的WASD键
    else if (['w', 'a', 's', 'd'].includes(key)) {
        keys[key] = true;
        event.preventDefault();
    }
    else if (key === 'p') {
        // P键暂停/继续游戏
        togglePause();
    } 
    else if (key === ' ' && !game.isRunning) {
        // 空格键开始游戏（如果游戏未运行）
        startGame();
    } 
    else if (key === 'r') {
        // R键重置游戏
        resetGame();
    }
});

document.addEventListener('keyup', (event) => {
    const key = event.key.toLowerCase();
    
    if (key === 'arrowup') {
        keys.arrowup = false;
    } 
    else if (key === 'arrowdown') {
        keys.arrowdown = false;
    }
    else if (key === 'arrowleft') {
        keys.arrowleft = false;
    }
    else if (key === 'arrowright') {
        keys.arrowright = false;
    }
    // 玩家2的WASD键
    else if (['w', 'a', 's', 'd'].includes(key)) {
        keys[key] = false;
    }
});

// 触摸控制事件
function setupTouchControls() {
    // 玩家1触摸控制
    upButton.addEventListener('touchstart', () => {
        keys.arrowup = true;
    });
    upButton.addEventListener('touchend', () => {
        keys.arrowup = false;
    });
    
    downButton.addEventListener('touchstart', () => {
        keys.arrowdown = true;
    });
    downButton.addEventListener('touchend', () => {
        keys.arrowdown = false;
    });
    
    leftButton.addEventListener('touchstart', () => {
        keys.arrowleft = true;
    });
    leftButton.addEventListener('touchend', () => {
        keys.arrowleft = false;
    });
    
    rightButton.addEventListener('touchstart', () => {
        keys.arrowright = true;
    });
    rightButton.addEventListener('touchend', () => {
        keys.arrowright = false;
    });
    
    // 玩家2触摸控制
    upButton2.addEventListener('touchstart', () => {
        keys.w = true;
    });
    upButton2.addEventListener('touchend', () => {
        keys.w = false;
    });
    
    downButton2.addEventListener('touchstart', () => {
        keys.s = true;
    });
    downButton2.addEventListener('touchend', () => {
        keys.s = false;
    });
    
    leftButton2.addEventListener('touchstart', () => {
        keys.a = true;
    });
    leftButton2.addEventListener('touchend', () => {
        keys.a = false;
    });
    
    rightButton2.addEventListener('touchstart', () => {
        keys.d = true;
    });
    rightButton2.addEventListener('touchend', () => {
        keys.d = false;
    });
    
    // 防止触摸事件引起的页面滚动
    document.querySelectorAll('.touch-control').forEach(element => {
        element.addEventListener('touchstart', (e) => {
            e.preventDefault();
        });
        element.addEventListener('touchmove', (e) => {
            e.preventDefault();
        });
        element.addEventListener('touchend', (e) => {
            e.preventDefault();
        });
    });
}

// 游戏模式按钮事件
singlePlayerButton.addEventListener('click', () => {
    toggleGameMode(false);
});

multiPlayerButton.addEventListener('click', () => {
    toggleGameMode(true);
});

// 按钮事件
startButton.addEventListener('click', startGame);
pauseButton.addEventListener('click', togglePause);
resetButton.addEventListener('click', resetGame);

// 设置触摸控制
setupTouchControls();

// 初始化游戏
initGame();

// 切换游戏模式
function toggleGameMode(isMultiplayer) {
    config.isMultiplayer = isMultiplayer;
    
    if (isMultiplayer) {
        // 激活多人模式按钮
        singlePlayerButton.classList.remove('mode-active');
        multiPlayerButton.classList.add('mode-active');
        
        // 显示玩家2信息和控制
        player2Info.style.display = 'flex';
        if (window.innerWidth <= 600) {
            player2TouchControls.style.display = 'flex';
        }
        
        // 显示多人模式说明
        multiplayerInstructions.style.display = 'block';
        
        // 重置玩家2位置
        player2.x = config.canvasWidth * 2 / 3;
        player2.y = config.canvasHeight / 2;
    } else {
        // 激活单人模式按钮
        singlePlayerButton.classList.add('mode-active');
        multiPlayerButton.classList.remove('mode-active');
        
        // 隐藏玩家2信息和控制
        player2Info.style.display = 'none';
        player2TouchControls.style.display = 'none';
        
        // 隐藏多人模式说明
        multiplayerInstructions.style.display = 'none';
    }
    
    // 如果游戏正在运行，重置游戏
    if (game.isRunning) {
        resetGame();
    } else {
        // 否则只重绘
        draw();
    }
}

// 游戏结束（单人模式）
function gameOver() {
    // 保存高分
    saveHighScore();
    
    // 停止游戏
    game.isRunning = false;
    
    // 更新按钮状态
    startButton.disabled = false;
    pauseButton.disabled = true;
    
    // 绘制游戏结束画面
    drawGameOver();
    
    // 播放游戏结束音效
    playGameOverSound();
}

// 绘制游戏结束画面（单人模式）
function drawGameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, config.canvasWidth, config.canvasHeight);
    
    ctx.fillStyle = '#e74c3c';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('游戏结束', config.canvasWidth / 2, config.canvasHeight / 2 - 40);
    
    ctx.fillStyle = '#fff';
    ctx.font = '20px Arial';
    ctx.fillText('最终分数: ' + game.score, config.canvasWidth / 2, config.canvasHeight / 2);
    ctx.fillText('最高分: ' + game.highScore, config.canvasWidth / 2, config.canvasHeight / 2 + 30);
    
    ctx.font = '16px Arial';
    ctx.fillText('按重新开始按钮再次挑战', config.canvasWidth / 2, config.canvasHeight / 2 + 70);
}