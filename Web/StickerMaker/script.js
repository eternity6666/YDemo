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
    TEXT_INPUTS: 'stickerMaker_textInputs',
    OPTIONS: 'stickerMaker_options',
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

        // 透明背景
        if (options.transparentBg) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = options.bgColor || '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // 计算字体大小
        let fontSize = 100 * scale;
        let textWidth;
        do {
            ctx.font = `${fontSize}px ${font}`;
            textWidth = ctx.measureText(text).width;
            fontSize -= 2;
        } while (textWidth > (canvas.width - 10) && fontSize > 10);
        
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

function initConfigArea() {
    const configArea = document.getElementById('configArea');
    const options = JSON.parse(localStorage.getItem(STORAGE_KEYS.OPTIONS) || '{}');
    configList = [
        {
            label: '贴纸宽度',
            inputType: 'number',
            id: 'stickerWidth',
            value: options.stickerWidth || 200,
        },
        {
            label: '贴纸高度',
            inputType: 'number',
            id:'stickerHeight',
            value: options.stickerHeight || 200,
        },
        {
            label: '描边宽度',
            inputType: 'number',
            id:'strokeWidth',
            value: options.strokeWidth || 20,
        },
        {
            label: '文字颜色',
            inputType: 'color',
            id:'textColor',
            value: options.textColor || '#000000',
        },
        {
            label: '描边颜色',
            inputType: 'color',
            id:'strokeColor',
            value: options.strokeColor || '#ffffff',
        },
        {
            label: '透明背景',
            inputType: 'checkbox',
            id:'transparentBg',
            value: options.transparentBg || false,
        },
        {
            label: '文字描边',
            inputType: 'checkbox',
            id:'textStroke',
            value: options.textStroke || false,
        },
    ];
    configList.forEach(config => {
        const div = document.createElement('div');
        div.className = 'col-md-3';
        inputClassName = ''
        if (config.inputType === 'checkbox') {
            inputClassName = 'form-check-input';
        } else if (config.inputType === 'color') {
            inputClassName = 'form-control-color';
        }
        div.innerHTML = `
            <div class="d-flex align-items-center">
                <label class="form-label me-2 mb-0" style="min-width: 80px;">${config.label}</label>
                <input type="${config.inputType}" 
                       class="form-control form-control-lg ${inputClassName}" 
                       id="${config.id}" 
                       value="${config.value}"
                       ${config.inputType === 'checkbox' ? 'checked' : ''}
                       style="${config.inputType === 'checkbox' ? 'margin: 0;' : ''}">
            </div>
        `;
        configArea.appendChild(div);
    })
}

function initButtonArea() {
    const buttonArea = document.getElementById('buttonArea');
    buttonList = [
        {
            label: '生成贴纸',
            id:'generateBtn',
            className: 'btn btn-primary',
            icon: 'fas fa-paint-brush',
        },
        {
            label: '导出贴纸',
            id:'exportBtn',
            className: 'btn btn-success',
            icon: 'fas fa-download',
        }
    ];
    buttonList.forEach(button => {
        const buttonElement = document.createElement('button');
        buttonElement.className = `${button.className} btn-lg`;
        buttonElement.id = button.id;
        buttonElement.innerHTML = `<i class="${button.icon}"></i>${button.label}`;
        buttonArea.appendChild(buttonElement);
    })
}

initConfigArea();
initButtonArea();

// 添加控制选项
// 在页面加载时初始化
window.addEventListener('load', () => {
    loadHistory();
});

// 添加短语数量提示
const textInput = document.getElementById('textInput');
const counter = document.getElementById('phrase-counter');

// 监听 value 变化
textInput.addEventListener('input', () => {
    const phrases = textInput.value.split(',').filter(p => p.trim()!== '');
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
        transparentBg: document.getElementById('transparentBg').value,
        textColor: document.getElementById('textColor').value,
        stroke: document.getElementById('textStroke').checked,
        strokeColor: document.getElementById('strokeColor').value,
        strokeWidth: document.getElementById('strokeWidth').value
    }
    localStorage.setItem(STORAGE_KEYS.OPTIONS, JSON.stringify(options));

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
