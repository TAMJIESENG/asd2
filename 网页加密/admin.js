document.addEventListener('DOMContentLoaded', function() {
    // 检查管理员权限
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || !currentUser.isAdmin) {
        window.location.href = 'index.html';
        return;
    }

    // 初始化系统设置和统计数据
    initAdminPanel();

    // 页面切换
    const navLinks = document.querySelectorAll('.nav-link');
    const pageContents = document.querySelectorAll('.page-content');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetPage = this.getAttribute('data-page');
            
            // 更新导航栏激活状态
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');

            // 显示目标页面
            pageContents.forEach(page => {
                page.style.display = page.id === targetPage ? 'block' : 'none';
            });

            // 如果是统计页面，加载统计数据
            if (targetPage === 'stats') {
                loadStatistics();
            }
        });
    });

    // 加载用户列表
    loadUserList();

    // 用户搜索功能
    const userSearchInput = document.getElementById('userSearchInput');
    const userSearchBtn = document.getElementById('userSearchBtn');
    
    if (userSearchBtn) {
        userSearchBtn.addEventListener('click', function() {
            searchUsers();
        });
    }
    
    if (userSearchInput) {
        userSearchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                searchUsers();
            }
        });
    }

    // 系统设置保存按钮
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', function() {
            saveSystemSettings();
        });
    }

    // 清除缓存按钮
    const clearCacheBtn = document.getElementById('clearCacheBtn');
    if (clearCacheBtn) {
        clearCacheBtn.addEventListener('click', function() {
            clearSystemCache();
        });
    }

    // 用户管理功能
    const addUserBtn = document.getElementById('addUserBtn');
    if (addUserBtn) {
        addUserBtn.addEventListener('click', function() {
            // 创建添加用户的模态框
            const modal = document.createElement('div');
            modal.className = 'modal fade';
            modal.innerHTML = `
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">添加用户</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="addUserForm">
                                <div class="mb-3">
                                    <label class="form-label">用户名</label>
                                    <input type="text" class="form-control" name="username" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">密码</label>
                                    <input type="text" class="form-control" name="password" required>
                                </div>
                                <div class="mb-3">
                                    <div class="form-check">
                                        <input type="checkbox" class="form-check-input" name="isVip" id="isVip">
                                        <label class="form-check-label" for="isVip">VIP用户</label>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                            <button type="button" class="btn btn-primary" id="saveUserBtn">保存</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            const modalInstance = new bootstrap.Modal(modal);
            modalInstance.show();

            // 保存用户
            const saveUserBtn = document.getElementById('saveUserBtn');
            saveUserBtn.addEventListener('click', function() {
                const form = document.getElementById('addUserForm');
                const formData = new FormData(form);
                
                const users = JSON.parse(localStorage.getItem('users')) || [];
                
                // 检查用户名是否已存在
                if (users.some(u => u.username === formData.get('username'))) {
                    showAlert('用户名已存在!', 'danger');
                    return;
                }
                
                const userData = {
                    username: formData.get('username'),
                    password: formData.get('password'),
                    isVip: formData.get('isVip') === 'on',
                    isAdmin: false,
                    registerDate: new Date().toISOString()
                };
                
                // 保存到localStorage
                users.push(userData);
                localStorage.setItem('users', JSON.stringify(users));
                
                modalInstance.hide();
                showAlert('用户添加成功！', 'success');
                loadUserList(); // 刷新用户列表
            });

            // 模态框关闭后删除
            modal.addEventListener('hidden.bs.modal', function() {
                document.body.removeChild(modal);
            });
        });
    }

    // VIP管理功能
    const addVipBtn = document.getElementById('addVipBtn');
    if (addVipBtn) {
        addVipBtn.addEventListener('click', function() {
            // 创建添加VIP套餐的模态框
            const modal = document.createElement('div');
            modal.className = 'modal fade';
            modal.innerHTML = `
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">添加VIP套餐</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="addVipForm">
                                <div class="mb-3">
                                    <label class="form-label">套餐名称</label>
                                    <input type="text" class="form-control" name="name" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">价格</label>
                                    <input type="number" class="form-control" name="price" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">时长（天）</label>
                                    <input type="number" class="form-control" name="duration" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">特权描述</label>
                                    <textarea class="form-control" name="features" rows="3" required></textarea>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                            <button type="button" class="btn btn-primary" id="saveVipBtn">保存</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            const modalInstance = new bootstrap.Modal(modal);
            modalInstance.show();

            // 保存VIP套餐
            const saveVipBtn = document.getElementById('saveVipBtn');
            saveVipBtn.addEventListener('click', function() {
                const form = document.getElementById('addVipForm');
                const formData = new FormData(form);
                const vipData = {
                    name: formData.get('name'),
                    price: formData.get('price'),
                    duration: formData.get('duration'),
                    features: formData.get('features').split('\n')
                };
                
                // 这里应该调用后端API保存VIP套餐
                console.log('添加VIP套餐:', vipData);
                
                modalInstance.hide();
                showAlert('VIP套餐添加成功！', 'success');
            });

            // 模态框关闭后删除
            modal.addEventListener('hidden.bs.modal', function() {
                document.body.removeChild(modal);
            });
        });
    }

    // 退出登录
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        });
    }
});

// 初始化管理面板
function initAdminPanel() {
    // 加载系统设置
    loadSystemSettings();
    
    // 初始化统计数据
    initStatisticsData();
    
    // 加载用户列表
    loadUserList();
}

// 加载系统设置
function loadSystemSettings() {
    const savedSettings = localStorage.getItem('systemSettings');
    
    if (savedSettings) {
        try {
            const settings = JSON.parse(savedSettings);
            
            // 填充基本设置表单
            if (document.getElementById('basicSettingsForm')) {
                document.querySelector('input[name="siteName"]').value = settings.siteName || '文本加密工具';
                document.querySelector('textarea[name="siteDescription"]').value = settings.siteDescription || '';
                document.querySelector('input[name="contactEmail"]').value = settings.contactEmail || '';
            }
            
            // 填充加密设置表单
            if (document.getElementById('encryptionSettingsForm')) {
                const encryptionSelect = document.querySelector('select[name="defaultEncryption"]');
                if (encryptionSelect && settings.defaultEncryption) {
                    encryptionSelect.value = settings.defaultEncryption;
                }
                
                const aesKeyInput = document.querySelector('input[name="aesKey"]');
                if (aesKeyInput && settings.aesKey) {
                    aesKeyInput.value = settings.aesKey;
                }
                
                if (settings.allowCustomKey !== undefined) {
                    document.getElementById('allowCustomKey').checked = settings.allowCustomKey;
                }
                
                const maxLengthInput = document.querySelector('input[name="maxLength"]');
                if (maxLengthInput && settings.maxLength) {
                    maxLengthInput.value = settings.maxLength;
                }
            }
            
            // 填充主题设置表单
            if (document.getElementById('themeSettingsForm')) {
                const themeSelect = document.querySelector('select[name="defaultTheme"]');
                if (themeSelect && settings.defaultTheme) {
                    themeSelect.value = settings.defaultTheme;
                }
                
                if (settings.themeColor) {
                    const colorRadio = document.querySelector(`input[name="themeColor"][value="${settings.themeColor}"]`);
                    if (colorRadio) {
                        colorRadio.checked = true;
                    }
                }
                
                if (settings.allowUserTheme !== undefined) {
                    document.getElementById('allowUserTheme').checked = settings.allowUserTheme;
                }
            }
            
            console.log('系统设置已加载');
        } catch (error) {
            console.error('加载系统设置时出错:', error);
        }
    }
}

// 初始化统计数据
function initStatisticsData() {
    // 这里可以是一些预设的统计数据，或者从localStorage加载保存的数据
    // 在实际项目中，这里应该通过API请求获取统计数据
    
    // 更新仪表盘数据 (模拟数据)
    updateDashboardStats();
}

// 更新仪表盘统计数据
function updateDashboardStats() {
    // 获取用户数据以更新真实的用户总数
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const vipUsers = users.filter(user => user.isVip).length;
    const adminUsers = users.filter(user => user.isAdmin).length;
    const lockedUsers = users.filter(user => user.isLocked).length;
    
    // 更新仪表盘卡片的数据
    const dashboardTotalUsers = document.querySelector('#dashboard .col-md-3:nth-child(1) .card-title');
    const dashboardVipUsers = document.querySelector('#dashboard .col-md-3:nth-child(2) .card-title');
    
    if (dashboardTotalUsers) {
        dashboardTotalUsers.textContent = users.length.toLocaleString();
    }
    
    if (dashboardVipUsers) {
        dashboardVipUsers.textContent = vipUsers.toLocaleString();
    }
}

// 加载用户列表
function loadUserList() {
    const tableBody = document.querySelector('#users .table tbody');
    if (!tableBody) return;
    
    // 清空现有行
    tableBody.innerHTML = '';
    
    // 获取用户数据
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // 更新用户统计
    updateUserStats(users);
    
    if (users.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" class="text-center">暂无用户数据</td></tr>`;
        return;
    }
    
    // 填充用户数据
    users.forEach((user, index) => {
        const registerDate = user.registerDate ? new Date(user.registerDate).toLocaleDateString() : '未知';
        
        // 用户状态标识
        let status = '';
        if (user.isAdmin) {
            status += '<span class="badge bg-danger me-1">管理员</span>';
        }
        if (user.isVip) {
            status += '<span class="badge bg-warning me-1">VIP</span>';
        }
        if (user.isLocked) {
            status += '<span class="badge bg-secondary me-1">已锁定</span>';
        }
        if (!user.isAdmin && !user.isVip && !user.isLocked) {
            status += '<span class="badge bg-success">普通用户</span>';
        }
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${user.username}</td>
            <td>${user.password}</td>
            <td>${registerDate}</td>
            <td>${status}</td>
            <td>
                <button class="btn btn-sm btn-info me-1 edit-user" data-id="${index}"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-danger delete-user" data-id="${index}"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tableBody.appendChild(row);
    });
    
    // 添加编辑用户事件
    document.querySelectorAll('.edit-user').forEach(btn => {
        btn.addEventListener('click', function() {
            const userId = this.getAttribute('data-id');
            editUser(userId);
        });
    });
    
    // 添加删除用户事件
    document.querySelectorAll('.delete-user').forEach(btn => {
        btn.addEventListener('click', function() {
            const userId = this.getAttribute('data-id');
            deleteUser(userId);
        });
    });
}

// 更新用户统计
function updateUserStats(users) {
    const totalUsersElement = document.getElementById('totalUsers');
    const vipUsersElement = document.getElementById('vipUsers');
    const adminUsersElement = document.getElementById('adminUsers');
    const lockedUsersElement = document.getElementById('lockedUsers');
    
    if (totalUsersElement) {
        totalUsersElement.textContent = users.length;
    }
    
    if (vipUsersElement) {
        const vipCount = users.filter(user => user.isVip).length;
        vipUsersElement.textContent = vipCount;
    }
    
    if (adminUsersElement) {
        const adminCount = users.filter(user => user.isAdmin).length;
        adminUsersElement.textContent = adminCount;
    }
    
    if (lockedUsersElement) {
        const lockedCount = users.filter(user => user.isLocked).length;
        lockedUsersElement.textContent = lockedCount;
    }
}

// 编辑用户
function editUser(userId) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users[userId];
    
    if (!user) return;
    
    // 创建编辑用户的模态框
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">编辑用户</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="editUserForm">
                        <div class="mb-3">
                            <label class="form-label">用户名</label>
                            <input type="text" class="form-control" name="username" value="${user.username}" readonly>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">密码</label>
                            <input type="text" class="form-control" name="password" value="${user.password}">
                        </div>
                        <div class="mb-3">
                            <div class="form-check">
                                <input type="checkbox" class="form-check-input" name="isVip" id="editIsVip" ${user.isVip ? 'checked' : ''}>
                                <label class="form-check-label" for="editIsVip">VIP用户</label>
                            </div>
                        </div>
                        <div class="mb-3">
                            <div class="form-check">
                                <input type="checkbox" class="form-check-input" name="isAdmin" id="editIsAdmin" ${user.isAdmin ? 'checked' : ''}>
                                <label class="form-check-label" for="editIsAdmin">管理员权限</label>
                            </div>
                        </div>
                        <div class="mb-3">
                            <div class="form-check">
                                <input type="checkbox" class="form-check-input" name="isLocked" id="editIsLocked" ${user.isLocked ? 'checked' : ''}>
                                <label class="form-check-label" for="editIsLocked">锁定账户</label>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">注册日期</label>
                            <input type="text" class="form-control" name="registerDate" value="${user.registerDate ? new Date(user.registerDate).toLocaleDateString() : '未知'}" readonly>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                    <button type="button" class="btn btn-primary" id="updateUserBtn">保存</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();
    
    // 保存编辑
    const updateUserBtn = document.getElementById('updateUserBtn');
    updateUserBtn.addEventListener('click', function() {
        const form = document.getElementById('editUserForm');
        const formData = new FormData(form);
        
        // 更新用户数据
        users[userId].password = formData.get('password');
        users[userId].isVip = formData.get('isVip') === 'on';
        users[userId].isAdmin = formData.get('isAdmin') === 'on';
        users[userId].isLocked = formData.get('isLocked') === 'on';
        
        localStorage.setItem('users', JSON.stringify(users));
        
        modalInstance.hide();
        showAlert('用户更新成功！', 'success');
        loadUserList(); // 刷新用户列表
    });
    
    // 模态框关闭后删除
    modal.addEventListener('hidden.bs.modal', function() {
        document.body.removeChild(modal);
    });
}

// 删除用户
function deleteUser(userId) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    if (confirm('确定要删除此用户吗？')) {
        users.splice(userId, 1);
        localStorage.setItem('users', JSON.stringify(users));
        showAlert('用户已删除！', 'success');
        loadUserList(); // 刷新用户列表
    }
}

// 搜索用户
function searchUsers() {
    const searchInput = document.getElementById('userSearchInput');
    const searchTerm = searchInput.value.trim().toLowerCase();
    
    // 获取所有用户
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    if (searchTerm === '') {
        // 如果搜索词为空，显示所有用户
        loadUserList();
        return;
    }
    
    // 过滤符合条件的用户
    const filteredUsers = users.filter(user => 
        user.username.toLowerCase().includes(searchTerm)
    );
    
    // 显示过滤后的用户列表
    displayFilteredUsers(filteredUsers);
}

// 显示过滤后的用户列表
function displayFilteredUsers(filteredUsers) {
    const tableBody = document.querySelector('#users .table tbody');
    if (!tableBody) return;
    
    // 清空现有行
    tableBody.innerHTML = '';
    
    if (filteredUsers.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" class="text-center">未找到匹配的用户</td></tr>`;
        return;
    }
    
    // 填充过滤后的用户数据
    filteredUsers.forEach((user, index) => {
        const registerDate = user.registerDate ? new Date(user.registerDate).toLocaleDateString() : '未知';
        
        // 用户状态标识
        let status = '';
        if (user.isAdmin) {
            status += '<span class="badge bg-danger me-1">管理员</span>';
        }
        if (user.isVip) {
            status += '<span class="badge bg-warning me-1">VIP</span>';
        }
        if (user.isLocked) {
            status += '<span class="badge bg-secondary me-1">已锁定</span>';
        }
        if (!user.isAdmin && !user.isVip && !user.isLocked) {
            status += '<span class="badge bg-success">普通用户</span>';
        }
        
        // 查找用户在原始列表中的索引
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const originalIndex = users.findIndex(u => u.username === user.username);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${user.username}</td>
            <td>${user.password}</td>
            <td>${registerDate}</td>
            <td>${status}</td>
            <td>
                <button class="btn btn-sm btn-info me-1 edit-user" data-id="${originalIndex}"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-danger delete-user" data-id="${originalIndex}"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tableBody.appendChild(row);
    });
    
    // 添加编辑用户事件
    document.querySelectorAll('.edit-user').forEach(btn => {
        btn.addEventListener('click', function() {
            const userId = this.getAttribute('data-id');
            editUser(userId);
        });
    });
    
    // 添加删除用户事件
    document.querySelectorAll('.delete-user').forEach(btn => {
        btn.addEventListener('click', function() {
            const userId = this.getAttribute('data-id');
            deleteUser(userId);
        });
    });
}

// 全局显示提示信息
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

// 加载统计数据
function loadStatistics() {
    // 这里是模拟数据，实际项目中应该从服务器获取数据
    console.log('加载统计数据...');
    
    // 模拟异步加载
    setTimeout(() => {
        showAlert('统计数据已更新', 'success');
    }, 800);
    
    // 在实际项目中，这里应该有Ajax请求来获取真实数据
    // fetch('/api/stats')
    //    .then(response => response.json())
    //    .then(data => {
    //        updateStatisticsUI(data);
    //    })
    //    .catch(error => {
    //        showAlert('获取统计数据失败', 'danger');
    //    });
}

// 保存系统设置
function saveSystemSettings() {
    // 获取表单数据
    const basicForm = document.getElementById('basicSettingsForm');
    const encryptionForm = document.getElementById('encryptionSettingsForm');
    const themeForm = document.getElementById('themeSettingsForm');
    
    if (!basicForm || !encryptionForm || !themeForm) return;
    
    // 模拟保存配置
    console.log('保存系统设置...');
    
    // 收集表单数据
    const basicSettings = new FormData(basicForm);
    const encryptionSettings = new FormData(encryptionForm);
    const themeSettings = new FormData(themeForm);
    
    // 合并设置数据
    const settings = {
        siteName: basicSettings.get('siteName'),
        siteDescription: basicSettings.get('siteDescription'),
        contactEmail: basicSettings.get('contactEmail'),
        defaultEncryption: encryptionSettings.get('defaultEncryption'),
        aesKey: encryptionSettings.get('aesKey'),
        allowCustomKey: document.getElementById('allowCustomKey').checked,
        maxLength: encryptionSettings.get('maxLength'),
        defaultTheme: themeSettings.get('defaultTheme'),
        themeColor: document.querySelector('input[name="themeColor"]:checked').value,
        allowUserTheme: document.getElementById('allowUserTheme').checked
    };
    
    // 保存到localStorage (演示用途)
    localStorage.setItem('systemSettings', JSON.stringify(settings));
    
    // 显示成功消息
    showAlert('系统设置已保存', 'success');
    
    // 在实际项目中，这里应该有Ajax请求来保存设置到服务器
    // fetch('/api/settings', {
    //    method: 'POST',
    //    body: JSON.stringify(settings),
    //    headers: {
    //        'Content-Type': 'application/json'
    //    }
    // })
    // .then(response => response.json())
    // .then(data => {
    //     showAlert('系统设置已保存', 'success');
    // })
    // .catch(error => {
    //     showAlert('保存设置失败', 'danger');
    // });
}

// 清除系统缓存
function clearSystemCache() {
    // 确认对话框
    if (confirm('确定要清除系统缓存吗？这可能会暂时影响系统性能。')) {
        console.log('清除系统缓存...');
        
        // 模拟清除缓存
        setTimeout(() => {
            showAlert('系统缓存已清除', 'success');
        }, 1000);
        
        // 在实际项目中，这里应该有Ajax请求来清除服务器缓存
        // fetch('/api/clear-cache', {
        //    method: 'POST'
        // })
        // .then(response => response.json())
        // .then(data => {
        //     showAlert('系统缓存已清除', 'success');
        // })
        // .catch(error => {
        //     showAlert('清除缓存失败', 'danger');
        // });
    }
} 