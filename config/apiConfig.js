// config/apiConfig.js
// API配置文件

// 生产环境API地址
const PROD_API_URL = 'https://your-production-api.com/api';

// 开发环境API地址
const DEV_API_URL = 'http://localhost:3000/api';

// 测试环境API地址
const TEST_API_URL = 'https://your-test-api.com/api';

// 当前环境 - 可以通过全局变量或其他方式动态设置
const CURRENT_ENV = 'dev'; // 'prod', 'dev', 'test'

// 根据当前环境选择API基础URL
function getApiBaseUrl() {
  switch(CURRENT_ENV) {
    case 'prod':
      return PROD_API_URL;
    case 'test':
      return TEST_API_URL;
    case 'dev':
    default:
      return DEV_API_URL;
  }
}

module.exports = {
  API_BASE_URL: getApiBaseUrl(),
  CURRENT_ENV,
  PROD_API_URL,
  DEV_API_URL,
  TEST_API_URL
};