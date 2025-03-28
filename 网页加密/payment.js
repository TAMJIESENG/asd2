document.addEventListener('DOMContentLoaded', function() {
    // 检查用户登录状态
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    // 获取DOM元素
    const monthlyPlan = document.getElementById('monthlyPlan');
    const yearlyPlan = document.getElementById('yearlyPlan');
    const lifetimePlan = document.getElementById('lifetimePlan');
    const planName = document.getElementById('planName');
    const planPrice = document.getElementById('planPrice');
    const totalPrice = document.getElementById('totalPrice');
    const alipay = document.getElementById('alipay');
    const wechat = document.getElementById('wechat');
    const creditCard = document.getElementById('creditCard');
    const alipayForm = document.getElementById('alipayForm');
    const wechatForm = document.getElementById('wechatForm');
    const creditCardForm = document.getElementById('creditCardForm');
    const paymentForm = document.getElementById('paymentForm');

    // 设置套餐信息
    const plans = {
        monthly: {
            name: '月度VIP',
            price: '29.9',
            duration: 30
        },
        yearly: {
            name: '年度VIP',
            price: '299',
            duration: 365
        },
        lifetime: {
            name: '终身VIP',
            price: '699',
            duration: 36500 // 约100年
        }
    };

    // 更新套餐显示
    function updatePlanInfo() {
        let selectedPlan;
        if (monthlyPlan.checked) {
            selectedPlan = plans.monthly;
        } else if (yearlyPlan.checked) {
            selectedPlan = plans.yearly;
        } else {
            selectedPlan = plans.lifetime;
        }

        planName.textContent = selectedPlan.name;
        planPrice.textContent = '¥' + selectedPlan.price;
        totalPrice.textContent = '¥' + selectedPlan.price;
    }

    // 初始化套餐显示
    updatePlanInfo();

    // 套餐选择变化监听
    monthlyPlan.addEventListener('change', updatePlanInfo);
    yearlyPlan.addEventListener('change', updatePlanInfo);
    lifetimePlan.addEventListener('change', updatePlanInfo);

    // 支付方式切换
    function updatePaymentForm() {
        alipayForm.style.display = alipay.checked ? 'block' : 'none';
        wechatForm.style.display = wechat.checked ? 'block' : 'none';
        creditCardForm.style.display = creditCard.checked ? 'block' : 'none';
    }

    // 初始化支付方式显示
    updatePaymentForm();

    // 支付方式选择变化监听
    alipay.addEventListener('change', updatePaymentForm);
    wechat.addEventListener('change', updatePaymentForm);
    creditCard.addEventListener('change', updatePaymentForm);

    // 表单提交处理
    paymentForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // 获取选中的套餐
        let selectedPlan;
        if (monthlyPlan.checked) {
            selectedPlan = plans.monthly;
        } else if (yearlyPlan.checked) {
            selectedPlan = plans.yearly;
        } else {
            selectedPlan = plans.lifetime;
        }

        // 获取选中的支付方式
        let paymentMethod;
        if (alipay.checked) {
            paymentMethod = 'alipay';
        } else if (wechat.checked) {
            paymentMethod = 'wechat';
        } else {
            paymentMethod = 'creditCard';
        }

        // 银行卡支付方式验证
        if (paymentMethod === 'creditCard') {
            const cardNumber = document.getElementById('cardNumber').value;
            const expiryDate = document.getElementById('expiryDate').value;
            const cvv = document.getElementById('cvv').value;
            const cardName = document.getElementById('cardName').value;

            if (!cardNumber || !expiryDate || !cvv || !cardName) {
                showAlert('请填写完整的银行卡信息', 'danger');
                return;
            }
        }

        // 模拟支付处理
        // 在实际应用中，这里应该调用支付接口
        setTimeout(function() {
            // 更新用户VIP状态
            updateUserVipStatus(selectedPlan.duration);
            
            // 显示支付成功模态框
            const successModal = new bootstrap.Modal(document.getElementById('successModal'));
            successModal.show();
        }, 1500);
    });

    // 更新用户VIP状态
    function updateUserVipStatus(days) {
        // 获取用户数据
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const currentUserId = users.findIndex(u => u.username === currentUser.username);
        
        if (currentUserId !== -1) {
            // 设置VIP到期时间
            const now = new Date();
            const expiryDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
            
            // 更新用户信息
            users[currentUserId].isVip = true;
            users[currentUserId].vipExpiryDate = expiryDate.toISOString();
            
            // 保存回本地存储
            localStorage.setItem('users', JSON.stringify(users));
            
            // 更新当前用户状态
            currentUser.isVip = true;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
    }

    // 显示提示信息
    function showAlert(message, type) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
        alertDiv.style.zIndex = '1000';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(alertDiv);
        setTimeout(() => {
            alertDiv.remove();
        }, 3000);
    }
}); 