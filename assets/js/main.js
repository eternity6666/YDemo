// Google Analytics 配置
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-6Z8KV5R1TW');

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 初始化页面过渡动画
    initializePageTransitions();
    
    // 初始化加载状态
    initializeLoadingState();
    
    // 初始化工具提示
    initializeTooltips();
    
    // 初始化暗色模式
    initializeDarkMode();
});

// 页面过渡动画
function initializePageTransitions() {
    const elements = document.querySelectorAll('.card, .navbar, .footer');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('page-transition', 'visible');
            }
        });
    }, {
        threshold: 0.1
    });

    elements.forEach(element => {
        element.classList.add('page-transition');
        observer.observe(element);
    });
}

// 加载状态
function initializeLoadingState() {
    const loading = document.createElement('div');
    loading.className = 'loading';
    loading.innerHTML = '<div class="spinner"></div>';
    document.body.appendChild(loading);

    window.addEventListener('load', () => {
        loading.style.display = 'none';
    });
}

// 工具提示
function initializeTooltips() {
    const tooltips = document.querySelectorAll('[data-tooltip]');
    
    tooltips.forEach(element => {
        const tooltipText = element.getAttribute('data-tooltip');
        const tooltip = document.createElement('span');
        tooltip.className = 'tooltip-text';
        tooltip.textContent = tooltipText;
        element.appendChild(tooltip);
    });
}

// 暗色模式
function initializeDarkMode() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    
    function updateTheme(e) {
        document.body.classList.toggle('dark-mode', e.matches);
    }
    
    prefersDark.addListener(updateTheme);
    updateTheme(prefersDark);
}

// 页面加载进度条
let progressBar = null;

function createProgressBar() {
    progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    document.body.appendChild(progressBar);
}

function updateProgressBar(progress) {
    if (!progressBar) {
        createProgressBar();
    }
    progressBar.style.width = `${progress}%`;
}

// 平滑滚动
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// 响应式导航栏
const navbar = document.querySelector('.navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll <= 0) {
        navbar.classList.remove('scroll-up');
        return;
    }
    
    if (currentScroll > lastScroll && !navbar.classList.contains('scroll-down')) {
        navbar.classList.remove('scroll-up');
        navbar.classList.add('scroll-down');
    } else if (currentScroll < lastScroll && navbar.classList.contains('scroll-down')) {
        navbar.classList.remove('scroll-down');
        navbar.classList.add('scroll-up');
    }
    
    lastScroll = currentScroll;
});

// 性能优化
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// 图片懒加载
if ('loading' in HTMLImageElement.prototype) {
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach(img => {
        img.src = img.dataset.src;
    });
} else {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
    document.body.appendChild(script);
}

// 错误处理
window.addEventListener('error', function(e) {
    console.error('页面错误:', e.message);
    // 这里可以添加错误报告逻辑
});

// 离线支持
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('ServiceWorker 注册成功:', registration);
            })
            .catch(error => {
                console.log('ServiceWorker 注册失败:', error);
            });
    });
} 