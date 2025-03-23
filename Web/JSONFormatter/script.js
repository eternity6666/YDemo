document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const input = document.getElementById('input');
    const output = document.getElementById('output');
    const indent = document.getElementById('indent');
    const theme = document.getElementById('theme');
    const formatBtn = document.getElementById('formatBtn');
    const compressBtn = document.getElementById('compressBtn');
    const validateBtn = document.getElementById('validateBtn');
    const escapeBtn = document.getElementById('escapeBtn');
    const clearBtn = document.getElementById('clearBtn');
    const copyBtn = document.getElementById('copyBtn');
    const downloadBtn = document.getElementById('downloadBtn');

    let history = [];

    // 初始化 CodeMirror
    const editor = CodeMirror.fromTextArea(input, {
        mode: 'application/json',
        theme: 'monokai',
        lineNumbers: true,
        autoCloseBrackets: true,
        matchBrackets: true,
        indentUnit: 4,
        tabSize: 4,
        lineWrapping: true,
        extraKeys: {
            'Ctrl-Space': 'autocomplete',
            'Ctrl-Enter': function(cm) {
                formatBtn.click();
            }
        }
    });

    // 主题切换
    theme.addEventListener('change', function() {
        editor.setOption('theme', this.value);
    });

    // 缩进切换
    indent.addEventListener('change', function() {
        const value = this.value;
        if (value === 'tab') {
            editor.setOption('indentUnit', 4);
            editor.setOption('tabSize', 4);
        } else {
            editor.setOption('indentUnit', parseInt(value));
            editor.setOption('tabSize', parseInt(value));
        }
    });

    // 格式化
    formatBtn.addEventListener('click', function() {
        try {
            const json = JSON.parse(editor.getValue());
            const formatted = JSON.stringify(json, null, indent.value === 'tab' ? '\t' : parseInt(indent.value));
            editor.setValue(formatted);
            addToHistory('format', editor.getValue(), formatted);
            showToast('格式化成功');
        } catch (error) {
            showToast('JSON 格式错误：' + error.message, 'error');
        }
    });

    // 压缩
    compressBtn.addEventListener('click', function() {
        try {
            const json = JSON.parse(editor.getValue());
            const compressed = JSON.stringify(json);
            editor.setValue(compressed);
            addToHistory('compress', editor.getValue(), compressed);
            showToast('压缩成功');
        } catch (error) {
            showToast('JSON 格式错误：' + error.message, 'error');
        }
    });

    // 验证
    validateBtn.addEventListener('click', function() {
        try {
            const json = JSON.parse(editor.getValue());
            showToast('JSON 格式正确');
        } catch (error) {
            showToast('JSON 格式错误：' + error.message, 'error');
        }
    });

    // 转义
    escapeBtn.addEventListener('click', function() {
        try {
            const json = editor.getValue();
            const escaped = JSON.stringify(json);
            editor.setValue(escaped);
            addToHistory('escape', json, escaped);
            showToast('转义成功');
        } catch (error) {
            showToast('转义失败：' + error.message, 'error');
        }
    });

    // 清除
    clearBtn.addEventListener('click', function() {
        editor.setValue('');
        showToast('已清除');
    });

    // 复制
    copyBtn.addEventListener('click', function() {
        const text = editor.getValue();
        if (!text) {
            showToast('没有可复制的内容', 'warning');
            return;
        }

        navigator.clipboard.writeText(text).then(() => {
            showToast('复制成功');
        }).catch(() => {
            showToast('复制失败', 'error');
        });
    });

    // 下载
    downloadBtn.addEventListener('click', function() {
        const text = editor.getValue();
        if (!text) {
            showToast('没有可下载的内容', 'warning');
            return;
        }

        const blob = new Blob([text], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'data.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showToast('下载成功');
    });

    // 历史记录
    const savedHistory = localStorage.getItem('jsonFormatterHistory');
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
        localStorage.setItem('jsonFormatterHistory', JSON.stringify(history));
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

    // 自动调整编辑器大小
    function adjustEditorSize() {
        editor.setSize('100%', '400px');
    }

    window.addEventListener('resize', adjustEditorSize);
    adjustEditorSize();

    // 初始化
    editor.setValue('');
}); 