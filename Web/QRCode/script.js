document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const type = document.getElementById('type');
    const input = document.getElementById('input');
    const size = document.getElementById('size');
    const sizeValue = document.getElementById('sizeValue');
    const margin = document.getElementById('margin');
    const marginValue = document.getElementById('marginValue');
    const color = document.getElementById('color');
    const generateBtn = document.getElementById('generateBtn');
    const clearBtn = document.getElementById('clearBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const qrcode = document.getElementById('qrcode');

    let history = [];

    // 更新显示值
    size.addEventListener('input', function() {
        sizeValue.textContent = this.value;
    });

    margin.addEventListener('input', function() {
        marginValue.textContent = this.value;
    });

    // 生成二维码
    generateBtn.addEventListener('click', function() {
        try {
            const text = input.value.trim();
            if (!text) {
                showToast('请输入需要生成二维码的内容', 'warning');
                return;
            }

            // 根据类型生成不同格式的内容
            let content = text;
            switch (type.value) {
                case 'url':
                    if (!isValidUrl(text)) {
                        showToast('请输入有效的URL', 'error');
                        return;
                    }
                    break;
                case 'vcard':
                    content = generateVCard(text);
                    break;
            }

            // 生成二维码
            const qr = qrcode(0, 'M');
            qr.addData(content);
            qr.make();
            qrcode.innerHTML = qr.createImgTag(parseInt(size.value), parseInt(margin.value));
            
            // 设置颜色
            const img = qrcode.querySelector('img');
            if (img) {
                img.style.filter = `invert(1) sepia(100%) saturate(1000%) hue-rotate(${getHueRotation(color.value)})`;
            }

            downloadBtn.disabled = false;
            
            // 添加到历史记录
            addToHistory(type.value, text, content);
            
            showToast('二维码生成成功');
        } catch (error) {
            showToast('二维码生成失败', 'error');
            console.error(error);
        }
    });

    // 清除
    clearBtn.addEventListener('click', function() {
        input.value = '';
        qrcode.innerHTML = '';
        downloadBtn.disabled = true;
        showToast('已清除');
    });

    // 下载二维码
    downloadBtn.addEventListener('click', function() {
        const img = qrcode.querySelector('img');
        if (!img) {
            showToast('没有可下载的二维码', 'warning');
            return;
        }

        const link = document.createElement('a');
        link.download = 'qrcode.png';
        link.href = img.src;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('下载成功');
    });

    // 历史记录
    const savedHistory = localStorage.getItem('qrcodeHistory');
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
        localStorage.setItem('qrcodeHistory', JSON.stringify(history));
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

    // 验证URL
    function isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    // 生成名片格式
    function generateVCard(text) {
        const lines = text.split('\n');
        const vcard = ['BEGIN:VCARD', 'VERSION:3.0'];
        
        lines.forEach(line => {
            const [key, value] = line.split(':').map(s => s.trim());
            if (key && value) {
                switch (key.toLowerCase()) {
                    case 'name':
                        vcard.push(`FN:${value}`);
                        vcard.push(`N:${value};;;;`);
                        break;
                    case 'tel':
                        vcard.push(`TEL:${value}`);
                        break;
                    case 'email':
                        vcard.push(`EMAIL:${value}`);
                        break;
                    case 'org':
                        vcard.push(`ORG:${value}`);
                        break;
                    case 'title':
                        vcard.push(`TITLE:${value}`);
                        break;
                    case 'url':
                        vcard.push(`URL:${value}`);
                        break;
                    case 'address':
                        vcard.push(`ADR:;;${value};;;;`);
                        break;
                    default:
                        vcard.push(`${key.toUpperCase()}:${value}`);
                }
            }
        });
        
        vcard.push('END:VCARD');
        return vcard.join('\n');
    }

    // 获取色相旋转值
    function getHueRotation(color) {
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h = 0;
        
        if (max === min) {
            h = 0;
        } else if (max === r) {
            h = 60 * ((g - b) / (max - min));
        } else if (max === g) {
            h = 60 * (2 + (b - r) / (max - min));
        } else {
            h = 60 * (4 + (r - g) / (max - min));
        }
        
        if (h < 0) h += 360;
        return h;
    }

    // 自动调整文本框高度
    function adjustTextareaHeight(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    }

    input.addEventListener('input', function() {
        adjustTextareaHeight(this);
    });

    // 初始化文本框高度
    adjustTextareaHeight(input);

    // 键盘快捷键
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && e.ctrlKey) {
            if (document.activeElement === input) {
                generateBtn.click();
            }
        }
    });

    // 初始化
    downloadBtn.disabled = true;
}); 