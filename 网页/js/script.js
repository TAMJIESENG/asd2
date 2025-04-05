// 等待DOM内容加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 获取激活表单
    const activateForm = document.getElementById('activateForm');
    // 获取状态显示区域
    const activationStatus = document.getElementById('activationStatus');
    
    // 如果找到了激活表单，添加提交事件监听器
    if (activateForm) {
        activateForm.addEventListener('submit', function(e) {
            // 阻止表单默认提交行为
            e.preventDefault();
            
            // 获取表单数据
            const deviceId = document.getElementById('deviceId').value.trim();
            const activationCode = document.getElementById('activationCode').value.trim();
            const email = document.getElementById('email').value.trim();
            
            // 验证设备ID（必填）
            if (!deviceId) {
                showStatus('请输入设备ID', 'error');
                return;
            }
            
            // 验证激活码（必填且格式检查）
            if (!activationCode) {
                showStatus('请输入激活码', 'error');
                return;
            }
            
            // 简单的激活码格式验证（可根据实际需求调整）
            // if (!isValidActivationCode(activationCode)) {
            //     showStatus('激活码格式不正确，请检查后重试', 'error');
            //     return;
            // }
            
            // 模拟激活验证过程
            simulateActivation(deviceId, activationCode, email);
        });
    }
    
    // 显示激活状态
    function showStatus(message, type = 'info') {
        if (activationStatus) {
            // 清除之前的类
            activationStatus.className = 'activation-status';
            // 添加类型类
            activationStatus.classList.add(type);
            // 设置消息
            activationStatus.innerHTML = message;
            // 确保状态区域可见
            activationStatus.style.display = 'flex';
            
            // 如果是成功消息，5秒后自动隐藏
            if (type === 'success') {
                setTimeout(() => {
                    // 渐隐效果
                    activationStatus.style.opacity = '0';
                    setTimeout(() => {
                        activationStatus.style.display = 'none';
                        activationStatus.style.opacity = '1';
                    }, 1000);
                }, 5000);
            }
        }
    }
    
    // 模拟激活过程
    function simulateActivation(deviceId, activationCode, email) {
        // 显示正在处理的状态
        showStatus('<div class="loading-spinner"></div> 正在验证激活码，请稍候...', 'processing');
        
        // 模拟网络请求延迟
        setTimeout(() => {
            // 这里实际项目中应该是向服务器发送请求验证激活码
            // 为了演示，我们使用随机结果
            const randomResult = Math.random();
            
            if (randomResult > 0.3) { // 70% 概率激活成功
                const expiryDate = new Date();
                expiryDate.setDate(expiryDate.getDate() + 90); // 假设90天有效期
                
                const successMessage = `
                    <div class="success-icon">✓</div>
                    <div class="success-message">
                        <h4>激活成功！</h4>
                        <p>您的奕天Cursor助手已成功激活</p>
                        <p>会员有效期至：${expiryDate.toLocaleDateString()}</p>
                        ${email ? `<p>激活凭证已发送至您的邮箱：${email}</p>` : ''}
                    </div>
                `;
                showStatus(successMessage, 'success');
                
                // 清空表单
                activateForm.reset();
            } else {
                // 激活失败
                showStatus('<div class="error-icon">✗</div> 激活失败：激活码无效或已被使用，请检查后重试或联系客服', 'error');
            }
        }, 2000); // 2秒延迟模拟网络请求
    }
    
    // 激活码格式验证
    function isValidActivationCode(code) {
        // 这里实现实际的激活码验证逻辑
        // 例如：xxxx-xxxx-xxxx-xxxx 格式
        const regex = /^[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}$/;
        return regex.test(code);
    }

    // 页面增强功能
    enhanceWebsite();
});

/**
 * 网站交互增强函数
 * 添加动画、滚动效果和其他交互行为
 */
function enhanceWebsite() {
    // 导航菜单高亮当前部分
    highlightNavOnScroll();
    
    // 平滑滚动效果
    initSmoothScroll();
    
    // 滚动显示动画
    initScrollAnimations();
    
    // 表单验证效果
    initFormValidation();
    
    // FAQ折叠面板效果
    initFaqAccordion();
    
    // 功能卡片悬停效果
    initFeatureHover();
    
    // 初始化响应式菜单
    initMobileMenu();
    
    // 价格卡片悬停效果
    initPricingCardHover();
    
    // 首屏动画效果 (页面加载后)
    initHeroAnimation();
}

/**
 * 导航菜单滚动高亮效果
 */
function highlightNavOnScroll() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('nav ul li a');
    
    if (sections.length === 0 || navLinks.length === 0) return;
    
    window.addEventListener('scroll', function() {
        const scrollPosition = window.scrollY + 100; // 加偏移量以提前高亮
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                // 移除所有链接的激活状态
                navLinks.forEach(link => {
                    link.classList.remove('active');
                });
                
                // 为当前部分的链接添加激活状态
                const activeLink = document.querySelector(`nav ul li a[href="#${sectionId}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
            }
        });
    });
}

/**
 * 平滑滚动效果
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80, // 考虑固定导航的高度
                    behavior: 'smooth'
                });
                
                // 添加URL历史记录但不刷新页面
                if (history.pushState) {
                    history.pushState(null, null, targetId);
                }
            }
        });
    });
}

/**
 * 滚动触发动画效果
 */
function initScrollAnimations() {
    // 如果浏览器支持 IntersectionObserver
    if ('IntersectionObserver' in window) {
        const animatedElements = document.querySelectorAll('.animated:not(.fadeIn)');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fadeIn');
                    // 元素出现后就不再观察它
                    observer.unobserve(entry.target);
                }
            });
        }, {
            root: null, // 相对于视口
            threshold: 0.2, // 当元素20%可见时触发
            rootMargin: '0px 0px -50px 0px' // 底部偏移50px提前触发
        });
        
        animatedElements.forEach(element => {
            observer.observe(element);
        });
    } else {
        // 对于不支持 IntersectionObserver 的浏览器，直接显示所有元素
        document.querySelectorAll('.animated').forEach(el => {
            el.classList.add('fadeIn');
        });
    }
}

/**
 * 表单验证增强
 */
function initFormValidation() {
    const formInputs = document.querySelectorAll('.form-group input, .form-group textarea, .form-group select');
    
    formInputs.forEach(input => {
        // 失去焦点时验证
        input.addEventListener('blur', function() {
            validateInput(this);
        });
        
        // 获得焦点时移除错误状态
        input.addEventListener('focus', function() {
            this.classList.remove('invalid');
            
            // 隐藏相关的错误提示 (如果有)
            const errorElement = this.parentElement.querySelector('.error-message');
            if (errorElement) {
                errorElement.style.display = 'none';
            }
        });
        
        // 对于输入字段，实时验证
        if (input.tagName === 'INPUT' && input.type !== 'checkbox' && input.type !== 'radio') {
            input.addEventListener('input', function() {
                if (this.classList.contains('invalid')) {
                    validateInput(this);
                }
            });
        }
    });
    
    // 验证单个输入字段
    function validateInput(input) {
        // 必填字段验证
        if (input.hasAttribute('required') && !input.value.trim()) {
            showInputError(input, '此字段不能为空');
            return;
        }
        
        // 电子邮件格式验证
        if (input.type === 'email' && input.value.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(input.value.trim())) {
                showInputError(input, '请输入有效的电子邮件地址');
                return;
            }
        }
        
        // 最小长度验证
        if (input.hasAttribute('minlength') && input.value.trim()) {
            const minLength = parseInt(input.getAttribute('minlength'));
            if (input.value.length < minLength) {
                showInputError(input, `至少需要 ${minLength} 个字符`);
                return;
            }
        }
        
        // 验证通过，移除错误状态
        input.classList.remove('invalid');
        
        // 隐藏错误消息
        const errorElement = input.parentElement.querySelector('.error-message');
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    }
    
    // 显示输入错误
    function showInputError(input, message) {
        input.classList.add('invalid');
        
        // 查找或创建错误消息元素
        let errorElement = input.parentElement.querySelector('.error-message');
        
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            input.parentElement.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

/**
 * FAQ折叠面板效果
 */
function initFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('h4');
        const answer = item.querySelector('.faq-answer');
        
        if (question && answer) {
            // 为了可访问性，确保答案区域有适当的ARIA属性
            answer.setAttribute('aria-hidden', 'true');
            question.setAttribute('aria-expanded', 'false');
            question.setAttribute('role', 'button');
            question.setAttribute('tabindex', '0');
            
            // 添加初始状态类
            answer.classList.add('faq-answer-collapsed');
            
            // 点击问题展开/折叠答案
            question.addEventListener('click', () => {
                toggleFaqItem(item, question, answer);
            });
            
            // 键盘访问支持
            question.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleFaqItem(item, question, answer);
                }
            });
        }
    });
    
    // 切换FAQ项的展开/折叠状态
    function toggleFaqItem(item, question, answer) {
        const isExpanded = question.getAttribute('aria-expanded') === 'true';
        
        question.setAttribute('aria-expanded', !isExpanded);
        answer.setAttribute('aria-hidden', isExpanded);
        
        if (isExpanded) {
            answer.classList.add('faq-answer-collapsed');
            item.classList.remove('active');
        } else {
            answer.classList.remove('faq-answer-collapsed');
            item.classList.add('active');
        }
    }
}

/**
 * 功能卡片悬停效果
 */
function initFeatureHover() {
    const featureItems = document.querySelectorAll('.feature-item');
    
    featureItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.classList.add('feature-hover');
        });
        
        item.addEventListener('mouseleave', function() {
            this.classList.remove('feature-hover');
        });
    });
}

/**
 * 移动设备响应式菜单
 */
function initMobileMenu() {
    const header = document.querySelector('header');
    
    if (!header) return;
    
    // 创建移动菜单按钮
    if (!document.querySelector('.mobile-menu-toggle')) {
        const menuToggle = document.createElement('button');
        menuToggle.className = 'mobile-menu-toggle';
        menuToggle.setAttribute('aria-label', '打开菜单');
        menuToggle.innerHTML = '<span></span><span></span><span></span>';
        
        const navigation = header.querySelector('nav');
        if (navigation) {
            navigation.parentNode.insertBefore(menuToggle, navigation);
            
            // 点击切换菜单显示状态
            menuToggle.addEventListener('click', function() {
                const isExpanded = this.getAttribute('aria-expanded') === 'true';
                
                this.setAttribute('aria-expanded', !isExpanded);
                this.setAttribute('aria-label', isExpanded ? '打开菜单' : '关闭菜单');
                
                navigation.classList.toggle('nav-open');
                this.classList.toggle('active');
                document.body.classList.toggle('menu-open');
            });
            
            // 点击导航链接后关闭移动菜单
            const navLinks = navigation.querySelectorAll('a');
            navLinks.forEach(link => {
                link.addEventListener('click', function() {
                    if (window.innerWidth <= 768) { // 只在移动视图下执行
                        navigation.classList.remove('nav-open');
                        menuToggle.classList.remove('active');
                        menuToggle.setAttribute('aria-expanded', 'false');
                        menuToggle.setAttribute('aria-label', '打开菜单');
                        document.body.classList.remove('menu-open');
                    }
                });
            });
        }
    }
}

/**
 * 价格卡片悬停效果
 */
function initPricingCardHover() {
    const pricingCards = document.querySelectorAll('.pricing-card');
    
    pricingCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            // 移除其他卡片的强调效果
            pricingCards.forEach(c => {
                if (c !== this && c.classList.contains('featured')) {
                    c.classList.add('featured-temp');
                    c.classList.remove('featured');
                }
            });
        });
        
        card.addEventListener('mouseleave', function() {
            // 恢复原本的强调卡片
            pricingCards.forEach(c => {
                if (c.classList.contains('featured-temp')) {
                    c.classList.remove('featured-temp');
                    c.classList.add('featured');
                }
            });
        });
    });
}

/**
 * 首屏动画效果
 */
function initHeroAnimation() {
    const heroSection = document.getElementById('hero');
    if (!heroSection) return;
    
    setTimeout(() => {
        heroSection.querySelectorAll('.animated').forEach((el, index) => {
            setTimeout(() => {
                el.classList.add('fadeIn');
            }, index * 200); // 依次延迟显示
        });
    }, 300);
}