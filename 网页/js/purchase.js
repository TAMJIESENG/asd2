// 当前选择的产品类型
let selectedProduct = 'quarter';
let currentStep = 1;

// 产品价格映射
const productPrices = {
    month: 50,
    quarter: 100,
    year: 288
};

// 产品有效期映射
const productDurations = {
    month: '30天',
    quarter: '90天 (赠送30天)',
    year: '365天 (赠送90天)'
};

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    
    // 检查是否需要显示激活码步骤（从支付页面跳转过来）
    const showActivationStep = localStorage.getItem('showActivationStep');
    if (showActivationStep === 'true') {
        // 获取最近生成的激活码
        const activationCode = localStorage.getItem('lastActivationCode');
        if (activationCode) {
            // 更新激活码显示
            document.getElementById('activation-code').textContent = activationCode;
            // 跳转到第4步
            goToStep(4);
        }
        // 清除标记，避免刷新页面后仍然显示
        localStorage.removeItem('showActivationStep');
    }
});

// 设置事件监听器
function setupEventListeners() {
    // 产品选择按钮
    document.querySelectorAll('.select-product').forEach(button => {
        button.addEventListener('click', function() {
            const productType = this.getAttribute('data-product');
            selectProduct(productType);
            goToStep(2);
        });
    });
    
    // 表单下一步按钮
    document.querySelector('.go-next[data-step="3"]').addEventListener('click', function() {
        if (validateUserInfo()) {
            updateOrderSummary();
            goToStep(3);
        }
    });
    
    // 表单上一步按钮
    document.querySelectorAll('.go-prev').forEach(button => {
        button.addEventListener('click', function() {
            const prevStep = parseInt(this.getAttribute('data-step'), 10);
            goToStep(prevStep);
        });
    });
    
    // 支付方式选择
    document.querySelectorAll('.payment-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.payment-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            this.classList.add('selected');
        });
    });
    
    // 立即支付按钮
    document.getElementById('pay-now').addEventListener('click', function() {
        // 保存订单信息
        const orderInfo = {
            id: generateOrderNumber(),
            product: getProductName(selectedProduct),
            price: productPrices[selectedProduct],
            email: document.getElementById('user-email').value,
            payment: document.querySelector('.payment-option.selected').getAttribute('data-payment')
        };
        
        // 保存到localStorage，以便支付页面获取
        localStorage.setItem('currentOrder', JSON.stringify(orderInfo));
        
        // 跳转到支付页面
        window.location.href = 'payment.html';
    });
    
    // 关闭支付模态框
    document.querySelector('#payment-modal .modal-close').addEventListener('click', function() {
        document.getElementById('payment-modal').classList.add('modal-hidden');
    });
    
    // 我已支付完成按钮
    document.getElementById('payment-complete-btn').addEventListener('click', function() {
        completePayment();
    });
    
    // 复制激活码按钮
    document.getElementById('copy-code').addEventListener('click', function() {
        const codeElement = document.getElementById('activation-code');
        
        // 创建一个临时输入框
        const tempInput = document.createElement('input');
        tempInput.value = codeElement.textContent;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        
        // 更改按钮文字提示已复制
        const originalText = this.textContent;
        this.textContent = '已复制';
        this.disabled = true;
        
        setTimeout(() => {
            this.textContent = originalText;
            this.disabled = false;
        }, 2000);
    });
}

// 选择产品
function selectProduct(productType) {
    selectedProduct = productType;
    
    // 更新产品卡片选中状态
    document.querySelectorAll('.product-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    const selectedCard = document.querySelector(`.product-card[data-product="${productType}"]`);
    if (selectedCard) {
        selectedCard.classList.add('selected');
    }
}

// 切换到指定步骤
function goToStep(step) {
    // 更新当前步骤
    currentStep = step;
    
    // 更新步骤指示器
    document.querySelectorAll('.step').forEach((stepEl, index) => {
        const stepNumber = index + 1;
        stepEl.classList.remove('active', 'completed');
        
        if (stepNumber === currentStep) {
            stepEl.classList.add('active');
        } else if (stepNumber < currentStep) {
            stepEl.classList.add('completed');
        }
    });
    
    // 显示当前步骤内容
    document.querySelectorAll('.purchase-section').forEach((section, index) => {
        const sectionNumber = index + 1;
        section.classList.remove('active');
        
        if (sectionNumber === currentStep) {
            section.classList.add('active');
        }
    });
}

// 验证用户信息
function validateUserInfo() {
    const email = document.getElementById('user-email').value.trim();
    const agreeTerms = document.getElementById('agree-terms').checked;
    
    if (!email) {
        alert('请输入您的电子邮箱');
        return false;
    }
    
    // 简单的邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('请输入有效的电子邮箱地址');
        return false;
    }
    
    if (!agreeTerms) {
        alert('请阅读并同意用户协议和隐私政策');
        return false;
    }
    
    return true;
}

// 更新订单摘要信息
function updateOrderSummary() {
    const email = document.getElementById('user-email').value.trim();
    
    document.getElementById('order-product').textContent = getProductName(selectedProduct);
    document.getElementById('order-duration').textContent = productDurations[selectedProduct];
    document.getElementById('order-email').textContent = email;
    document.getElementById('order-price').textContent = `¥${productPrices[selectedProduct].toFixed(2)}`;
}

// 显示支付模态框
function showPaymentModal() {
    const paymentModal = document.getElementById('payment-modal');
    const selectedPaymentMethod = document.querySelector('.payment-option.selected').getAttribute('data-payment');
    const paymentMethodName = getPaymentMethodName(selectedPaymentMethod);
    const amount = productPrices[selectedProduct];
    
    // 更新模态框内容
    document.getElementById('modal-amount').textContent = amount.toFixed(2);
    document.getElementById('payment-method-name').textContent = paymentMethodName;
    
    // 生成随机订单号
    const orderNumber = generateOrderNumber();
    document.getElementById('order-number').textContent = orderNumber;
    
    // 显示模态框
    paymentModal.classList.remove('modal-hidden');
    
    // 模拟支付过程
    startPaymentCountdown();
    
    // 使用BASE64编码的二维码图片
    const qrCodeBase64 = getQRCodeImageBase64(selectedPaymentMethod);
    document.getElementById('payment-qrcode').innerHTML = `
        <img src="${qrCodeBase64}" alt="${paymentMethodName}支付二维码" style="width: 100%; height: 100%;">
    `;
}

// 获取支付二维码BASE64编码
function getQRCodeImageBase64(paymentMethod) {
    // 简单的示例二维码图片（使用BASE64编码）
    const qrCodes = {
        alipay: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
        wechat: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
        qq: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII="
    };
    
    return qrCodes[paymentMethod] || qrCodes['alipay']; // 默认返回支付宝
}

// 开始支付倒计时
function startPaymentCountdown() {
    let seconds = 15 * 60; // 15分钟倒计时
    const countdownEl = document.getElementById('payment-countdown');
    const progressEl = document.getElementById('payment-progress');
    
    // 更新进度条和倒计时文本
    function updateCountdown() {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        
        countdownEl.textContent = `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
        
        // 更新进度条宽度
        const progressWidth = (seconds / (15 * 60)) * 100;
        progressEl.style.width = `${progressWidth}%`;
        
        if (seconds > 0) {
            seconds--;
        }
    }
    
    // 初始更新
    updateCountdown();
    
    // 设置定时器
    const countdownInterval = setInterval(updateCountdown, 1000);
    
    // 模拟5秒后支付成功
    setTimeout(function() {
        clearInterval(countdownInterval);
        completePayment();
    }, 5000);
}

// 完成支付
function completePayment() {
    // 隐藏支付模态框
    document.getElementById('payment-modal').classList.add('modal-hidden');
    
    // 获取订单类型
    const orderType = selectedProduct;
    
    // 从卡密池中获取未使用的卡密
    const activationCode = getUnusedActivationCode(orderType);
    
    if (!activationCode) {
        alert('没有可用的激活码，请联系管理员添加激活码');
        return;
    }
    
    // 更新激活码显示
    document.getElementById('activation-code').textContent = activationCode;
    
    // 保存订单和激活码信息到localStorage
    saveOrderData(activationCode);
    
    // 跳转到步骤4
    goToStep(4);
}

// 保存订单数据
function saveOrderData(activationCode) {
    const order = {
        id: generateOrderNumber(),
        product: getProductName(selectedProduct),
        type: selectedProduct,
        price: productPrices[selectedProduct],
        email: document.getElementById('user-email').value.trim(),
        qq: document.getElementById('user-qq').value.trim(),
        deviceId: document.getElementById('device-id').value.trim(),
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
    
    // 保存激活码
    saveActivationCode(activationCode, selectedProduct);
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
        status: 'used',
        createdAt: new Date().toISOString(),
        usedAt: new Date().toISOString(),
        deviceId: document.getElementById('device-id').value.trim() || null
    });
    
    // 保存回localStorage
    localStorage.setItem('activationCodes', JSON.stringify(codes));
}

// 辅助函数
function getProductName(type) {
    switch (type) {
        case 'month': return '月度会员';
        case 'quarter': return '季度会员';
        case 'year': return '年度会员';
        default: return '未知产品';
    }
}

function getPaymentMethodName(method) {
    switch (method) {
        case 'alipay': return '支付宝';
        case 'wechat': return '微信支付';
        case 'qq': return 'QQ钱包';
        default: return '未知支付方式';
    }
}

function getValidityDays(type) {
    switch (type) {
        case 'month': return 30;
        case 'quarter': return 90;
        case 'year': return 365;
        default: return 30;
    }
}

function generateOrderNumber() {
    const now = new Date();
    const dateStr = now.getFullYear().toString().substring(2) +
                   padZero(now.getMonth() + 1) +
                   padZero(now.getDate());
    const timeStr = padZero(now.getHours()) +
                   padZero(now.getMinutes());
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return dateStr + timeStr + randomNum;
}

function padZero(num) {
    return num.toString().padStart(2, '0');
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

function generateId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}