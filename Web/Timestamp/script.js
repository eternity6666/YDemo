document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const timestampInput = document.getElementById('timestamp');
    const dateInput = document.getElementById('date');
    const timezoneSelect = document.getElementById('timezone');
    const timestampToDateBtn = document.getElementById('timestampToDateBtn');
    const dateToTimestampBtn = document.getElementById('dateToTimestampBtn');
    const copyTimestampBtn = document.getElementById('copyTimestampBtn');
    const localTime = document.getElementById('localTime');
    const utcTime = document.getElementById('utcTime');
    const resultTimestamp = document.getElementById('resultTimestamp');
    const currentTimestamp = document.getElementById('currentTimestamp');
    const currentLocalTime = document.getElementById('currentLocalTime');
    const currentUTCTime = document.getElementById('currentUTCTime');

    // 格式化日期时间
    function formatDateTime(date, options = {}) {
        const defaultOptions = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        };
        return date.toLocaleString('zh-CN', { ...defaultOptions, ...options });
    }

    // 更新当前时间
    function updateCurrentTime() {
        const now = new Date();
        const timestamp = Math.floor(now.getTime() / 1000);
        
        currentTimestamp.value = timestamp;
        currentLocalTime.value = formatDateTime(now);
        currentUTCTime.value = formatDateTime(new Date(now.toUTCString()));
    }

    // 每秒更新当前时间
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);

    // 时间戳转日期
    timestampToDateBtn.addEventListener('click', function() {
        try {
            const timestamp = timestampInput.value.trim();
            if (!timestamp) {
                showToast('请输入时间戳', 'warning');
                return;
            }

            // 处理毫秒级时间戳
            const date = new Date(timestamp.length === 13 ? parseInt(timestamp) : parseInt(timestamp) * 1000);
            if (isNaN(date.getTime())) {
                throw new Error('无效的时间戳');
            }

            localTime.value = formatDateTime(date);
            utcTime.value = formatDateTime(new Date(date.toUTCString()));
            
            // 添加到历史记录
            addToHistory('时间戳转日期', timestamp, localTime.value);
            
            showToast('转换成功');
        } catch (error) {
            showToast('转换失败：' + error.message, 'error');
        }
    });

    // 日期转时间戳
    dateToTimestampBtn.addEventListener('click', function() {
        try {
            const date = new Date(dateInput.value);
            if (isNaN(date.getTime())) {
                throw new Error('无效的日期时间');
            }

            // 根据时区选择处理
            const timestamp = timezoneSelect.value === 'utc' 
                ? Math.floor(date.getTime() / 1000)
                : Math.floor((date.getTime() - date.getTimezoneOffset() * 60000) / 1000);

            resultTimestamp.value = timestamp;
            copyTimestampBtn.disabled = false;
            
            // 添加到历史记录
            addToHistory('日期转时间戳', dateInput.value, timestamp.toString());
            
            showToast('转换成功');
        } catch (error) {
            showToast('转换失败：' + error.message, 'error');
        }
    });

    // 复制时间戳
    copyTimestampBtn.addEventListener('click', function() {
        const text = resultTimestamp.value;
        if (!text) {
            showToast('没有可复制的内容', 'warning');
            return;
        }

        navigator.clipboard.writeText(text)
            .then(() => {
                this.innerHTML = '<i class="fas fa-check me-2"></i>已复制';
                showToast('复制成功');
                setTimeout(() => {
                    this.innerHTML = '<i class="fas fa-copy me-2"></i>复制';
                }, 2000);
            })
            .catch(() => {
                showToast('复制失败', 'error');
            });
    });

    // 历史记录
    let history = [];
    const savedHistory = localStorage.getItem('timestampHistory');
    if (savedHistory) {
        history = JSON.parse(savedHistory);
    }

    function addToHistory(type, input, output) {
        history.push({
            type,
            input,
            output,
            timestamp: new Date().toISOString()
        });
        
        // 限制历史记录数量
        if (history.length > 10) {
            history.shift();
        }
        
        // 保存到本地存储
        localStorage.setItem('timestampHistory', JSON.stringify(history));
    }

    // 显示提示消息
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-white bg-${type === 'success' ? 'success' : type === 'error' ? 'danger' : 'warning'} border-0 position-fixed bottom-0 end-0 m-3`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');
        
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;
        
        document.body.appendChild(toast);
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
        
        toast.addEventListener('hidden.bs.toast', function() {
            document.body.removeChild(toast);
        });
    }

    // 输入验证
    timestampInput.addEventListener('input', function() {
        const value = this.value.trim();
        if (value) {
            const isValid = /^\d{10,13}$/.test(value);
            this.classList.toggle('is-invalid', !isValid);
            this.classList.toggle('is-valid', isValid);
        } else {
            this.classList.remove('is-invalid', 'is-valid');
        }
    });

    dateInput.addEventListener('input', function() {
        const value = this.value;
        if (value) {
            const date = new Date(value);
            const isValid = !isNaN(date.getTime());
            this.classList.toggle('is-invalid', !isValid);
            this.classList.toggle('is-valid', isValid);
        } else {
            this.classList.remove('is-invalid', 'is-valid');
        }
    });

    // 键盘快捷键
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && e.ctrlKey) {
            if (document.activeElement === timestampInput) {
                timestampToDateBtn.click();
            } else if (document.activeElement === dateInput) {
                dateToTimestampBtn.click();
            }
        }
    });

    // 初始化
    copyTimestampBtn.disabled = true;
}); 