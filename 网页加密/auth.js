// 用户状态管理
let currentUser = null;
let isAdmin = false;

// 用户数据存储
let users = JSON.parse(localStorage.getItem('users')) || [];

// 检查登录状态
function checkAuth() {
    try {
        // 从本地存储获取当前用户信息
        currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        // 获取需要更新的元素
        const usernameElement = document.getElementById('username');
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        const settingsBtn = document.getElementById('settingsBtn');
        const adminBtn = document.getElementById('adminBtn');
        const adminNavItem = document.getElementById('adminNavItem');
        const logoutBtn = document.getElementById('logoutBtn');
        const vipBadge = document.getElementById('vipBadge');
        const vipUpgrade = document.getElementById('vipUpgrade');
        const encryptionMethod = document.getElementById('encryptionMethod');
        
        if (currentUser) {
            // 用户已登录
            if (usernameElement) usernameElement.textContent = currentUser.username;
            if (loginBtn) loginBtn.style.display = 'none';
            if (registerBtn) registerBtn.style.display = 'none';
            if (settingsBtn) settingsBtn.style.display = 'block';
            if (logoutBtn) logoutBtn.style.display = 'block';
            
            // 处理VIP状态
            if (currentUser.isVip) {
                if (vipBadge) vipBadge.style.display = 'inline-block';
                if (vipUpgrade) vipUpgrade.style.display = 'none';
                
                // 解锁VIP加密方法
                if (encryptionMethod) {
                    const vipOption = encryptionMethod.querySelector('option[value="vip"]');
                    if (vipOption) vipOption.disabled = false;
                }
            } else {
                if (vipBadge) vipBadge.style.display = 'none';
                if (vipUpgrade) vipUpgrade.style.display = 'block';
                
                // 锁定VIP加密方法
                if (encryptionMethod) {
                    const vipOption = encryptionMethod.querySelector('option[value="vip"]');
                    if (vipOption) vipOption.disabled = true;
                }
            }
            
            // 处理管理员状态
            if (currentUser.isAdmin) {
                if (adminBtn) adminBtn.style.display = 'block';
                if (adminNavItem) adminNavItem.style.display = 'block';
            } else {
                if (adminBtn) adminBtn.style.display = 'none';
                if (adminNavItem) adminNavItem.style.display = 'none';
            }
        } else {
            // 用户未登录
            if (usernameElement) usernameElement.textContent = '未登录';
            if (loginBtn) loginBtn.style.display = 'block';
            if (registerBtn) registerBtn.style.display = 'block';
            if (settingsBtn) settingsBtn.style.display = 'none';
            if (adminBtn) adminBtn.style.display = 'none';
            if (adminNavItem) adminNavItem.style.display = 'none';
            if (logoutBtn) logoutBtn.style.display = 'none';
            if (vipBadge) vipBadge.style.display = 'none';
            if (vipUpgrade) vipUpgrade.style.display = 'none';
        }
    } catch (error) {
        console.error('检查授权时发生错误:', error);
    }
}

// 登录处理
function handleLogin(username, password) {
    try {
        // 从本地存储获取用户数据
        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        // 特殊处理：admin用户总是可以登录
        if (username.toLowerCase() === 'admin') {
            const adminUser = users.find(u => u.username.toLowerCase() === 'admin');
            if (adminUser) {
                // 如果admin用户已存在
                if (adminUser.password !== password) {
                    return false; // 密码不匹配
                }
            } else {
                // 如果admin用户不存在，创建一个新的
                users.push({
                    username: 'admin',
                    password: password,
                    isVip: true,
                    isAdmin: true,
                    registerDate: new Date().toISOString()
                });
                localStorage.setItem('users', JSON.stringify(users));
            }
            
            currentUser = {
                username: 'admin',
                isVip: true,
                isAdmin: true
            };
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            return true;
        }
        
        // 普通用户登录
        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
            // 检查账户是否被锁定
            if (user.isLocked) {
                showAlert('您的账户已被锁定，请联系管理员', 'danger');
                return false;
            }
            
            currentUser = {
                username: user.username,
                isVip: user.isVip || false,
                isAdmin: user.isAdmin || false
            };
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            return true;
        }
        return false;
    } catch (error) {
        console.error('登录过程中发生错误:', error);
        return false;
    }
}

// 注册处理
function handleRegister(username, password) {
    try {
        if (!username || !password) {
            return false;
        }
        
        // 用户名和密码长度验证
        if (username.trim().length < 3 || password.length < 6) {
            return false;
        }
        
        // 从本地存储获取用户数据
        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        // 检查用户名是否已存在
        if (users.some(u => u.username === username)) {
            return false;
        }

        // 创建新用户
        const newUser = {
            username: username,
            password: password,
            isVip: false,
            isAdmin: false,
            registerDate: new Date().toISOString()
        };

        // 添加到用户列表
        users.push(newUser);
        
        // 保存到本地存储
        localStorage.setItem('users', JSON.stringify(users));
        
        // 自动登录
        currentUser = {
            username: newUser.username,
            isVip: newUser.isVip,
            isAdmin: newUser.isAdmin
        };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        return true;
    } catch (error) {
        console.error('注册过程中发生错误:', error);
        return false;
    }
}

// 退出登录
function handleLogout() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    updateUIForUser();
    showAlert('已退出登录', 'info');
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

// 页面加载时检查登录状态
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();

    // 登录按钮点击事件
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            window.location.href = 'login.html';
        });
    }

    // 注册按钮点击事件
    const registerBtn = document.getElementById('registerBtn');
    if (registerBtn) {
        registerBtn.addEventListener('click', function() {
            window.location.href = 'login.html#register';
        });
    }

    // 退出按钮点击事件
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // 后台管理按钮点击事件
    const adminBtn = document.getElementById('adminBtn');
    if (adminBtn) {
        adminBtn.addEventListener('click', function() {
            if (currentUser && currentUser.isAdmin) {
                window.location.href = 'admin.html';
            } else {
                showAlert('您没有管理员权限', 'danger');
            }
        });
    }

    // 如果当前是管理员页面，检查权限
    if (window.location.pathname.includes('admin.html')) {
        if (!currentUser || !currentUser.isAdmin) {
            showAlert('您没有管理员权限', 'danger');
            setTimeout(function() {
                window.location.href = 'index.html';
            }, 2000);
        }
    }

    // VIP特权按钮点击事件
    const vipFeaturesBtn = document.getElementById('vipFeaturesBtn');
    if (vipFeaturesBtn) {
        vipFeaturesBtn.addEventListener('click', function() {
            const vipModal = new bootstrap.Modal(document.getElementById('vipModal'));
            vipModal.show();
        });
    }

    // 升级VIP按钮点击事件
    const upgradeVipBtn = document.getElementById('upgradeVipBtn');
    if (upgradeVipBtn) {
        upgradeVipBtn.addEventListener('click', function() {
            const vipModal = new bootstrap.Modal(document.getElementById('vipModal'));
            vipModal.show();
        });
    }
}); 