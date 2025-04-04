// 模拟数据库存储
let activationCodes = [];
let orders = [];
// 管理员账户信息
const adminCredentials = {
    username: 'admin',
    password: 'admin123'
};

// 页面加载时初始化数据
document.addEventListener('DOMContentLoaded', function() {
    console.log("页面加载完成");
    
    // 确保登录按钮事件绑定
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
        console.log("找到登录按钮，添加事件监听器");
        loginBtn.addEventListener('click', function() {
            console.log("登录按钮被点击");
            handleLogin();
        });
        
        // 添加回车键登录
        const passwordInput = document.getElementById('password');
        if (passwordInput) {
            passwordInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    console.log("按下回车键登录");
                    handleLogin();
                }
            });
        }
    } else {
        console.error("未找到登录按钮");
    }
    
    // 处理页面上的所有导入按钮
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn') && 
            (e.target.textContent.includes('导入') || e.target.textContent.includes('导入激活码'))) {
            console.log("点击了导入按钮:", e.target);
            
            // 检查是否有已填写的文本域
            const nearbyTextarea = findNearbyTextarea(e.target);
            if (nearbyTextarea && nearbyTextarea.value.trim()) {
                console.log("找到附近已填写的文本域，准备导入");
                importCodesFromElement(nearbyTextarea);
                e.preventDefault();
                return;
            }
        }
        
        // 处理导入和生成按钮
        if (e.target.textContent === '导入' || e.target.textContent === '生成') {
            console.log("点击了导入/生成按钮:", e.target);
            const nearbyTextarea = findNearbyTextarea(e.target);
            if (nearbyTextarea) {
                console.log("找到附近的文本域，准备导入");
                importCodesFromElement(nearbyTextarea);
                e.preventDefault();
            }
        }
    });
    
    // 先检查登录状态，再设置事件监听器
    checkLoginStatus();
    
    // 只有在已登录状态下才初始化其他功能
    if (localStorage.getItem('adminLoggedIn') === 'true') {
        initializeData();
        setupEventListeners();
        renderActivationCodes();
        renderOrders();
        
        // 添加点击事件处理
        document.getElementById('generate-codes').addEventListener('click', function() {
            console.log("点击了生成激活码按钮");
            showGenerateCodesModal();
        });
        
        // 关闭按钮事件处理
        document.querySelector('.modal-close').addEventListener('click', function() {
            console.log("点击了关闭按钮");
            document.getElementById('modal-container').classList.add('modal-hidden');
        });
        
        // 取消按钮事件处理
        document.querySelector('.modal-actions .btn-secondary').addEventListener('click', function() {
            console.log("点击了取消按钮");
            document.getElementById('modal-container').classList.add('modal-hidden');
        });
        
        // 生成按钮事件处理
        document.querySelector('.modal-actions .btn-primary').addEventListener('click', function() {
            console.log("点击了生成按钮");
            
            const type = document.getElementById('code-type').value;
            const count = parseInt(document.getElementById('code-count').value, 10);
            
            console.log("类型:", type, "数量:", count);
            
            if (count < 1 || count > 100) {
                alert('请输入1-100之间的数量');
                return;
            }
            
            alert(`成功生成${count}个激活码`);
            document.getElementById('modal-container').classList.add('modal-hidden');
        });
    }
});

// 查找按钮附近的文本域
function findNearbyTextarea(button) {
    // 尝试查找按钮所在表单中的文本域
    let form = button.closest('form') || button.closest('div');
    if (form) {
        let textarea = form.querySelector('textarea');
        if (textarea) return textarea;
    }
    
    // 向上查找最近的容器，然后在其中寻找文本域
    let container = button;
    for (let i = 0; i < 5; i++) { // 最多向上查找5层
        container = container.parentElement;
        if (!container) break;
        
        let textarea = container.querySelector('textarea');
        if (textarea) return textarea;
    }
    
    return null;
}

// 从指定元素导入激活码
function importCodesFromElement(element) {
    if (!element || !element.value.trim()) {
        console.log("没有找到有效的输入内容");
        return;
    }
    
    console.log("从元素导入激活码:", element);
    const codesText = element.value.trim();
    importCodesFromText(codesText);
}

// 从文本导入激活码
function importCodesFromText(codesText) {
    if (!codesText) {
        alert('请输入要导入的激活码');
        return;
    }
    
    const codeLines = codesText.split('\n').filter(line => line.trim());
    
    if (codeLines.length === 0) {
        alert('请输入要导入的激活码');
        return;
    }
    
    let importedCount = 0;
    let invalidCount = 0;
    let invalidCodes = [];
    
    codeLines.forEach(line => {
        const parts = line.split(',');
        if (parts.length >= 2) {
            const code = parts[0].trim();
            const type = parts[1].trim();
            
            // 验证code格式
            const isValidCode = code && code.length >= 6;
            
            if (isValidCode && (type === 'month' || type === 'quarter' || type === 'year')) {
                activationCodes.push({
                    id: generateId(),
                    code: code,
                    type: type,
                    validity: getValidityPeriod(type),
                    status: 'unused',
                    createdAt: new Date().toISOString(),
                    usedAt: null,
                    deviceId: null
                });
                importedCount++;
                console.log("成功导入激活码:", code);
            } else {
                invalidCount++;
                invalidCodes.push(line);
                console.log("无效的激活码格式:", line);
            }
        } else {
            invalidCount++;
            invalidCodes.push(line);
            console.log("无效的激活码格式 (缺少类型):", line);
        }
    });
    
    // 保存并更新UI
    saveData('activationCodes', activationCodes);
    renderActivationCodes();
    
    // 关闭所有可能的模态窗口
    closeModal();
    closeAllDialogs();
    
    let message = `成功导入${importedCount}个激活码`;
    if (invalidCount > 0) {
        message += `，${invalidCount}个无效激活码未导入`;
        console.log("无效的卡密:", invalidCodes);
    }
    
    alert(message);
}

// 设置模态窗口的事件监听器
function setupModalEventListeners() {
    console.log("设置模态窗口事件监听器");
    
    // 关闭按钮事件处理
    const closeBtn = document.querySelector('.modal-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            console.log("点击了关闭按钮");
            closeModal();
        });
    }
    
    // 取消按钮事件处理
    const cancelBtn = document.getElementById('cancel-generate');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            console.log("点击了取消按钮");
            closeModal();
        });
    }
    
    // 生成按钮事件处理
    const confirmBtn = document.getElementById('confirm-generate');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', function() {
            console.log("点击了生成按钮");
            generateCodes();
        });
    }
}

// 使closeModal和generateCodes成为全局函数
window.closeModal = closeModal;
window.generateCodes = generateCodes;
window.importCodes = importCodes;

// 检查登录状态
function checkLoginStatus() {
    // 确保模态窗口隐藏
    const modalContainer = document.getElementById('modal-container');
    if (modalContainer) {
        modalContainer.classList.add('modal-hidden');
        modalContainer.style.display = 'none';
    }
    
    console.log("检查登录状态");
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    console.log("登录状态:", isLoggedIn);
    
    if (isLoggedIn === 'true') {
        showAdminPanel();
    } else {
        showLoginForm();
    }
}

// 显示登录表单
function showLoginForm() {
    console.log("显示登录表单");
    document.getElementById('login-container').style.display = 'flex';
    document.getElementById('admin-panel').style.display = 'none';
}

// 显示管理面板
function showAdminPanel() {
    console.log("显示管理面板");
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('admin-panel').style.display = 'block';
}

// 初始化模拟数据
function initializeData() {
    // 从localStorage加载数据，如果存在的话
    const storedCodes = localStorage.getItem('activationCodes');
    const storedOrders = localStorage.getItem('orders');
    
    if (storedCodes) {
        activationCodes = JSON.parse(storedCodes);
    } else {
        // 生成一些示例激活码
        generateSampleCodes();
    }
    
    if (storedOrders) {
        orders = JSON.parse(storedOrders);
    } else {
        // 生成一些示例订单
        generateSampleOrders();
    }
}

// 生成示例激活码
function generateSampleCodes() {
    const types = ['month', 'quarter', 'year'];
    const statuses = ['unused', 'used', 'pending'];
    
    for (let i = 0; i < 15; i++) {
        const type = types[Math.floor(Math.random() * types.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        
        activationCodes.push({
            id: generateId(),
            code: generateActivationCode(),
            type: type,
            validity: getValidityPeriod(type),
            status: status,
            createdAt: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString(),
            usedAt: status === 'used' ? new Date().toISOString() : null,
            deviceId: status === 'used' ? generateDeviceId() : null
        });
    }
    
    saveData('activationCodes', activationCodes);
}

// 生成示例订单
function generateSampleOrders() {
    const products = ['月度会员', '季度会员', '年度会员'];
    const prices = [50, 100, 288];
    const statuses = ['pending', 'completed', 'cancelled'];
    
    for (let i = 0; i < 10; i++) {
        const productIndex = Math.floor(Math.random() * products.length);
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        
        orders.push({
            id: generateOrderId(),
            user: {
                email: `user${i+1}@example.com`,
                qq: Math.floor(Math.random() * 1000000000).toString()
            },
            product: products[productIndex],
            price: prices[productIndex],
            status: status,
            createdAt: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString(),
            activationCode: status === 'completed' ? generateActivationCode() : null
        });
    }
    
    saveData('orders', orders);
}

// 设置事件监听器
function setupEventListeners() {
    // 退出登录按钮
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
    
    // 导航切换
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('data-target');
            
            // 移除其他链接的active类
            document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
            // 添加当前链接的active类
            this.classList.add('active');
            
            // 隐藏所有部分
            document.querySelectorAll('.admin-section').forEach(section => {
                section.classList.remove('active');
            });
            
            // 显示目标部分
            document.getElementById(targetId).classList.add('active');
        });
    });
    
    // 导入激活码按钮
    const importBtn = document.getElementById('import-codes');
    if (importBtn) {
        importBtn.addEventListener('click', function() {
            console.log("点击了导入激活码按钮");
            showImportCodesModal();
        });
    }
    
    // 过滤激活码列表
    document.getElementById('code-status-filter').addEventListener('change', renderActivationCodes);
    document.getElementById('code-type-filter').addEventListener('change', renderActivationCodes);
    
    // 过滤订单列表
    document.getElementById('order-status-filter').addEventListener('change', renderOrders);
    document.getElementById('order-date-filter').addEventListener('change', renderOrders);
    
    // 搜索功能
    document.querySelector('#activation-codes .search-btn').addEventListener('click', function() {
        renderActivationCodes();
    });
    
    document.querySelector('#orders .search-btn').addEventListener('click', function() {
        renderOrders();
    });
}

// 处理登录
function handleLogin() {
    console.log("尝试登录...");
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorElement = document.getElementById('login-error');
    
    console.log("输入的用户名:", username);
    console.log("输入的密码:", password);
    console.log("期望的用户名:", adminCredentials.username);
    console.log("期望的密码:", adminCredentials.password);
    
    if (username === adminCredentials.username && password === adminCredentials.password) {
        console.log("登录成功");
        localStorage.setItem('adminLoggedIn', 'true');
        showAdminPanel();
        errorElement.textContent = '';
        
        // 登录成功后初始化管理面板
        initializeData();
        setupEventListeners();
        renderActivationCodes();
        renderOrders();
    } else {
        console.log("登录失败");
        errorElement.textContent = '用户名或密码错误';
    }
}

// 处理退出登录
function handleLogout(e) {
    e.preventDefault();
    localStorage.removeItem('adminLoggedIn');
    showLoginForm();
}

// 显示生成激活码模态窗口
function showGenerateCodesModal() {
    // 确保只有在登录后才能显示
    if (localStorage.getItem('adminLoggedIn') !== 'true') {
        return;
    }
    
    console.log("显示激活码选择窗口");
    const modalContainer = document.getElementById('modal-container');
    const modalTitle = document.getElementById('modal-title');
    const modalContent = document.getElementById('modal-content');
    
    modalTitle.textContent = '选择已有激活码';
    
    // 过滤出未使用的激活码
    const availableCodes = activationCodes.filter(code => code.status === 'unused');
    
    let codesHTML = '';
    
    if (availableCodes.length === 0) {
        codesHTML = '<p class="no-codes">激活码已用完，请通过导入功能添加激活码</p>';
    } else {
        codesHTML = `
            <div class="codes-filter">
                <select id="code-select-type">
                    <option value="all">所有类型</option>
                    <option value="month">月度会员</option>
                    <option value="quarter">季度会员</option>
                    <option value="year">年度会员</option>
                </select>
            </div>
            <div class="codes-list">
                <table class="codes-table">
                    <thead>
                        <tr>
                            <th>激活码</th>
                            <th>类型</th>
                            <th>有效期</th>
                            <th>创建时间</th>
                            <th>选择</th>
                        </tr>
                    </thead>
                    <tbody id="available-codes-list">
                        ${availableCodes.map(code => `
                            <tr data-type="${code.type}">
                                <td>${code.code}</td>
                                <td>${getTypeLabel(code.type)}</td>
                                <td>${code.validity}天</td>
                                <td>${formatDate(code.createdAt)}</td>
                                <td><button class="btn-select-code" data-id="${code.id}">选择</button></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
    
    modalContent.innerHTML = `
        <div class="select-codes-form">
            ${codesHTML}
            <div class="modal-actions">
                <button class="btn btn-secondary" id="cancel-select">关闭</button>
                ${availableCodes.length === 0 ? `<button class="btn btn-primary" id="import-codes-btn">导入激活码</button>` : ''}
            </div>
        </div>
    `;
    
    // 显示模态窗口
    if (modalContainer) {
        modalContainer.classList.remove('modal-hidden');
        modalContainer.style.display = 'flex';
        
        // 关闭按钮
        document.querySelector('.modal-close').addEventListener('click', closeModal);
        document.getElementById('cancel-select').addEventListener('click', closeModal);
        
        // 导入激活码按钮（如果没有可用激活码）
        if (availableCodes.length === 0) {
            document.getElementById('import-codes-btn').addEventListener('click', function() {
                closeModal();
                showImportCodesModal();
            });
        } else {
            // 类型筛选功能
            document.getElementById('code-select-type').addEventListener('change', function() {
                const selectedType = this.value;
                const codeRows = document.querySelectorAll('#available-codes-list tr');
                
                codeRows.forEach(row => {
                    if (selectedType === 'all' || row.getAttribute('data-type') === selectedType) {
                        row.style.display = '';
                    } else {
                        row.style.display = 'none';
                    }
                });
            });
            
            // 选择激活码按钮事件
            document.querySelectorAll('.btn-select-code').forEach(btn => {
                btn.addEventListener('click', function() {
                    const codeId = this.getAttribute('data-id');
                    const selectedCode = activationCodes.find(c => c.id === codeId);
                    
                    if (selectedCode) {
                        alert(`已选择激活码: ${selectedCode.code}`);
                        // 这里可以添加后续处理逻辑
                        closeModal();
                    }
                });
            });
        }
    }
}

// 显示创建激活码的模态窗口
function showCreateCodesModal() {
    console.log("显示创建激活码窗口");
    const modalContainer = document.getElementById('modal-container');
    const modalTitle = document.getElementById('modal-title');
    const modalContent = document.getElementById('modal-content');
    
    modalTitle.textContent = '生成激活码';
    
    modalContent.innerHTML = `
        <div class="generate-form">
            <div class="form-row">
                <div class="form-field">
                    <label for="code-type">会员类型</label>
                    <select id="code-type">
                        <option value="month">月度会员</option>
                        <option value="quarter">季度会员</option>
                        <option value="year">年度会员</option>
                    </select>
                </div>
                <div class="form-field">
                    <label for="code-count">生成数量</label>
                    <input type="number" id="code-count" min="1" max="100" value="10">
                </div>
            </div>
            <div class="modal-actions">
                <button class="btn btn-secondary" id="cancel-generate">取消</button>
                <button class="btn btn-primary" id="confirm-generate">生成</button>
            </div>
        </div>
    `;
    
    // 显示模态窗口
    if (modalContainer) {
        modalContainer.classList.remove('modal-hidden');
        modalContainer.style.display = 'flex';
        
        // 设置事件处理器
        document.querySelector('.modal-close').addEventListener('click', closeModal);
        document.getElementById('cancel-generate').addEventListener('click', closeModal);
        document.getElementById('confirm-generate').addEventListener('click', generateCodes);
    }
}

// 显示导入激活码模态窗口
function showImportCodesModal() {
    console.log("显示导入激活码模态窗口");
    const modalContainer = document.getElementById('modal-container');
    const modalTitle = document.getElementById('modal-title');
    const modalContent = document.getElementById('modal-content');
    
    modalTitle.textContent = '导入激活码';
    
    modalContent.innerHTML = `
        <div class="import-form">
            <div class="import-instructions">
                <h4>导入说明</h4>
                <p>每行输入一个激活码，格式为：<code>激活码,类型</code>（以英文逗号分隔）</p>
                <p>类型可选：month（月度会员）、quarter（季度会员）、year（年度会员）</p>
                <p>示例：</p>
                <pre>ABCD-1234-EFGH-5678,month
WXYZ-9876-IJKL-5432,quarter
MNOP-6543-QRST-2109,year</pre>
            </div>
            <div class="form-field">
                <label for="import-codes">输入激活码</label>
                <textarea id="import-codes" rows="10" placeholder="格式：激活码,类型(month/quarter/year)"></textarea>
            </div>
            <div class="modal-actions">
                <button class="btn btn-secondary" onclick="closeModal()">取消</button>
                <button class="btn btn-primary" onclick="importCodes()">导入</button>
            </div>
        </div>
    `;
    
    // 显示模态窗口
    modalContainer.classList.remove('modal-hidden');
    modalContainer.style.display = 'flex';
}

// 关闭模态窗口
function closeModal() {
    console.log("关闭模态窗口");
    const modalContainer = document.getElementById('modal-container');
    if (modalContainer) {
        modalContainer.classList.add('modal-hidden');
        modalContainer.style.display = 'none';
    }
}

// 生成激活码
function generateCodes() {
    console.log("正在生成激活码...");
    const type = document.getElementById('code-type').value;
    const count = parseInt(document.getElementById('code-count').value, 10);
    
    if (count < 1 || count > 100) {
        alert('请输入1-100之间的数量');
        return;
    }
    
    for (let i = 0; i < count; i++) {
        const newCode = {
            id: generateId(),
            code: generateActivationCode(),
            type: type,
            validity: getValidityPeriod(type),
            status: 'unused',
            createdAt: new Date().toISOString(),
            usedAt: null,
            deviceId: null
        };
        console.log("生成激活码:", newCode.code);
        activationCodes.push(newCode);
    }
    
    // 保存并更新UI
    saveData('activationCodes', activationCodes);
    renderActivationCodes();
    closeModal();
    
    alert(`成功生成${count}个激活码`);
}

// 渲染激活码列表
function renderActivationCodes() {
    const tableBody = document.getElementById('codes-table-body');
    if (!tableBody) {
        console.error("未找到codes-table-body元素");
        return;
    }
    
    const statusFilter = document.getElementById('code-status-filter').value;
    const typeFilter = document.getElementById('code-type-filter').value;
    const searchQuery = (document.getElementById('code-search')?.value || '').toLowerCase();
    
    // 过滤数据
    let filteredCodes = activationCodes.filter(code => {
        const matchesStatus = statusFilter === 'all' || code.status === statusFilter;
        const matchesType = typeFilter === 'all' || code.type === typeFilter;
        const matchesSearch = !searchQuery || code.code.toLowerCase().includes(searchQuery);
        
        return matchesStatus && matchesType && matchesSearch;
    });
    
    // 按创建时间排序（最新的在前）
    filteredCodes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // 清空表格
    tableBody.innerHTML = '';
    
    // 填充表格
    if (filteredCodes.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" class="text-center">没有找到符合条件的激活码</td></tr>`;
    } else {
        filteredCodes.forEach(code => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${code.code}</td>
                <td>${getTypeLabel(code.type)}</td>
                <td>${code.validity}天</td>
                <td><span class="status-badge ${code.status}">${getStatusLabel(code.status)}</span></td>
                <td>${formatDate(code.createdAt)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn view" data-id="${code.id}">查看</button>
                        <button class="action-btn edit" data-id="${code.id}">编辑</button>
                        <button class="action-btn delete" data-id="${code.id}">删除</button>
                    </div>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
        
        // 添加按钮事件监听器
        const actionButtons = document.querySelectorAll('#codes-table-body .action-btn');
        console.log(`找到 ${actionButtons.length} 个操作按钮`);
        
        actionButtons.forEach(button => {
            // 移除旧事件监听器以避免重复
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            // 添加新事件监听器
            newButton.addEventListener('click', function(e) {
                const id = this.getAttribute('data-id');
                console.log(`点击了 ${this.textContent} 按钮, ID: ${id}`);
                handleCodeAction(e);
            });
        });
    }
}

// 渲染订单列表
function renderOrders() {
    const tableBody = document.getElementById('orders-table-body');
    const statusFilter = document.getElementById('order-status-filter').value;
    const dateFilter = document.getElementById('order-date-filter').value;
    const searchQuery = document.getElementById('order-search').value.toLowerCase();
    
    // 过滤数据
    let filteredOrders = orders.filter(order => {
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        const matchesDate = dateFilter === 'all' || isWithinDateRange(order.createdAt, dateFilter);
        const matchesSearch = !searchQuery || 
                             order.id.toLowerCase().includes(searchQuery) || 
                             (order.user && order.user.email && order.user.email.toLowerCase().includes(searchQuery));
        
        return matchesStatus && matchesDate && matchesSearch;
    });
    
    // 按创建时间排序（最新的在前）
    filteredOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // 清空表格
    tableBody.innerHTML = '';
    
    // 填充表格
    if (filteredOrders.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" class="text-center">没有找到符合条件的订单</td></tr>`;
    } else {
        filteredOrders.forEach(order => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${order.id}</td>
                <td>
                    <div>${order.user && order.user.email ? order.user.email : '无邮箱'}</div>
                    ${order.user && order.user.qq ? `<div>QQ: ${order.user.qq}</div>` : ''}
                </td>
                <td>${order.product}</td>
                <td>¥${order.price.toFixed(2)}</td>
                <td><span class="status-badge ${order.status}">${getOrderStatusLabel(order.status)}</span></td>
                <td>${formatDate(order.createdAt)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn view" data-id="${order.id}">查看</button>
                        ${order.status === 'pending' ? `
                            <button class="action-btn edit complete-order" data-id="${order.id}">完成</button>
                            <button class="action-btn delete cancel-order" data-id="${order.id}">取消</button>
                        ` : ''}
                    </div>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
        
        // 添加按钮事件监听器
        document.querySelectorAll('#orders-table-body .action-btn').forEach(button => {
            button.addEventListener('click', handleOrderAction);
        });
    }
}

// 处理激活码操作
function handleCodeAction(e) {
    e.preventDefault();
    
    // 获取事件目标
    const button = e.target.closest('.action-btn');
    if (!button) {
        console.error("找不到操作按钮元素");
        return;
    }
    
    // 确定操作类型
    const action = button.classList.contains('view') ? 'view' : 
                  button.classList.contains('edit') ? 'edit' : 'delete';
    
    // 获取激活码ID
    const id = button.getAttribute('data-id');
    if (!id) {
        console.error("按钮没有data-id属性");
        return;
    }
    
    console.log(`执行 ${action} 操作，ID: ${id}`);
    
    // 查找激活码
    const code = activationCodes.find(c => c.id === id);
    if (!code) {
        console.error(`找不到ID为 ${id} 的激活码`);
        alert('操作失败：找不到指定的激活码');
        return;
    }
    
    // 执行对应操作
    if (action === 'view') {
        showCodeDetails(code);
    } else if (action === 'edit') {
        showEditCodeModal(code);
    } else if (action === 'delete') {
        if (confirm(`确定要删除激活码 ${code.code} 吗？`)) {
            deleteCode(id);
        }
    }
}

// 处理订单操作
function handleOrderAction(e) {
    const action = e.target.classList.contains('view') ? 'view' : 
                  e.target.classList.contains('complete-order') ? 'complete' : 'cancel';
    const id = e.target.getAttribute('data-id');
    const order = orders.find(o => o.id === id);
    
    if (!order) return;
    
    if (action === 'view') {
        showOrderDetails(order);
    } else if (action === 'complete') {
        completeOrder(id);
    } else if (action === 'cancel') {
        if (confirm('确定要取消此订单吗？')) {
            cancelOrder(id);
        }
    }
}

// 显示激活码详情
function showCodeDetails(code) {
    console.log("显示激活码详情:", code.code);
    
    const modalContainer = document.getElementById('modal-container');
    const modalTitle = document.getElementById('modal-title');
    const modalContent = document.getElementById('modal-content');
    
    if (!modalContainer || !modalTitle || !modalContent) {
        console.error("找不到模态窗口元素");
        return;
    }
    
    modalTitle.textContent = '激活码详情';
    
    modalContent.innerHTML = `
        <div class="code-details">
            <div class="detail-row">
                <span class="detail-label">激活码:</span>
                <span class="detail-value">${code.code}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">类型:</span>
                <span class="detail-value">${getTypeLabel(code.type)}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">有效期:</span>
                <span class="detail-value">${code.validity}天</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">状态:</span>
                <span class="detail-value status-badge ${code.status}">${getStatusLabel(code.status)}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">创建时间:</span>
                <span class="detail-value">${formatDate(code.createdAt)}</span>
            </div>
            ${code.usedAt ? `
                <div class="detail-row">
                    <span class="detail-label">使用时间:</span>
                    <span class="detail-value">${formatDate(code.usedAt)}</span>
                </div>
            ` : ''}
            ${code.deviceId ? `
                <div class="detail-row">
                    <span class="detail-label">设备ID:</span>
                    <span class="detail-value">${code.deviceId}</span>
                </div>
            ` : ''}
            <div class="modal-actions">
                <button class="btn btn-primary" id="close-details">关闭</button>
            </div>
        </div>
    `;
    
    // 显示模态窗口
    modalContainer.classList.remove('modal-hidden');
    modalContainer.style.display = 'flex';
    
    // 添加事件监听器
    const closeBtn = document.getElementById('close-details');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
}

// 显示编辑激活码模态窗口
function showEditCodeModal(code) {
    console.log("编辑激活码:", code.code);
    
    const modalContainer = document.getElementById('modal-container');
    const modalTitle = document.getElementById('modal-title');
    const modalContent = document.getElementById('modal-content');
    
    if (!modalContainer || !modalTitle || !modalContent) {
        console.error("找不到模态窗口元素");
        return;
    }
    
    modalTitle.textContent = '编辑激活码';
    
    modalContent.innerHTML = `
        <div class="edit-form">
            <div class="form-field">
                <label for="edit-code">激活码</label>
                <input type="text" id="edit-code" value="${code.code}">
            </div>
            <div class="form-row">
                <div class="form-field">
                    <label for="edit-type">会员类型</label>
                    <select id="edit-type">
                        <option value="month" ${code.type === 'month' ? 'selected' : ''}>月度会员</option>
                        <option value="quarter" ${code.type === 'quarter' ? 'selected' : ''}>季度会员</option>
                        <option value="year" ${code.type === 'year' ? 'selected' : ''}>年度会员</option>
                    </select>
                </div>
                <div class="form-field">
                    <label for="edit-status">状态</label>
                    <select id="edit-status">
                        <option value="unused" ${code.status === 'unused' ? 'selected' : ''}>未使用</option>
                        <option value="used" ${code.status === 'used' ? 'selected' : ''}>已使用</option>
                        <option value="pending" ${code.status === 'pending' ? 'selected' : ''}>待发货</option>
                    </select>
                </div>
            </div>
            <div class="form-field">
                <label for="edit-device-id">设备ID</label>
                <input type="text" id="edit-device-id" value="${code.deviceId || ''}">
            </div>
            <input type="hidden" id="edit-code-id" value="${code.id}">
            <div class="modal-actions">
                <button class="btn btn-secondary" id="cancel-edit">取消</button>
                <button class="btn btn-primary" id="save-edit">保存</button>
            </div>
        </div>
    `;
    
    // 显示模态窗口
    modalContainer.classList.remove('modal-hidden');
    modalContainer.style.display = 'flex';
    
    // 添加事件监听器
    const cancelBtn = document.getElementById('cancel-edit');
    const saveBtn = document.getElementById('save-edit');
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeModal);
    }
    
    if (saveBtn) {
        saveBtn.addEventListener('click', saveCodeEdit);
    }
}

// 保存激活码编辑
function saveCodeEdit() {
    console.log("保存激活码编辑");
    
    const idField = document.getElementById('edit-code-id');
    if (!idField) {
        console.error("找不到edit-code-id元素");
        alert('保存失败：无法获取激活码ID');
        return;
    }
    
    const id = idField.value;
    const codeField = document.getElementById('edit-code');
    const typeField = document.getElementById('edit-type');
    const statusField = document.getElementById('edit-status');
    const deviceIdField = document.getElementById('edit-device-id');
    
    if (!codeField || !typeField || !statusField) {
        console.error("找不到编辑表单元素");
        alert('保存失败：无法获取表单数据');
        return;
    }
    
    const code = codeField.value.trim();
    const type = typeField.value;
    const status = statusField.value;
    const deviceId = deviceIdField ? deviceIdField.value.trim() : '';
    
    if (!code) {
        alert('激活码不能为空');
        return;
    }
    
    console.log("保存激活码编辑:", {
        id,
        code,
        type,
        status,
        deviceId
    });
    
    // 更新激活码
    const index = activationCodes.findIndex(c => c.id === id);
    if (index !== -1) {
        const oldStatus = activationCodes[index].status;
        const oldCode = activationCodes[index].code;
        
        activationCodes[index].code = code;
        activationCodes[index].type = type;
        activationCodes[index].validity = getValidityPeriod(type);
        activationCodes[index].status = status;
        activationCodes[index].deviceId = deviceId || null;
        
        // 如果状态从非使用变为使用，设置使用时间
        if (oldStatus !== 'used' && status === 'used') {
            activationCodes[index].usedAt = new Date().toISOString();
        } else if (status !== 'used') {
            activationCodes[index].usedAt = null;
        }
        
        // 保存并更新UI
        saveData('activationCodes', activationCodes);
        renderActivationCodes();
        closeModal();
        
        alert(`激活码已从 ${oldCode} 更新为 ${code}`);
    } else {
        console.error(`找不到ID为 ${id} 的激活码`);
        alert('保存失败：找不到指定的激活码');
    }
}

// 删除激活码
function deleteCode(id) {
    const index = activationCodes.findIndex(c => c.id === id);
    if (index !== -1) {
        const codeToDelete = activationCodes[index];
        console.log("删除激活码:", codeToDelete.code);
        
        // 删除激活码
        activationCodes.splice(index, 1);
        
        // 保存并更新UI
        saveData('activationCodes', activationCodes);
        renderActivationCodes();
        
        alert(`激活码 ${codeToDelete.code} 已成功删除`);
    } else {
        console.error("未找到要删除的激活码:", id);
        alert('删除失败：未找到指定的激活码');
    }
}

// 显示订单详情
function showOrderDetails(order) {
    const modalContainer = document.getElementById('modal-container');
    const modalTitle = document.getElementById('modal-title');
    const modalContent = document.getElementById('modal-content');
    
    modalTitle.textContent = '订单详情';
    
    modalContent.innerHTML = `
        <div class="order-details">
            <div class="detail-row">
                <span class="detail-label">订单号:</span>
                <span class="detail-value">${order.id}</span>
            </div>
            ${order.user && order.user.email ? `
            <div class="detail-row">
                <span class="detail-label">用户邮箱:</span>
                <span class="detail-value">${order.user.email}</span>
            </div>
            ` : ''}
            ${order.user && order.user.qq ? `
                <div class="detail-row">
                    <span class="detail-label">QQ号码:</span>
                    <span class="detail-value">${order.user.qq}</span>
                </div>
            ` : ''}
            <div class="detail-row">
                <span class="detail-label">产品:</span>
                <span class="detail-value">${order.product}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">金额:</span>
                <span class="detail-value">¥${order.price.toFixed(2)}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">状态:</span>
                <span class="detail-value status-badge ${order.status}">${getOrderStatusLabel(order.status)}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">下单时间:</span>
                <span class="detail-value">${formatDate(order.createdAt)}</span>
            </div>
            ${order.activationCode ? `
                <div class="detail-row">
                    <span class="detail-label">激活码:</span>
                    <span class="detail-value">${order.activationCode}</span>
                </div>
            ` : ''}
            <div class="modal-actions">
                <button class="btn btn-primary" id="close-details">关闭</button>
            </div>
        </div>
    `;
    
    // 显示模态窗口
    modalContainer.classList.remove('modal-hidden');
    
    // 添加事件监听器
    document.getElementById('close-details').addEventListener('click', closeModal);
}

// 完成订单
function completeOrder(id) {
    const orderIndex = orders.findIndex(o => o.id === id);
    if (orderIndex === -1) return;
    
    // 查找未使用的激活码
    const orderType = getOrderType(orders[orderIndex].product);
    const availableCodeIndex = activationCodes.findIndex(c => c.status === 'unused' && c.type === orderType);
    
    if (availableCodeIndex === -1) {
        alert(`没有可用的${getTypeLabel(orderType)}激活码，请先生成激活码`);
        return;
    }
    
    // 更新订单
    orders[orderIndex].status = 'completed';
    orders[orderIndex].activationCode = activationCodes[availableCodeIndex].code;
    
    // 更新激活码
    activationCodes[availableCodeIndex].status = 'used';
    activationCodes[availableCodeIndex].usedAt = new Date().toISOString();
    
    // 保存并更新UI
    saveData('activationCodes', activationCodes);
    saveData('orders', orders);
    renderOrders();
    
    alert('订单已完成，激活码已分配');
}

// 取消订单
function cancelOrder(id) {
    const index = orders.findIndex(o => o.id === id);
    if (index !== -1) {
        orders[index].status = 'cancelled';
        
        // 保存并更新UI
        saveData('orders', orders);
        renderOrders();
        
        alert('订单已取消');
    }
}

// 判断日期是否在指定范围内
function isWithinDateRange(dateString, range) {
    const date = new Date(dateString);
    const now = new Date();
    
    if (range === 'today') {
        return date.toDateString() === now.toDateString();
    } else if (range === 'week') {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);
        return date >= weekStart;
    } else if (range === 'month') {
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }
    
    return true;
}

// 辅助函数
function generateId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function generateOrderId() {
    const now = new Date();
    const dateStr = now.getFullYear().toString().substring(2) +
                   padZero(now.getMonth() + 1) +
                   padZero(now.getDate());
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return dateStr + randomNum;
}

function padZero(num) {
    return num.toString().padStart(2, '0');
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

function generateDeviceId() {
    const chars = '0123456789ABCDEF';
    let result = '';
    
    for (let i = 0; i < 32; i++) {
        if (i === 8 || i === 12 || i === 16 || i === 20) {
            result += '-';
        }
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
}

function getValidityPeriod(type) {
    switch (type) {
        case 'month': return 30;
        case 'quarter': return 90;
        case 'year': return 365;
        default: return 30;
    }
}

function getTypeLabel(type) {
    switch (type) {
        case 'month': return '月度会员';
        case 'quarter': return '季度会员';
        case 'year': return '年度会员';
        default: return '未知类型';
    }
}

function getStatusLabel(status) {
    switch (status) {
        case 'unused': return '未使用';
        case 'used': return '已使用';
        case 'pending': return '待发货';
        default: return '未知状态';
    }
}

function getOrderStatusLabel(status) {
    switch (status) {
        case 'pending': return '待处理';
        case 'completed': return '已完成';
        case 'cancelled': return '已取消';
        default: return '未知状态';
    }
}

function getOrderType(product) {
    if (product.includes('月度')) return 'month';
    if (product.includes('季度')) return 'quarter';
    if (product.includes('年度')) return 'year';
    return 'month';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${padZero(date.getMonth() + 1)}-${padZero(date.getDate())} ${padZero(date.getHours())}:${padZero(date.getMinutes())}`;
}

function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// 导入激活码
function importCodes() {
    // 尝试从多个可能的输入源获取激活码
    let codesText = '';
    
    // 检查模态窗口中的输入
    const modalInput = document.getElementById('import-codes');
    if (modalInput && modalInput.value.trim()) {
        codesText = modalInput.value;
    }
    
    // 如果模态窗口没有输入，检查页面上其他可能的输入框
    if (!codesText) {
        const allTextareas = document.querySelectorAll('textarea');
        for (let textarea of allTextareas) {
            if (textarea.value.trim()) {
                codesText = textarea.value;
                break;
            }
        }
    }
    
    importCodesFromText(codesText);
}

// 关闭所有对话框
function closeAllDialogs() {
    // 尝试关闭页面上所有可能的对话框
    const dialogs = document.querySelectorAll('.modal, dialog, [role="dialog"]');
    dialogs.forEach(dialog => {
        if (dialog.style) {
            dialog.style.display = 'none';
        }
        if (dialog.close && typeof dialog.close === 'function') {
            try {
                dialog.close();
            } catch (e) {
                console.log("关闭对话框失败:", e);
            }
        }
    });
} 