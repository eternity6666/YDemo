document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const editorElement = document.getElementById('editor');
    const previewElement = document.getElementById('preview');
    const themeBtn = document.getElementById('themeBtn');
    const clearBtn = document.getElementById('clearBtn');
    const copyBtn = document.getElementById('copyBtn');
    const downloadBtn = document.getElementById('downloadBtn');

    let history = [];
    let autoSaveTimer = null;

    // 初始化 CodeMirror
    const editor = CodeMirror(editorElement, {
        mode: 'markdown',
        theme: 'monokai',
        lineNumbers: true,
        lineWrapping: true,
        autoCloseBrackets: true,
        matchBrackets: true,
        indentUnit: 4,
        tabSize: 4,
        extraKeys: {
            'Ctrl-Space': 'autocomplete',
            'Ctrl-S': function(cm) {
                saveContent();
            }
        }
    });

    // 初始化 Markdown-it
    const md = window.markdownit({
        html: true,
        linkify: true,
        typographer: true,
        highlight: function(str, lang) {
            if (lang && hljs.getLanguage(lang)) {
                try {
                    return hljs.highlight(str, { language: lang }).value;
                } catch (__) {}
            }
            return ''; // 使用默认的转义
        }
    });

    // 实时预览
    editor.on('change', function(cm) {
        updatePreview();
        autoSave();
    });

    // 主题切换
    themeBtn.addEventListener('click', function() {
        const currentTheme = editor.getOption('theme');
        const newTheme = currentTheme === 'monokai' ? 'default' : 'monokai';
        editor.setOption('theme', newTheme);
        localStorage.setItem('markdownTheme', newTheme);
        showToast('主题已切换');
    });

    // 清除
    clearBtn.addEventListener('click', function() {
        if (confirm('确定要清除所有内容吗？')) {
            editor.setValue('');
            localStorage.removeItem('markdownContent');
            showToast('已清除');
        }
    });

    // 复制
    copyBtn.addEventListener('click', function() {
        const content = editor.getValue();
        if (!content) {
            showToast('没有可复制的内容', 'warning');
            return;
        }

        navigator.clipboard.writeText(content).then(() => {
            showToast('复制成功');
        }).catch(() => {
            showToast('复制失败', 'error');
        });
    });

    // 下载
    downloadBtn.addEventListener('click', function() {
        const content = editor.getValue();
        if (!content) {
            showToast('没有可下载的内容', 'warning');
            return;
        }

        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'document.md';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showToast('下载成功');
    });

    // 更新预览
    function updatePreview() {
        const content = editor.getValue();
        previewElement.innerHTML = md.render(content);
        
        // 添加代码高亮
        previewElement.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightBlock(block);
        });
    }

    // 自动保存
    function autoSave() {
        if (autoSaveTimer) {
            clearTimeout(autoSaveTimer);
        }
        
        autoSaveTimer = setTimeout(() => {
            saveContent();
        }, 1000);
    }

    // 保存内容
    function saveContent() {
        const content = editor.getValue();
        localStorage.setItem('markdownContent', content);
    }

    // 加载内容
    function loadContent() {
        const content = localStorage.getItem('markdownContent');
        if (content) {
            editor.setValue(content);
            updatePreview();
        }
    }

    // 历史记录
    const savedHistory = localStorage.getItem('markdownHistory');
    if (savedHistory) {
        history = JSON.parse(savedHistory);
    }

    function addToHistory(content) {
        history.push({
            content,
            timestamp: new Date().toISOString()
        });
        
        // 限制历史记录数量
        if (history.length > 10) {
            history.shift();
        }
        
        // 保存到本地存储
        localStorage.setItem('markdownHistory', JSON.stringify(history));
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
        const height = window.innerHeight - 400;
        editor.setSize('100%', height + 'px');
    }

    // 图片上传
    function handleImageUpload(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imageData = e.target.result;
            const cursor = editor.getCursor();
            editor.replaceRange(`![${file.name}](${imageData})`, cursor);
            editor.setCursor(cursor.line + 1, 0);
        };
        reader.readAsDataURL(file);
    }

    // 拖放支持
    editorElement.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.stopPropagation();
    });

    editorElement.addEventListener('drop', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                handleImageUpload(file);
            } else {
                showToast('只支持图片文件', 'warning');
            }
        }
    });

    // 键盘快捷键
    document.addEventListener('keydown', function(e) {
        if (e.key === 's' && e.ctrlKey) {
            e.preventDefault();
            saveContent();
        }
    });

    // 初始化
    const savedTheme = localStorage.getItem('markdownTheme');
    if (savedTheme) {
        editor.setOption('theme', savedTheme);
    }

    window.addEventListener('resize', adjustEditorSize);
    adjustEditorSize();
    loadContent();
}); 