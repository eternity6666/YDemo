document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const fetchForm = document.getElementById('fetchForm');
    const urlInput = document.getElementById('url');
    const intervalInput = document.getElementById('interval');
    const methodSelect = document.getElementById('method');
    const headersInput = document.getElementById('headers');
    const bodyInput = document.getElementById('body');
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    const exportBtn = document.getElementById('exportBtn');
    const clearBtn = document.getElementById('clearBtn');
    const resultDiv = document.getElementById('result');
    const historyDiv = document.getElementById('history');
    const copyBtn = document.getElementById('copyBtn');
    const formatBtn = document.getElementById('formatBtn');

    let fetchInterval = null;
    let history = [];
    let currentData = null;

    // 加载历史记录
    const savedHistory = localStorage.getItem('fetchHistory');
    if (savedHistory) {
        history = JSON.parse(savedHistory);
        updateHistory();
    }

    // 表单提交
    fetchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        startFetching();
    });

    // 开始获取
    function startFetching() {
        const url = urlInput.value;
        const interval = parseInt(intervalInput.value);
        const method = methodSelect.value;
        const headers = parseHeaders(headersInput.value);
        const body = bodyInput.value;

        if (!url) {
            showToast('请输入网页地址', 'warning');
            return;
        }

        // 禁用表单和开始按钮
        disableForm(true);
        startBtn.disabled = true;
        stopBtn.disabled = false;

        // 立即执行一次
        fetchData(url, method, headers, body);

        // 设置定时器
        fetchInterval = setInterval(() => {
            fetchData(url, method, headers, body);
        }, interval * 1000);

        showToast('开始自动获取');
    }

    // 停止获取
    stopBtn.addEventListener('click', function() {
        if (fetchInterval) {
            clearInterval(fetchInterval);
            fetchInterval = null;
        }
        disableForm(false);
        startBtn.disabled = false;
        stopBtn.disabled = true;
        showToast('已停止获取');
    });

    // 获取数据
    async function fetchData(url, method, headers, body) {
        try {
            const options = {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    ...headers
                }
            };

            if (method !== 'GET' && body) {
                options.body = body;
            }

            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            currentData = data;
            displayResult(data);
            addToHistory(url, data);
        } catch (error) {
            console.error('获取数据失败:', error);
            showToast(`获取失败: ${error.message}`, 'error');
        }
    }

    // 显示结果
    function displayResult(data) {
        resultDiv.textContent = JSON.stringify(data, null, 2);
    }

    // 格式化结果
    formatBtn.addEventListener('click', function() {
        if (!currentData) {
            showToast('没有可格式化的数据', 'warning');
            return;
        }
        resultDiv.textContent = JSON.stringify(currentData, null, 2);
    });

    // 复制结果
    copyBtn.addEventListener('click', function() {
        if (!currentData) {
            showToast('没有可复制的数据', 'warning');
            return;
        }

        navigator.clipboard.writeText(JSON.stringify(currentData, null, 2))
            .then(() => showToast('复制成功'))
            .catch(() => showToast('复制失败', 'error'));
    });

    // 导出数据
    exportBtn.addEventListener('click', function() {
        if (!currentData) {
            showToast('没有可导出的数据', 'warning');
            return;
        }

        const blob = new Blob([JSON.stringify(currentData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `fetch_${new Date().toISOString().slice(0,10)}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showToast('导出成功');
    });

    // 清除
    clearBtn.addEventListener('click', function() {
        if (confirm('确定要清除所有内容吗？')) {
            fetchForm.reset();
            resultDiv.textContent = '';
            history = [];
            localStorage.removeItem('fetchHistory');
            updateHistory();
            showToast('已清除');
        }
    });

    // 解析请求头
    function parseHeaders(headersStr) {
        if (!headersStr) return {};
        
        const headers = {};
        headersStr.split('\n').forEach(line => {
            const [key, value] = line.split(':').map(s => s.trim());
            if (key && value) {
                headers[key] = value;
            }
        });
        return headers;
    }

    // 添加到历史记录
    function addToHistory(url, data) {
        history.push({
            url,
            data,
            timestamp: new Date().toISOString()
        });

        // 限制历史记录数量
        if (history.length > 10) {
            history.shift();
        }

        // 保存到本地存储
        localStorage.setItem('fetchHistory', JSON.stringify(history));
        updateHistory();
    }

    // 更新历史记录显示
    function updateHistory() {
        historyDiv.innerHTML = history.map((item, index) => `
            <div class="list-group-item">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="mb-1">${item.url}</h6>
                        <small class="text-muted">${new Date(item.timestamp).toLocaleString()}</small>
                    </div>
                    <button class="btn btn-sm btn-outline-primary" onclick="loadHistoryItem(${index})">
                        <i class="fas fa-history"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    // 加载历史记录项
    window.loadHistoryItem = function(index) {
        const item = history[index];
        if (item) {
            urlInput.value = item.url;
            resultDiv.textContent = JSON.stringify(item.data, null, 2);
            currentData = item.data;
            showToast('已加载历史记录');
        }
    };

    // 禁用/启用表单
    function disableForm(disabled) {
        urlInput.disabled = disabled;
        intervalInput.disabled = disabled;
        methodSelect.disabled = disabled;
        headersInput.disabled = disabled;
        bodyInput.disabled = disabled;
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

    // 自动调整文本框高度
    function adjustTextareaHeight(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    }

    headersInput.addEventListener('input', function() {
        adjustTextareaHeight(this);
    });

    bodyInput.addEventListener('input', function() {
        adjustTextareaHeight(this);
    });
}); 