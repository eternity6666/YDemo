document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('qrForm');
    const content = document.getElementById('content');
    const size = document.getElementById('size');
    const sizeValue = document.getElementById('sizeValue');
    const color = document.getElementById('color');
    const bgColor = document.getElementById('bgColor');
    const errorLevel = document.getElementById('errorLevel');
    const qrCode = document.getElementById('qrCode');
    const downloadBtn = document.getElementById('downloadBtn');

    let qr = null;

    // 更新大小显示
    size.addEventListener('input', function() {
        sizeValue.textContent = this.value + 'px';
    });

    // 生成二维码
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        generateQRCode();
    });

    // 下载二维码
    downloadBtn.addEventListener('click', function() {
        if (qr) {
            const link = document.createElement('a');
            link.download = 'qrcode.png';
            link.href = qr.toDataURL('image/png');
            link.click();
        }
    });

    // 监听输入变化
    [content, size, color, bgColor, errorLevel].forEach(element => {
        element.addEventListener('input', generateQRCode);
    });

    function generateQRCode() {
        const text = content.value.trim();
        if (!text) {
            qrCode.innerHTML = '';
            downloadBtn.disabled = true;
            return;
        }

        qrCode.innerHTML = '';
        qr = new QRCode(qrCode, {
            text: text,
            width: parseInt(size.value),
            height: parseInt(size.value),
            colorDark: color.value,
            colorLight: bgColor.value,
            correctLevel: QRCode.CorrectLevel[errorLevel.value]
        });

        downloadBtn.disabled = false;
    }
}); 