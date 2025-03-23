const main = {
    functionList: [
        {
            "name": "贴纸生成器",
            "description": "快速生成个性化贴纸",
            "url": "/YDemo/Web/StickerMaker/"
        },
        {
            "name": "图片转图标集",
            "description": "将图片转换为图标集",
            "url": "/YDemo/Web/ImageToIconSet/"
        },
        {
            "name": "自动获取图片链接并导出",
            "description": "自动获取图片链接并导出",
            "url": "/YDemo/Web/AutoFetchImg/"
        },
        {
            "name": "LED字体",
            "description": "LED字体",
            "url": "/YDemo/Web/LedFont/"
        },
        {
            "name": "字体设置",
            "description": "字体设置",
            "url": "/YDemo/Web/FontSet/"
        }
    ],
    init: function() {
        this.createFunctionList();
    },
    createFunctionList: function() {
        this.functionList.forEach(function(item) {
            this.createFunctionItem(item);
        });
    },
    createFunctionItem: function(item) {
        const functionItem = document.createElement("div");
        functionItem.classList.add("function-item");
        functionItem.innerHTML = `
            <h3>${item.name}</h3>   
            <p>${item.description}</p>
            <a href="${item.url}" class="btn btn-primary">使用工具</a>
        `;
        document.getElementById("function-list").appendChild(functionItem);
    }
}

main.init();
