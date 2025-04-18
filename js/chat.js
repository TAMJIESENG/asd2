// 初始化聊天组件
document.addEventListener('DOMContentLoaded', function() {
  initRealTimeChat();
});

/**
 * 初始化实时聊天功能
 */
function initRealTimeChat() {
  // 获取DOM元素
  const chatButton = document.getElementById('chat-widget-button');
  const chatPopup = document.getElementById('chat-widget-popup');
  const chatClose = document.getElementById('chat-widget-close');
  const sendButton = document.getElementById('widget-send-message-btn');
  const chatInput = document.getElementById('widget-chat-input');
  const chatMessages = document.getElementById('widget-chat-messages');
  
  // 如果聊天组件不存在，直接返回
  if (!chatButton || !chatPopup) return;
  
  // 生成唯一的用户ID并存储
  let userId = localStorage.getItem('chat_user_id');
  if (!userId) {
    userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('chat_user_id', userId);
  }

  // 连接Socket.IO服务器
  const socket = io(window.location.hostname + ':3000');
  
  // 连接成功事件
  socket.on('connect', () => {
    console.log('已连接到聊天服务器');
    // 加载历史消息
    loadChatHistory();
  });
  
  // 连接断开事件
  socket.on('disconnect', () => {
    console.log('与聊天服务器的连接已断开');
  });
  
  // 监听新消息事件
  socket.on('new-message', (message) => {
    // 只处理当前用户的消息
    if (message.userId === userId) {
      addMessageToUI(message);
      // 如果聊天窗口已打开，滚动到最新消息
      if (chatPopup.classList.contains('active')) {
        // 使用延时确保DOM已更新
        setTimeout(() => {
          scrollToLatestMessage();
        }, 100);
      } else {
        // 如果聊天窗口未打开，显示通知徽章
        showNotificationBadge();
      }
    }
  });
  
  // 打开聊天窗口
  chatButton.addEventListener('click', () => {
    chatPopup.classList.add('active');
    // 清除通知徽章
    clearNotificationBadge();
    // 滚动到最新消息，使用延时确保窗口动画完成
    setTimeout(() => {
      scrollToLatestMessage();
    }, 300);
  });
  
  // 关闭聊天窗口
  chatClose.addEventListener('click', () => {
    chatPopup.classList.remove('active');
  });
  
  // 发送消息
  sendButton.addEventListener('click', sendMessage);
  
  // 按回车键发送消息
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
  
  // 消息区域滚动事件监听（用于检测用户是否手动滚动）
  let userScrolled = false;
  chatMessages.addEventListener('scroll', () => {
    // 检测是否用户手动滚动上去了
    const isScrolledToBottom = chatMessages.scrollHeight - chatMessages.clientHeight <= chatMessages.scrollTop + 50;
    userScrolled = !isScrolledToBottom;
  });
  
  // 发送消息函数
  function sendMessage() {
    const messageText = chatInput.value.trim();
    if (!messageText) return;
    
    // 显示消息在界面上
    const messageData = {
      userId: userId,
      content: messageText,
      sender: 'user'
    };
    
    // 清空输入框
    chatInput.value = '';
    
    // 通过Socket.IO发送消息
    socket.emit('send-message', messageData);
    
    // 重置用户滚动状态，确保自己发送的消息后会自动滚动到底部
    userScrolled = false;
  }
  
  // 加载历史聊天记录
  function loadChatHistory() {
    fetch('/api/messages')
      .then(response => response.json())
      .then(messages => {
        // 清空当前消息
        chatMessages.innerHTML = '';
        
        // 过滤当前用户的消息
        const userMessages = messages.filter(msg => msg.userId === userId);
        
        // 按时间排序
        userMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        
        // 添加消息到UI
        userMessages.forEach(message => {
          addMessageToUI(message);
        });
        
        // 滚动到最新消息，给足够时间让DOM更新
        setTimeout(() => {
          scrollToLatestMessage();
        }, 200);
      })
      .catch(error => {
        console.error('加载历史消息失败:', error);
      });
  }
  
  // 添加消息到UI
  function addMessageToUI(message) {
    const messageElement = document.createElement('div');
    messageElement.className = `chat-message ${message.sender === 'user' ? 'outgoing' : 'incoming'}`;
    messageElement.dataset.id = message.id;
    
    const messageTime = formatChatTime(message.timestamp);
    
    messageElement.innerHTML = `
      <div class="chat-message-content">
        <div class="chat-message-text">${message.content}</div>
        <div class="chat-message-time">${messageTime}</div>
      </div>
    `;
    
    chatMessages.appendChild(messageElement);
    
    // 当新消息添加时，如果用户没有手动滚动，则自动滚动到底部
    if (!userScrolled) {
      setTimeout(() => {
        scrollToLatestMessage();
      }, 50);
    }
  }
  
  // 滚动到最新消息
  function scrollToLatestMessage() {
    if (chatMessages) {
      // 强制滚动到底部
      chatMessages.scrollTop = chatMessages.scrollHeight;
      
      // 双重检查是否真的滚动到底部
      setTimeout(() => {
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }, 50);
    }
  }
  
  // 格式化聊天时间
  function formatChatTime(timestamp) {
    const messageDate = new Date(timestamp);
    const now = new Date();
    
    // 今天的消息显示时间
    if (messageDate.toDateString() === now.toDateString()) {
      return messageDate.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    }
    
    // 昨天的消息
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return `昨天 ${messageDate.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // 更早的消息显示完整日期
    return messageDate.toLocaleString('zh-CN', { 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit', 
      minute: '2-digit'
    });
  }
  
  // 显示通知徽章
  function showNotificationBadge() {
    let badge = document.querySelector('.chat-notification-badge');
    
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'chat-notification-badge';
      chatButton.appendChild(badge);
    }
    
    // 获取未读消息数
    let unreadCount = parseInt(badge.textContent) || 0;
    badge.textContent = unreadCount + 1;
    badge.style.display = 'flex';
  }
  
  // 清除通知徽章
  function clearNotificationBadge() {
    const badge = document.querySelector('.chat-notification-badge');
    if (badge) {
      badge.style.display = 'none';
      badge.textContent = '0';
    }
    
    // 标记所有消息为已读
    const messageElements = chatMessages.querySelectorAll('.chat-message');
    messageElements.forEach(element => {
      const messageId = element.dataset.id;
      if (messageId) {
        markMessageAsRead(messageId);
      }
    });
  }
  
  // 标记消息为已读
  function markMessageAsRead(messageId) {
    fetch(`/api/messages/${messageId}/read`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      }
    }).catch(error => {
      console.error('标记消息已读失败:', error);
    });
  }
} 