// Google Analytics 配置
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-6Z8KV5R1TW');

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 初始化工具卡片点击事件
    initializeToolCards();
});

// 初始化工具卡片
function initializeToolCards() {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('click', function(e) {
            if (!e.target.classList.contains('btn')) {
                const link = this.querySelector('.btn');
                if (link) {
                    window.location.href = link.href;
                }
            }
        });
    });
} 