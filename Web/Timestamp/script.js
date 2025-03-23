document.addEventListener('DOMContentLoaded', function() {
    const timestampInput = document.getElementById('timestampInput');
    const dateInput = document.getElementById('dateInput');
    const convertToDateBtn = document.getElementById('convertToDateBtn');
    const convertToTimestampBtn = document.getElementById('convertToTimestampBtn');
    const dateResult = document.getElementById('dateResult');
    const dateFormat = document.getElementById('dateFormat');
    const timestampResult = document.getElementById('timestampResult');
    const timestampFormat = document.getElementById('timestampFormat');
    const currentDate = document.getElementById('currentDate');
    const currentDateFormat = document.getElementById('currentDateFormat');
    const currentTimestamp = document.getElementById('currentTimestamp');
    const currentTimestampFormat = document.getElementById('currentTimestampFormat');

    // 更新当前时间
    function updateCurrentTime() {
        const now = new Date();
        const isoString = now.toISOString();
        const timestamp = Math.floor(now.getTime() / 1000);
        const timestampMs = now.getTime();

        currentDate.textContent = isoString;
        currentDateFormat.textContent = 'ISO 8601 格式';
        currentTimestamp.textContent = `${timestamp} (秒) / ${timestampMs} (毫秒)`;
        currentTimestampFormat.textContent = 'Unix 时间戳';
    }

    // 时间戳转日期
    convertToDateBtn.addEventListener('click', function() {
        const timestamp = timestampInput.value.trim();
        if (!timestamp) return;

        try {
            let date;
            if (timestamp.length === 13) {
                // 毫秒时间戳
                date = new Date(parseInt(timestamp));
            } else {
                // 秒时间戳
                date = new Date(parseInt(timestamp) * 1000);
            }

            if (isNaN(date.getTime())) {
                throw new Error('无效的时间戳');
            }

            const isoString = date.toISOString();
            const localString = date.toLocaleString();
            const utcString = date.toUTCString();

            dateResult.innerHTML = `
                <div>ISO 8601: ${isoString}</div>
                <div>本地时间: ${localString}</div>
                <div>UTC时间: ${utcString}</div>
            `;
            dateFormat.textContent = '多种时间格式';
        } catch (error) {
            dateResult.textContent = '转换失败：' + error.message;
        }
    });

    // 日期转时间戳
    convertToTimestampBtn.addEventListener('click', function() {
        const date = new Date(dateInput.value);
        if (isNaN(date.getTime())) {
            timestampResult.textContent = '无效的日期';
            return;
        }

        const timestamp = Math.floor(date.getTime() / 1000);
        const timestampMs = date.getTime();

        timestampResult.innerHTML = `
            <div>Unix时间戳（秒）: ${timestamp}</div>
            <div>Unix时间戳（毫秒）: ${timestampMs}</div>
        `;
        timestampFormat.textContent = 'Unix 时间戳';
    });

    // 定期更新当前时间
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
}); 