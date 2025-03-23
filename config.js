const config = {
    development: {
        baseUrl: 'http://localhost:8000'
    },
    production: {
        baseUrl: 'https://blog.yangzuohua.top/YDemo'
    }
};

// 根据环境变量选择配置
const env = process.env.NODE_ENV || 'development';
const currentConfig = config[env];

export default currentConfig; 