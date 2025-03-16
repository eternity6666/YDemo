// 加载字体
function loadFont(url) {
    const font = new FontFace('CustomFont', `url(${url})`);
    return font.load().then(() => {
        document.fonts.add(font);
        return true;
    }).catch(err => {
        console.error('字体加载失败:', err);
        return false;
    });
}

// 本地存储键名
const STORAGE_KEYS = {
    FONT_URLS: 'stickerMaker_fontUrls',
    TEXT_INPUTS: 'stickerMaker_textInputs'
};

// 最大历史记录数量
const MAX_HISTORY = 20;

// 加载历史记录
// 在 loadHistory 函数中
function loadHistory() {
    const fontUrls = JSON.parse(localStorage.getItem(STORAGE_KEYS.FONT_URLS) || '[]');
    const textInputs = JSON.parse(localStorage.getItem(STORAGE_KEYS.TEXT_INPUTS) || '[]');

    const fontHistory = document.getElementById('fontHistory');
    const textHistory = document.getElementById('textHistory');

    // 清空历史记录
    fontHistory.innerHTML = '';
    textHistory.innerHTML = '';

    // 添加字体历史记录
    if (fontUrls.length > 0) {
        fontUrls.forEach(url => {
            const item = document.createElement('button');
            item.className = 'btn btn-outline-secondary btn-sm me-2 mb-2';
            item.innerHTML = `<i class="fas fa-link me-1"></i>${url}`;
            item.addEventListener('click', () => {
                document.getElementById('fontUrl').value = url;
            });
            fontHistory.appendChild(item);
        });
    } else {
        fontHistory.innerHTML = '<div class="text-muted">暂无字体历史记录</div>';
    }

    // 添加文字历史记录
    if (textInputs.length > 0) {
        textInputs.forEach(text => {
            const item = document.createElement('button');
            item.className = 'btn btn-outline-secondary btn-sm me-2 mb-2';
            item.innerHTML = `<i class="fas fa-comment me-1"></i>${text}`;
            item.addEventListener('click', () => {
                document.getElementById('textInput').value = text;
            });
            textHistory.appendChild(item);
        });
    } else {
        textHistory.innerHTML = '<div class="text-muted">暂无文字历史记录</div>';
    }
}

// 保存历史记录
function saveHistory(key, value) {
    let history = JSON.parse(localStorage.getItem(key) || '[]');
    history = [value, ...history.filter(item => item !== value)].slice(0, MAX_HISTORY);
    localStorage.setItem(key, JSON.stringify(history));
}

// 生成贴纸
function generateSticker(text, font, options = {}) {
    return new Promise((resolve) => {
        const scale = 2;
        const canvas = document.createElement('canvas');
        canvas.width = options.stickerWidth * scale;
        canvas.height = options.stickerHeight * scale;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = options.bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 计算字体大小
        let fontSize = 100 * scale;
        let textWidth;
        do {
            ctx.font = `${fontSize}px ${font}`;
            textWidth = ctx.measureText(text).width;
            fontSize -= 2;
        } while (textWidth > 230 * scale && fontSize > 10);
        
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // 文字描边
        if (options.stroke) {
            ctx.strokeStyle = options.strokeColor || '#ffffff';
            ctx.lineWidth = options.strokeWidth || 20;
            ctx.strokeText(text, canvas.width / 2, canvas.height / 2);
        }
        
        ctx.fillStyle = options.textColor || '#000000';
        ctx.fillText(text, canvas.width / 2, canvas.height / 2);
        
        canvas.toBlob(blob => {
            const img = new Image();
            img.src = URL.createObjectURL(blob);
            img.alt = text;
            img.style.width = `${options.stickerWidth}px`;
            img.style.height = `${options.stickerHeight}px`;
            resolve(img);
        }, 'image/png', 1);
    });
}

// 添加控制选项
// 在页面加载时初始化
window.addEventListener('load', () => {
    loadHistory();
});

// 添加短语数量提示
const textInput = document.getElementById('textInput');
const counter = document.createElement('div');
counter.className = 'phrase-counter';
counter.style.color = '#666';
counter.style.fontSize = '0.8em';
counter.style.marginTop = '5px';
textInput.parentNode.insertBefore(counter, textInput.nextSibling);

// 监听输入变化
textInput.addEventListener('input', () => {
    const phrases = textInput.value.split(',').filter(p => p.trim() !== '');
    counter.textContent = `${phrases.length} 个`;
});

// 主逻辑
document.getElementById('generateBtn').addEventListener('click', async () => {
    const fontUrl = document.getElementById('fontUrl').value;
    const textInput = document.getElementById('textInput').value;

    if (!fontUrl || !textInput) {
        alert('请填写字体URL和文字内容');
        return;
    }
    
    // 保存历史记录
    saveHistory(STORAGE_KEYS.FONT_URLS, fontUrl);
    saveHistory(STORAGE_KEYS.TEXT_INPUTS, textInput);

    // 加载字体
    const fontLoaded = await loadFont(fontUrl);
    if (!fontLoaded) {
        alert('字体加载失败，请检查URL');
        return;
    }
    
    // 清空容器
    const container = document.querySelector('.sticker-container');
    container.innerHTML = '';
    options = {
        stickerWidth: document.getElementById('stickerWidth').value,
        stickerHeight: document.getElementById('stickerHeight').value,
        bgColor: document.getElementById('bgColor').value,
        textColor: document.getElementById('textColor').value,
        stroke: document.getElementById('textStroke').checked,
        strokeColor: document.getElementById('strokeColor').value,
        strokeWidth: document.getElementById('strokeWidth').value
    }

    // 生成贴纸
    const texts = textInput.split(',');
    for (const text of texts) {
        const img = await generateSticker(text.trim(), 'CustomFont', options);
        container.appendChild(img); // Now we're appending a proper Node
    }
    
    // 启用导出按钮
    document.getElementById('exportBtn').disabled = false;
});

// 修改导出功能
document.getElementById('exportBtn').addEventListener('click', async () => {
    const images = document.querySelectorAll('.sticker-container img');

    const results = await Promise.all(
        Array.from(images).map(async (img) => {
            return new Promise((resolve) => {
                // 直接从img元素获取Blob
                fetch(img.src)
                    .then(response => response.blob())
                    .then(blob => {
                        const filename = img.alt.endsWith('.png')? img.alt : `${img.alt}.png`;
                        resolve({blob, filename});
                    });
            });
        })
    );

    if (results.length === 1) {
        // 单个文件直接下载
        const link = document.createElement('a');
        link.href = URL.createObjectURL(results[0].blob);
        link.download = results[0].filename;
        link.click();
    } else {
        // 多个文件打包下载
        const zip = new JSZip();
        results.forEach((result, index) => {
            zip.file(result.filename, result.blob);
        });
        
        const content = await zip.generateAsync({type: "blob"});
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = `stickers_${Date.now()}.zip`;
        link.click();
    }
});
