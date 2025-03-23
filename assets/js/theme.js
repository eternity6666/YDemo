// 主题管理
const ThemeManager = {
    // 初始化主题
    init() {
        // 获取存储的主题设置
        const savedTheme = localStorage.getItem('theme');
        
        // 创建主题切换按钮
        const themeToggle = document.createElement('button');
        themeToggle.className = 'theme-switch btn btn-outline-secondary position-fixed bottom-0 end-0 m-3';
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        themeToggle.setAttribute('aria-label', '切换主题');
        document.body.appendChild(themeToggle);
        
        // 更新主题
        this.updateTheme(savedTheme === 'dark');
        
        // 添加主题切换事件
        themeToggle.addEventListener('click', () => {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            this.updateTheme(!isDark);
        });
        
        // 监听系统主题变化
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
        prefersDark.addListener((e) => {
            if (!localStorage.getItem('theme')) {
                this.updateTheme(e.matches);
            }
        });
    },
    
    // 更新主题
    updateTheme(isDark) {
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        const themeToggle = document.querySelector('.theme-switch');
        if (themeToggle) {
            themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        }
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    },
    
    // 获取当前主题
    getCurrentTheme() {
        return document.documentElement.getAttribute('data-theme') || 'light';
    }
};

// 页面加载完成后初始化主题
document.addEventListener('DOMContentLoaded', () => {
    ThemeManager.init();
}); 