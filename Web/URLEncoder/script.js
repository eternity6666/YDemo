document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('urlForm');
    const input = document.getElementById('input');
    const file = document.getElementById('file');
    const output = document.getElementById('output');
    const encodeBtn = document.getElementById('encodeBtn');
    const decodeBtn = document.getElementById('decodeBtn');
    const clearBtn = document.getElementById('clearBtn');
    const copyBtn = document.getElementById('copyBtn');
    const downloadBtn = document.getElementById('downloadBtn');

    let currentFile = null;
    let history = [];

    // 文件选择处理
    file.addEventListener('change', function(e) {
        currentFile = e.target.files[0];
        if (currentFile) {
            const reader = new FileReader();
            reader.onload = function(e) {
                input.value = e.target.result;
                showToast('文件加载成功');
            };
            reader.onerror = function() {
                showToast('文件加载失败', 'error');
            };
            reader.readAsText(currentFile);
        }
    });

    // 拖放支持
    const dropZone = document.querySelector('.card-body');
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });

    function highlight(e) {
        dropZone.classList.add('border-primary');
    }

    function unhighlight(e) {
        dropZone.classList.remove('border-primary');
    }

    dropZone.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length > 0) {
            currentFile = files[0];
            if (currentFile.type === 'text/plain' || currentFile.name.endsWith('.txt')) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    input.value = e.target.result;
                    showToast('文件加载成功');
                };
                reader.onerror = function() {
                    showToast('文件加载失败', 'error');
                };
                reader.readAsText(currentFile);
            } else {
                showToast('请上传文本文件', 'error');
            }
        }
    }

    // 编码处理
    encodeBtn.addEventListener('click', function() {
        try {
            const text = input.value.trim();
            if (!text) {
                showToast('请输入需要编码的文本', 'warning');
                return;
            }
            
            const encoded = encodeURIComponent(text);
            output.value = encoded;
            downloadBtn.disabled = false;
            
            // 添加到历史记录
            addToHistory('编码', text, encoded);
            
            showToast('编码成功');
        } catch (error) {
            output.value = '编码失败：' + error.message;
            showToast('编码失败', 'error');
        }
    });

    // 解码处理
    decodeBtn.addEventListener('click', function() {
        try {
            const text = input.value.trim();
            if (!text) {
                showToast('请输入需要解码的文本', 'warning');
                return;
            }
            
            const decoded = decodeURIComponent(text);
            output.value = decoded;
            downloadBtn.disabled = false;
            
            // 添加到历史记录
            addToHistory('解码', text, decoded);
            
            showToast('解码成功');
        } catch (error) {
            output.value = '解码失败：' + error.message;
            showToast('解码失败', 'error');
        }
    });

    // 清除处理
    clearBtn.addEventListener('click', function() {
        input.value = '';
        output.value = '';
        file.value = '';
        currentFile = null;
        downloadBtn.disabled = true;
        showToast('已清除');
    });

    // 复制结果
    copyBtn.addEventListener('click', function() {
        const text = output.value;
        if (!text) {
            showToast('没有可复制的内容', 'warning');
            return;
        }

        navigator.clipboard.writeText(text)
            .then(() => {
                this.innerHTML = '<i class="fas fa-check me-2"></i>已复制';
                showToast('复制成功');
                setTimeout(() => {
                    this.innerHTML = '<i class="fas fa-copy me-2"></i>复制结果';
                }, 2000);
            })
            .catch(() => {
                showToast('复制失败', 'error');
            });
    });

    // 下载结果
    downloadBtn.addEventListener('click', function() {
        const text = output.value;
        if (!text) {
            showToast('没有可下载的内容', 'warning');
            return;
        }

        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = currentFile ? `url_${currentFile.name}` : 'url_result.txt';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showToast('下载成功');
    });

    // 历史记录
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
        localStorage.setItem('urlEncoderHistory', JSON.stringify(history));
    }

    // 加载历史记录
    const savedHistory = localStorage.getItem('urlEncoderHistory');
    if (savedHistory) {
        history = JSON.parse(savedHistory);
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

    input.addEventListener('input', function() {
        adjustTextareaHeight(this);
    });

    output.addEventListener('input', function() {
        adjustTextareaHeight(this);
    });

    // 初始化文本框高度
    adjustTextareaHeight(input);
    adjustTextareaHeight(output);
}); 