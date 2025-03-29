// 网站主JavaScript文件

document.addEventListener('DOMContentLoaded', function() {
    // 初始化导航栏激活状态
    initializeNavigation();
    
    // 初始化演示区域滑块效果（如果存在）
    initializeDemoSliders();
    
    // 初始化平滑滚动
    initializeSmoothScroll();
    
    // 初始化指南页面导航（如果在指南页面）
    initializeGuideNav();
});

// 初始化导航栏激活状态
function initializeNavigation() {
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('nav ul li a');
    
    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        if (linkHref === currentPage || 
            (currentPage === '' && linkHref === 'index.html')) {
            link.classList.add('active');
        }
    });
}

// 初始化演示区域滑块效果
function initializeDemoSliders() {
    const demoSliders = document.querySelectorAll('.demo-slider');
    
    demoSliders.forEach(slider => {
        const demoItem = slider.closest('.demo-item');
        const demoBeforeAfter = slider.closest('.demo-before-after');
        const demoAfter = demoBeforeAfter.querySelector('.demo-after');
        
        let isDragging = false;
        
        // 滑块拖动事件
        slider.addEventListener('mousedown', (e) => {
            isDragging = true;
            e.preventDefault();
        });
        
        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
        
        demoBeforeAfter.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const rect = demoBeforeAfter.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
            
            slider.style.left = `${percent}%`;
            demoAfter.style.clipPath = `polygon(${percent}% 0, 100% 0, 100% 100%, ${percent}% 100%)`;
        });
        
        // 点击事件，无需拖动直接点击移动滑块
        demoBeforeAfter.addEventListener('click', (e) => {
            const rect = demoBeforeAfter.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
            
            slider.style.left = `${percent}%`;
            demoAfter.style.clipPath = `polygon(${percent}% 0, 100% 0, 100% 100%, ${percent}% 100%)`;
        });
    });
}

// 平滑滚动到锚点
function initializeSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const navHeight = document.querySelector('header').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // 更新URL以反映当前部分
                history.pushState(null, null, targetId);
                
                // 如果在指南页面，更新导航激活状态
                updateGuideNavActive(targetId);
            }
        });
    });
}

// 指南页面导航初始化
function initializeGuideNav() {
    const guideNav = document.querySelector('.guide-nav');
    if (!guideNav) return;
    
    // 根据滚动位置更新导航激活状态
    window.addEventListener('scroll', () => {
        const sections = document.querySelectorAll('.guide-section');
        const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
        const navHeight = document.querySelector('header').offsetHeight;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - navHeight - 50;
            const sectionBottom = sectionTop + section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                const sectionId = `#${section.id}`;
                updateGuideNavActive(sectionId);
            }
        });
    });
}

// 更新指南导航的激活状态
function updateGuideNavActive(targetId) {
    const guideNavLinks = document.querySelectorAll('.guide-nav a');
    if (!guideNavLinks.length) return;
    
    guideNavLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === targetId) {
            link.classList.add('active');
        }
    });
}

// 创建目录文件夹结构
function createImageDirectories() {
    // 这个函数在实际部署网站时调用，用于确保所有必要的目录存在
    const directories = [
        'images',
        'images/demo',
        'images/guide',
        'images/models',
        'images/about',
        'files'
    ];
    
    // 在实际环境中，这需要服务器端支持
    console.log('在实际环境中，需要确保以下目录已创建:');
    directories.forEach(dir => {
        console.log(`- ${dir}`);
    });
} 