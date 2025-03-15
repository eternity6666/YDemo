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
function loadHistory() {
    const fontUrls = JSON.parse(localStorage.getItem(STORAGE_KEYS.FONT_URLS) || '[]');
    const textInputs = JSON.parse(localStorage.getItem(STORAGE_KEYS.TEXT_INPUTS) || '[]');
    
    // 创建历史记录容器
    const historyContainer = document.createElement('div');
    historyContainer.className = 'history-container';
    historyContainer.style.display = 'grid';
    historyContainer.style.gridTemplateColumns = 'repeat(auto-fit, minmax(150px, 1fr))';
    historyContainer.style.gap = '10px';
    historyContainer.style.margin = '10px 0';
    
    // 添加字体历史记录
    if (fontUrls.length > 0) {
        const fontHistory = document.createElement('div');
        fontHistory.className = 'font-history';
        fontUrls.forEach(url => {
            const item = document.createElement('div');
            item.className = 'history-item';
            item.textContent = url;
            item.style.cursor = 'pointer';
            item.style.padding = '5px';
            item.style.border = '1px solid #ccc';
            item.style.borderRadius = '4px';
            item.addEventListener('click', () => {
                document.getElementById('fontUrl').value = url;
            });
            fontHistory.appendChild(item);
        });
        historyContainer.appendChild(fontHistory);
    }
    
    // 添加文字历史记录
    if (textInputs.length > 0) {
        const textHistory = document.createElement('div');
        textHistory.className = 'text-history';
        textInputs.forEach(text => {
            const item = document.createElement('div');
            item.className = 'history-item';
            item.textContent = text;
            item.style.cursor = 'pointer';
            item.style.padding = '5px';
            item.style.border = '1px solid #ccc';
            item.style.borderRadius = '4px';
            item.addEventListener('click', () => {
                document.getElementById('textInput').value = text;
            });
            textHistory.appendChild(item);
        });
        historyContainer.appendChild(textHistory);
    }
    
    // 插入到页面
    const controls = document.querySelector('.controls');
    controls.insertBefore(historyContainer, controls.firstChild);
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
        canvas.width = 240 * scale;
        canvas.height = 240 * scale;
        const ctx = canvas.getContext('2d');
        
        // 修复透明背景
        ctx.clearRect(0, 0, canvas.width, canvas.height); // 先清空画布
        if (!options.transparent) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        
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
            ctx.strokeStyle = options.strokeColor || '#000000';
            ctx.lineWidth = options.strokeWidth || 2;
            ctx.strokeText(text, canvas.width / 2, canvas.height / 2);
        }
        
        ctx.fillStyle = options.textColor || '#000000';
        ctx.fillText(text, canvas.width / 2, canvas.height / 2);
        
        canvas.toBlob(blob => {
            const img = new Image();
            img.src = URL.createObjectURL(blob);
            img.alt = text;
            img.style.width = '240px';
            img.style.height = '240px';
            resolve(img);
        }, 'image/png', 1);
    });
}

// 添加控制选项
function addOptions() {
    const controls = document.querySelector('.controls');
    
    // 透明背景选项
    const transparentLabel = document.createElement('label');
    transparentLabel.innerHTML = '透明背景:';
    const transparentCheckbox = document.createElement('input');
    transparentCheckbox.type = 'checkbox';
    transparentCheckbox.id = 'transparentBg';
    controls.appendChild(transparentLabel);
    controls.appendChild(transparentCheckbox);
    
    // 文字描边选项
    const strokeLabel = document.createElement('label');
    strokeLabel.innerHTML = '文字描边:';
    const strokeCheckbox = document.createElement('input');
    strokeCheckbox.type = 'checkbox';
    strokeCheckbox.id = 'textStroke';
    controls.appendChild(strokeLabel);
    controls.appendChild(strokeCheckbox);
}

// 页面加载时初始化
window.addEventListener('load', () => {
    loadHistory();
    addOptions();
});

// 主逻辑
document.getElementById('generateBtn').addEventListener('click', async () => {
    const fontUrl = document.getElementById('fontUrl').value;
    const textInput = document.getElementById('textInput').value;
    
    // 保存历史记录
    saveHistory(STORAGE_KEYS.FONT_URLS, fontUrl);
    saveHistory(STORAGE_KEYS.TEXT_INPUTS, textInput);
    
    // 生成选项
    // 修复选项传递
    const options = {
        transparent: document.getElementById('transparentBg').checked,
        stroke: document.getElementById('textStroke').checked,
        strokeColor: '#000000',
        strokeWidth: 2,
        textColor: '#000000' // 添加文字颜色
    };
    
    if (!fontUrl || !textInput) {
        alert('请填写字体URL和文字内容');
        return;
    }
    
    // 加载字体
    const fontLoaded = await loadFont(fontUrl);
    if (!fontLoaded) {
        alert('字体加载失败，请检查URL');
        return;
    }
    
    // 清空容器
    const container = document.querySelector('.sticker-container');
    container.innerHTML = '';
    
    // 生成贴纸
    const texts = textInput.split(',');
    for (const text of texts) {
        const img = await generateSticker(text.trim(), 'CustomFont');
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
            const response = await fetch(img.src);
            const blob = await response.blob();
            // 确保文件名以 .png 结尾
            const filename = img.alt.endsWith('.png') ? img.alt : `${img.alt}.png`;
            return {blob, filename};
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
