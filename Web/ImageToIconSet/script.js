const sizes = [];

for (let i = 16; i <= 1024; i *= 2) {
    sizes.push({ width: i, height: i });
}
sizes.push({ width: 58, height: 58 });
sizes.push({ width: 120, height: 120 });
sizes.push({ width: 180, height: 180 });
sizes.push({ width: 120, height: 90 });
sizes.push({ width: 180, height: 135 });
sizes.push({ width: 134, height: 100 });
sizes.push({ width: 148, height: 110 });
sizes.push({ width: 54, height: 40 });
sizes.push({ width: 81, height: 60 });
sizes.push({ width: 64, height: 48 });
sizes.push({ width: 96, height: 72 });
sizes.push({ width: 1024, height: 768 });

const imageInput = document.getElementById('imageInput');
const exportBtn = document.getElementById('exportBtn');
const preview = document.querySelector('.preview');

imageInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
            preview.innerHTML = `<img src="${img.src}" alt="Preview">`;
            exportBtn.disabled = false;
        };
    }
});

exportBtn.addEventListener('click', async () => {
    const file = imageInput.files[0];
    if (!file) return;

    const img = await createImageBitmap(file);
    const zip = new JSZip();
    const promises = [];

    for (const size of sizes) {
        const canvas = document.createElement('canvas');
        canvas.width = size.width;
        canvas.height = size.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, size.width, size.height);
        
        const promise = new Promise(resolve => {
            canvas.toBlob(blob => {
                zip.file(`icon_${size.width}x${size.height}.png`, blob);
                resolve();
            }, 'image/png');
        });
        promises.push(promise);
    }

    await Promise.all(promises);
    const content = await zip.generateAsync({type: 'blob'});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = 'icons.zip';
    link.click();
});