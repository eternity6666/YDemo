// Google Analytics 配置
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-6Z8KV5R1TW');

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 初始化工具卡片点击事件
    initializeToolCards();
    
    // 初始化深色模式
    initializeDarkMode();
    
    // 初始化页面过渡动画
    initializePageTransitions();
    
    // 初始化加载状态
    initializeLoadingState();
});

// 初始化工具卡片
function initializeToolCards() {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('click', function(e) {
            if (!e.target.classList.contains('btn')) {
                const link = this.querySelector('.btn');
                if (link) {
                    showLoading();
                    window.location.href = link.href;
                }
            }
        });
    });
}

// 初始化深色模式
function initializeDarkMode() {
    // 检查本地存储中的主题设置
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
        // 检查系统主题偏好
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    }
    
    // 添加主题切换按钮
    const navbar = document.querySelector('.navbar .container');
    const themeSwitch = document.createElement('div');
    themeSwitch.className = 'theme-switch ms-auto';
    themeSwitch.innerHTML = '<i class="fas fa-moon"></i>';
    themeSwitch.title = '切换主题';
    navbar.appendChild(themeSwitch);
    
    // 主题切换事件
    themeSwitch.addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // 更新图标
        this.innerHTML = newTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    });
}

// 初始化页面过渡动画
function initializePageTransitions() {
    const elements = document.querySelectorAll('.card, .navbar, footer');
    elements.forEach(element => {
        element.classList.add('page-transition');
    });
    
    // 使用 Intersection Observer 检测元素可见性
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1
    });
    
    elements.forEach(element => {
        observer.observe(element);
    });
}

// 初始化加载状态
function initializeLoadingState() {
    // 创建加载遮罩
    const loading = document.createElement('div');
    loading.className = 'loading';
    loading.innerHTML = '<div class="loading-spinner"></div>';
    document.body.appendChild(loading);
    
    // 页面加载完成时隐藏加载遮罩
    window.addEventListener('load', function() {
        hideLoading();
    });
}

// 显示加载状态
function showLoading() {
    document.querySelector('.loading').classList.add('active');
}

// 隐藏加载状态
function hideLoading() {
    document.querySelector('.loading').classList.remove('active');
}

// 添加工具提示
function addTooltip(element, text) {
    element.classList.add('tooltip');
    const tooltipText = document.createElement('span');
    tooltipText.className = 'tooltip-text';
    tooltipText.textContent = text;
    element.appendChild(tooltipText);
} 