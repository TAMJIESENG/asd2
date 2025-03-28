document.addEventListener('DOMContentLoaded', function() {
    // 初始化管理员账户
    initializeAdmin();

    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const showRegisterBtn = document.getElementById('showRegister');
    const showLoginBtn = document.getElementById('showLogin');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const regUsernameInput = document.getElementById('regUsername');
    const regPasswordInput = document.getElementById('regPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    // 检查是否已登录，如果已登录则跳转到首页
    if (localStorage.getItem('currentUser')) {
        window.location.href = 'index.html';
        return;
    }

    // 检查URL中是否有#register，如果有则显示注册表单
    if (window.location.hash === '#register') {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    }

    // 显示注册表单
    showRegisterBtn.addEventListener('click', function() {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        regUsernameInput.focus();
    });

    // 显示登录表单
    showLoginBtn.addEventListener('click', function() {
        registerForm.style.display = 'none';
        loginForm.style.display = 'block';
        usernameInput.focus();
    });

    // 实时验证密码一致性
    confirmPasswordInput.addEventListener('input', function() {
        if (this.value !== regPasswordInput.value) {
            this.setCustomValidity('两次输入的密码不一致');
        } else {
            this.setCustomValidity('');
        }
    });

    regPasswordInput.addEventListener('input', function() {
        if (confirmPasswordInput.value && confirmPasswordInput.value !== this.value) {
            confirmPasswordInput.setCustomValidity('两次输入的密码不一致');
        } else {
            confirmPasswordInput.setCustomValidity('');
        }
    });

    // 处理登录表单提交
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        if (handleLogin(username, password)) {
            // 检查是否为管理员
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (currentUser && currentUser.isAdmin) {
                // 管理员跳转到后台
                window.location.href = 'admin.html';
            } else {
                // 普通用户跳转到首页
                window.location.href = 'index.html';
            }
        } else {
            showAlert('用户名或密码不正确!', 'danger');
        }
    });

    // 处理注册表单提交
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // 表单验证
        if (!regUsernameInput.value.trim()) {
            showAlert('请输入用户名', 'warning');
            regUsernameInput.focus();
            return;
        }

        if (regUsernameInput.value.trim().length < 3) {
            showAlert('用户名长度至少为3个字符', 'warning');
            regUsernameInput.focus();
            return;
        }

        if (!regPasswordInput.value) {
            showAlert('请输入密码', 'warning');
            regPasswordInput.focus();
            return;
        }

        if (regPasswordInput.value.length < 6) {
            showAlert('密码长度至少为6个字符', 'warning');
            regPasswordInput.focus();
            return;
        }

        if (regPasswordInput.value !== confirmPasswordInput.value) {
            showAlert('两次输入的密码不一致', 'warning');
            confirmPasswordInput.focus();
            return;
        }

        const registerBtn = registerForm.querySelector('button[type="submit"]');
        const originalText = registerBtn.innerHTML;
        registerBtn.disabled = true;
        registerBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>注册中...';

        // 模拟网络延迟，实际应用中可以移除
        setTimeout(function() {
            try {
                if (handleRegister(regUsernameInput.value, regPasswordInput.value)) {
                    showAlert('注册成功，正在跳转...', 'success');
                    setTimeout(function() {
                        window.location.href = 'index.html';
                    }, 1000);
                } else {
                    showAlert('注册失败，用户名可能已被占用', 'danger');
                    registerBtn.disabled = false;
                    registerBtn.innerHTML = originalText;
                }
            } catch (error) {
                showAlert('注册过程中发生错误: ' + error.message, 'danger');
                registerBtn.disabled = false;
                registerBtn.innerHTML = originalText;
            }
        }, 500);
    });

    // 切换登录/注册表单
    function toggleForms(formToShow) {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        
        if (formToShow === 'login') {
            loginForm.style.display = 'block';
            registerForm.style.display = 'none';
        } else {
            loginForm.style.display = 'none';
            registerForm.style.display = 'block';
        }
    }

    // 页面加载时聚焦到用户名输入框
    usernameInput.focus();
});

// 初始化管理员账户
function initializeAdmin() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // 检查管理员账户是否已存在
    const adminExists = users.some(user => user.username.toLowerCase() === 'admin');
    
    if (!adminExists) {
        // 创建默认管理员账户
        users.push({
            username: 'admin',
            password: 'admin123',
            isAdmin: true,
            isVip: true,
            registerDate: new Date().toISOString()
        });
        
        localStorage.setItem('users', JSON.stringify(users));
        console.log('管理员账户已初始化');
    }
}

// 显示提示信息
function showAlert(message, type) {
    // 移除所有已存在的提示框
    const existingAlerts = document.querySelectorAll('.alert');
    existingAlerts.forEach(alert => alert.remove());
    
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