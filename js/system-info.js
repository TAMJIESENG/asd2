// 初始化系统信息自动刷新功能
document.addEventListener('DOMContentLoaded', function() {
  initSystemInfoUpdates();
});

/**
 * 初始化系统信息自动更新功能
 */
function initSystemInfoUpdates() {
  // 系统信息显示区域
  const userCountElement = document.getElementById('active-users-count');
  const serverStatusElement = document.getElementById('server-status');
  const cpuLoadElement = document.getElementById('cpu-load');
  const memoryLoadElement = document.getElementById('memory-load');
  const lastUpdateTimeElement = document.getElementById('last-update-time');
  const newsListElement = document.getElementById('news-list');
  const updateListElement = document.getElementById('update-list');
  
  // 检查是否找到了所有需要的元素
  if (!newsListElement || !updateListElement) {
    console.warn('系统信息自动更新：未找到必要的DOM元素');
    createSystemInfoElements();
  }
  
  // 连接Socket.IO服务器
  let socket;
  try {
    socket = io(window.location.hostname + ':3000');
  } catch (error) {
    console.error('连接Socket.IO服务器失败:', error);
    // 如果Socket.IO连接失败，使用轮询方式
    initPollingUpdate();
    return;
  }
  
  // 连接成功事件
  socket.on('connect', () => {
    console.log('已连接到系统信息服务器');
    // 立即获取一次系统信息
    fetchSystemInfo();
  });
  
  // 连接断开事件
  socket.on('disconnect', () => {
    console.log('与系统信息服务器的连接已断开');
    updateServerStatus('离线');
  });
  
  // 监听系统信息更新事件
  socket.on('system-info-update', (systemInfo) => {
    updateSystemInfoUI(systemInfo);
  });
  
  // 通过HTTP请求获取系统信息
  function fetchSystemInfo() {
    fetch('/api/system-info')
      .then(response => response.json())
      .then(systemInfo => {
        updateSystemInfoUI(systemInfo);
      })
      .catch(error => {
        console.error('获取系统信息失败:', error);
        updateServerStatus('错误');
      });
  }
  
  // 如果Socket.IO不可用，使用轮询方式更新
  function initPollingUpdate() {
    fetchSystemInfo();
    // 每60秒轮询一次
    setInterval(fetchSystemInfo, 60000);
  }
  
  // 更新系统信息UI
  function updateSystemInfoUI(systemInfo) {
    if (!systemInfo) return;
    
    // 更新在线用户数
    if (userCountElement) {
      userCountElement.textContent = systemInfo.activeUsers;
    }
    
    // 更新服务器状态
    updateServerStatus(systemInfo.serverStatus);
    
    // 更新系统负载
    if (cpuLoadElement) {
      cpuLoadElement.textContent = `${systemInfo.systemLoad.cpu}%`;
    }
    
    if (memoryLoadElement) {
      memoryLoadElement.textContent = `${systemInfo.systemLoad.memory}%`;
    }
    
    // 更新最后更新时间
    if (lastUpdateTimeElement) {
      const updateTime = new Date(systemInfo.lastUpdated);
      lastUpdateTimeElement.textContent = updateTime.toLocaleString('zh-CN');
    }
    
    // 更新新闻列表
    updateNewsList(systemInfo.latestNews);
    
    // 更新产品更新列表
    updateProductUpdates(systemInfo.productUpdates);
  }
  
  // 更新服务器状态
  function updateServerStatus(status) {
    if (!serverStatusElement) return;
    
    serverStatusElement.textContent = status;
    
    // 根据状态设置不同的颜色
    serverStatusElement.className = 'server-status';
    if (status === '运行中') {
      serverStatusElement.classList.add('status-online');
    } else if (status === '离线') {
      serverStatusElement.classList.add('status-offline');
    } else {
      serverStatusElement.classList.add('status-error');
    }
  }
  
  // 更新新闻列表
  function updateNewsList(news) {
    if (!newsListElement || !news || !news.length) return;
    
    // 清空现有内容
    newsListElement.innerHTML = '';
    
    // 按日期排序，最新的在前面
    const sortedNews = [...news].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // 添加新闻条目
    sortedNews.forEach(item => {
      const newsItem = document.createElement('div');
      newsItem.className = 'news-item';
      newsItem.dataset.id = item.id;
      
      const newsDate = new Date(item.date);
      
      newsItem.innerHTML = `
        <div class="news-header">
          <h4>${item.title}</h4>
          <span class="news-date">${newsDate.toLocaleDateString('zh-CN')}</span>
        </div>
        <p>${item.content}</p>
      `;
      
      // 添加到DOM，带有动画效果
      newsItem.style.opacity = '0';
      newsItem.style.transform = 'translateY(20px)';
      newsListElement.appendChild(newsItem);
      
      // 触发重排后应用动画
      setTimeout(() => {
        newsItem.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        newsItem.style.opacity = '1';
        newsItem.style.transform = 'translateY(0)';
      }, 10);
    });
    
    // 显示系统信息区域
    const systemInfoSection = document.getElementById('system-info-section');
    if (systemInfoSection) {
      systemInfoSection.style.display = 'block';
    }
  }
  
  // 更新产品更新列表
  function updateProductUpdates(updates) {
    if (!updateListElement || !updates || !updates.length) return;
    
    // 清空现有内容
    updateListElement.innerHTML = '';
    
    // 按日期排序，最新的在前面
    const sortedUpdates = [...updates].sort((a, b) => 
      new Date(b.releaseDate) - new Date(a.releaseDate));
    
    // 添加更新条目
    sortedUpdates.forEach(item => {
      const updateItem = document.createElement('div');
      updateItem.className = 'update-item';
      updateItem.dataset.id = item.id;
      
      const releaseDate = new Date(item.releaseDate);
      
      let featuresHtml = '';
      if (item.features && item.features.length) {
        featuresHtml = `
          <ul class="feature-list">
            ${item.features.map(feature => `<li>${feature}</li>`).join('')}
          </ul>
        `;
      }
      
      updateItem.innerHTML = `
        <div class="update-header">
          <h4>版本 ${item.version}</h4>
          <span class="update-date">${releaseDate.toLocaleDateString('zh-CN')}</span>
        </div>
        ${featuresHtml}
      `;
      
      // 添加到DOM，带有动画效果
      updateItem.style.opacity = '0';
      updateItem.style.transform = 'translateY(20px)';
      updateListElement.appendChild(updateItem);
      
      // 触发重排后应用动画
      setTimeout(() => {
        updateItem.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        updateItem.style.opacity = '1';
        updateItem.style.transform = 'translateY(0)';
      }, 10);
    });
  }
  
  // 创建系统信息显示元素
  function createSystemInfoElements() {
    // 检查是否已存在
    if (document.getElementById('system-info-section')) return;
    
    // 在hero区域后创建系统信息区域
    const heroSection = document.getElementById('hero');
    if (!heroSection) return;
    
    const systemInfoSection = document.createElement('section');
    systemInfoSection.id = 'system-info-section';
    systemInfoSection.className = 'system-info-section';
    systemInfoSection.style.display = 'none'; // 默认隐藏，有数据时显示
    
    systemInfoSection.innerHTML = `
      <div class="container">
        <h2>系统实时信息</h2>
        <div class="system-status-panel">
          <div class="status-grid">
            <div class="status-item">
              <span class="status-label">在线用户</span>
              <span class="status-value" id="active-users-count">0</span>
            </div>
            <div class="status-item">
              <span class="status-label">服务器状态</span>
              <span class="status-value server-status" id="server-status">加载中</span>
            </div>
            <div class="status-item">
              <span class="status-label">CPU负载</span>
              <span class="status-value" id="cpu-load">0%</span>
            </div>
            <div class="status-item">
              <span class="status-label">内存使用</span>
              <span class="status-value" id="memory-load">0%</span>
            </div>
          </div>
          <div class="last-update">
            最后更新时间: <span id="last-update-time">--</span>
          </div>
        </div>
        
        <div class="info-tabs">
          <div class="tab-header">
            <button class="tab-btn active" data-tab="news">最新动态</button>
            <button class="tab-btn" data-tab="updates">产品更新</button>
          </div>
          
          <div class="tab-content">
            <div class="tab-pane active" id="news-tab">
              <div class="news-list" id="news-list"></div>
            </div>
            
            <div class="tab-pane" id="updates-tab">
              <div class="update-list" id="update-list"></div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // 插入到hero区域后
    heroSection.after(systemInfoSection);
    
    // 初始化标签页
    initTabs();
  }
  
  // 初始化标签页功能
  function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        // 移除所有标签页的激活状态
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabPanes.forEach(pane => pane.classList.remove('active'));
        
        // 激活当前标签页
        button.classList.add('active');
        const tabId = button.dataset.tab;
        document.getElementById(`${tabId}-tab`).classList.add('active');
      });
    });
  }
} 