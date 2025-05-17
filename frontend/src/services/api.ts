import axios from 'axios';
import { apiUrl, apiTimeout, corsConfig } from '../config';

// API Logger function
const logApiCall = (method: string, url: string, data?: any, headers?: any) => {
  console.log(`[API] ${method} ${url}`);
  if (data) console.log(`[API] Request data:`, data);
  if (headers) console.log(`[API] Request headers:`, headers);
};

// Tạo một instance của axios với cấu hình mặc định
const api = axios.create({
  baseURL: apiUrl,
  timeout: apiTimeout,
  headers: {
    'Content-Type': 'application/json',
  },
  ...corsConfig
});

// Thêm interceptor để xử lý token và schema name trong mỗi request
api.interceptors.request.use(
  (config) => {
    // Xác định token dựa trên loại endpoint đang gọi
    let token = null;
    let schemaName = null;
    
    if (config.url?.includes('/auth/system')) {
      // System admin endpoint
      token = localStorage.getItem('token');
      console.log('[API Interceptor] System admin endpoint detected');
    } else if (config.url?.includes('/auth/tenant')) {
      // Tenant admin endpoint
      token = localStorage.getItem('tenant_token');
      schemaName = localStorage.getItem('schema_name');
      console.log(`[API Interceptor] Tenant admin endpoint detected. Schema name from storage: ${schemaName}`);
    } else if (config.url?.includes('/auth/user')) {
      // User endpoint
      token = localStorage.getItem('user_token');
      schemaName = localStorage.getItem('user_schema_name');
      console.log(`[API Interceptor] User endpoint detected. Schema name from storage: ${schemaName}`);
    } else {
      // Default - try tokens in priority order
      token = localStorage.getItem('token') || 
              localStorage.getItem('tenant_token') || 
              localStorage.getItem('user_token');
      
      schemaName = localStorage.getItem('schema_name') || 
                   localStorage.getItem('user_schema_name') || 'default';
      console.log(`[API Interceptor] Default endpoint. Using Schema name: ${schemaName}`);
    }    // Thêm Authorization header nếu có token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Chỉ thêm schema name vào header cho các endpoint auth/tenant và auth/user
    // KHÔNG thêm cho tất cả các requests để tránh vấn đề CORS
    if (schemaName && (config.url?.includes('/auth/tenant') || config.url?.includes('/auth/user'))) {
      // Vẫn lưu giá trị vào localStorage nhưng không tự động thêm vào mọi request
      console.log(`[API Interceptor] Adding schema_name to request: ${schemaName}`);
    }
    
    console.log(`[API Interceptor] Final request: ${config.method?.toUpperCase() || 'GET'} ${config.url}`);
    console.log(`[API Interceptor] Headers:`, JSON.stringify(config.headers));
    if (config.params) console.log(`[API Interceptor] Params:`, JSON.stringify(config.params));
    if (config.data) console.log(`[API Interceptor] Data:`, JSON.stringify(config.data));
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Thêm interceptor để xử lý các response
api.interceptors.response.use(
  (response) => {
    console.log(`[API Response] Status: ${response.status} ${response.statusText}`);
    console.log(`[API Response] URL: ${response.config.url}`);
    console.log(`[API Response] Data:`, response.data);
    return response;
  },
  (error) => {
    console.error(`[API Error] ${error.message}`);
    if (error.response) {
      console.error(`[API Error] Status: ${error.response.status}`);
      console.error(`[API Error] Data:`, error.response.data);
      console.error(`[API Error] Headers:`, error.response.headers);
    }
    if (error.config) {
      console.error(`[API Error] Request URL: ${error.config.url}`);
      console.error(`[API Error] Request Method: ${error.config.method}`);
      if (error.config.data) console.error(`[API Error] Request Data:`, error.config.data);
    }
      // Xử lý lỗi 401 (Unauthorized) - logout nếu token hết hạn
    if (error.response && error.response.status === 401) {
      // Xác định loại endpoint đang gọi để chuyển hướng đến trang login tương ứng
      const url = error.config.url;
      
      // Không chuyển hướng khi đang kiểm tra tenant tồn tại
      if (url.includes('/tenants/check/')) {
        console.log('[API Error] Skipping redirect for tenant check endpoint');
        return Promise.reject(error);
      }
      
      if (url.includes('/auth/system')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';  // Go to system admin login
      } else if (url.includes('/auth/tenant')) {
        localStorage.removeItem('tenant_token');
        localStorage.removeItem('tenant_user');
        localStorage.removeItem('schema_name');
        window.location.href = '/tenant/login';
      } else if (url.includes('/auth/user')) {
        localStorage.removeItem('user_token');
        localStorage.removeItem('user_info');
        localStorage.removeItem('user_schema_name');
        window.location.href = '/user/login';
      } else {
        // Default - only clear tokens relevant to the user type
        // Don't clear everything as that might affect other user types
        if (localStorage.getItem('token')) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        } else if (localStorage.getItem('tenant_token')) {
          localStorage.removeItem('tenant_token');
          localStorage.removeItem('tenant_user');
          localStorage.removeItem('schema_name');
          window.location.href = '/tenant/login';
        } else if (localStorage.getItem('user_token')) {
          localStorage.removeItem('user_token');
          localStorage.removeItem('user_info');
          localStorage.removeItem('user_schema_name');
          window.location.href = '/user/login';
        } else {
          // If no tokens found, go to the default login page
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
