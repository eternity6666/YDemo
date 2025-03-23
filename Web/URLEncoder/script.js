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

    // 文件选择处理
    file.addEventListener('change', function(e) {
        currentFile = e.target.files[0];
        if (currentFile) {
            const reader = new FileReader();
            reader.onload = function(e) {
                input.value = e.target.result;
            };
            reader.readAsText(currentFile);
        }
    });

    // 编码处理
    encodeBtn.addEventListener('click', function() {
        try {
            const text = input.value.trim();
            if (!text) return;
            
            const encoded = encodeURIComponent(text);
            output.value = encoded;
            downloadBtn.disabled = false;
        } catch (error) {
            output.value = '编码失败：' + error.message;
        }
    });

    // 解码处理
    decodeBtn.addEventListener('click', function() {
        try {
            const text = input.value.trim();
            if (!text) return;
            
            const decoded = decodeURIComponent(text);
            output.value = decoded;
            downloadBtn.disabled = false;
        } catch (error) {
            output.value = '解码失败：' + error.message;
        }
    });

    // 清除处理
    clearBtn.addEventListener('click', function() {
        input.value = '';
        output.value = '';
        file.value = '';
        currentFile = null;
        downloadBtn.disabled = true;
    });

    // 复制结果
    copyBtn.addEventListener('click', function() {
        output.select();
        document.execCommand('copy');
        this.innerHTML = '<i class="fas fa-check me-2"></i>已复制';
        setTimeout(() => {
            this.innerHTML = '<i class="fas fa-copy me-2"></i>复制结果';
        }, 2000);
    });

    // 下载结果
    downloadBtn.addEventListener('click', function() {
        const text = output.value;
        if (!text) return;

        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = currentFile ? `url_${currentFile.name}` : 'url_result.txt';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    });
}); 