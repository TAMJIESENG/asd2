document.addEventListener('DOMContentLoaded', function() {
    // 检查用户登录状态
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    // 获取用户数据
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const currentUserId = users.findIndex(u => u.username === currentUser.username);
    const userData = currentUserId !== -1 ? users[currentUserId] : null;

    if (!userData) {
        showAlert('获取用户数据失败', 'danger');
        return;
    }

    // 更新用户信息显示
    updateUserInfo(userData);

    // 加载个人资料
    loadProfileData(userData);

    // 检查VIP状态并更新显示
    updateVipStatus(userData);

    // 加载偏好设置
    loadPreferences(userData);

    // 个人资料表单提交
    const profileForm = document.getElementById('profileForm');
    profileForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveProfileData(userData, currentUserId, users);
    });

    // 密码修改表单提交
    const passwordForm = document.getElementById('passwordForm');
    passwordForm.addEventListener('submit', function(e) {
        e.preventDefault();
        changePassword(userData, currentUserId, users);
    });

    // 保存偏好设置
    const savePreferencesBtn = document.getElementById('savePreferences');
    savePreferencesBtn.addEventListener('click', function() {
        savePreferences(userData, currentUserId, users);
    });

    // 安全设置开关
    const loginNotification = document.getElementById('loginNotification');
    const twoFactorAuth = document.getElementById('twoFactorAuth');

    loginNotification.addEventListener('change', function() {
        userData.settings = userData.settings || {};
        userData.settings.loginNotification = this.checked;
        users[currentUserId] = userData;
        localStorage.setItem('users', JSON.stringify(users));
        showAlert('设置已保存', 'success');
    });

    twoFactorAuth.addEventListener('change', function() {
        if (this.checked) {
            showAlert('两步验证功能暂未开放', 'warning');
            this.checked = false;
        }
    });
});

// 更新用户基本信息显示
function updateUserInfo(userData) {
    const profileUsername = document.getElementById('profileUsername');
    const userVipStatus = document.getElementById('userVipStatus');
    const userRegisterDate = document.getElementById('userRegisterDate');

    profileUsername.textContent = userData.username;
    
    if (userData.isVip) {
        userVipStatus.innerHTML = `
            <span class="badge bg-warning">
                <i class="fas fa-crown me-1"></i>VIP会员
            </span>
        `;
    } else {
        userVipStatus.innerHTML = `
            <span class="badge bg-secondary">
                <i class="fas fa-user me-1"></i>普通用户
            </span>
        `;
    }

    if (userData.registerDate) {
        const date = new Date(userData.registerDate);
        userRegisterDate.textContent = `注册时间：${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    } else {
        userRegisterDate.textContent = '注册时间：未知';
    }
}

// 加载个人资料
function loadProfileData(userData) {
    const profileNickname = document.getElementById('profileNickname');
    const profileEmail = document.getElementById('profileEmail');
    const profilePhone = document.getElementById('profilePhone');
    const profileBio = document.getElementById('profileBio');

    profileNickname.value = userData.nickname || '';
    profileEmail.value = userData.email || '';
    profilePhone.value = userData.phone || '';
    profileBio.value = userData.bio || '';
}

// 保存个人资料
function saveProfileData(userData, currentUserId, users) {
    const profileNickname = document.getElementById('profileNickname').value;
    const profileEmail = document.getElementById('profileEmail').value;
    const profilePhone = document.getElementById('profilePhone').value;
    const profileBio = document.getElementById('profileBio').value;

    // 更新用户数据
    userData.nickname = profileNickname;
    userData.email = profileEmail;
    userData.phone = profilePhone;
    userData.bio = profileBio;

    // 保存到本地存储
    users[currentUserId] = userData;
    localStorage.setItem('users', JSON.stringify(users));

    showAlert('个人资料已保存', 'success');
}

// 修改密码
function changePassword(userData, currentUserId, users) {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;

    // 验证当前密码
    if (userData.password !== currentPassword) {
        showAlert('当前密码不正确', 'danger');
        return;
    }

    // 验证新密码
    if (newPassword !== confirmNewPassword) {
        showAlert('两次输入的新密码不一致', 'danger');
        return;
    }

    if (newPassword.length < 6) {
        showAlert('新密码长度不能少于6位', 'danger');
        return;
    }

    // 更新密码
    userData.password = newPassword;
    users[currentUserId] = userData;
    localStorage.setItem('users', JSON.stringify(users));

    // 清空密码输入框
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmNewPassword').value = '';

    showAlert('密码修改成功', 'success');
}

// 更新VIP状态显示
function updateVipStatus(userData) {
    const nonVipAlert = document.getElementById('nonVipAlert');
    const vipInfo = document.getElementById('vipInfo');
    const vipLevel = document.getElementById('vipLevel');
    const vipExpiry = document.getElementById('vipExpiry');
    const vipProgress = document.getElementById('vipProgress');
    const vipDaysRemaining = document.getElementById('vipDaysRemaining');
    
    if (userData.isVip && userData.vipExpiryDate) {
        nonVipAlert.style.display = 'none';
        vipInfo.style.display = 'block';
        
        const now = new Date();
        const expiryDate = new Date(userData.vipExpiryDate);
        
        // 设置VIP信息
        vipLevel.textContent = 'VIP会员';
        vipExpiry.textContent = `有效期至：${expiryDate.getFullYear()}-${String(expiryDate.getMonth() + 1).padStart(2, '0')}-${String(expiryDate.getDate()).padStart(2, '0')}`;
        
        // 计算剩余天数
        const totalDays = Math.round((expiryDate - now) / (1000 * 60 * 60 * 24));
        vipDaysRemaining.textContent = `剩余 ${totalDays} 天`;
        
        // 如果是终身VIP
        if (totalDays > 3650) {  // 超过10年
            vipLevel.textContent = '终身VIP会员';
            vipExpiry.textContent = '永久有效';
            vipDaysRemaining.textContent = '永久有效';
            vipProgress.style.width = '100%';
        } else {
            // 假设一个标准周期为1年
            const percentage = Math.min(100, (totalDays / 365) * 100);
            vipProgress.style.width = `${percentage}%`;
        }
    } else {
        nonVipAlert.style.display = 'block';
        vipInfo.style.display = 'none';
    }
}

// 加载偏好设置
function loadPreferences(userData) {
    const themeSetting = document.getElementById('themeSetting');
    const animationSetting = document.getElementById('animationSetting');
    const defaultEncryption = document.getElementById('defaultEncryption');
    const loginNotification = document.getElementById('loginNotification');

    // 获取设置，优先使用用户设置，否则使用全局设置
    const themeValue = userData.settings?.theme || localStorage.getItem('theme') || 'light';
    
    themeSetting.value = themeValue;
    applyTheme(themeValue);  // 立即应用主题
    
    if (userData.settings) {
        animationSetting.checked = userData.settings.animation !== false;
        defaultEncryption.value = userData.settings.defaultEncryption || 'base64';
        loginNotification.checked = userData.settings.loginNotification === true;
    }
}

// 保存偏好设置
function savePreferences(userData, currentUserId, users) {
    const themeSetting = document.getElementById('themeSetting').value;
    const animationSetting = document.getElementById('animationSetting').checked;
    const defaultEncryption = document.getElementById('defaultEncryption').value;
    const loginNotification = document.getElementById('loginNotification').checked;

    // 初始化设置对象
    userData.settings = userData.settings || {};
    
    // 更新设置
    userData.settings.theme = themeSetting;
    userData.settings.animation = animationSetting;
    userData.settings.defaultEncryption = defaultEncryption;
    userData.settings.loginNotification = loginNotification;

    // 保存到本地存储
    users[currentUserId] = userData;
    localStorage.setItem('users', JSON.stringify(users));

    // 应用主题设置
    applyTheme(themeSetting);

    showAlert('偏好设置已保存', 'success');
}

// 应用主题
function applyTheme(theme) {
    // 加载主题相关的CSS
    let darkThemeLink = document.getElementById('dark-theme-css');
    
    if (theme === 'dark') {
        if (!darkThemeLink) {
            darkThemeLink = document.createElement('link');
            darkThemeLink.id = 'dark-theme-css';
            darkThemeLink.rel = 'stylesheet';
            darkThemeLink.href = 'dark-theme.css';
            document.head.appendChild(darkThemeLink);
        }
        document.documentElement.classList.add('dark-theme');
        document.body.classList.add('dark-theme');
    } else {
        if (darkThemeLink) {
            darkThemeLink.disabled = true;
        }
        document.documentElement.classList.remove('dark-theme');
        document.body.classList.remove('dark-theme');
    }
    
    // 将主题设置保存到本地存储中，使其在所有页面生效
    localStorage.setItem('theme', theme);
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