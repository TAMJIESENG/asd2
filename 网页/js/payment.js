// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 从localStorage获取订单信息
    loadOrderInfo();
    
    // 初始化二维码
    initQRCode();
    
    // 设置倒计时
    initCountdown();
    
    // 绑定事件
    bindEvents();
});

// 加载订单信息
function loadOrderInfo() {
    const orderInfoStr = localStorage.getItem('currentOrder');
    if (!orderInfoStr) {
        console.error('没有找到订单信息，返回购买页面');
        window.location.href = 'purchase.html';
        return;
    }
    
    try {
        const orderInfo = JSON.parse(orderInfoStr);
        
        // 更新页面上的订单信息
        document.getElementById('order-number').textContent = orderInfo.id;
        document.getElementById('payment-amount').textContent = orderInfo.price.toFixed(2);
        document.getElementById('product-name').textContent = orderInfo.product;
        
        // 设置默认支付方式
        if (orderInfo.payment) {
            const paymentMethods = document.querySelectorAll('.payment-method-item');
            paymentMethods.forEach(method => {
                if (method.getAttribute('data-method') === orderInfo.payment) {
                    method.classList.add('active');
                    document.getElementById('payment-method').textContent = getPaymentMethodName(orderInfo.payment);
                    document.getElementById('payment-app-name').textContent = getPaymentMethodName(orderInfo.payment);
                } else {
                    method.classList.remove('active');
                }
            });
        }
    } catch (e) {
        console.error('解析订单信息失败', e);
    }
}

// 初始化二维码
function initQRCode() {
    // 获取订单信息
    const orderInfoStr = localStorage.getItem('currentOrder');
    if (!orderInfoStr) {
        return;
    }
    
    const orderInfo = JSON.parse(orderInfoStr);
    const orderId = orderInfo.id;
    const amount = orderInfo.price.toFixed(2);
    
    // 获取当前支付方式
    const activeMethod = document.querySelector('.payment-method-item.active');
    const paymentMethod = activeMethod ? activeMethod.getAttribute('data-method') : 'alipay';
    
    // 检查是否已加载qrcode.js库
    if (typeof QRCode !== 'undefined') {
        const qrcodeElement = document.getElementById('qrcode-container');
        
        // 创建二维码
        new QRCode(qrcodeElement, {
            text: `https://example.com/pay?order=${orderId}&amount=${amount}&method=${paymentMethod}`,
            width: 200,
            height: 200,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
    } else {
        // 如果未加载qrcode.js库，创建一个占位
        console.error("QRCode库未加载，无法生成二维码");
        document.getElementById('qrcode-container').innerHTML = '<div style="padding: 20px; text-align: center;">二维码加载中...</div>';
        
        // 尝试延迟加载
        setTimeout(initQRCode, 1000);
    }
}

// 初始化倒计时
function initCountdown() {
    let totalSeconds = 15 * 60; // 15分钟倒计时
    const countdownElement = document.getElementById('countdown');
    const progressElement = document.getElementById('countdown-progress');
    
    function updateCountdown() {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        
        // 更新显示
        countdownElement.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        
        // 更新进度条
        const progressPercentage = (totalSeconds / (15 * 60)) * 100;
        progressElement.style.width = `${progressPercentage}%`;
        
        // 如果倒计时结束，显示二维码过期
        if (totalSeconds <= 0) {
            clearInterval(countdownInterval);
            document.getElementById('payment-failed').classList.remove('hidden');
            return;
        }
        
        totalSeconds--;
    }
    
    // 立即更新一次
    updateCountdown();
    
    // 设置定时器，每秒更新一次
    const countdownInterval = setInterval(updateCountdown, 1000);
}

// 从卡密池中获取未使用的卡密
function getUnusedActivationCode(type) {
    // 获取所有激活码
    let codes = [];
    const storedCodes = localStorage.getItem('activationCodes');
    if (storedCodes) {
        codes = JSON.parse(storedCodes);
    }
    
    // 查找未使用的激活码
    const availableCode = codes.find(code => code.status === 'unused' && code.type === type);
    
    if (availableCode) {
        // 更新激活码状态为已使用
        availableCode.status = 'used';
        availableCode.usedAt = new Date().toISOString();
        
        // 保存回localStorage
        localStorage.setItem('activationCodes', JSON.stringify(codes));
        
        return availableCode.code;
    }
    
    return null;
}

// 生成激活码（保留此函数作为备用）
function generateActivationCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    
    // 生成四组四位码
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        if (i < 3) result += '-';
    }
    
    return result;
}

// 保存订单数据
function saveOrderData(orderInfo, activationCode) {
    const order = {
        id: orderInfo.id,
        product: orderInfo.product,
        type: orderInfo.product.includes('月度') ? 'month' : 
              orderInfo.product.includes('季度') ? 'quarter' : 
              orderInfo.product.includes('年度') ? 'year' : 'unknown',
        price: orderInfo.price,
        email: orderInfo.email,
        activationCode: activationCode,
        createdAt: new Date().toISOString(),
        status: 'completed'
    };
    
    // 获取现有订单
    let orders = [];
    const storedOrders = localStorage.getItem('orders');
    if (storedOrders) {
        orders = JSON.parse(storedOrders);
    }
    
    // 添加新订单
    orders.push(order);
    
    // 保存回localStorage
    localStorage.setItem('orders', JSON.stringify(orders));
    localStorage.setItem('lastActivationCode', activationCode);
    
    // 不再需要保存激活码，因为我们是从卡密池中获取的已有卡密
}

// 保存激活码
function saveActivationCode(code, type) {
    // 获取现有激活码
    let codes = [];
    const storedCodes = localStorage.getItem('activationCodes');
    if (storedCodes) {
        codes = JSON.parse(storedCodes);
    }
    
    // 添加新激活码
    codes.push({
        id: generateId(),
        code: code,
        type: type,
        validity: getValidityDays(type),
        status: 'unused',
        createdAt: new Date().toISOString()
    });
    
    // 保存回localStorage
    localStorage.setItem('activationCodes', JSON.stringify(codes));
}

// 生成唯一ID
function generateId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// 获取有效期天数
function getValidityDays(type) {
    switch (type) {
        case 'month': return 30;
        case 'quarter': return 90;
        case 'year': return 365;
        default: return 30;
    }
}

// 绑定事件
function bindEvents() {
    // 支付方式切换
    document.querySelectorAll('.payment-method-item').forEach(item => {
        item.addEventListener('click', function() {
            // 移除其他支付方式的选中状态
            document.querySelectorAll('.payment-method-item').forEach(el => {
                el.classList.remove('active');
            });
            
            // 设置当前选中的支付方式
            this.classList.add('active');
            
            // 更新显示
            const method = this.getAttribute('data-method');
            document.getElementById('payment-method').textContent = getPaymentMethodName(method);
            document.getElementById('payment-app-name').textContent = getPaymentMethodName(method);
            
            // 重新生成二维码
            regenerateQRCode(method);
        });
    });
    
    // 我已支付完成按钮
    const paymentCompleteBtn = document.getElementById('payment-complete-btn');
    if (paymentCompleteBtn) {
        paymentCompleteBtn.addEventListener('click', function() {
            console.log('我已支付完成按钮被点击');
            // 显示支付成功界面
            document.getElementById('payment-success').classList.remove('hidden');
            
            // 获取订单信息
            const orderInfoStr = localStorage.getItem('currentOrder');
            if (!orderInfoStr) return;
            
            try {
                const orderInfo = JSON.parse(orderInfoStr);
                
                // 获取订单类型
                const orderType = orderInfo.product.toLowerCase().includes('月') ? 'month' : 
                      orderInfo.product.toLowerCase().includes('季') ? 'quarter' : 
                      orderInfo.product.toLowerCase().includes('年') ? 'year' : 'unknown';
                
                // 获取或生成激活码
                let activationCode = getUnusedActivationCode(orderType);
                if (!activationCode) {
                    activationCode = generateActivationCode();
                    saveActivationCode(activationCode, orderType);
                }
                
                // 保存订单数据
                saveOrderData(orderInfo, activationCode);
                
                // 设置标记，以便跳转到激活码页面时显示
                localStorage.setItem('showActivationStep', 'true');
            } catch (e) {
                console.error('处理订单信息失败', e);
            }
        });
    }
    
    // 刷新二维码按钮
    document.getElementById('refresh-qrcode').addEventListener('click', function() {
        // 获取当前选中的支付方式
        const activeMethod = document.querySelector('.payment-method-item.active');
        if (activeMethod) {
            const paymentMethod = activeMethod.getAttribute('data-method');
            regenerateQRCode(paymentMethod);
        } else {
            regenerateQRCode('alipay'); // 默认支付宝
        }
    });
    
    // 复制订单号按钮
    const copyOrderNumberBtn = document.getElementById('copy-order-number');
    if (copyOrderNumberBtn) {
        copyOrderNumberBtn.addEventListener('click', function() {
            const orderNumber = document.getElementById('order-number').textContent;
            copyToClipboard(orderNumber);
            
            // 显示复制成功提示
            this.textContent = '已复制';
            setTimeout(() => {
                this.textContent = '复制';
            }, 2000);
        });
    }
    
    // 关闭支付窗口
    const closePaymentBtn = document.getElementById('close-payment');
    if (closePaymentBtn) {
        closePaymentBtn.addEventListener('click', function() {
            // 这里可以根据需要跳转到其他页面或关闭窗口
            if (confirm('确定要取消支付吗？')) {
                window.location.href = 'index.html';
            }
        });
    }
    
    // 重新支付
    const retryPaymentBtn = document.getElementById('retry-payment');
    if (retryPaymentBtn) {
        retryPaymentBtn.addEventListener('click', function() {
            document.getElementById('payment-failed').classList.add('hidden');
            initCountdown();
            
            // 获取当前选中的支付方式
            const activeMethod = document.querySelector('.payment-method-item.active');
            if (activeMethod) {
                const paymentMethod = activeMethod.getAttribute('data-method');
                regenerateQRCode(paymentMethod);
            } else {
                regenerateQRCode('alipay'); // 默认支付宝
            }
        });
    }
    
    // 取消订单
    const cancelPaymentBtn = document.getElementById('cancel-payment');
    if (cancelPaymentBtn) {
        cancelPaymentBtn.addEventListener('click', function() {
            window.location.href = 'index.html';
        });
    }
    
    // 查看激活码按钮
    const viewActivationCodeBtn = document.getElementById('view-activation-code');
    if (viewActivationCodeBtn) {
        viewActivationCodeBtn.addEventListener('click', function() {
            // 设置标记，以便页面加载时显示激活码
            localStorage.setItem('showActivationStep', 'true');
            // 跳转到购买页面的激活码步骤
            window.location.href = 'purchase.html';
        });
    }
}

// 模拟支付成功（仅用于演示）
function simulatePaymentSuccess() {
    // 20秒后自动显示支付成功
    setTimeout(function() {
        document.getElementById('payment-success').classList.remove('hidden');
    }, 20000); // 真实场景中，这里应该是通过后端接口轮询订单状态
}

// 根据支付方式重新生成二维码
function regenerateQRCode(paymentMethod) {
    const qrcodeElement = document.getElementById('qrcode-container');
    
    // 清空原有内容
    qrcodeElement.innerHTML = '';
    
    // 创建二维码
    if (typeof QRCode !== 'undefined') {
        new QRCode(qrcodeElement, {
            text: `https://example.com/pay?order=2025040412345678&amount=100.00&method=${paymentMethod}`,
            width: 200,
            height: 200,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
    }
}

// 复制文本到剪贴板
function copyToClipboard(text) {
    // 创建临时输入框
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    
    // 选择文本并复制
    textarea.select();
    document.execCommand('copy');
    
    // 移除临时输入框
    document.body.removeChild(textarea);
}

// 获取支付方式名称
function getPaymentMethodName(method) {
    switch (method) {
        case 'alipay':
            return '支付宝';
        case 'wechat':
            return '微信支付';
        case 'qq':
            return 'QQ钱包';
        default:
            return '支付宝';
    }
}

// 添加对模拟支付成功函数的调用
simulatePaymentSuccess();