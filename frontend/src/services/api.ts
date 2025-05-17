import axios from 'axios';
import { apiUrl, apiTimeout, corsConfig } from '../config';

// Tạo một instance của axios với cấu hình mặc định
const api = axios.create({
  baseURL: apiUrl,
  timeout: apiTimeout,
  headers: {
    'Content-Type': 'application/json',
  },
  ...corsConfig
});

// Thêm interceptor để xử lý token và tenant ID trong mỗi request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Thêm tenant ID vào header cho mọi request
    config.headers['x-tenant-id'] = localStorage.getItem('tenant_id') || '1';
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Thêm interceptor để xử lý các response
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Xử lý lỗi 401 (Unauthorized) - logout nếu token hết hạn
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
